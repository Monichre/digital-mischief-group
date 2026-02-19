/**
 * Notification service for observe primitive
 * Handles email and webhook notifications with suppression controls
 */

import { sql } from '@/platform/db/neon'
import type { DiffResult } from './diff'
import {
  sendEmailNotification,
  sendWebhookNotification as sendWebhookRequest,
} from '@/platform/notifications/client'
import { renderObserveEmailHtml } from '@/platform/notifications/templates/observe'

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
      AND created_at > NOW() - make_interval(mins => ${cooldownMinutes})
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
 * Send webhook notification for monitor change
 */
async function sendWebhookNotification(
  webhookUrl: string,
  payload: NotificationPayload
): Promise<boolean> {
  const result = await sendWebhookRequest(webhookUrl, {
    event: 'monitor.change_detected',
    monitor_id: payload.monitorId,
    monitor_name: payload.monitorName,
    url: payload.url,
    ai_summary: payload.aiSummary,
    diff_summary: payload.diff.summary,
    additions: payload.diff.additions,
    deletions: payload.diff.deletions,
    timestamp: payload.timestamp.toISOString(),
  })

  if (!result.sent && !result.skipped) {
    console.error('[observe] Webhook notification error:', result.error)
  }

  return result.sent
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
    const emailResult = await sendEmailNotification({
      to: notificationEmail,
      subject: `[Daedalus] Change detected: ${payload.monitorName}`,
      html: renderObserveEmailHtml({
        monitorName: payload.monitorName,
        url: payload.url,
        aiSummary: payload.aiSummary,
        diffSummary: payload.diff.summary,
        timestamp: payload.timestamp,
      }),
    })

    if (!emailResult.sent) {
      if (emailResult.skipped) {
        console.log('[observe] Email notification skipped:', emailResult.error)
      } else {
        console.error('[observe] Email notification error:', emailResult.error)
      }
    }

    if (emailResult.sent) {
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
