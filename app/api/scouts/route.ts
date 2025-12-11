import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db/neon"

export async function GET() {
  try {
    const scouts = await sql`
      SELECT s.*, 
        (SELECT COUNT(*) FROM scout_results WHERE scout_id = s.id) as result_count
      FROM scouts s
      ORDER BY created_at DESC
    `
    return NextResponse.json({ scouts })
  } catch (error) {
    console.error("Failed to fetch scouts:", error)
    return NextResponse.json({ error: "Failed to fetch scouts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, search_query, schedule, notification_email } = body

    if (!name || !search_query) {
      return NextResponse.json({ error: "Name and search query required" }, { status: 400 })
    }

    const [scout] = await sql`
      INSERT INTO scouts (name, search_query, schedule, notification_email)
      VALUES (${name}, ${search_query}, ${schedule || "manual"}, ${notification_email || null})
      RETURNING *
    `

    return NextResponse.json({ scout })
  } catch (error) {
    console.error("Failed to create scout:", error)
    return NextResponse.json({ error: "Failed to create scout" }, { status: 500 })
  }
}
