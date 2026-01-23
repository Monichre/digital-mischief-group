import { NextResponse } from "next/server"
import { processScheduledRules } from "@/daedalus/radar/service"

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = request.headers.get("x-cron-secret")
  return header === secret
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const stats = await processScheduledRules()
    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("[radar] scheduled run error", error)
    return NextResponse.json({ error: "Failed to run scheduled radar" }, { status: 500 })
  }
}
