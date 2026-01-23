import {NextResponse} from 'next/server'
import {headers} from 'next/headers'
import {auth} from '@/platform/auth/server'
import {sql} from '@/platform/db/neon'

export async function GET(
  _request: Request,
  {params}: {params: Promise<{id: string}>}
) {
  try {
    const session = await auth.api.getSession({headers: await headers()})
    if (!session?.user?.id) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }
    const userId = session.user.id
    const {id} = await params

    const [scout] = await sql`
      SELECT id FROM scouts WHERE id = ${id} AND user_id = ${userId}
    `

    if (!scout) {
      return NextResponse.json({error: 'Scout not found'}, {status: 404})
    }

    const runs = await sql`
      SELECT id, scout_id, status, created_at, completed_at,
        search_results_count, new_results_count, analysis_duration_ms,
        error_message
      FROM sentinel_agent_runs
      WHERE scout_id = ${id}
      ORDER BY created_at DESC
      LIMIT 50
    `

    return NextResponse.json({runs})
  } catch (error) {
    console.error('Failed to fetch scout runs:', error)
    return NextResponse.json({error: 'Failed to fetch scout runs'}, {status: 500})
  }
}

export async function DELETE(
  _request: Request,
  {params}: {params: Promise<{id: string}>}
) {
  try {
    const session = await auth.api.getSession({headers: await headers()})
    if (!session?.user?.id) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401})
    }
    const userId = session.user.id
    const {id} = await params

    const [scout] = await sql`
      SELECT id FROM scouts WHERE id = ${id} AND user_id = ${userId}
    `

    if (!scout) {
      return NextResponse.json({error: 'Scout not found'}, {status: 404})
    }

    await sql`
      DELETE FROM sentinel_insights WHERE scout_id = ${id}
    `
    await sql`
      DELETE FROM competitive_intel WHERE scout_id = ${id}
    `
    await sql`
      DELETE FROM sentinel_trends WHERE scout_id = ${id}
    `
    await sql`
      DELETE FROM sentinel_agent_runs WHERE scout_id = ${id}
    `
    await sql`
      DELETE FROM scout_results WHERE scout_id = ${id}
    `

    return NextResponse.json({success: true})
  } catch (error) {
    console.error('Failed to clear scout runs:', error)
    return NextResponse.json({error: 'Failed to clear scout runs'}, {status: 500})
  }
}
