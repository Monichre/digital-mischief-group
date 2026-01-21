import { sql } from '@/platform/db/neon'
import { generateText } from 'ai'
import { MODELS } from '@/ai/models'
import { getFirecrawlClient } from '@/lib/firecrawl/client'
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
  const { name, url, check_interval_seconds = 86400, notification_email = null } = input

  const [monitor] = await sql`
    INSERT INTO monitors (name, url, check_interval_seconds, notification_email, user_id)
    VALUES (${name}, ${url}, ${check_interval_seconds}, ${notification_email}, ${userId})
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
 * Check a monitor for changes - core observe workflow
 * 1. Scrape current content
 * 2. Compare hash with stored hash
 * 3. If changed, generate AI summary and record change
 * 4. Update monitor with new hash and excerpt
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
    console.error('Failed to scrape monitor URL', scrapeResult.errorDetails || scrapeResult.error)
    return { success: false, changed: false, newHash: '', error: 'Failed to scrape URL' }
  }

  const scrapePayload = scrapeResult.data as { markdown?: string }
  const content = scrapePayload.markdown || ''
  const newHash = hashContent(content)
  const excerpt = content.slice(0, 500)

  // Check if content changed
  const hasChanged = monitor.last_content_hash && monitor.last_content_hash !== newHash

  let aiSummary: string | null = null

  if (hasChanged) {
    // Generate AI summary of changes
    try {
      const { text } = await generateText({
        model: MODELS.openai.gpt52,
        prompt: `Summarize what changed on this webpage. Be concise (2-3 sentences).
          
Old excerpt: ${monitor.last_excerpt || 'N/A'}

New excerpt: ${excerpt}`,
      })
      aiSummary = text
    } catch (e) {
      console.error('AI summary failed:', e)
    }

    // Record the change
    await sql`
      INSERT INTO monitor_changes (monitor_id, old_hash, new_hash, old_excerpt, new_excerpt, ai_summary, user_id)
      VALUES (${monitorId}, ${monitor.last_content_hash}, ${newHash}, ${monitor.last_excerpt || null}, ${excerpt}, ${aiSummary}, ${userId})
    `
  }

  // Update monitor with new hash and excerpt
  await sql`
    UPDATE monitors 
    SET last_checked_at = NOW(), last_content_hash = ${newHash}, last_excerpt = ${excerpt}, updated_at = NOW()
    WHERE id = ${monitorId}
  `

  return {
    success: true,
    changed: hasChanged,
    newHash,
    aiSummary,
  }
}
