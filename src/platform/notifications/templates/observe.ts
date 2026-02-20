import {escapeHtml} from '@/platform/notifications/types'

export interface ObserveEmailTemplatePayload {
  monitorName: string
  url: string
  aiSummary: string | null
  diffSummary: string
  timestamp: Date
}

export function renderObserveEmailHtml(payload: ObserveEmailTemplatePayload): string {
  const summarySection = payload.aiSummary
    ? `<h3>AI Summary</h3><p>${escapeHtml(payload.aiSummary)}</p>`
    : ''

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
    <p class="diff-stats">${escapeHtml(payload.diffSummary)}</p>
  </div>
  <p style="color: #999; font-size: 12px;">
    Detected at ${payload.timestamp.toISOString()}
  </p>
</body>
</html>
`
}
