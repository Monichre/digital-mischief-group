import {NextResponse} from 'next/server'
import {headers} from 'next/headers'
import {auth} from '@/platform/auth/server'
import {sendScoutEmailNotification} from '@/daedalus/scout/notifications'

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

  const scoutName =
    typeof body.scoutName === 'string' && body.scoutName.trim()
      ? body.scoutName.trim()
      : 'Scout Notification Test'

  const query =
    typeof body.query === 'string' && body.query.trim()
      ? body.query.trim()
      : 'daedalus scout notification test'

  const sent = await sendScoutEmailNotification(email, {
    scoutId: 'test-scout',
    scoutName,
    query,
    newResults: [
      {
        url: 'https://example.com/daedalus-test',
        title: 'Scout notification test result',
        snippet: 'This is a test notification generated from Daedalus.',
        source: 'test',
      },
    ],
  })

  return NextResponse.json({success: sent, sent, email})
}
