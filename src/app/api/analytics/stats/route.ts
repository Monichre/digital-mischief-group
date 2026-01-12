import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/kysely'

/**
 * Analytics Dashboard API
 *
 * Returns aggregated analytics data for internal dashboards
 * TODO: Add authentication middleware - only admin users should access
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get lead statistics
    const leadStats = await db
      .selectFrom('leads')
      .select([
        'type',
        db.fn.count('id').as('count'),
      ])
      .where('created_at', '>=', startDate)
      .groupBy('type')
      .execute()

    // Get total leads by day
    const leadsByDay = await db
      .selectFrom('leads')
      .select([
        db.fn('DATE', ['created_at']).as('date'),
        db.fn.count('id').as('count'),
      ])
      .where('created_at', '>=', startDate)
      .groupBy('date')
      .orderBy('date', 'asc')
      .execute()

    // Get top referrers
    const topReferrers = await db
      .selectFrom('leads')
      .select([
        'referrer',
        db.fn.count('id').as('count'),
      ])
      .where('created_at', '>=', startDate)
      .where('referrer', 'is not', null)
      .groupBy('referrer')
      .orderBy('count', 'desc')
      .limit(10)
      .execute()

    // Get recent leads
    const recentLeads = await db
      .selectFrom('leads')
      .select([
        'id',
        'email',
        'name',
        'type',
        'source',
        'created_at'
      ])
      .orderBy('created_at', 'desc')
      .limit(20)
      .execute()

    // Calculate conversion metrics
    const totalPageViews = await db
      .selectFrom('page_views')
      .select(db.fn.count('id').as('count'))
      .where('viewed_at', '>=', startDate)
      .executeTakeFirst()

    const totalLeads = await db
      .selectFrom('leads')
      .select(db.fn.count('id').as('count'))
      .where('created_at', '>=', startDate)
      .executeTakeFirst()

    const conversionRate = totalPageViews && totalLeads
      ? ((Number(totalLeads.count) / Number(totalPageViews.count)) * 100).toFixed(2)
      : '0.00'

    return NextResponse.json({
      success: true,
      period: {
        days,
        start: startDate.toISOString(),
        end: new Date().toISOString(),
      },
      summary: {
        total_leads: Number(totalLeads?.count || 0),
        total_page_views: Number(totalPageViews?.count || 0),
        conversion_rate: `${conversionRate}%`,
      },
      leads_by_type: leadStats,
      leads_by_day: leadsByDay,
      top_referrers: topReferrers,
      recent_leads: recentLeads,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
