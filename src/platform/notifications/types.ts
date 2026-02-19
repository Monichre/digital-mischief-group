export interface EmailNotificationInput {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export interface NotificationSendResult {
  sent: boolean
  skipped: boolean
  status?: number
  error?: string
}

export const DEFAULT_NOTIFICATION_FROM_EMAIL = 'notifications@resend.dev'

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
