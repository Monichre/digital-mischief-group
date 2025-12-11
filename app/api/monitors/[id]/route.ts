import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db/neon"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const [monitor] = await sql`SELECT * FROM monitors WHERE id = ${id}`

    if (!monitor) {
      return NextResponse.json({ error: "Monitor not found" }, { status: 404 })
    }

    const changes = await sql`
      SELECT * FROM monitor_changes 
      WHERE monitor_id = ${id} 
      ORDER BY created_at DESC
      LIMIT 50
    `

    return NextResponse.json({ monitor, changes })
  } catch (error) {
    console.error("Failed to fetch monitor:", error)
    return NextResponse.json({ error: "Failed to fetch monitor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await sql`DELETE FROM monitors WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete monitor:", error)
    return NextResponse.json({ error: "Failed to delete monitor" }, { status: 500 })
  }
}
