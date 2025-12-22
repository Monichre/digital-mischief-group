import { type NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db/neon'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')
  const search = searchParams.get('search') || ''

  try {
    let jobs
    let total

    if (search) {
      jobs = await sql`
        SELECT 
          id, input_type, input_value, domain, company_name, 
          company_description, icp_fit_score, status, 
          created_at, completed_phases
        FROM enrichment_jobs
        WHERE user_id = ${session.user.id}
          AND (
            company_name ILIKE ${'%' + search + '%'}
            OR domain ILIKE ${'%' + search + '%'}
            OR input_value ILIKE ${'%' + search + '%'}
          )
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      const countResult = await sql`
        SELECT COUNT(*) as count FROM enrichment_jobs
        WHERE user_id = ${session.user.id}
          AND (
            company_name ILIKE ${'%' + search + '%'}
            OR domain ILIKE ${'%' + search + '%'}
            OR input_value ILIKE ${'%' + search + '%'}
          )
      `
      total = parseInt(countResult[0].count)
    } else {
      jobs = await sql`
        SELECT 
          id, input_type, input_value, domain, company_name, 
          company_description, icp_fit_score, status, 
          created_at, completed_phases
        FROM enrichment_jobs
        WHERE user_id = ${session.user.id}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      const countResult = await sql`
        SELECT COUNT(*) as count FROM enrichment_jobs
        WHERE user_id = ${session.user.id}
      `
      total = parseInt(countResult[0].count)
    }

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + jobs.length < total,
      },
    })
  } catch (error) {
    console.error('[Enrich History] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
