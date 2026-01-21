/**
 * Monitoring API Endpoint
 *
 * T-007: Lightweight dashboard endpoint for real-time metrics.
 * Returns per-primitive metrics with 1h rolling windows.
 *
 * GET /api/monitoring - Get metrics summary
 * POST /api/monitoring/check - Run alert checks
 */

import { NextResponse } from "next/server"
import { auth } from "@/platform/auth/server"
import { getMetricsSummary, checkAndDispatchAlerts } from "@/platform/monitoring"

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) ?? []

async function isAdmin(headers: Headers): Promise<boolean> {
  const session = await auth.api.getSession({ headers })
  if (!session?.user?.email) return false
  return ADMIN_EMAILS.includes(session.user.email)
}

export async function GET(req: Request) {
  // Admin-only endpoint
  if (!(await isAdmin(req.headers))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const summary = getMetricsSummary()

  return NextResponse.json({
    success: true,
    data: summary,
  })
}

export async function POST(req: Request) {
  // Admin-only endpoint
  if (!(await isAdmin(req.headers))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const action = body.action as string | undefined

  if (action === "check") {
    await checkAndDispatchAlerts()
    return NextResponse.json({ success: true, message: "Alert check completed" })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
