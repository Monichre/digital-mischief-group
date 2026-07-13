import {headers} from 'next/headers'
import {NextResponse} from 'next/server'
import {z} from 'zod'
import {auth} from '@/platform/auth/server'
import {checkUsageLimits} from '@/platform/billing/limits'
import {sql} from '@/platform/db/neon'
import {consumeWorkspaceRateLimit} from '@/daedalus/agent/workspace/rate-limit'
import {
  deleteKnowledgeSource,
  ingestKnowledgeSource,
  listKnowledgeSources,
  type KnowledgeIngestInput,
} from '@/daedalus/agent/knowledge/ingest'
import {KNOWLEDGE_SOURCE_TYPES} from '@/daedalus/agent/knowledge/types'

export const maxDuration = 120

const FREE_HOURLY_INGEST_LIMIT = 5
const PAID_HOURLY_INGEST_LIMIT = 25
const ENTERPRISE_HOURLY_INGEST_LIMIT = 100

const JsonInputSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('text'),
    text: z.string().trim().min(1).max(200_000),
    title: z.string().trim().max(180).optional(),
  }),
  z.object({
    type: z.literal('url'),
    url: z.string().url().refine(
      (value) => ['http:', 'https:'].includes(new URL(value).protocol),
      'Only HTTP and HTTPS URLs are supported'
    ),
    title: z.string().trim().max(180).optional(),
  }),
])

async function getUserId() {
  const session = await auth.api.getSession({headers: await headers()})
  return session?.user?.id || null
}

export async function GET(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  const typeParam = new URL(request.url).searchParams.get('type')
  const type = KNOWLEDGE_SOURCE_TYPES.find((value) => value === typeParam)
  const sources = await listKnowledgeSources(userId, type)
  return NextResponse.json({sources})
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  let usageEventId: string | null = null
  try {
    let input: KnowledgeIngestInput
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      const file = form.get('file')
      const title = String(form.get('title') || '').trim() || undefined
      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json({error: 'A file is required'}, {status: 400})
      }
      input = {type: 'file', file, title}
    } else {
      const parsed = JsonInputSchema.safeParse(await request.json())
      if (!parsed.success) {
        return NextResponse.json(
          {error: parsed.error.issues[0]?.message || 'Invalid knowledge source'},
          {status: 400}
        )
      }
      input = parsed.data
    }

    const usage = await checkUsageLimits(userId, 'agent')
    if (!usage.allowed) {
      return NextResponse.json(
        {error: 'Monthly knowledge-ingestion limit reached. Upgrade your plan to continue.'},
        {status: 429}
      )
    }

    const hourlyLimit =
      usage.limit === 0
        ? ENTERPRISE_HOURLY_INGEST_LIMIT
        : usage.limit > 10
          ? PAID_HOURLY_INGEST_LIMIT
          : FREE_HOURLY_INGEST_LIMIT
    const rateLimit = await consumeWorkspaceRateLimit({
      userId,
      action: 'ingest',
      limit: hourlyLimit,
      windowMinutes: 60,
    })
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {error: `Hourly knowledge-ingestion limit reached (${hourlyLimit}). Try again next hour.`},
        {status: 429}
      )
    }

    const [usageEvent] = await sql`
      INSERT INTO usage_events (event_type, module, input_value, status, metadata, user_id)
      VALUES (
        'knowledge_ingest',
        'agent',
        ${input.type === 'file' ? input.file.name : input.type === 'url' ? input.url : input.title || 'text'},
        'processing',
        ${JSON.stringify({source_type: input.type, outcome: 'accepted', billable: true})}::jsonb,
        ${userId}
      )
      RETURNING id
    `
    usageEventId = String(usageEvent.id)

    const source = await ingestKnowledgeSource(userId, input)
    await sql`
      UPDATE usage_events
      SET
        status = 'success',
        metadata = ${JSON.stringify({
          source_type: input.type,
          source_id: source.id,
          outcome: 'ready',
          billable: true,
        })}::jsonb
      WHERE id = ${usageEventId} AND user_id = ${userId}
    `
    return NextResponse.json({source}, {status: 201})
  } catch (error) {
    console.error('[knowledge] Ingestion failed:', error)
    if (usageEventId) {
      try {
        await sql`
          UPDATE usage_events
          SET
            status = 'failed',
            metadata = COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify({
              outcome: 'failed',
              billable: true,
            })}::jsonb
          WHERE id = ${usageEventId} AND user_id = ${userId}
        `
      } catch (usageError) {
        console.error('[knowledge] Failed to update usage event:', usageError)
      }
    }
    return NextResponse.json(
      {error: error instanceof Error ? error.message : 'Knowledge ingestion failed'},
      {status: 500}
    )
  }
}

export async function DELETE(request: Request) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({error: 'Source id is required'}, {status: 400})

  const deleted = await deleteKnowledgeSource(userId, id)
  return deleted
    ? NextResponse.json({success: true})
    : NextResponse.json({error: 'Source not found'}, {status: 404})
}
