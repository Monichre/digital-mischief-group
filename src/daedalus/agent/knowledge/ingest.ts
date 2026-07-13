import {del, put} from '@vercel/blob'
import {generateText} from 'ai'
import * as mammoth from 'mammoth'
import {MODELS} from '@/ai/models'
import {getFirecrawlClient} from '@/platform/firecrawl/service'
import {sql} from '@/platform/db/neon'
import {chunkKnowledgeContent, estimateTokens} from './chunk'
import {createKnowledgeEmbeddings} from './embeddings'
import type {
  KnowledgeSearchResult,
  KnowledgeSource,
  KnowledgeSourceType,
} from './types'

const MAX_TEXT_LENGTH = 200_000
const MAX_FILE_SIZE = 10 * 1024 * 1024
const DOCX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const TEXT_MIME_TYPES = new Set([
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  'application/xml',
  'text/xml',
])

const AI_FILE_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

export type KnowledgeIngestInput =
  | {type: 'text'; text: string; title?: string}
  | {type: 'url'; url: string; title?: string}
  | {type: 'file'; file: File; title?: string}

type ExtractedKnowledge = {
  title: string
  content: string
  sourceUrl: string | null
  fileName: string | null
  mimeType: string | null
  sizeBytes: number | null
  blobUrl: string | null
  blobPathname: string | null
  metadata: Record<string, unknown>
}

function cleanTitle(value: string | undefined, fallback: string): string {
  const title = value?.trim() || fallback
  return title.slice(0, 180)
}

function buildSummary(content: string): string {
  const firstParagraph = content
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .find(Boolean)
  const summary = firstParagraph || content.trim()
  return summary.length > 320 ? `${summary.slice(0, 317)}...` : summary
}

function safeBlobName(fileName: string): string {
  return fileName
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120) || 'source'
}

async function extractFileContent(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()

  if (TEXT_MIME_TYPES.has(file.type) || /\.(txt|md|markdown|csv|json|xml)$/i.test(file.name)) {
    return new TextDecoder().decode(buffer).slice(0, MAX_TEXT_LENGTH).trim()
  }

  if (file.type === DOCX_MIME_TYPE || /\.docx$/i.test(file.name)) {
    const result = await mammoth.extractRawText({buffer: Buffer.from(buffer)})
    return result.value.slice(0, MAX_TEXT_LENGTH).trim()
  }

  if (!AI_FILE_MIME_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || file.name}`)
  }

  const {text} = await generateText({
    model: MODELS.anthropic.sonnet45,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              'Extract the meaningful textual and visual information from this source as clean Markdown. Preserve headings, facts, names, numbers, tables, and relationships. Do not add commentary.',
          },
          {
            type: 'file',
            data: new Uint8Array(buffer),
            mediaType: file.type,
            filename: file.name,
          },
        ],
      },
    ],
  })

  return text.slice(0, MAX_TEXT_LENGTH).trim()
}

async function extractKnowledge(
  userId: string,
  sourceId: string,
  input: KnowledgeIngestInput
): Promise<ExtractedKnowledge> {
  if (input.type === 'text') {
    const content = input.text.trim().slice(0, MAX_TEXT_LENGTH)
    if (!content) throw new Error('Knowledge text is required')

    return {
      title: cleanTitle(input.title, content.split('\n')[0] || 'Untitled knowledge'),
      content,
      sourceUrl: null,
      fileName: null,
      mimeType: 'text/plain',
      sizeBytes: new TextEncoder().encode(content).byteLength,
      blobUrl: null,
      blobPathname: null,
      metadata: {},
    }
  }

  if (input.type === 'url') {
    const firecrawl = getFirecrawlClient()
    const result = await firecrawl.scrape({
      url: input.url,
      formats: ['markdown'],
      onlyMainContent: true,
    })

    if (!result.success || !result.data?.markdown) {
      throw new Error('The URL could not be extracted')
    }

    const metadata = (result.data.metadata || {}) as Record<string, unknown>
    const content = result.data.markdown.slice(0, MAX_TEXT_LENGTH).trim()

    return {
      title: cleanTitle(
        input.title,
        typeof metadata.title === 'string' ? metadata.title : new URL(input.url).hostname
      ),
      content,
      sourceUrl: input.url,
      fileName: null,
      mimeType: 'text/markdown',
      sizeBytes: new TextEncoder().encode(content).byteLength,
      blobUrl: null,
      blobPathname: null,
      metadata,
    }
  }

  if (input.file.size > MAX_FILE_SIZE) {
    throw new Error('Files must be 10 MB or smaller')
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('Private file storage is not configured')
  }

  const file = input.file
  const blob = await put(
    `knowledge/${userId}/${safeBlobName(file.name)}`,
    file,
    {access: 'private', addRandomSuffix: true}
  )

  try {
    await sql`
      UPDATE knowledge_sources
      SET
        file_name = ${file.name},
        mime_type = ${file.type || 'application/octet-stream'},
        size_bytes = ${file.size},
        blob_url = ${blob.url},
        blob_pathname = ${blob.pathname},
        updated_at = NOW()
      WHERE id = ${sourceId} AND user_id = ${userId}
    `

    const content = await extractFileContent(file)
    if (!content) throw new Error('No usable content was extracted from the file')

    return {
      title: cleanTitle(input.title, file.name),
      content,
      sourceUrl: null,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      blobUrl: blob.url,
      blobPathname: blob.pathname,
      metadata: {},
    }
  } catch (error) {
    await del(blob.url, {token: process.env.BLOB_READ_WRITE_TOKEN})
    await sql`
      UPDATE knowledge_sources
      SET blob_url = NULL, blob_pathname = NULL, updated_at = NOW()
      WHERE id = ${sourceId} AND user_id = ${userId}
    `
    throw error
  }
}

export async function ingestKnowledgeSource(
  userId: string,
  input: KnowledgeIngestInput
): Promise<KnowledgeSource> {
  const sourceType: KnowledgeSourceType = input.type
  const fallbackTitle =
    input.type === 'file'
      ? input.file.name
      : input.type === 'url'
        ? input.url
        : input.text.split('\n')[0] || 'Untitled knowledge'

  const [created] = await sql`
    INSERT INTO knowledge_sources (user_id, source_type, title, status)
    VALUES (${userId}, ${sourceType}, ${cleanTitle(input.title, fallbackTitle)}, 'processing')
    RETURNING id
  `
  const sourceId = String(created.id)

  let extracted: ExtractedKnowledge | null = null
  try {
    extracted = await extractKnowledge(userId, sourceId, input)
    const chunks = chunkKnowledgeContent(extracted.content)
    const embeddings = await createKnowledgeEmbeddings(chunks)

    await sql`
      UPDATE knowledge_sources
      SET
        title = ${extracted.title},
        source_url = ${extracted.sourceUrl},
        file_name = ${extracted.fileName},
        mime_type = ${extracted.mimeType},
        size_bytes = ${extracted.sizeBytes},
        blob_url = ${extracted.blobUrl},
        blob_pathname = ${extracted.blobPathname},
        content = ${extracted.content},
        summary = ${buildSummary(extracted.content)},
        metadata = ${JSON.stringify(extracted.metadata)}::jsonb,
        status = 'ready',
        error_message = NULL,
        updated_at = NOW()
      WHERE id = ${sourceId} AND user_id = ${userId}
    `

    for (let index = 0; index < chunks.length; index += 1) {
      const embedding = embeddings?.[index] || null
      const vector = embedding ? JSON.stringify(embedding) : null
      await sql`
        INSERT INTO knowledge_chunks (
          source_id, user_id, chunk_index, content, token_estimate, embedding
        )
        VALUES (
          ${sourceId},
          ${userId},
          ${index},
          ${chunks[index]},
          ${estimateTokens(chunks[index])},
          ${vector}::vector
        )
      `
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Knowledge ingestion failed'
    let blobCleaned = false
    if (extracted?.blobUrl && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        await del(extracted.blobUrl, {token: process.env.BLOB_READ_WRITE_TOKEN})
        blobCleaned = true
      } catch (cleanupError) {
        console.error('[knowledge] Failed to clean up Blob after ingestion error:', cleanupError)
      }
    }
    await sql`
      UPDATE knowledge_sources
      SET
        status = 'failed',
        error_message = ${message},
        blob_url = CASE WHEN ${blobCleaned} THEN NULL ELSE blob_url END,
        blob_pathname = CASE WHEN ${blobCleaned} THEN NULL ELSE blob_pathname END,
        updated_at = NOW()
      WHERE id = ${sourceId} AND user_id = ${userId}
    `
    throw error
  }

  const [source] = await sql`
    SELECT
      source.id,
      source.source_type,
      source.title,
      source.source_url,
      source.file_name,
      source.mime_type,
      source.size_bytes,
      source.blob_pathname,
      source.summary,
      source.status,
      source.error_message,
      source.created_at,
      (SELECT COUNT(*)::int FROM knowledge_chunks chunk WHERE chunk.source_id = source.id) AS chunk_count
    FROM knowledge_sources source
    WHERE source.id = ${sourceId} AND source.user_id = ${userId}
  `

  return source as unknown as KnowledgeSource
}

export async function listKnowledgeSources(
  userId: string,
  type?: KnowledgeSourceType
): Promise<KnowledgeSource[]> {
  await sql`
    UPDATE knowledge_sources
    SET
      status = 'failed',
      error_message = 'Ingestion timed out before completion',
      updated_at = NOW()
    WHERE user_id = ${userId}
      AND status = 'processing'
      AND updated_at < NOW() - INTERVAL '10 minutes'
  `

  const rows = type
    ? await sql`
        SELECT
          source.id,
          source.source_type,
          source.title,
          source.source_url,
          source.file_name,
          source.mime_type,
          source.size_bytes,
          source.blob_pathname,
          source.summary,
          source.status,
          source.error_message,
          source.created_at,
          (SELECT COUNT(*)::int FROM knowledge_chunks chunk WHERE chunk.source_id = source.id) AS chunk_count
        FROM knowledge_sources source
        WHERE source.user_id = ${userId} AND source.source_type = ${type}
        ORDER BY source.created_at DESC
        LIMIT 100
      `
    : await sql`
        SELECT
          source.id,
          source.source_type,
          source.title,
          source.source_url,
          source.file_name,
          source.mime_type,
          source.size_bytes,
          source.blob_pathname,
          source.summary,
          source.status,
          source.error_message,
          source.created_at,
          (SELECT COUNT(*)::int FROM knowledge_chunks chunk WHERE chunk.source_id = source.id) AS chunk_count
        FROM knowledge_sources source
        WHERE source.user_id = ${userId}
        ORDER BY source.created_at DESC
        LIMIT 100
      `

  return rows as unknown as KnowledgeSource[]
}

export async function searchKnowledge(
  userId: string,
  query: string,
  limit = 12
): Promise<KnowledgeSearchResult[]> {
  const [queryEmbedding] = (await createKnowledgeEmbeddings([query])) || []

  const fullTextPromise = sql`
    SELECT
      chunk.id,
      chunk.source_id,
      source.title AS source_title,
      source.source_type,
      chunk.content,
      NULL::float AS similarity
    FROM knowledge_chunks chunk
    JOIN knowledge_sources source ON source.id = chunk.source_id
    WHERE chunk.user_id = ${userId}
      AND source.status = 'ready'
      AND (
        to_tsvector('english', chunk.content) @@ websearch_to_tsquery('english', ${query})
        OR chunk.content ILIKE ${`%${query}%`}
        OR source.title ILIKE ${`%${query}%`}
      )
    ORDER BY source.created_at DESC, chunk.chunk_index ASC
    LIMIT ${limit}
  `

  if (queryEmbedding) {
    const vector = JSON.stringify(queryEmbedding)
    const [vectorRows, fullTextRows] = await Promise.all([
      sql`
        SELECT
          chunk.id,
          chunk.source_id,
          source.title AS source_title,
          source.source_type,
          chunk.content,
          1 - (chunk.embedding <=> ${vector}::vector) AS similarity
        FROM knowledge_chunks chunk
        JOIN knowledge_sources source ON source.id = chunk.source_id
        WHERE chunk.user_id = ${userId}
          AND source.status = 'ready'
          AND chunk.embedding IS NOT NULL
        ORDER BY chunk.embedding <=> ${vector}::vector
        LIMIT ${limit}
      `,
      fullTextPromise,
    ])
    const seen = new Set<string>()
    const hybridRows: Array<(typeof vectorRows)[number]> = []
    const addRow = (row: (typeof vectorRows)[number] | undefined) => {
      if (!row || hybridRows.length >= limit) return
      const id = String(row.id)
      if (seen.has(id)) return
      seen.add(id)
      hybridRows.push(row)
    }

    for (let index = 0; index < Math.max(vectorRows.length, fullTextRows.length); index += 1) {
      addRow(vectorRows[index])
      addRow(fullTextRows[index])
    }

    return hybridRows as unknown as KnowledgeSearchResult[]
  }

  const rows = await fullTextPromise
  return rows as unknown as KnowledgeSearchResult[]
}

export async function deleteKnowledgeSource(userId: string, sourceId: string) {
  const [source] = await sql`
    SELECT blob_url FROM knowledge_sources
    WHERE id = ${sourceId} AND user_id = ${userId}
  `

  if (!source) return false
  if (source.blob_url && process.env.BLOB_READ_WRITE_TOKEN) {
    await del(String(source.blob_url), {token: process.env.BLOB_READ_WRITE_TOKEN})
  }

  await sql`
    DELETE FROM knowledge_sources
    WHERE id = ${sourceId} AND user_id = ${userId}
  `
  return true
}
