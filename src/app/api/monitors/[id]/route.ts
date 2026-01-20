import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/platform/db/neon"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"

export async function GET( request: NextRequest, { params }: { params: Promise<{ id: string }> } ) {
  try {
    const session = await auth.api.getSession( { headers: await headers() } )
    if ( !session?.user?.id ) {
      return NextResponse.json( { error: "Unauthorized" }, { status: 401 } )
    }
    const userId = session.user.id

    const { id } = await params
    const [monitor] = await sql`SELECT * FROM monitors WHERE id = ${id} AND user_id = ${userId}`

    if ( !monitor ) {
      return NextResponse.json( { error: "Monitor not found" }, { status: 404 } )
    }

    const changes = await sql`
      SELECT * FROM monitor_changes 
      WHERE monitor_id = ${id} AND user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `

    return NextResponse.json( { monitor, changes } )
  } catch ( error ) {
    console.error( "Failed to fetch monitor:", error )
    return NextResponse.json( { error: "Failed to fetch monitor" }, { status: 500 } )
  }
}

export async function DELETE( request: NextRequest, { params }: { params: Promise<{ id: string }> } ) {
  try {
    const session = await auth.api.getSession( { headers: await headers() } )
    if ( !session?.user?.id ) {
      return NextResponse.json( { error: "Unauthorized" }, { status: 401 } )
    }
    const userId = session.user.id

    const { id } = await params
    const result = await sql`DELETE FROM monitors WHERE id = ${id} AND user_id = ${userId} RETURNING id`

    if ( result.length === 0 ) {
      return NextResponse.json( { error: "Monitor not found or unauthorized" }, { status: 404 } )
    }

    return NextResponse.json( { success: true } )
  } catch ( error ) {
    console.error( "Failed to delete monitor:", error )
    return NextResponse.json( { error: "Failed to delete monitor" }, { status: 500 } )
  }
}
