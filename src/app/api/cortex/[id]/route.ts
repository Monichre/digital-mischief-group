import { NextResponse } from 'next/server'
import { sql } from '@/platform/db/neon'
import { auth } from '@/platform/auth/server'
import { headers } from 'next/headers'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await sql`
    SELECT
      id,
      target_type,
      target_name,
      target_identifier,
      directive,
      summary,
      dossier_json,
      logo_url,
      sources,
      created_at
    FROM cortex_dossiers
    WHERE id = ${params.id}
      AND user_id = ${session.user.id}
    LIMIT 1
  `

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Dossier not found' }, { status: 404 })
  }

  return NextResponse.json({ dossier: rows[0] })
}
