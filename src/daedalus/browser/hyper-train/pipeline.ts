import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { Hyperbrowser } from '@hyperbrowser/sdk'

export interface HyperTrainPipelineOptions {
  urls: string[]
  outputDir: string
  chunkSize?: number
  concurrency?: number
  includeEmbeddings?: boolean
  includeQaGeneration?: boolean
  runLabel?: string
  embeddingModel?: string
  qaModel?: string
}

export interface HyperTrainDatasetRecord {
  id: string
  url: string
  title: string
  chunk_id: string
  text: string
  metadata: {
    collected_at: string
    source_index: number
    tag?: string
  }
}

export interface HyperTrainRunReport {
  run_id: string
  started_at: string
  completed_at: string
  duration_ms: number
  counts: {
    input_urls: number
    unique_urls: number
    succeeded_urls: number
    failed_urls: number
    chunks_written: number
    embeddings_generated: number
    qa_records_generated: number
  }
  artifacts: {
    dataset_jsonl: string
    dataset_markdown: string
    embeddings_jsonl: string | null
    qa_jsonl: string | null
    report_json: string
  }
  failures: Array<{ url: string; reason: string }>
}

type ScrapeSuccess = {
  ok: true
  url: string
  title: string
  markdown: string
  sourceIndex: number
}

type ScrapeFailure = {
  ok: false
  url: string
  reason: string
  sourceIndex: number
}

type ScrapeResult = ScrapeSuccess | ScrapeFailure

const DEFAULT_CHUNK_SIZE = 900
const DEFAULT_CONCURRENCY = 3
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small'
const DEFAULT_QA_MODEL = 'gpt-4o-mini'

function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim()
  const withProtocol =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`

  try {
    const parsed = new URL(withProtocol)
    parsed.hash = ''
    return parsed.toString()
  } catch {
    throw new Error(`Invalid URL provided to Hyper Train: ${rawUrl}`)
  }
}

function hash(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

function chunkText(markdown: string, maxChars: number): string[] {
  if (markdown.length <= maxChars) return [markdown]

  const paragraphs = markdown.split(/\n\s*\n/)
  const chunks: string[] = []
  let current = ''

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) continue

    if (current && current.length + paragraph.length + 2 > maxChars) {
      chunks.push(current.trim())
      current = paragraph
      continue
    }

    current = current ? `${current}\n\n${paragraph}` : paragraph
  }

  if (current.trim()) chunks.push(current.trim())

  return chunks.length > 0 ? chunks : [markdown.slice(0, maxChars)]
}

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0

  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, items.length || 1)) }, async () => {
    while (cursor < items.length) {
      const current = cursor
      cursor += 1
      results[current] = await fn(items[current], current)
    }
  })

  await Promise.all(workers)
  return results
}

function buildRunId(runLabel?: string): string {
  const base = (runLabel || 'hyper-train').toLowerCase().replace(/[^a-z0-9_-]/g, '-')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `${base}-${timestamp}`
}

function resolveSafeOutputDir(outputDir: string): string {
  const projectRoot = path.resolve(process.cwd())
  const resolved = path.resolve(projectRoot, outputDir)

  if (resolved !== projectRoot && !resolved.startsWith(`${projectRoot}${path.sep}`)) {
    throw new Error('outputDir must stay within the project directory')
  }

  return resolved
}

async function generateEmbedding(model: string, input: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for embedding generation')
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: input.slice(0, 8000),
    }),
  })

  if (!response.ok) {
    throw new Error(`Embedding request failed (${response.status})`)
  }

  const payload = await response.json()
  const vector = payload?.data?.[0]?.embedding
  if (!Array.isArray(vector)) {
    throw new Error('Embedding response missing vector')
  }
  return vector
}

async function generateQaPairs(model: string, input: string): Promise<Array<{ question: string; answer: string }>> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for QA generation')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Generate 2 concise QA pairs from the provided text. Return JSON with key qa_pairs: [{question,answer}]',
        },
        {
          role: 'user',
          content: input.slice(0, 12000),
        },
      ],
      temperature: 0.1,
    }),
  })

  if (!response.ok) {
    throw new Error(`QA request failed (${response.status})`)
  }

  const payload = await response.json()
  const content = payload?.choices?.[0]?.message?.content
  if (typeof content !== 'string') {
    throw new Error('QA response missing content')
  }

  const parsed = JSON.parse(content) as {
    qa_pairs?: Array<{ question?: unknown; answer?: unknown }>
  }

  if (!Array.isArray(parsed.qa_pairs)) {
    throw new Error('QA response missing qa_pairs')
  }

  return parsed.qa_pairs
    .filter((pair) => typeof pair.question === 'string' && typeof pair.answer === 'string')
    .map((pair) => ({
      question: pair.question as string,
      answer: pair.answer as string,
    }))
}

export async function runHyperTrainDatasetPipeline(
  options: HyperTrainPipelineOptions
): Promise<HyperTrainRunReport> {
  if (!process.env.HYPERBROWSER_API_KEY) {
    throw new Error('HYPERBROWSER_API_KEY is required for Hyper Train')
  }

  const uniqueUrls = Array.from(new Set(options.urls.map(normalizeUrl)))
  if (uniqueUrls.length === 0) {
    throw new Error('Hyper Train needs at least one valid URL')
  }

  const runId = buildRunId(options.runLabel)
  const startedAt = new Date()
  const outputDir = resolveSafeOutputDir(options.outputDir)
  const chunkSize = Math.max(300, options.chunkSize || DEFAULT_CHUNK_SIZE)
  const concurrency = Math.max(1, options.concurrency || DEFAULT_CONCURRENCY)

  await mkdir(outputDir, { recursive: true })

  const client = new Hyperbrowser({ apiKey: process.env.HYPERBROWSER_API_KEY })
  const scrapeResults = await runWithConcurrency(
    uniqueUrls,
    concurrency,
    async (url, sourceIndex): Promise<ScrapeResult> => {
      try {
        const scraped = await client.scrape.startAndWait({
          url,
          scrapeOptions: { formats: ['markdown', 'html'] },
        })

        if (scraped.status !== 'completed' || !scraped.data) {
          return {
            ok: false,
            url,
            sourceIndex,
            reason: scraped.error || `Scrape incomplete (status=${scraped.status})`,
          }
        }

        const markdown = scraped.data.markdown || scraped.data.html || ''
        if (!markdown.trim()) {
          return {
            ok: false,
            url,
            sourceIndex,
            reason: 'No markdown/html content returned',
          }
        }

        const rawTitle = scraped.data.metadata?.title
        const title = Array.isArray(rawTitle)
          ? rawTitle[0] || new URL(url).hostname
          : (rawTitle as string | undefined) || new URL(url).hostname

        return {
          ok: true,
          url,
          sourceIndex,
          title,
          markdown,
        }
      } catch (error) {
        return {
          ok: false,
          url,
          sourceIndex,
          reason: error instanceof Error ? error.message : 'Unknown scrape failure',
        }
      }
    }
  )

  const failures = scrapeResults
    .filter((result): result is ScrapeFailure => !result.ok)
    .map((result) => ({ url: result.url, reason: result.reason }))

  const successfulScrapes = scrapeResults.filter(
    (result): result is ScrapeSuccess => result.ok
  )

  const datasetRecords: HyperTrainDatasetRecord[] = []
  const collectedAt = new Date().toISOString()

  for (const scrape of successfulScrapes) {
    const chunks = chunkText(scrape.markdown, chunkSize)
    chunks.forEach((chunk, chunkIndex) => {
      datasetRecords.push({
        id: hash(`${scrape.url}-${chunkIndex}-${chunk.slice(0, 120)}`),
        url: scrape.url,
        title: scrape.title,
        chunk_id: `chunk_${scrape.sourceIndex}_${chunkIndex}`,
        text: chunk,
        metadata: {
          collected_at: collectedAt,
          source_index: scrape.sourceIndex,
        },
      })
    })
  }

  const datasetJsonPath = path.join(outputDir, `${runId}.dataset.jsonl`)
  const datasetMdPath = path.join(outputDir, `${runId}.dataset.md`)
  const embeddingsPath = options.includeEmbeddings
    ? path.join(outputDir, `${runId}.embeddings.jsonl`)
    : null
  const qaPath = options.includeQaGeneration
    ? path.join(outputDir, `${runId}.qa.jsonl`)
    : null
  const reportPath = path.join(outputDir, `${runId}.report.json`)

  const jsonl = datasetRecords.map((record) => JSON.stringify(record)).join('\n')
  await writeFile(datasetJsonPath, jsonl ? `${jsonl}\n` : '', 'utf8')

  const markdown = datasetRecords
    .map(
      (record) =>
        `## ${record.title}\n\n- URL: ${record.url}\n- Chunk: ${record.chunk_id}\n\n${record.text}\n`
    )
    .join('\n')
  await writeFile(datasetMdPath, `# Hyper Train Dataset\n\n${markdown}`, 'utf8')

  let embeddingsGenerated = 0
  if (embeddingsPath) {
    const model = options.embeddingModel || DEFAULT_EMBEDDING_MODEL
    const embeddingRows: Array<Record<string, unknown>> = []

    for (const record of datasetRecords) {
      try {
        const vector = await generateEmbedding(model, record.text)
        embeddingRows.push({
          id: record.chunk_id,
          vector,
          dims: vector.length,
          source_url: record.url,
        })
        embeddingsGenerated += 1
      } catch (error) {
        failures.push({
          url: record.url,
          reason: `Embedding failed: ${error instanceof Error ? error.message : 'unknown'}`,
        })
      }
    }

    await writeFile(
      embeddingsPath,
      embeddingRows.map((row) => JSON.stringify(row)).join('\n') + (embeddingRows.length ? '\n' : ''),
      'utf8'
    )
  }

  let qaGenerated = 0
  if (qaPath) {
    const model = options.qaModel || DEFAULT_QA_MODEL
    const qaRows: Array<Record<string, unknown>> = []

    for (const record of datasetRecords) {
      try {
        const qaPairs = await generateQaPairs(model, record.text)
        qaRows.push({
          source_id: record.chunk_id,
          source_url: record.url,
          messages: qaPairs.flatMap((pair) => [
            { role: 'user', content: pair.question },
            { role: 'assistant', content: pair.answer },
          ]),
        })
        qaGenerated += 1
      } catch (error) {
        failures.push({
          url: record.url,
          reason: `QA generation failed: ${error instanceof Error ? error.message : 'unknown'}`,
        })
      }
    }

    await writeFile(
      qaPath,
      qaRows.map((row) => JSON.stringify(row)).join('\n') + (qaRows.length ? '\n' : ''),
      'utf8'
    )
  }

  const completedAt = new Date()

  const report: HyperTrainRunReport = {
    run_id: runId,
    started_at: startedAt.toISOString(),
    completed_at: completedAt.toISOString(),
    duration_ms: completedAt.getTime() - startedAt.getTime(),
    counts: {
      input_urls: options.urls.length,
      unique_urls: uniqueUrls.length,
      succeeded_urls: successfulScrapes.length,
      failed_urls: failures.length,
      chunks_written: datasetRecords.length,
      embeddings_generated: embeddingsGenerated,
      qa_records_generated: qaGenerated,
    },
    artifacts: {
      dataset_jsonl: datasetJsonPath,
      dataset_markdown: datasetMdPath,
      embeddings_jsonl: embeddingsPath,
      qa_jsonl: qaPath,
      report_json: reportPath,
    },
    failures,
  }

  await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8')
  return report
}
