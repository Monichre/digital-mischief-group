import { type NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db/neon'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession( { headers: await headers() } )
  if ( !session?.user?.id ) {
    return NextResponse.json( { error: 'Unauthorized' }, { status: 401 } )
  }

  const { id } = await params

  try {
    const jobs = await sql`
      SELECT * FROM enrichment_jobs
      WHERE id = ${id} AND user_id = ${session.user.id}
    `

    if ( jobs.length === 0 ) {
      return NextResponse.json( { error: 'Not found' }, { status: 404 } )
    }

    const job = jobs[0]

    // Parse JSON fields
    const result = {
      id: job.id,
      input_type: job.input_type,
      input_value: job.input_value,
      normalized_url: job.normalized_url,
      domain: job.domain,
      company_name: job.company_name,
      company_description: job.company_description,
      company_industry: job.industry,
      company_size: job.employee_count?.toString(),
      company_founded: job.founded_year?.toString(),
      company_headquarters: job.headquarters,
      company_website: job.website,
      tech_stack: job.technologies,
      funding_total: job.funding_total,
      key_people: job.leadership,
      icp_fit_score: job.icp_fit_score,
      icp_fit_reasons: job.icp_fit_reasons,
      buying_signals: job.buying_signals,
      sources: job.sources,
      status: job.status,
      created_at: job.created_at,
      agents: {
        discovery: job.discovery_data,
        profile: job.profile_data,
        funding: job.funding_data,
        techStack: job.tech_stack_data,
        customFields: job.custom_fields_data,
      },
    }

    return NextResponse.json( result )
  } catch ( error ) {
    console.error( '[Enrich Get] Error:', error )
    return NextResponse.json(
      { error: 'Failed to fetch enrichment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession( { headers: await headers() } )
  if ( !session?.user?.id ) {
    return NextResponse.json( { error: 'Unauthorized' }, { status: 401 } )
  }

  const { id } = await params

  try {
    const result = await sql`
      DELETE FROM enrichment_jobs
      WHERE id = ${id} AND user_id = ${session.user.id}
      RETURNING id
    `

    if ( result.length === 0 ) {
      return NextResponse.json( { error: 'Not found' }, { status: 404 } )
    }

    return NextResponse.json( { success: true } )
  } catch ( error ) {
    console.error( '[Enrich Delete] Error:', error )
    return NextResponse.json(
      { error: 'Failed to delete enrichment' },
      { status: 500 }
    )
  }
}
