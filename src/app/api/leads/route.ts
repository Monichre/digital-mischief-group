import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/kysely'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, type, feature, source, metadata } = body

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Get IP address (respecting proxies)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ||
               req.headers.get('x-real-ip') ||
               'unknown'

    // Check if lead already exists
    const existingLead = await db
      .selectFrom('leads')
      .where('email', '=', email)
      .where('type', '=', type)
      .selectAll()
      .executeTakeFirst()

    if (existingLead) {
      // Update existing lead
      await db
        .updateTable('leads')
        .set({
          name: name || existingLead.name,
          last_interaction: new Date(),
          interaction_count: (existingLead.interaction_count || 0) + 1,
          updated_at: new Date(),
        })
        .where('id', '=', existingLead.id)
        .execute()

      return NextResponse.json({
        success: true,
        message: 'Lead updated',
        lead_id: existingLead.id
      })
    }

    // Create new lead
    const [lead] = await db
      .insertInto('leads')
      .values({
        email,
        name: name || null,
        type,
        feature: feature || null,
        source: source || 'unknown',
        ip_address: ip,
        user_agent: req.headers.get('user-agent') || null,
        referrer: metadata?.referrer || null,
        landing_page: metadata?.page || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        interaction_count: 1,
        last_interaction: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('id')
      .execute()

    // TODO: Send to email service (Resend, SendGrid, etc.)
    // TODO: Add to CRM (HubSpot, Salesforce, etc.)

    return NextResponse.json({
      success: true,
      message: 'Lead captured',
      lead_id: lead.id
    })
  } catch (error) {
    console.error('Error capturing lead:', error)
    return NextResponse.json(
      { error: 'Failed to capture lead' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve leads (admin only)
export async function GET(req: NextRequest) {
  try {
    // TODO: Add authentication check
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = db
      .selectFrom('leads')
      .selectAll()
      .orderBy('created_at', 'desc')
      .limit(limit)

    if (type) {
      query = query.where('type', '=', type)
    }

    const leads = await query.execute()

    return NextResponse.json({
      success: true,
      leads,
      count: leads.length
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}
