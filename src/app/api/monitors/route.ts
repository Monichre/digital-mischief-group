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

    const monitors = await sql`
      SELECT m.*, 
        (SELECT COUNT(*) FROM monitor_changes WHERE monitor_id = m.id AND user_id = ${userId}) as change_count
      FROM monitors m
      WHERE m.user_id = ${userId}
      ORDER BY created_at DESC
    `
    return NextResponse.json( { monitors } )
  } catch ( error ) {
    console.error( "Failed to fetch monitors:", error )
    return NextResponse.json( { error: "Failed to fetch monitors" }, { status: 500 } )
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
    const { name, url, check_interval_seconds, notification_email } = body

    if ( !name || !url ) {
      return NextResponse.json( { error: "Name and URL required" }, { status: 400 } )
    }

    const [monitor] = await sql`
      INSERT INTO monitors (name, url, check_interval_seconds, notification_email, user_id)
      VALUES (${name}, ${url}, ${check_interval_seconds || 86400}, ${notification_email || null}, ${userId})
      RETURNING *
    `

    return NextResponse.json( { monitor } )
  } catch ( error ) {
    console.error( "Failed to create monitor:", error )
    return NextResponse.json( { error: "Failed to create monitor" }, { status: 500 } )
  }
}
