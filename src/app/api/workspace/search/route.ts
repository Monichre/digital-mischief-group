import {headers} from 'next/headers'
import {NextResponse} from 'next/server'
import {auth} from '@/platform/auth/server'
import {sql} from '@/platform/db/neon'
import {searchKnowledge} from '@/daedalus/agent/knowledge/ingest'
import {consumeWorkspaceRateLimit} from '@/daedalus/agent/workspace/rate-limit'

export async function GET(request: Request) {
  const session = await auth.api.getSession({headers: await headers()})
  if (!session?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }

  const query = new URL(request.url).searchParams.get('q')?.trim().slice(0, 500)
  if (!query) return NextResponse.json({tasks: [], sources: [], knowledge: []})

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

  const [tasks, sources, knowledge] = await Promise.all([
    sql`
      SELECT id, skill, primitive, title, prompt, status, target_href, created_at
      FROM workspace_tasks
      WHERE user_id = ${session.user.id}
        AND (
          to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(prompt, ''))
            @@ websearch_to_tsquery('english', ${query})
          OR title ILIKE ${`%${query}%`}
          OR prompt ILIKE ${`%${query}%`}
        )
      ORDER BY created_at DESC
      LIMIT 20
    `,
    sql`
      SELECT id, source_type, title, summary, status, created_at
      FROM knowledge_sources
      WHERE user_id = ${session.user.id}
        AND (
          to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, ''))
            @@ websearch_to_tsquery('english', ${query})
          OR title ILIKE ${`%${query}%`}
          OR summary ILIKE ${`%${query}%`}
          OR content ILIKE ${`%${query}%`}
        )
      ORDER BY created_at DESC
      LIMIT 20
    `,
    searchKnowledge(session.user.id, query, 8),
  ])

  return NextResponse.json({tasks, sources, knowledge})
}
