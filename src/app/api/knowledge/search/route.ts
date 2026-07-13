import {headers} from 'next/headers'
import {NextResponse} from 'next/server'
import {auth} from '@/platform/auth/server'
import {searchKnowledge} from '@/daedalus/agent/knowledge/ingest'
import {consumeWorkspaceRateLimit} from '@/daedalus/agent/workspace/rate-limit'

export async function GET(request: Request) {
  const session = await auth.api.getSession({headers: await headers()})
  if (!session?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }

  const query = new URL(request.url).searchParams.get('q')?.trim().slice(0, 500)
  if (!query) return NextResponse.json({results: []})

  const rateLimit = await consumeWorkspaceRateLimit({
    userId: session.user.id,
    action: 'search',
    limit: 30,
    windowMinutes: 1,
  })
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {error: 'Search rate limit reached. Try again in a minute.'},
      {status: 429}
    )
  }

  const results = await searchKnowledge(session.user.id, query)
  return NextResponse.json({results})
}
