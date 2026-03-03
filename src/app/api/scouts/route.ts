import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sql } from "@/platform/db/neon"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"

// Input validation schema
const CreateScoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  search_query: z.string().min(1, "Search query is required"),
  schedule: z.enum(["manual", "hourly", "daily", "weekly"]).optional(),
  notification_email: z.string().email().optional().nullable(),
})

export async function GET() {
  try {
    const session = await auth.api.getSession( { headers: await headers() } )
    if ( !session?.user?.id ) {
      return NextResponse.json( { error: "Unauthorized" }, { status: 401 } )
    }
    const userId = session.user.id

    const scouts = await sql`
      SELECT s.*, 
        (SELECT COUNT(*) FROM scout_results WHERE scout_id = s.id AND user_id = ${userId}) as result_count
      FROM scouts s
      WHERE s.user_id = ${userId}
      ORDER BY created_at DESC
    `
    return NextResponse.json( { scouts } )
  } catch ( error ) {
    console.error( "Failed to fetch scouts:", error )
    return NextResponse.json( { error: "Failed to fetch scouts" }, { status: 500 } )
  }
}

export async function POST( request: NextRequest ) {
  try {
    const session = await auth.api.getSession( { headers: await headers() } )
    if ( !session?.user?.id ) {
      return NextResponse.json( { error: "Unauthorized" }, { status: 401 } )
    }
    const userId = session.user.id

    const body = await request.json()

    // Validate input with Zod
    const parseResult = CreateScoutSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const { name, search_query, schedule, notification_email } = parseResult.data

    const [scout] = await sql`
      INSERT INTO scouts (name, search_query, schedule, notification_email, user_id)
      VALUES (${name}, ${search_query}, ${schedule || "manual"}, ${notification_email || null}, ${userId})
      RETURNING *
    `

    return NextResponse.json( { scout } )
  } catch ( error ) {
    console.error( "Failed to create scout:", error )
    return NextResponse.json( { error: "Failed to create scout" }, { status: 500 } )
  }
}
