import {NextResponse} from 'next/server'
import {headers} from 'next/headers'
import {auth} from '@/platform/auth/server'
import {sendEmailNotification} from '@/platform/notifications/client'
import {renderObserveEmailHtml} from '@/platform/notifications/templates/observe'

export async function POST(request: Request) {
  const session = await auth.api.getSession({headers: await headers()})
  if (!session?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }

  let body: Record<string, unknown> = {}
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    body = {}
  }

  const email = session.user.email

  if (!email) {
    return NextResponse.json(
      {error: 'Session has no recipient email'},
      {status: 400}
    )
  }

  const monitorName =
    typeof body.monitorName === 'string' && body.monitorName.trim()
      ? body.monitorName.trim()
      : 'Monitor Notification Test'

  const url =
    typeof body.url === 'string' && body.url.trim()
      ? body.url.trim()
      : 'https://example.com/monitor-test'

  const aiSummary =
    typeof body.aiSummary === 'string' && body.aiSummary.trim()
      ? body.aiSummary.trim()
      : 'This is a test summary for monitor change notifications.'

  const result = await sendEmailNotification({
    to: email,
    subject: `[Daedalus] Change detected: ${monitorName}`,
    html: renderObserveEmailHtml({
      monitorName,
      url,
      aiSummary,
      diffSummary: 'Test diff: +3 additions, -1 deletion',
      timestamp: new Date(),
    }),
  })

  return NextResponse.json({success: result.sent, ...result, email})
}
