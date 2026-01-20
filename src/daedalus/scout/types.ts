export type Scout = {
  id: string
  name: string
  search_query: string
  schedule: "manual" | "daily" | "weekly"
  is_active: boolean
  last_run_at: string | null
  next_run_at: string | null
  notification_email: string | null
  seen_urls: string[]
  created_at: string
  updated_at: string
}

export type ScoutResult = {
  id: string
  scout_id: string
  url: string
  title: string | null
  snippet: string | null
  source: string | null
  first_seen_at: string
  metadata: Record<string, unknown> | null
}

export type Monitor = {
  id: string
  name: string
  url: string
  check_interval_seconds: number
  is_active: boolean
  last_checked_at: string | null
  last_content_hash: string | null
  notification_email: string | null
  created_at: string
  updated_at: string
}

export type MonitorChange = {
  id: string
  monitor_id: string
  old_hash: string | null
  new_hash: string | null
  old_excerpt: string | null
  new_excerpt: string | null
  ai_summary: string | null
  created_at: string
}
