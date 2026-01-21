export interface Monitor {
  id: string
  name: string
  url: string
  check_interval_seconds: number
  is_active: boolean
  last_checked_at: string | null
  last_content_hash: string | null
  last_content: string | null
  last_excerpt: string | null
  notification_email: string | null
  webhook_url: string | null
  notification_cooldown_minutes: number
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
  old_content: string | null
  new_content: string
  old_excerpt: string | null
  new_excerpt: string | null
  diff_additions: number
  diff_deletions: number
  ai_summary: string | null
  created_at: string
}

export interface CreateMonitorInput {
  name: string
  url: string
  check_interval_seconds?: number
  notification_email?: string | null
  webhook_url?: string | null
  notification_cooldown_minutes?: number
}

export interface CheckMonitorResult {
  success: boolean
  changed: boolean
  newHash: string
  aiSummary?: string | null
  diff?: {
    additions: number
    deletions: number
    summary: string
  }
  notificationSent?: boolean
  error?: string
}
