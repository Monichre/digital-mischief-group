import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db/neon"

// GET all research missions
export async function GET() {
  try {
    const missions = await sql`
      SELECT * FROM research_missions 
      ORDER BY created_at DESC 
      LIMIT 50
    `
    return NextResponse.json({ missions })
  } catch (error) {
    console.error("Failed to fetch research missions:", error)
    return NextResponse.json({ error: "Failed to fetch research missions" }, { status: 500 })
  }
}

// POST create new research mission
export async function POST(req: NextRequest) {
  try {
    const { name, query, depth = "standard", sources = ["perplexity", "exa"] } = await req.json()

    if (!name || !query) {
      return NextResponse.json({ error: "Name and query are required" }, { status: 400 })
    }

    const [mission] = await sql`
      INSERT INTO research_missions (name, query, depth, sources, status)
      VALUES (${name}, ${query}, ${depth}, ${sources}, 'pending')
      RETURNING *
    `

    return NextResponse.json({ mission })
  } catch (error) {
    console.error("Failed to create research mission:", error)
    return NextResponse.json({ error: "Failed to create research mission" }, { status: 500 })
  }
}
