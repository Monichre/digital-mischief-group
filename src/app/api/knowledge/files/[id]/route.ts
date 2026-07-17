import {get} from '@vercel/blob'
import {headers} from 'next/headers'
import {NextResponse} from 'next/server'
import {auth} from '@/platform/auth/server'
import {sql} from '@/platform/db/neon'

export async function GET(
  _request: Request,
  context: {params: Promise<{id: string}>}
) {
  const session = await auth.api.getSession({headers: await headers()})
  if (!session?.user?.id) return new NextResponse('Unauthorized', {status: 401})

  const {id} = await context.params
  const [source] = await sql`
    SELECT blob_pathname, file_name, mime_type
    FROM knowledge_sources
    WHERE id = ${id} AND user_id = ${session.user.id} AND source_type = 'file'
  `

  if (!source?.blob_pathname) return new NextResponse('Not found', {status: 404})

  const result = await get(String(source.blob_pathname), {access: 'private'})
  if (!result || result.statusCode !== 200) {
    return new NextResponse('Not found', {status: 404})
  }

  const fileName = String(source.file_name || 'source').replace(/["\r\n]/g, '')
  const asciiFileName =
    fileName.normalize('NFKD').replace(/[^\x20-\x7E]/g, '_') || 'source'
  const encodedFileName = encodeURIComponent(fileName).replace(
    /['()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  )

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': String(source.mime_type || result.blob.contentType),
      'Content-Disposition': `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
