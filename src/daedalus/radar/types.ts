export type RadarSource = "twitter" | "reddit" | "hackernews" | "firecrawl" | "exa"

export interface RadarRule {
  id: string
  user_id: string
  name: string
  terms: string[]
  sources: RadarSource[]
  notify_email: string | null
  notify_webhook: string | null
  cooldown_minutes: number
  check_interval_minutes: number
  is_active: boolean
  last_run_at: string | null
  last_notification_at: string | null
  created_at: string
  updated_at: string
}

export interface RadarEvent {
  id: string
  user_id: string
  rule_id: string
  source: RadarSource | string
  url: string
  normalized_url: string
  title: string | null
  snippet: string | null
  matched_terms: string[]
  occurred_at: string
  seen: boolean
  created_at: string
}

export interface SearchHit {
  url: string
  title: string | null
  snippet: string | null
  timestamp: string
  source: RadarSource | string
}

export interface RunResult {
  ruleId: string
  newEvents: number
  errors?: string[]
}

export interface RadarStats {
  processedRules: number
  newEvents: number
  errors: Array<{ ruleId: string; error: string }>
}
