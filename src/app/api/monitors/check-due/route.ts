import { NextResponse } from "next/server"
import { processDueMonitors } from "@/daedalus/observe/workflow"

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
    const result = await processDueMonitors()
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("[observe] Scheduled check failed:", error)
    return NextResponse.json({ error: "Failed to process monitors" }, { status: 500 })
  }
}
