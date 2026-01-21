import { type NextRequest } from 'next/server'
import { streamText } from 'ai'
import { getFirecrawlClient } from '@/lib/firecrawl/client'
import { sql } from '@/platform/db/neon'
import { auth } from '@/platform/auth/server'
import { headers } from 'next/headers'
import type { ResearchStreamEvent, SourceFoundEvent } from '@/daedalus/agent/research/stream-types'
import { MODELS } from '@/ai/models'

/**
 * POST /api/agent
 * 
 * Agent primitive: Interactive, tool-using sessions for research and synthesis.
 * This is the canonical API endpoint for agent-driven research.
 * 
 * Features:
 * - Streaming thinking/answer/sources
 * - Multi-provider search (Perplexity, Exa, Serper, Firecrawl)
 * - AI-powered synthesis with citations
 * - Session persistence for audit trail
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY
const EXA_API_KEY = process.env.EXA_API_KEY
const SERPER_API_KEY = process.env.SERPER_API_KEY

// Helper to create SSE formatted message
function formatSSE(event: ResearchStreamEvent): string {
  return `data: ${JSON.stringify({ ...event, timestamp: Date.now() })}\n\n`
}

// Search Perplexity
async function searchPerplexity(query: string): Promise<{
  content: string
  citations: string[]
}> {
  if (!PERPLEXITY_API_KEY) return { content: '', citations: [] }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'You are a research assistant. Provide detailed, factual answers with specific data points.',
        },
        { role: 'user', content: query },
      ],
      max_tokens: 4096,
      return_citations: true,
    }),
  })

  if (!response.ok) return { content: '', citations: [] }

  const data = await response.json()
  return {
    content: data.choices?.[0]?.message?.content || '',
    citations: data.citations || [],
  }
}

// Search Exa
async function searchExa(query: string): Promise<Array<{
  title: string
  url: string
  text: string
  score: number
}>> {
  if (!EXA_API_KEY) return []

  const response = await fetch('https://api.exa.ai/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${EXA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      numResults: 10,
      useAutoprompt: true,
      type: 'neural',
      contents: { text: { maxCharacters: 2000 } },
    }),
  })

  if (!response.ok) return []

  const data = await response.json()
  return data.results || []
}

// Search Serper (Google)
async function searchSerper(query: string): Promise<Array<{
  title: string
  link: string
  snippet: string
}>> {
  if (!SERPER_API_KEY) return []

  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 10 }),
  })

  if (!response.ok) return []

  const data = await response.json()
  return data.organic || []
}

// Deep scrape with Firecrawl
async function deepScrape(url: string): Promise<{
  title: string
  content: string
  success: boolean
}> {
  try {
    const client = getFirecrawlClient()
    const result = await client.scrape({
      url,
      formats: ['markdown'],
      onlyMainContent: true,
      timeout: 30000,
    })

    if (result.success && result.data) {
      const data = result.data as { markdown?: string; metadata?: { title?: string } }
      return {
        title: data.metadata?.title || url,
        content: data.markdown || '',
        success: true,
      }
    }
    return { title: url, content: '', success: false }
  } catch {
    return { title: url, content: '', success: false }
  }
}

// Get favicon URL
function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  // 1. Authenticate
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const userId = session.user.id

  // 2. Validate input
  const body = await req.json()
  const { query, sessionId } = body

  if (!query) {
    return new Response(JSON.stringify({ error: 'Query is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()
  const startTime = Date.now()
  const allSources: SourceFoundEvent['data'][] = []
  let missionId: string | null = sessionId || null

  // 3. Stream response with tool orchestration
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ResearchStreamEvent) => {
        controller.enqueue(encoder.encode(formatSSE(event)))
      }

      try {
        // Phase 1: Initial thinking
        send({
          type: 'thinking',
          data: { blockNumber: 1, content: `Analyzing query: "${query}"` },
        })

        // Phase 2: Search multiple sources in parallel (tool orchestration)
        send({ type: 'search_start', data: { source: 'perplexity', query } })
        send({ type: 'search_start', data: { source: 'exa', query } })
        send({ type: 'search_start', data: { source: 'serper', query } })
        send({ type: 'search_start', data: { source: 'firecrawl', query } })

        const searchStart = Date.now()
        const firecrawl = getFirecrawlClient()
        const [perplexityResult, exaResults, serperResults, firecrawlResults] = await Promise.all([
          searchPerplexity(query),
          searchExa(query),
          searchSerper(query),
          firecrawl.search({ query, limit: 5 }).then(r => r.success ? (r.data || []) : []).catch(() => []),
        ])
        const searchDuration = Date.now() - searchStart

        // Report search results
        send({
          type: 'search_result',
          data: { source: 'perplexity', resultCount: perplexityResult.citations.length, duration: searchDuration },
        })
        send({
          type: 'search_result',
          data: { source: 'exa', resultCount: exaResults.length, duration: searchDuration },
        })
        send({
          type: 'search_result',
          data: { source: 'serper', resultCount: serperResults.length, duration: searchDuration },
        })
        send({
          type: 'search_result',
          data: { source: 'firecrawl', resultCount: firecrawlResults.length, duration: searchDuration },
        })

        // Phase 3: Process and emit sources
        const totalSources = exaResults.length + serperResults.length + perplexityResult.citations.length + firecrawlResults.length
        send({
          type: 'thinking',
          data: { blockNumber: 2, content: `Found ${totalSources} potential sources across 4 search engines. Analyzing...` },
        })

        // Add Perplexity citations
        for (const url of perplexityResult.citations.slice(0, 3)) {
          const source: SourceFoundEvent['data'] = {
            url,
            title: url,
            snippet: 'Source from Perplexity research',
            source: 'perplexity',
            favicon: getFaviconUrl(url),
          }
          allSources.push(source)
          send({ type: 'source_found', data: source })
        }

        // Add Exa results
        for (const result of exaResults.slice(0, 5)) {
          const source: SourceFoundEvent['data'] = {
            url: result.url,
            title: result.title,
            snippet: result.text.slice(0, 200),
            source: 'exa',
            favicon: getFaviconUrl(result.url),
          }
          allSources.push(source)
          send({ type: 'source_found', data: source })
        }

        // Add Serper results
        for (const result of serperResults.slice(0, 5)) {
          const source: SourceFoundEvent['data'] = {
            url: result.link,
            title: result.title,
            snippet: result.snippet,
            source: 'serper',
            favicon: getFaviconUrl(result.link),
          }
          allSources.push(source)
          send({ type: 'source_found', data: source })
        }

        // Add Firecrawl results
        for (const result of firecrawlResults.slice(0, 5)) {
          const source: SourceFoundEvent['data'] = {
            url: result.url,
            title: result.title,
            snippet: result.description || result.markdown?.slice(0, 200) || '',
            source: 'firecrawl',
            favicon: getFaviconUrl(result.url),
          }
          allSources.push(source)
          send({ type: 'source_found', data: source })
        }

        // Phase 4: Deep scrape top sources
        send({
          type: 'thinking',
          data: { blockNumber: 3, content: 'Deep scraping top sources for detailed content...' },
        })

        const urlsToScrape = allSources.slice(0, 3).map(s => s.url)
        const scrapedContent: string[] = []

        for (const url of urlsToScrape) {
          send({ type: 'scrape_start', data: { url, reason: 'Top relevance source' } })

          const scrapeResult = await deepScrape(url)

          send({
            type: 'scrape_result',
            data: {
              url,
              title: scrapeResult.title,
              content: scrapeResult.content.slice(0, 500),
              success: scrapeResult.success,
            },
          })

          if (scrapeResult.success && scrapeResult.content) {
            scrapedContent.push(`[Source: ${url}]\n${scrapeResult.content.slice(0, 2000)}`)
          }
        }

        // Phase 5: Synthesize with streaming LLM
        send({
          type: 'thinking',
          data: { blockNumber: 4, content: 'Synthesizing findings into intelligence brief...' },
        })

        send({ type: 'synthesis_start', data: { sourceCount: allSources.length } })

        const currentDate = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })

        const contextText = [
          `Perplexity Analysis:\n${perplexityResult.content}`,
          ...exaResults.slice(0, 5).map(r => `[${r.title}]\n${r.text}`),
          ...scrapedContent,
        ].join('\n\n---\n\n')

        const { textStream } = streamText({
          model: MODELS.anthropic.sonnet45 as Parameters<typeof streamText>[0]['model'],
          system: `You are a strategic intelligence analyst for DMG (Digital Mischief Group). 
Your job is to synthesize research findings into actionable intelligence briefs.

Today's date is: ${currentDate}

Structure your analysis as:
# INTELLIGENCE BRIEF

## EXECUTIVE SUMMARY
(2-3 sentences)

## KEY FINDINGS
(bullet points with specific facts)

## OPPORTUNITIES
(what can be exploited)

## THREATS
(what to watch out for)

## RECOMMENDED ACTIONS
(specific next steps)

## SOURCES
(list URLs used)

Be direct, tactical, and actionable. Include specific data points and statistics when available.`,
          prompt: `Research Query: ${query}

Research Data:
${contextText}

Sources Found:
${allSources.map(s => `- ${s.title}: ${s.url}`).join('\n')}

Synthesize these findings into an intelligence brief.`,
        })

        let fullSummary = ''
        for await (const chunk of textStream) {
          fullSummary += chunk
          send({ type: 'synthesis_chunk', data: { content: chunk } })
        }

        // Save session to database
        const totalDuration = Date.now() - startTime
        try {
          const [mission] = await sql`
            INSERT INTO research_missions (
              name, query, depth, sources, status, 
              findings, summary, user_id
            ) VALUES (
              ${`Agent Session: ${query.slice(0, 50)}${query.length > 50 ? '...' : ''}`},
              ${query},
              'deep',
              ${['perplexity', 'exa', 'serper', 'firecrawl']},
              'completed',
              ${JSON.stringify(allSources.map(s => ({ url: s.url, title: s.title, snippet: s.snippet })))},
              ${fullSummary},
              ${userId}
            )
            RETURNING id
          `
          missionId = mission?.id || null
        } catch (dbError) {
          console.error('[Agent] DB save error:', dbError)
        }

        // Log usage event
        try {
          await sql`
            INSERT INTO usage_events (event_type, module, input_value, status, metadata, user_id)
            VALUES (
              'agent',
              'agent_research',
              ${query},
              'success',
              ${JSON.stringify({
                sources_count: allSources.length,
                duration_ms: totalDuration,
                session_id: missionId,
              })},
              ${userId}
            )
          `
        } catch (usageError) {
          console.error('[Agent] Usage log error:', usageError)
        }

        // Complete
        send({
          type: 'complete',
          data: {
            summary: fullSummary,
            sources: allSources,
            duration: totalDuration,
            missionId,
          },
        })

      } catch (error) {
        send({
          type: 'error',
          data: {
            message: error instanceof Error ? error.message : 'Agent session failed',
            code: 'AGENT_ERROR',
          },
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
