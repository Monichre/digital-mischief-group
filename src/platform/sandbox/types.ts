/**
 * War Games Sandbox - Shared Types
 */

export type WorkflowType =
  | 'agent-routing'
  | 'prompt-evaluation'
  | 'pdf-analysis'
  | 'document-pipeline'
  | 'enrich-profile'

export interface SandboxSession {
  id: string
  created_at: number
  last_activity: number
  total_executions: number
}

export interface ExecutionRecord {
  workflow_type: WorkflowType
  timestamp: number
  input_tokens: number
  output_tokens: number
  duration_ms: number
}

export interface RateLimitCheck {
  allowed: boolean
  reason?: 'daily_limit' | 'cooldown' | 'invalid_session'
  remaining_executions?: number
  cooldown_remaining_seconds?: number
  reset_at?: number
}

export interface UsageStats {
  executions_today: number
  remaining_executions: number
  cooldown_seconds: number
  reset_at: number
}

export interface SessionResponse {
  session_id: string
  session: SandboxSession
  usage: UsageStats
}
