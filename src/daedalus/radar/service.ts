import { sql } from "@/platform/db/neon"
import { normalizeUrl } from "@/daedalus/scout/workflow"
import { fetchBySource } from "./sources"
import { matchHit } from "./matcher"
import { sendRadarEmail, sendRadarWebhook } from "./notifications"
import type { RadarRule, RadarEvent, RadarSource, RunResult, RadarStats, SearchHit } from "./types"

const DEFAULT_CHECK_MINUTES = 10

function now(): string {
  return new Date().toISOString()
}

function toRadarRule(row: any): RadarRule {
  return {
    ...row,
    terms: row.terms || [],
    sources: row.sources || [],
  }
}

export async function listRules(userId: string): Promise<RadarRule[]> {
  const rows = await sql`SELECT * FROM radar_rules WHERE user_id = ${userId} ORDER BY created_at DESC`
  return rows.map(toRadarRule)
}

export async function getRule(ruleId: string, userId: string): Promise<RadarRule | null> {
  const rows = await sql`SELECT * FROM radar_rules WHERE id = ${ruleId} AND user_id = ${userId} LIMIT 1`
  if (!rows[0]) return null
  return toRadarRule(rows[0])
}

export async function createRule(input: {
  userId: string
  name: string
  terms: string[]
  sources: RadarSource[]
  notify_email?: string | null
  notify_webhook?: string | null
  cooldown_minutes?: number
  check_interval_minutes?: number
}): Promise<RadarRule> {
  const cooldown = input.cooldown_minutes ?? 60
  const interval = input.check_interval_minutes ?? DEFAULT_CHECK_MINUTES

  const rows = await sql`
    INSERT INTO radar_rules (
      user_id, name, terms, sources, notify_email, notify_webhook,
      cooldown_minutes, check_interval_minutes, is_active
    ) VALUES (
      ${input.userId}, ${input.name}, ${input.terms}, ${input.sources},
      ${input.notify_email || null}, ${input.notify_webhook || null},
      ${cooldown}, ${interval}, true
    ) RETURNING *
  `

  return toRadarRule(rows[0])
}

export async function updateRule(ruleId: string, userId: string, updates: Partial<{
  name: string
  terms: string[]
  sources: RadarSource[]
  notify_email: string | null
  notify_webhook: string | null
  cooldown_minutes: number
  check_interval_minutes: number
  is_active: boolean
}>): Promise<RadarRule | null> {
  const rows = await sql`
    UPDATE radar_rules
    SET
      name = COALESCE(${updates.name}, name),
      terms = COALESCE(${updates.terms as any}, terms),
      sources = COALESCE(${updates.sources as any}, sources),
      notify_email = COALESCE(${updates.notify_email ?? null}, notify_email),
      notify_webhook = COALESCE(${updates.notify_webhook ?? null}, notify_webhook),
      cooldown_minutes = COALESCE(${updates.cooldown_minutes as any}, cooldown_minutes),
      check_interval_minutes = COALESCE(${updates.check_interval_minutes as any}, check_interval_minutes),
      is_active = COALESCE(${updates.is_active as any}, is_active),
      updated_at = NOW()
    WHERE id = ${ruleId} AND user_id = ${userId}
    RETURNING *
  `

  if (!rows[0]) return null
  return toRadarRule(rows[0])
}

export async function deleteRule(ruleId: string, userId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM radar_rules WHERE id = ${ruleId} AND user_id = ${userId} RETURNING id`
  return rows.length > 0
}

function buildQueryFromTerms(terms: string[]): string {
  return terms.join(" OR ")
}

async function insertEvents(rule: RadarRule, userId: string, events: Array<{
  hit: SearchHit
  matchedTerms: string[]
}>): Promise<RadarEvent[]> {
  const inserted: RadarEvent[] = []
  for (const { hit, matchedTerms } of events) {
    const normalized = normalizeUrl(hit.url)
    try {
      const rows = await sql`
        INSERT INTO radar_events (
          user_id, rule_id, source, url, normalized_url, title, snippet, matched_terms, occurred_at
        ) VALUES (
          ${rule.user_id}, ${rule.id}, ${hit.source}, ${hit.url}, ${normalized},
          ${hit.title}, ${hit.snippet}, ${matchedTerms}, ${hit.timestamp}
        )
        ON CONFLICT (rule_id, normalized_url) DO NOTHING
        RETURNING *
      `
      if (rows[0]) {
        inserted.push(rows[0] as RadarEvent)
      }
    } catch (error) {
      console.error("[radar] insert event failed", error)
    }
  }
  return inserted
}

async function shouldNotify(ruleId: string, cooldownMinutes: number): Promise<boolean> {
  const [recent] = await sql`
    SELECT sent_at FROM radar_notifications
    WHERE rule_id = ${ruleId}
      AND sent_at > NOW() - INTERVAL '${cooldownMinutes} minutes'
    ORDER BY sent_at DESC
    LIMIT 1
  `
  return !recent
}

async function recordNotification(ruleId: string, channel: string, payload: unknown): Promise<void> {
  await sql`
    INSERT INTO radar_notifications (rule_id, channel, payload)
    VALUES (${ruleId}, ${channel}, ${JSON.stringify(payload)})
  `
}

async function notify(rule: RadarRule, newEvents: RadarEvent[]): Promise<void> {
  if (newEvents.length === 0) return
  const canNotify = await shouldNotify(rule.id, rule.cooldown_minutes)
  if (!canNotify) {
    console.log(`[radar] Notification suppressed (cooldown) for rule ${rule.id}`)
    return
  }

  const sentChannels: string[] = []
  if (rule.notify_email) {
    const ok = await sendRadarEmail(rule, newEvents)
    if (ok) sentChannels.push("email")
  }
  if (rule.notify_webhook) {
    const ok = await sendRadarWebhook(rule, newEvents)
    if (ok) sentChannels.push("webhook")
  }

  for (const channel of sentChannels) {
    await recordNotification(rule.id, channel, {
      count: newEvents.length,
      sample: newEvents.slice(0, 5),
    })
  }

  if (sentChannels.length > 0) {
    await sql`UPDATE radar_rules SET last_notification_at = NOW() WHERE id = ${rule.id}`
  }
}

async function runRule(rule: RadarRule): Promise<RunResult> {
  const query = buildQueryFromTerms(rule.terms)
  const hits: SearchHit[] = []
  const errors: string[] = []

  await Promise.all(
    rule.sources.map(async (source) => {
      try {
        const results = await fetchBySource(source, query)
        hits.push(...results)
      } catch (error) {
        console.error(`[radar] Source ${source} failed`, error)
        errors.push(String(error))
      }
    })
  )

  const matches: Array<{ hit: SearchHit; matchedTerms: string[] }> = []
  for (const hit of hits) {
    const { matched, matchedTerms } = matchHit(rule.terms, hit)
    if (matched) {
      matches.push({ hit, matchedTerms })
    }
  }

  const inserted = await insertEvents(rule, rule.user_id, matches)

  if (inserted.length > 0) {
    await notify(rule, inserted)
  }

  await sql`UPDATE radar_rules SET last_run_at = NOW() WHERE id = ${rule.id}`

  return { ruleId: rule.id, newEvents: inserted.length, errors: errors.length ? errors : undefined }
}

export async function runRulesForUser(userId: string, ruleId?: string): Promise<RadarStats> {
  const rules = ruleId
    ? await sql`SELECT * FROM radar_rules WHERE id = ${ruleId} AND user_id = ${userId}`
    : await sql`SELECT * FROM radar_rules WHERE user_id = ${userId} AND is_active = true`

  let processed = 0
  let newEvents = 0
  const errors: Array<{ ruleId: string; error: string }> = []

  for (const row of rules) {
    const rule = toRadarRule(row)
    const result = await runRule(rule)
    processed += 1
    newEvents += result.newEvents
    if (result.errors) {
      result.errors.forEach((e) => errors.push({ ruleId: result.ruleId, error: e }))
    }
  }

  return { processedRules: processed, newEvents, errors }
}

export async function processScheduledRules(): Promise<RadarStats> {
  const rules = await sql`
    SELECT * FROM radar_rules
    WHERE is_active = true
      AND (
        last_run_at IS NULL OR last_run_at <= NOW() - (check_interval_minutes || ${DEFAULT_CHECK_MINUTES}) * INTERVAL '1 minute'
      )
    ORDER BY last_run_at ASC NULLS FIRST
    LIMIT 100
  `

  const runIdRows = await sql`INSERT INTO radar_runs (user_id, rule_count, status) VALUES ('00000000-0000-0000-0000-000000000000', ${rules.length}, 'running') RETURNING id`
  const runId = runIdRows[0]?.id

  let processed = 0
  let newEvents = 0
  const errors: Array<{ ruleId: string; error: string }> = []

  for (const row of rules) {
    const rule = toRadarRule(row)
    try {
      const result = await runRule(rule)
      processed += 1
      newEvents += result.newEvents
      if (result.errors) {
        result.errors.forEach((e) => errors.push({ ruleId: result.ruleId, error: e }))
      }
    } catch (error) {
      errors.push({ ruleId: rule.id, error: String(error) })
    }
  }

  if (runId) {
    await sql`
      UPDATE radar_runs
      SET completed_at = NOW(), status = 'completed', source_stats = ${JSON.stringify({ processed, newEvents, errors })}
      WHERE id = ${runId}
    `
  }

  return { processedRules: processed, newEvents, errors }
}

export async function fetchFeed(userId: string, options: { ruleId?: string; seen?: boolean; limit?: number } = {}): Promise<RadarEvent[]> {
  const { ruleId, seen, limit = 50 } = options
  if (ruleId) {
    const rows = await sql`
      SELECT * FROM radar_events
      WHERE user_id = ${userId} AND rule_id = ${ruleId}
      ${seen === undefined ? sql`` : sql`AND seen = ${seen}`}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return rows as RadarEvent[]
  }

  const rows = await sql`
    SELECT * FROM radar_events
    WHERE user_id = ${userId}
    ${seen === undefined ? sql`` : sql`AND seen = ${seen}`}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return rows as RadarEvent[]
}

export async function sendTestNotification(rule: RadarRule): Promise<boolean> {
  const fakeEvent: RadarEvent = {
    id: "test",
    user_id: rule.user_id,
    rule_id: rule.id,
    source: "firecrawl",
    url: "https://example.com",
    normalized_url: "https://example.com",
    title: "Test alert",
    snippet: "This is a test notification from Radar",
    matched_terms: rule.terms.slice(0, 2),
    occurred_at: now(),
    seen: false,
    created_at: now(),
  }

  if (rule.notify_email) {
    const ok = await sendRadarEmail(rule, [fakeEvent])
    if (!ok) return false
  }

  if (rule.notify_webhook) {
    const ok = await sendRadarWebhook(rule, [fakeEvent])
    if (!ok) return false
  }

  await recordNotification(rule.id, "test", { rule: rule.id })
  return true
}
