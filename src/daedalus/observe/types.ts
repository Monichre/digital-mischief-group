export interface Monitor {
  id: string
  name: string
  url: string
  check_interval_seconds: number
  is_active: boolean
  last_checked_at: string | null
  last_content_hash: string | null
  last_excerpt: string | null
  notification_email: string | null
  user_id: string
  created_at: string
  updated_at: string
}

export interface MonitorChange {
  id: string
  monitor_id: string
  user_id: string
  old_hash: string | null
  new_hash: string
  old_excerpt: string | null
  new_excerpt: string | null
  ai_summary: string | null
  created_at: string
}

export interface CreateMonitorInput {
  name: string
  url: string
  check_interval_seconds?: number
  notification_email?: string | null
}

export interface CheckMonitorResult {
  success: boolean
  changed: boolean
  newHash: string
  aiSummary?: string | null
  error?: string
}
