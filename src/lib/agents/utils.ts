import { sql } from "@/lib/db/neon"
import type { AgentPhase } from "./types"

export interface AgentExecutionLog {
  enrichmentJobId?: string
  batchId?: string
  agentName: AgentPhase
  status: "running" | "completed" | "failed" | "skipped"
  startedAt: number
  completedAt?: number
  durationMs?: number
  inputData?: unknown
  outputData?: unknown
  errorMessage?: string
  apiCallsMade?: number
  sourcesAccessed?: string[]
}

export async function logAgentExecution( log: AgentExecutionLog ): Promise<void> {
  try {
    await sql`
      INSERT INTO agent_execution_logs (
        enrichment_job_id,
        batch_id,
        agent_name,
        status,
        started_at,
        completed_at,
        duration_ms,
        input_data,
        output_data,
        error_message,
        api_calls_made,
        sources_accessed
      ) VALUES (
        ${log.enrichmentJobId || null},
        ${log.batchId || null},
        ${log.agentName},
        ${log.status},
        ${new Date( log.startedAt ).toISOString()},
        ${log.completedAt ? new Date( log.completedAt ).toISOString() : null},
        ${log.durationMs || null},
        ${log.inputData ? JSON.stringify( log.inputData ) : null},
        ${log.outputData ? JSON.stringify( log.outputData ) : null},
        ${log.errorMessage || null},
        ${log.apiCallsMade || 0},
        ${log.sourcesAccessed || []}
      )
    `
  } catch ( error ) {
    // Don't fail the main operation if logging fails
    console.error( "[AgentLog] Failed to log execution:", error )
  }
}

// Normalize various input formats to a clean domain
export function normalizeDomain( input: string ): string {
  let domain = input.toLowerCase().trim()

  // Remove protocol
  domain = domain.replace( /^(https?:\/\/)/, "" )

  // Remove www
  domain = domain.replace( /^www\./, "" )

  // Remove path
  domain = domain.split( "/" )[0]

  // Remove port
  domain = domain.split( ":" )[0]

  return domain
}

// Extract domain from email
export function extractDomainFromEmail( email: string ): string | null {
  const match = email.match( /@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/ )
  return match ? match[1].toLowerCase() : null
}

// Merge source records
export function mergeSources(
  ...sourceRecords: ( Record<string, string[]> | string[] | undefined )[]
): string[] {
  const allSources = new Set<string>()

  for ( const record of sourceRecords ) {
    if ( !record ) continue

    if ( Array.isArray( record ) ) {
      record.forEach( ( s ) => allSources.add( s ) )
    } else {
      Object.values( record ).flat().forEach( ( s ) => allSources.add( s ) )
    }
  }

  return Array.from( allSources )
}

// Safe JSON parse with default
export function safeJsonParse<T>( json: string | null | undefined, defaultValue: T ): T {
  if ( !json ) return defaultValue
  try {
    return JSON.parse( json ) as T
  } catch {
    return defaultValue
  }
}

// Truncate string for logging
export function truncateForLog( str: string, maxLength = 100 ): string {
  if ( str.length <= maxLength ) return str
  return str.slice( 0, maxLength - 3 ) + "..."
}

// Rate limit helper - simple token bucket
const rateLimitBuckets = new Map<string, { tokens: number; lastRefill: number }>()

export function checkRateLimit(
  key: string,
  maxTokens: number,
  refillRate: number // tokens per second
): boolean {
  const now = Date.now()
  let bucket = rateLimitBuckets.get( key )

  if ( !bucket ) {
    bucket = { tokens: maxTokens, lastRefill: now }
    rateLimitBuckets.set( key, bucket )
  }

  // Refill tokens based on time elapsed
  const elapsed = ( now - bucket.lastRefill ) / 1000
  bucket.tokens = Math.min( maxTokens, bucket.tokens + elapsed * refillRate )
  bucket.lastRefill = now

  // Check if we can proceed
  if ( bucket.tokens >= 1 ) {
    bucket.tokens -= 1
    return true
  }

  return false
}

// Delay helper with exponential backoff
export async function delay( ms: number ): Promise<void> {
  return new Promise( ( resolve ) => setTimeout( resolve, ms ) )
}

export function calculateBackoff( attempt: number, baseMs = 1000, maxMs = 30000 ): number {
  const backoff = Math.min( baseMs * Math.pow( 2, attempt ), maxMs )
  // Add jitter (±25%)
  const jitter = backoff * 0.25 * ( Math.random() * 2 - 1 )
  return Math.round( backoff + jitter )
}
