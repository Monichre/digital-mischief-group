import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db/neon"

export async function GET() {
  try {
    const monitors = await sql`
      SELECT m.*, 
        (SELECT COUNT(*) FROM monitor_changes WHERE monitor_id = m.id) as change_count
      FROM monitors m
      ORDER BY created_at DESC
    `
    return NextResponse.json({ monitors })
  } catch (error) {
    console.error("Failed to fetch monitors:", error)
    return NextResponse.json({ error: "Failed to fetch monitors" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, url, check_interval_seconds, notification_email } = body

    if (!name || !url) {
      return NextResponse.json({ error: "Name and URL required" }, { status: 400 })
    }

    const [monitor] = await sql`
      INSERT INTO monitors (name, url, check_interval_seconds, notification_email)
      VALUES (${name}, ${url}, ${check_interval_seconds || 86400}, ${notification_email || null})
      RETURNING *
    `

    return NextResponse.json({ monitor })
  } catch (error) {
    console.error("Failed to create monitor:", error)
    return NextResponse.json({ error: "Failed to create monitor" }, { status: 500 })
  }
}
