import {
  DEFAULT_NOTIFICATION_FROM_EMAIL,
  type EmailNotificationInput,
  type NotificationSendResult,
} from '@/platform/notifications/types'

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export async function sendEmailNotification(
  input: EmailNotificationInput
): Promise<NotificationSendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return {
      sent: false,
      skipped: true,
      error: 'RESEND_API_KEY not configured',
    }
  }

  if (!input.to || (Array.isArray(input.to) && input.to.length === 0)) {
    return {
      sent: false,
      skipped: true,
      error: 'No recipient configured',
    }
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: input.from || process.env.RESEND_FROM_EMAIL || DEFAULT_NOTIFICATION_FROM_EMAIL,
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    })

    if (!response.ok) {
      return {
        sent: false,
        skipped: false,
        status: response.status,
        error: await response.text(),
      }
    }

    return {
      sent: true,
      skipped: false,
      status: response.status,
    }
  } catch (error) {
    return {
      sent: false,
      skipped: false,
      error: error instanceof Error ? error.message : 'Unknown email send error',
    }
  }
}

export async function sendWebhookNotification(
  webhookUrl: string,
  payload: Record<string, unknown>
): Promise<NotificationSendResult> {
  if (!webhookUrl) {
    return {
      sent: false,
      skipped: true,
      error: 'Webhook URL missing',
    }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return {
        sent: false,
        skipped: false,
        status: response.status,
        error: await response.text(),
      }
    }

    return {
      sent: true,
      skipped: false,
      status: response.status,
    }
  } catch (error) {
    return {
      sent: false,
      skipped: false,
      error: error instanceof Error ? error.message : 'Unknown webhook send error',
    }
  }
}
