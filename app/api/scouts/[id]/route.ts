import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db/neon"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    const { id } = await params
    const [scout] = await sql`SELECT * FROM scouts WHERE id = ${id} AND user_id = ${userId}`

    if (!scout) {
      return NextResponse.json({ error: "Scout not found" }, { status: 404 })
    }

    const results = await sql`
      SELECT * FROM scout_results 
      WHERE scout_id = ${id} 
      ORDER BY first_seen_at DESC
      LIMIT 100
    `

    return NextResponse.json({ scout, results })
  } catch (error) {
    console.error("Failed to fetch scout:", error)
    return NextResponse.json({ error: "Failed to fetch scout" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    const { id } = await params
    const result = await sql`DELETE FROM scouts WHERE id = ${id} AND user_id = ${userId} RETURNING id`
    
    if (result.length === 0) {
      return NextResponse.json({ error: "Scout not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete scout:", error)
    return NextResponse.json({ error: "Failed to delete scout" }, { status: 500 })
  }
}
