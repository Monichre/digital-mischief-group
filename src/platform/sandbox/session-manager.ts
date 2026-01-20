/**
 * War Games Sandbox - Session Manager (Upstash Redis)
 *
 * Manages anonymous user sessions for the freemium sandbox experience.
 * Uses Upstash Redis for fast, edge-optimized session tracking with automatic TTL.
 *
 * Features:
 * - Session creation and validation
 * - 24-hour session TTL (auto-cleanup)
 * - Session activity tracking
 * - Lightweight key-value storage
 */

import { redis } from '@/platform/redis'

// Session TTL: 24 hours
const SESSION_TTL = 60 * 60 * 24 // seconds

export interface SandboxSession {
  id: string
  created_at: number
  last_activity: number
  total_executions: number
}

/**
 * Generate crypto-secure random session ID
 */
function generateSessionId(): string {
  // Using crypto.randomUUID for security, replacing hyphens for cleaner ID
  return crypto.randomUUID().replace(/-/g, '')
}

/**
 * Create a new anonymous sandbox session
 * Returns session ID to be stored in cookie
 */
export async function createSession(): Promise<string> {
  const sessionId = generateSessionId()
  const now = Date.now()

  const session: Omit<SandboxSession, 'total_executions'> = {
    id: sessionId,
    created_at: now,
    last_activity: now,
  }

  // Store session with 24h TTL
  await redis.set(
    `sandbox:session:${sessionId}`,
    JSON.stringify(session),
    { ex: SESSION_TTL }
  )

  return sessionId
}

/**
 * Get session by ID
 * Returns null if session doesn't exist or expired
 */
export async function getSession(sessionId: string): Promise<SandboxSession | null> {
  const key = `sandbox:session:${sessionId}`
  const data = await redis.get<string>(key)

  if (!data) return null

  const session = JSON.parse(data) as Omit<SandboxSession, 'total_executions'>

  // Get total executions from counter
  const today = getTodayKey()
  const executions = await redis.get<number>(`sandbox:executions:${sessionId}:${today}`) || 0

  return {
    ...session,
    total_executions: executions,
  }
}

/**
 * Update session activity timestamp
 * Refreshes TTL to keep active sessions alive
 */
export async function updateActivity(sessionId: string): Promise<void> {
  const session = await getSession(sessionId)
  if (!session) return

  session.last_activity = Date.now()

  await redis.set(
    `sandbox:session:${sessionId}`,
    JSON.stringify({
      id: session.id,
      created_at: session.created_at,
      last_activity: session.last_activity
    }),
    { ex: SESSION_TTL }
  )
}

/**
 * Validate session exists and is active
 */
export async function validateSession(sessionId: string): Promise<boolean> {
  const session = await getSession(sessionId)
  return session !== null
}

/**
 * Delete session (for testing or manual cleanup)
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const today = getTodayKey()
  await Promise.all([
    redis.del(`sandbox:session:${sessionId}`),
    redis.del(`sandbox:executions:${sessionId}:${today}`),
    redis.del(`sandbox:cooldown:${sessionId}`),
    redis.del(`sandbox:history:${sessionId}`),
  ])
}

/**
 * Get today's date key for daily counters (YYYY-MM-DD)
 */
function getTodayKey(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}
