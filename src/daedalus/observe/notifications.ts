/**
 * Notification service for observe primitive
 * Handles email and webhook notifications with suppression controls
 */

import { sql } from '@/platform/db/neon'
import type { DiffResult } from './diff'

export interface NotificationPayload {
  monitorId: string
  monitorName: string
  url: string
  diff: DiffResult
  aiSummary: string | null
  timestamp: Date
}

export interface NotificationResult {
  sent: boolean
  suppressed: boolean
  reason?: string
}

/**
 * Check if notification should be suppressed based on recent notifications
 * Suppresses if a notification was sent for this monitor within the cooldown period
 */
async function shouldSuppressNotification(
  monitorId: string,
  cooldownMinutes = 60
): Promise<{ suppress: boolean; reason?: string }> {
  const [recent] = await sql`
    SELECT id, created_at FROM monitor_notifications
    WHERE monitor_id = ${monitorId}
      AND created_at > NOW() - INTERVAL '${cooldownMinutes} minutes'
    ORDER BY created_at DESC
    LIMIT 1
  `

  if (recent) {
    return {
      suppress: true,
      reason: `Notification suppressed: last notification sent at ${recent.created_at}`,
    }
  }

  return { suppress: false }
}

/**
 * Record that a notification was sent
 */
async function recordNotification(
  monitorId: string,
  userId: string,
  channel: 'email' | 'webhook',
  payload: NotificationPayload
): Promise<void> {
  await sql`
    INSERT INTO monitor_notifications (monitor_id, user_id, channel, payload)
    VALUES (${monitorId}, ${userId}, ${channel}, ${JSON.stringify(payload)})
  `
}

/**
 * Send email notification for monitor change
 */
async function sendEmailNotification(
  email: string,
  payload: NotificationPayload
): Promise<boolean> {
  // Check if Resend is configured
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.log('[observe] Email notification skipped: RESEND_API_KEY not configured')
    return false
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'notifications@resend.dev',
        to: email,
        subject: `[Daedalus] Change detected: ${payload.monitorName}`,
        html: formatEmailHtml(payload),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[observe] Email send failed:', errorText)
      return false
    }

    return true
  } catch (error) {
    console.error('[observe] Email notification error:', error)
    return false
  }
}

/**
 * Format email content as HTML
 */
function formatEmailHtml(payload: NotificationPayload): string {
  const summarySection = payload.aiSummary
    ? `<h3>AI Summary</h3><p>${escapeHtml(payload.aiSummary)}</p>`
    : ''

  const diffSummary = payload.diff.summary

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
    h2 { color: #1a1a1a; }
    .url { color: #666; font-size: 14px; }
    .summary { background: #f5f5f5; padding: 12px; border-radius: 6px; margin: 16px 0; }
    .diff-stats { color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <h2>Change Detected: ${escapeHtml(payload.monitorName)}</h2>
  <p class="url"><a href="${escapeHtml(payload.url)}">${escapeHtml(payload.url)}</a></p>
  
  ${summarySection}
  
  <div class="summary">
    <p class="diff-stats">${escapeHtml(diffSummary)}</p>
  </div>
  
  <p style="color: #999; font-size: 12px;">
    Detected at ${payload.timestamp.toISOString()}
  </p>
</body>
</html>
`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Send webhook notification for monitor change
 */
async function sendWebhookNotification(
  webhookUrl: string,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'monitor.change_detected',
        monitor_id: payload.monitorId,
        monitor_name: payload.monitorName,
        url: payload.url,
        ai_summary: payload.aiSummary,
        diff_summary: payload.diff.summary,
        additions: payload.diff.additions,
        deletions: payload.diff.deletions,
        timestamp: payload.timestamp.toISOString(),
      }),
    })

    return response.ok
  } catch (error) {
    console.error('[observe] Webhook notification error:', error)
    return false
  }
}

/**
 * Main notification dispatcher for monitor changes
 * Handles suppression and sends to configured channels
 */
export async function notifyMonitorChange(
  monitorId: string,
  userId: string,
  notificationEmail: string | null,
  webhookUrl: string | null,
  payload: NotificationPayload,
  options: { cooldownMinutes?: number } = {}
): Promise<NotificationResult> {
  const { cooldownMinutes = 60 } = options

  // Check suppression
  const { suppress, reason } = await shouldSuppressNotification(monitorId, cooldownMinutes)
  if (suppress) {
    console.log(`[observe] ${reason}`)
    return { sent: false, suppressed: true, reason }
  }

  let sent = false

  // Send email if configured
  if (notificationEmail) {
    const emailSent = await sendEmailNotification(notificationEmail, payload)
    if (emailSent) {
      await recordNotification(monitorId, userId, 'email', payload)
      sent = true
    }
  }

  // Send webhook if configured
  if (webhookUrl) {
    const webhookSent = await sendWebhookNotification(webhookUrl, payload)
    if (webhookSent) {
      await recordNotification(monitorId, userId, 'webhook', payload)
      sent = true
    }
  }

  return { sent, suppressed: false }
}
