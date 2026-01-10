import { type NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db/neon'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET() {
  const session = await auth.api.getSession( { headers: await headers() } )
  if ( !session?.user?.id ) {
    return NextResponse.json( { error: 'Unauthorized' }, { status: 401 } )
  }

  try {
    const users = await sql`
      SELECT 
        id, name, email, image, 
        stripe_customer_id, subscription_status, credits,
        created_at
      FROM "user"
      WHERE id = ${session.user.id}
    `

    if ( users.length === 0 ) {
      return NextResponse.json( { error: 'User not found' }, { status: 404 } )
    }

    const user = users[0]

    // Get usage stats
    const [enrichmentStats] = await sql`
      SELECT 
        COUNT(*) as total_enrichments,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as enrichments_this_month
      FROM enrichment_jobs
      WHERE user_id = ${session.user.id}
    `

    const [researchStats] = await sql`
      SELECT 
        COUNT(*) as total_research,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as research_this_month
      FROM research_missions
      WHERE user_id = ${session.user.id}
    `

    const [brandStats] = await sql`
      SELECT 
        COUNT(*) as total_brands,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as brands_this_month
      FROM brand_extractions
      WHERE user_id = ${session.user.id}
    `

    return NextResponse.json( {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        subscriptionStatus: user.subscription_status || 'inactive',
        credits: user.credits || 0,
        createdAt: user.created_at,
        hasStripeCustomer: !!user.stripe_customer_id,
      },
      usage: {
        enrichments: {
          total: parseInt( enrichmentStats?.total_enrichments || '0' ),
          thisMonth: parseInt( enrichmentStats?.enrichments_this_month || '0' ),
        },
        research: {
          total: parseInt( researchStats?.total_research || '0' ),
          thisMonth: parseInt( researchStats?.research_this_month || '0' ),
        },
        brands: {
          total: parseInt( brandStats?.total_brands || '0' ),
          thisMonth: parseInt( brandStats?.brands_this_month || '0' ),
        },
      },
    } )
  } catch ( error ) {
    console.error( '[Profile] Error:', error )
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH( request: NextRequest ) {
  const session = await auth.api.getSession( { headers: await headers() } )
  if ( !session?.user?.id ) {
    return NextResponse.json( { error: 'Unauthorized' }, { status: 401 } )
  }

  try {
    const { name } = await request.json()

    if ( name !== undefined ) {
      await sql`
        UPDATE "user"
        SET name = ${name}, updated_at = NOW()
        WHERE id = ${session.user.id}
      `
    }

    return NextResponse.json( { success: true } )
  } catch ( error ) {
    console.error( '[Profile Update] Error:', error )
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
