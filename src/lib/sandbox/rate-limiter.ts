/**
 * War Games Sandbox - Rate Limiter (Upstash Redis)
 *
 * Enforces usage limits for anonymous sandbox users:
 * - 10 executions per day (resets at midnight UTC)
 * - 30-second cooldown between executions
 * - 1K input tokens, 2K output tokens per execution
 *
 * Uses Redis atomic operations (INCR) for race-condition-safe counting.
 */

import { redis } from '@/lib/redis'
import { updateActivity } from './session-manager'

// Rate limit configuration
const DAILY_EXECUTION_LIMIT = 10
const COOLDOWN_SECONDS = 30
const MAX_INPUT_TOKENS = 1000
const MAX_OUTPUT_TOKENS = 2000

// TTLs
const EXECUTION_COUNTER_TTL = 60 * 60 * 24 // 24 hours (until midnight UTC)
const COOLDOWN_TTL = COOLDOWN_SECONDS

export interface RateLimitCheck {
  allowed: boolean
  reason?: 'daily_limit' | 'cooldown' | 'invalid_session'
  remaining_executions?: number
  cooldown_remaining_seconds?: number
  reset_at?: number // Timestamp when daily limit resets
}

export interface ExecutionRecord {
  workflow_type: string
  timestamp: number
  input_tokens: number
  output_tokens: number
  duration_ms: number
}

/**
 * Check if session can execute a workflow
 * Returns detailed rate limit status
 */
export async function checkRateLimit(sessionId: string): Promise<RateLimitCheck> {
  const today = getTodayKey()
  const executionKey = `sandbox:executions:${sessionId}:${today}`
  const cooldownKey = `sandbox:cooldown:${sessionId}`

  // Get current execution count
  const count = await redis.get<number>(executionKey) || 0

  // Check daily limit
  if (count >= DAILY_EXECUTION_LIMIT) {
    const resetAt = getMidnightUTC()
    return {
      allowed: false,
      reason: 'daily_limit',
      remaining_executions: 0,
      reset_at: resetAt,
    }
  }

  // Check cooldown
  const cooldownExpiry = await redis.get<number>(cooldownKey)
  if (cooldownExpiry) {
    const now = Date.now()
    const remaining = Math.ceil((cooldownExpiry - now) / 1000)
    if (remaining > 0) {
      return {
        allowed: false,
        reason: 'cooldown',
        cooldown_remaining_seconds: remaining,
        remaining_executions: DAILY_EXECUTION_LIMIT - count,
      }
    }
  }

  // Allowed - return remaining executions
  return {
    allowed: true,
    remaining_executions: DAILY_EXECUTION_LIMIT - count - 1, // -1 for the current execution
  }
}

/**
 * Record a workflow execution
 * Atomically increments counter and sets cooldown
 */
export async function recordExecution(
  sessionId: string,
  execution: ExecutionRecord
): Promise<void> {
  const today = getTodayKey()
  const executionKey = `sandbox:executions:${sessionId}:${today}`
  const cooldownKey = `sandbox:cooldown:${sessionId}`
  const historyKey = `sandbox:history:${sessionId}`

  // Atomic increment with TTL
  await redis.incr(executionKey)
  await redis.expire(executionKey, EXECUTION_COUNTER_TTL)

  // Set cooldown with expiry
  const cooldownExpiry = Date.now() + (COOLDOWN_SECONDS * 1000)
  await redis.set(cooldownKey, cooldownExpiry, { ex: COOLDOWN_TTL })

  // Store execution history (last 10)
  await redis.lpush(historyKey, JSON.stringify(execution))
  await redis.ltrim(historyKey, 0, 9) // Keep only last 10
  await redis.expire(historyKey, 60 * 60 * 24) // 24h TTL

  // Update session activity
  await updateActivity(sessionId)
}

/**
 * Get execution history for session
 */
export async function getExecutionHistory(sessionId: string): Promise<ExecutionRecord[]> {
  const historyKey = `sandbox:history:${sessionId}`
  const history = await redis.lrange<string>(historyKey, 0, -1)

  return history.map(item => JSON.parse(item)) as ExecutionRecord[]
}

/**
 * Get current usage stats for session
 */
export async function getUsageStats(sessionId: string): Promise<{
  executions_today: number
  remaining_executions: number
  cooldown_seconds: number
  reset_at: number
}> {
  const today = getTodayKey()
  const executionKey = `sandbox:executions:${sessionId}:${today}`
  const cooldownKey = `sandbox:cooldown:${sessionId}`

  const count = await redis.get<number>(executionKey) || 0
  const cooldownExpiry = await redis.get<number>(cooldownKey)

  let cooldownSeconds = 0
  if (cooldownExpiry) {
    const remaining = Math.ceil((cooldownExpiry - Date.now()) / 1000)
    cooldownSeconds = Math.max(0, remaining)
  }

  return {
    executions_today: count,
    remaining_executions: Math.max(0, DAILY_EXECUTION_LIMIT - count),
    cooldown_seconds: cooldownSeconds,
    reset_at: getMidnightUTC(),
  }
}

/**
 * Validate token limits
 */
export function validateTokenLimits(inputTokens: number, outputTokens: number): {
  valid: boolean
  reason?: string
} {
  if (inputTokens > MAX_INPUT_TOKENS) {
    return {
      valid: false,
      reason: `Input exceeds ${MAX_INPUT_TOKENS} token limit`,
    }
  }

  if (outputTokens > MAX_OUTPUT_TOKENS) {
    return {
      valid: false,
      reason: `Output exceeds ${MAX_OUTPUT_TOKENS} token limit`,
    }
  }

  return { valid: true }
}

/**
 * Get today's date key for daily counters (YYYY-MM-DD)
 */
function getTodayKey(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

/**
 * Get midnight UTC timestamp (when daily counter resets)
 */
function getMidnightUTC(): number {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  tomorrow.setUTCHours(0, 0, 0, 0)
  return tomorrow.getTime()
}

/**
 * Constants export for client-side display
 */
export const RATE_LIMITS = {
  DAILY_EXECUTIONS: DAILY_EXECUTION_LIMIT,
  COOLDOWN_SECONDS,
  MAX_INPUT_TOKENS,
  MAX_OUTPUT_TOKENS,
} as const
