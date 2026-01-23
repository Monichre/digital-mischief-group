import { sql } from '@/platform/db/neon'
import { generateText } from 'ai'
import { MODELS } from '@/ai/models'
import { getFirecrawlClient } from '@/platform/firecrawl/service'
import { generateDiff, formatDiffAsText } from './diff'
import { notifyMonitorChange, type NotificationPayload } from './notifications'
import type { Monitor, CheckMonitorResult, CreateMonitorInput } from './types'

/**
 * Generate a content hash for change detection
 */
function hashContent(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString(16)
}

/**
 * Create a new monitor for a user
 */
export async function createMonitor(
  input: CreateMonitorInput,
  userId: string
): Promise<Monitor> {
  const {
    name,
    url,
    check_interval_seconds = 86400,
    notification_email = null,
    webhook_url = null,
    notification_cooldown_minutes = 60,
  } = input

  const [monitor] = await sql`
    INSERT INTO monitors (name, url, check_interval_seconds, notification_email, webhook_url, notification_cooldown_minutes, user_id)
    VALUES (${name}, ${url}, ${check_interval_seconds}, ${notification_email}, ${webhook_url}, ${notification_cooldown_minutes}, ${userId})
    RETURNING *
  `

  return monitor as Monitor
}

/**
 * Get all monitors for a user
 */
export async function getMonitors(userId: string): Promise<(Monitor & { change_count: number })[]> {
  const monitors = await sql`
    SELECT m.*, 
      (SELECT COUNT(*) FROM monitor_changes WHERE monitor_id = m.id AND user_id = ${userId}) as change_count
    FROM monitors m
    WHERE m.user_id = ${userId}
    ORDER BY created_at DESC
  `
  return monitors as (Monitor & { change_count: number })[]
}

/**
 * Get a single monitor with its change history
 */
export async function getMonitor(
  monitorId: string,
  userId: string
): Promise<{ monitor: Monitor; changes: unknown[] } | null> {
  const [monitor] = await sql`
    SELECT * FROM monitors WHERE id = ${monitorId} AND user_id = ${userId}
  `

  if (!monitor) return null

  const changes = await sql`
    SELECT * FROM monitor_changes 
    WHERE monitor_id = ${monitorId} AND user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `

  return { monitor: monitor as Monitor, changes }
}

/**
 * Delete a monitor
 */
export async function deleteMonitor(monitorId: string, userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM monitors WHERE id = ${monitorId} AND user_id = ${userId} RETURNING id
  `
  return result.length > 0
}

/**
 * Get monitors due for checking based on check_interval_seconds
 */
export async function getMonitorsDueForCheck(limit = 100): Promise<(Monitor & { user_id: string })[]> {
  const monitors = await sql`
    SELECT * FROM monitors
    WHERE (
        last_checked_at IS NULL OR
        last_checked_at <= NOW() - (check_interval_seconds || ' seconds')::interval
      )
    ORDER BY last_checked_at ASC NULLS FIRST
    LIMIT ${limit}
  `

  return monitors as (Monitor & { user_id: string })[]
}

/**
 * Process all due monitors (for cron/background job)
 */
export async function processDueMonitors(): Promise<{
  processed: number
  results: Array<{ monitorId: string; userId: string; result: CheckMonitorResult }>
}> {
  const dueMonitors = await getMonitorsDueForCheck()
  const results: Array<{ monitorId: string; userId: string; result: CheckMonitorResult }> = []

  for (const monitor of dueMonitors) {
    const userId = (monitor as Monitor & { user_id: string }).user_id
    if (!userId) continue

    const result = await checkMonitor(monitor.id, userId)
    results.push({ monitorId: monitor.id, userId, result })
  }

  return { processed: results.length, results }
}

/**
 * Check a monitor for changes - core observe workflow
 * 1. Scrape current content
 * 2. Compare hash with stored hash
 * 3. If changed, generate diff and AI summary, record change
 * 4. Send notifications with suppression controls
 * 5. Update monitor with new hash, content, and excerpt
 */
export async function checkMonitor(
  monitorId: string,
  userId: string
): Promise<CheckMonitorResult> {
  // Get the monitor
  const [monitor] = await sql`
    SELECT * FROM monitors WHERE id = ${monitorId} AND user_id = ${userId}
  `

  if (!monitor) {
    return { success: false, changed: false, newHash: '', error: 'Monitor not found' }
  }

  // Scrape current content
  const firecrawl = getFirecrawlClient()
  const scrapeResult = await firecrawl.scrape({
    url: monitor.url,
    formats: ['markdown'],
    onlyMainContent: true,
  })

  if (!scrapeResult.success || !scrapeResult.data) {
    console.error('[observe] Failed to scrape monitor URL', scrapeResult.errorDetails || scrapeResult.error)
    return { success: false, changed: false, newHash: '', error: 'Failed to scrape URL' }
  }

  const scrapePayload = scrapeResult.data as { markdown?: string }
  const content = scrapePayload.markdown || ''
  const newHash = hashContent(content)
  const excerpt = content.slice(0, 500)

  // Check if content changed
  const hasChanged = monitor.last_content_hash && monitor.last_content_hash !== newHash

  let aiSummary: string | null = null
  let diffResult = null
  let notificationSent = false

  if (hasChanged) {
    // Generate diff between old and new content
    diffResult = generateDiff(monitor.last_content, content)
    const diffText = formatDiffAsText(diffResult, 30)

    // Generate AI summary of changes using diff context
    try {
      const { text } = await generateText({
        model: MODELS.openai.gpt52,
        prompt: `Summarize what changed on this webpage. Be concise (2-3 sentences).

Changes detected (${diffResult.summary}):
${diffText}

Old excerpt: ${monitor.last_excerpt || 'N/A'}

New excerpt: ${excerpt}`,
      })
      aiSummary = text
    } catch (e) {
      console.error('[observe] AI summary failed:', e)
      // Fallback summary
      aiSummary = `Content changed: ${diffResult.summary}`
    }

    // Record the change with full content snapshots
    await sql`
      INSERT INTO monitor_changes (
        monitor_id, old_hash, new_hash, 
        old_content, new_content,
        old_excerpt, new_excerpt, 
        diff_additions, diff_deletions,
        ai_summary, user_id
      )
      VALUES (
        ${monitorId}, ${monitor.last_content_hash}, ${newHash}, 
        ${monitor.last_content}, ${content},
        ${monitor.last_excerpt || null}, ${excerpt}, 
        ${diffResult.additions}, ${diffResult.deletions},
        ${aiSummary}, ${userId}
      )
    `

    // Send notifications with suppression controls
    const notificationPayload: NotificationPayload = {
      monitorId,
      monitorName: monitor.name,
      url: monitor.url,
      diff: diffResult,
      aiSummary,
      timestamp: new Date(),
    }

    const notifyResult = await notifyMonitorChange(
      monitorId,
      userId,
      monitor.notification_email,
      monitor.webhook_url,
      notificationPayload,
      { cooldownMinutes: monitor.notification_cooldown_minutes || 60 }
    )

    notificationSent = notifyResult.sent
    if (notifyResult.suppressed) {
      console.log(`[observe] Notification suppressed for monitor ${monitorId}: ${notifyResult.reason}`)
    }
  }

  // Update monitor with new hash, content, and excerpt
  await sql`
    UPDATE monitors 
    SET 
      last_checked_at = NOW(), 
      last_content_hash = ${newHash}, 
      last_content = ${content},
      last_excerpt = ${excerpt}, 
      updated_at = NOW()
    WHERE id = ${monitorId}
  `

  return {
    success: true,
    changed: hasChanged,
    newHash,
    aiSummary,
    diff: diffResult ? {
      additions: diffResult.additions,
      deletions: diffResult.deletions,
      summary: diffResult.summary,
    } : undefined,
    notificationSent,
  }
}
