/**
 * Scout Workflow - Core business logic for scout dedup and scheduling
 *
 * Implements:
 * - URL deduplication per user via `seen_urls`
 * - Scheduled run logic with proper next_run_at calculation
 * - Search aggregation from multiple engines
 */

import { sql } from "@/platform/db/neon"
import { getFirecrawlClient } from "@/platform/firecrawl/service"
import type { Scout, ScoutResult } from "./types"
import { sendScoutEmailNotification } from "./notifications"

const SERPER_API_KEY = process.env.SERPER_API_KEY
const EXA_API_KEY = process.env.EXA_API_KEY

// Schedule interval mappings
const SCHEDULE_INTERVALS: Record<string, number> = {
  hourly: 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  manual: 0,
}

export interface SearchResult {
  url: string
  title: string | null
  snippet: string | null
  source: string
}

export interface ScoutRunResult {
  success: boolean
  new_results: number
  total_searched: number
  duplicates_removed: number
  findings: SearchResult[]
  notification_sent?: boolean
  error?: string
}

/**
 * Normalize URL for consistent deduplication
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    // Remove trailing slash, lowercase hostname
    let normalized = `${parsed.protocol}//${parsed.hostname.toLowerCase()}${parsed.pathname.replace(/\/$/, "")}`
    // Remove common tracking parameters
    const cleanParams = new URLSearchParams()
    for (const [key, value] of parsed.searchParams) {
      if (!["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "source"].includes(key.toLowerCase())) {
        cleanParams.set(key, value)
      }
    }
    const queryString = cleanParams.toString()
    if (queryString) {
      normalized += `?${queryString}`
    }
    return normalized
  } catch {
    return url.toLowerCase().replace(/\/$/, "")
  }
}

/**
 * Deduplicate URLs against seen_urls set
 */
export function deduplicateResults(
  results: SearchResult[],
  seenUrls: string[]
): { newResults: SearchResult[]; duplicates: number } {
  const seenSet = new Set(seenUrls.map(normalizeUrl))
  const uniqueUrls = new Set<string>()
  const newResults: SearchResult[] = []

  for (const result of results) {
    const normalizedUrl = normalizeUrl(result.url)
    // Skip if already seen or duplicate in current batch
    if (seenSet.has(normalizedUrl) || uniqueUrls.has(normalizedUrl)) {
      continue
    }
    uniqueUrls.add(normalizedUrl)
    newResults.push(result)
  }

  return {
    newResults,
    duplicates: results.length - newResults.length,
  }
}

/**
 * Calculate next run time based on schedule
 */
export function calculateNextRunAt(schedule: string): Date | null {
  const interval = SCHEDULE_INTERVALS[schedule]
  if (!interval) return null
  return new Date(Date.now() + interval)
}

/**
 * Search Serper API
 */
async function searchSerper(query: string): Promise<SearchResult[]> {
  if (!SERPER_API_KEY) return []
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 20 }),
    })
    if (!response.ok) return []
    const data = await response.json()
    return (data.organic || []).map((r: { link: string; title: string; snippet: string }) => ({
      url: r.link,
      title: r.title,
      snippet: r.snippet,
      source: "serper",
    }))
  } catch (error) {
    console.error("Serper search failed:", error)
    return []
  }
}

/**
 * Search Exa API
 */
async function searchExa(query: string): Promise<SearchResult[]> {
  if (!EXA_API_KEY) return []
  try {
    const response = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "x-api-key": EXA_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        numResults: 20,
        useAutoprompt: true,
      }),
    })
    if (!response.ok) return []
    const data = await response.json()
    return (data.results || []).map((r: { url: string; title: string; text: string }) => ({
      url: r.url,
      title: r.title,
      snippet: r.text?.slice(0, 300) || null,
      source: "exa",
    }))
  } catch (error) {
    console.error("Exa search failed:", error)
    return []
  }
}

/**
 * Search Firecrawl API
 */
async function searchFirecrawl(query: string): Promise<SearchResult[]> {
  try {
    const firecrawl = getFirecrawlClient()
    const result = await firecrawl.search({
      query,
      limit: 20,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
      },
    })
    if (!result.success || !result.data) return []
    return result.data.map((r) => ({
      url: r.url,
      title: r.title || null,
      snippet: r.description || r.markdown?.slice(0, 300) || null,
      source: "firecrawl",
    }))
  } catch (error) {
    console.error("Firecrawl search failed:", error)
    return []
  }
}

/**
 * Run a scout: search, deduplicate, persist, update schedule
 */
export async function runScout(scoutId: string, userId: string): Promise<ScoutRunResult> {
  // Fetch scout with user ownership check
  const [scout] = await sql`
    SELECT * FROM scouts WHERE id = ${scoutId} AND user_id = ${userId}
  `
  if (!scout) {
    return {
      success: false,
      new_results: 0,
      total_searched: 0,
      duplicates_removed: 0,
      findings: [],
      error: "Scout not found or unauthorized",
    }
  }

  // Run all searches in parallel
  const [serperResults, exaResults, firecrawlResults] = await Promise.all([
    searchSerper(scout.search_query),
    searchExa(scout.search_query),
    searchFirecrawl(scout.search_query),
  ])

  const allResults = [...serperResults, ...exaResults, ...firecrawlResults]

  // Deduplicate against seen_urls
  const { newResults, duplicates } = deduplicateResults(allResults, scout.seen_urls || [])

  // Persist new findings
  for (const result of newResults) {
    await sql`
      INSERT INTO scout_results (scout_id, url, title, snippet, source, metadata, user_id)
      VALUES (
        ${scoutId},
        ${result.url},
        ${result.title},
        ${result.snippet},
        ${result.source},
        ${JSON.stringify(result)},
        ${userId}
      )
    `
  }

  // Update scout with new seen URLs, last_run_at, and next_run_at
  const updatedSeenUrls = [
    ...(scout.seen_urls || []),
    ...newResults.map((r) => normalizeUrl(r.url)),
  ]
  const nextRunAt = calculateNextRunAt(scout.schedule)

  await sql`
    UPDATE scouts
    SET
      seen_urls = ${updatedSeenUrls},
      last_run_at = NOW(),
      next_run_at = ${nextRunAt},
      updated_at = NOW()
    WHERE id = ${scoutId}
  `

  let notificationSent = false

  // Notify user when new findings are available
  if (newResults.length > 0 && scout.notification_email) {
    notificationSent = await sendScoutEmailNotification(scout.notification_email, {
      scoutId,
      scoutName: scout.name,
      query: scout.search_query,
      newResults,
    })
  }

  return {
    success: true,
    new_results: newResults.length,
    total_searched: allResults.length,
    duplicates_removed: duplicates,
    findings: newResults,
    notification_sent: notificationSent,
  }
}

/**
 * Get scouts due for scheduled runs
 */
export async function getScoutsDueForRun(): Promise<Scout[]> {
  const scouts = await sql`
    SELECT * FROM scouts
    WHERE is_active = true
      AND schedule != 'manual'
      AND (next_run_at IS NULL OR next_run_at <= NOW())
    ORDER BY next_run_at ASC NULLS FIRST
    LIMIT 100
  `
  return scouts as Scout[]
}

/**
 * Process all due scouts (for cron/background job)
 */
export async function processScheduledScouts(): Promise<{
  processed: number
  results: Array<{ scoutId: string; userId: string; result: ScoutRunResult }>
}> {
  const dueScouts = await getScoutsDueForRun()
  const results: Array<{ scoutId: string; userId: string; result: ScoutRunResult }> = []

  for (const scout of dueScouts) {
    // Get user_id from scout
    const userId = (scout as Scout & { user_id: string }).user_id
    if (!userId) continue

    const result = await runScout(scout.id, userId)
    results.push({ scoutId: scout.id, userId, result })
  }

  return { processed: results.length, results }
}
