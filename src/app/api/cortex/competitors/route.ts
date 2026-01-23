import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sql } from '@/platform/db/neon'
import { auth } from '@/platform/auth/server'
import { headers } from 'next/headers'
import { discoverCompetitors } from '@/ai/agents/competitive.agent'

export const maxDuration = 60

const RequestSchema = z.object({
  enrichmentJobId: z.string().uuid(),
})

function parseJsonValue<T>(value: unknown): T | null {
  if (!value) return null
  if (typeof value === 'object') return value as T
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }
  return null
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  try {
    const body = await request.json()
    const { enrichmentJobId } = RequestSchema.parse(body)

    const enrichmentRows = await sql`
      SELECT
        id,
        company_name,
        domain,
        industry,
        company_description,
        custom_fields_data
      FROM enrichment_jobs
      WHERE id = ${enrichmentJobId}
        AND user_id = ${userId}
      LIMIT 1
    `

    if (enrichmentRows.length === 0) {
      return NextResponse.json({ error: 'Enrichment job not found' }, { status: 404 })
    }

    const enrichment = enrichmentRows[0]

    const existing = await sql`
      SELECT competitors, status
      FROM brand_recon_jobs
      WHERE enrichment_job_id = ${enrichmentJobId}
        AND user_id = ${userId}
      LIMIT 1
    `

    if (existing.length > 0 && existing[0].status === 'completed') {
      const competitors = parseJsonValue(existing[0].competitors) || []
      return NextResponse.json({ competitors })
    }

    const customFields = parseJsonValue<Record<string, unknown>>(enrichment.custom_fields_data)

    const competitiveResult = await discoverCompetitors({
      company_name: enrichment.company_name || enrichment.domain || 'Unknown',
      domain: enrichment.domain || '',
      industry: enrichment.industry || null,
      description: enrichment.company_description || null,
      segment:
        (customFields?.segment as string | null) ||
        (customFields?.business_type as string | null) ||
        null,
    })

    if (!competitiveResult.success || !competitiveResult.data) {
      return NextResponse.json({ competitors: [] })
    }

    return NextResponse.json({
      competitors: competitiveResult.data.competitors.slice(0, 10),
    })
  } catch (error) {
    console.error('[Cortex Competitors] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to discover competitors' },
      { status: 500 }
    )
  }
}
