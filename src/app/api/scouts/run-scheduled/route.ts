import { NextResponse } from "next/server"
import { processScheduledScouts } from "@/daedalus/scout/workflow"

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
    const result = await processScheduledScouts()
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("[scout] Scheduled run failed:", error)
    return NextResponse.json({ error: "Failed to process scheduled scouts" }, { status: 500 })
  }
}
