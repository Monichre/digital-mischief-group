import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/platform/auth/server"
import { sql } from "@/platform/db/neon"
import { getUsageStats, getPlanLimits } from "@/platform/billing/limits"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user info
    const [user] = await sql`
      SELECT 
        id, email, subscription_status, stripe_customer_id, credits
      FROM public."user" 
      WHERE id = ${session.user.id}
    `

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const subscriptionStatus = user.subscription_status || "inactive"
    const limits = getPlanLimits(subscriptionStatus)

    // Get usage stats per primitive
    const usageStats = await getUsageStats(session.user.id)

    // Get billing period info
    const currentMonth = new Date()
    const periodStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const periodEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    // Get recent usage events
    const recentEvents = await sql`
      SELECT 
        id, event_type, module, status, created_at
      FROM usage_events
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
      LIMIT 20
    `

    return NextResponse.json({
      plan: {
        status: subscriptionStatus,
        name: subscriptionStatus === "active" ? "Operator" : "Observer",
        hasStripeCustomer: !!user.stripe_customer_id,
      },
      limits,
      usage: usageStats,
      billingPeriod: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
      },
      recentEvents: recentEvents.map((e) => ({
        id: e.id,
        type: e.event_type,
        module: e.module,
        status: e.status,
        createdAt: e.created_at,
      })),
      credits: user.credits || 0,
    })
  } catch (error) {
    console.error("[Billing Usage] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    )
  }
}
