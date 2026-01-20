import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/platform/db/neon"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"

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
    const { name, search_query, schedule, notification_email } = body

    if ( !name || !search_query ) {
      return NextResponse.json( { error: "Name and search query required" }, { status: 400 } )
    }

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
