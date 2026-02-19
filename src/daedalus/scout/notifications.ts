import type { SearchResult } from "./workflow"
import { sendEmailNotification } from "@/platform/notifications/client"
import { renderScoutEmailHtml } from "@/platform/notifications/templates/scout"

interface ScoutNotificationPayload {
  scoutId: string
  scoutName: string
  query: string
  newResults: SearchResult[]
}

export async function sendScoutEmailNotification(
  email: string,
  payload: ScoutNotificationPayload
): Promise<boolean> {
  const result = await sendEmailNotification({
    to: email,
    subject: `[Daedalus] New scout findings for ${payload.scoutName}`,
    html: renderScoutEmailHtml(payload),
  })

  if (!result.sent) {
    if (result.skipped) {
      console.log("[scout] Notification skipped:", result.error)
    } else {
      console.error("[scout] Email send failed:", result.error)
    }
  }

  return result.sent
}
