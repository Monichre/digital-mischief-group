import { type NextRequest } from 'next/server'
import { streamText } from 'ai'
import { getFirecrawlClient } from '@/platform/firecrawl/service'
import { sql } from '@/platform/db/neon'
import { auth } from '@/platform/auth/server'
import { headers } from 'next/headers'
import type {
  ResearchStreamEvent,
  SourceFoundEvent,
  CitationFoundEvent,
} from '@/daedalus/agent/research/stream-types'
import {
  createStreamState,
  executeWithFallback,
  extractCitations,
  generateToolSummary,
  reconcileStreamState,
  type StreamState,
  type ToolResult,
} from '@/daedalus/agent/research/stream-handler'
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
 * - Tool failure fallback handling (T-011)
 * - Citation tracking for source attribution (T-011)
 * - Stream synchronization across providers (T-011)
 */

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY
const EXA_API_KEY = process.env.EXA_API_KEY
const SERPER_API_KEY = process.env.SERPER_API_KEY

// Helper to create SSE formatted message
function formatSSE(event: ResearchStreamEvent): string {
  return `data: ${JSON.stringify({ ...event, timestamp: Date.now() })}\n\n`
}

// Search result types
type PerplexityResult = { content: string; citations: string[] }
type ExaResult = { title: string; url: string; text: string; score: number }
type SerperResult = { title: string; link: string; snippet: string }

// Search Perplexity with proper error handling
async function searchPerplexity(query: string): Promise<PerplexityResult> {
  if (!PERPLEXITY_API_KEY) {
    console.log('[Agent] Perplexity API key not configured, skipping')
    return { content: '', citations: [] }
  }

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

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`Perplexity API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  return {
    content: data.choices?.[0]?.message?.content || '',
    citations: data.citations || [],
  }
}

// Search Exa with proper error handling
async function searchExa(query: string): Promise<ExaResult[]> {
  if (!EXA_API_KEY) {
    console.log('[Agent] Exa API key not configured, skipping')
    return []
  }

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

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`Exa API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  return data.results || []
}

// Search Serper (Google) with proper error handling
async function searchSerper(query: string): Promise<SerperResult[]> {
  if (!SERPER_API_KEY) {
    console.log('[Agent] Serper API key not configured, skipping')
    return []
  }

  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 10 }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`Serper API error (${response.status}): ${errorText}`)
  }

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
  let missionId: string | null = sessionId || null

  // 3. Initialize stream state for reliability tracking (T-011)
  const streamState = createStreamState()

  // 4. Stream response with tool orchestration and fallback handling
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ResearchStreamEvent) => {
        controller.enqueue(encoder.encode(formatSSE(event)))
      }

      // Track thinking block numbers for synchronization
      let thinkingBlockNum = 0
      const nextThinkingBlock = () => ++thinkingBlockNum

      try {
        streamState.phase = 'searching'

        // Phase 1: Initial thinking
        send({
          type: 'thinking',
          data: { blockNumber: nextThinkingBlock(), content: `Analyzing query: "${query}"` },
        })

        // Phase 2: Search multiple sources in parallel with fallback handling (T-011)
        send({ type: 'search_start', data: { source: 'perplexity', query } })
        send({ type: 'search_start', data: { source: 'exa', query } })
        send({ type: 'search_start', data: { source: 'serper', query } })
        send({ type: 'search_start', data: { source: 'firecrawl', query } })

        const searchStart = Date.now()
        const firecrawl = getFirecrawlClient()

        // Execute searches with fallback handling
        const [perplexityToolResult, exaToolResult, serperToolResult, firecrawlToolResult] = await Promise.all([
          executeWithFallback<PerplexityResult>(
            'perplexity',
            () => searchPerplexity(query),
            undefined,
            {
              maxRetries: 1,
              onRetry: (attempt, error) => {
                console.log(`[Agent] Perplexity retry ${attempt}: ${error.message}`)
              },
            }
          ),
          executeWithFallback<ExaResult[]>(
            'exa',
            () => searchExa(query),
            undefined,
            {
              maxRetries: 1,
              onRetry: (attempt, error) => {
                console.log(`[Agent] Exa retry ${attempt}: ${error.message}`)
              },
            }
          ),
          executeWithFallback<SerperResult[]>(
            'serper',
            () => searchSerper(query),
            undefined,
            {
              maxRetries: 1,
              onRetry: (attempt, error) => {
                console.log(`[Agent] Serper retry ${attempt}: ${error.message}`)
              },
            }
          ),
          executeWithFallback<Array<{ url: string; title: string; description?: string; markdown?: string }>>(
            'firecrawl',
            () => firecrawl.search({ query, limit: 5 }).then(r => r.success ? (r.data || []) : []),
            undefined,
            {
              maxRetries: 1,
              onRetry: (attempt, error) => {
                console.log(`[Agent] Firecrawl retry ${attempt}: ${error.message}`)
              },
            }
          ),
        ])

        const searchDuration = Date.now() - searchStart

        // Store tool results in stream state
        streamState.toolResults.set('perplexity', perplexityToolResult)
        streamState.toolResults.set('exa', exaToolResult)
        streamState.toolResults.set('serper', serperToolResult)
        streamState.toolResults.set('firecrawl', firecrawlToolResult)

        // Extract data with defaults for failed tools
        const perplexityResult = perplexityToolResult.data || { content: '', citations: [] }
        const exaResults = exaToolResult.data || []
        const serperResults = serperToolResult.data || []
        const firecrawlResults = firecrawlToolResult.data || []

        // Report search results with fallback indicators (T-011)
        for (const [toolName, result] of [
          ['perplexity', perplexityToolResult] as const,
          ['exa', exaToolResult] as const,
          ['serper', serperToolResult] as const,
          ['firecrawl', firecrawlToolResult] as const,
        ]) {
          if (result.status === 'failed') {
            streamState.failedTools.push(toolName)
            streamState.errors.push({
              tool: toolName,
              message: result.error || 'Unknown error',
              timestamp: Date.now(),
            })
            send({
              type: 'search_fallback',
              data: {
                source: toolName,
                error: result.error || 'Unknown error',
                fallbackAction: 'Continuing with other search providers',
              },
            })
            console.warn(`[Agent] Tool ${toolName} failed: ${result.error}`)
          } else {
            const count = toolName === 'perplexity'
              ? (result.data as PerplexityResult)?.citations?.length || 0
              : Array.isArray(result.data) ? result.data.length : 0
            send({
              type: 'search_result',
              data: { source: toolName, resultCount: count, duration: searchDuration },
            })
          }
        }

        // Phase 3: Process and emit sources
        const totalSources = exaResults.length + serperResults.length + perplexityResult.citations.length + firecrawlResults.length
        const failedCount = streamState.failedTools.length

        send({
          type: 'thinking',
          data: {
            blockNumber: nextThinkingBlock(),
            content: failedCount > 0
              ? `Found ${totalSources} sources across ${4 - failedCount} providers (${failedCount} provider${failedCount > 1 ? 's' : ''} unavailable). Analyzing...`
              : `Found ${totalSources} potential sources across 4 search engines. Analyzing...`,
          },
        })

        // Add sources with proper tracking
        // Perplexity citations
        for (const url of perplexityResult.citations.slice(0, 3)) {
          const source: SourceFoundEvent['data'] = {
            url,
            title: url,
            snippet: 'Source from Perplexity research',
            source: 'perplexity',
            favicon: getFaviconUrl(url),
          }
          streamState.sources.push(source)
          send({ type: 'source_found', data: source })
        }

        // Exa results
        for (const result of exaResults.slice(0, 5)) {
          const source: SourceFoundEvent['data'] = {
            url: result.url,
            title: result.title,
            snippet: result.text.slice(0, 200),
            source: 'exa',
            favicon: getFaviconUrl(result.url),
          }
          streamState.sources.push(source)
          send({ type: 'source_found', data: source })
        }

        // Serper results
        for (const result of serperResults.slice(0, 5)) {
          const source: SourceFoundEvent['data'] = {
            url: result.link,
            title: result.title,
            snippet: result.snippet,
            source: 'serper',
            favicon: getFaviconUrl(result.link),
          }
          streamState.sources.push(source)
          send({ type: 'source_found', data: source })
        }

        // Firecrawl results
        for (const result of firecrawlResults.slice(0, 5)) {
          const source: SourceFoundEvent['data'] = {
            url: result.url,
            title: result.title,
            snippet: result.description || result.markdown?.slice(0, 200) || '',
            source: 'firecrawl',
            favicon: getFaviconUrl(result.url),
          }
          streamState.sources.push(source)
          send({ type: 'source_found', data: source })
        }

        // Phase 4: Deep scrape top sources with fallback handling (T-011)
        streamState.phase = 'scraping'
        send({
          type: 'thinking',
          data: { blockNumber: nextThinkingBlock(), content: 'Deep scraping top sources for detailed content...' },
        })

        const urlsToScrape = streamState.sources.slice(0, 3).map(s => s.url)
        const scrapedContent: string[] = []
        let scrapeFailures = 0

        for (const url of urlsToScrape) {
          send({ type: 'scrape_start', data: { url, reason: 'Top relevance source' } })

          const scrapeToolResult = await executeWithFallback(
            `scrape:${url}`,
            () => deepScrape(url),
            undefined,
            { maxRetries: 1 }
          )

          streamState.toolResults.set(`scrape:${url}`, scrapeToolResult)

          const scrapeResult = scrapeToolResult.data || { title: url, content: '', success: false }

          if (!scrapeResult.success || scrapeToolResult.status === 'failed') {
            scrapeFailures++
            send({
              type: 'scrape_fallback',
              data: {
                url,
                error: scrapeToolResult.error || 'Content extraction failed',
                fallbackAction: 'Using snippet from search results instead',
              },
            })
            // Use snippet as fallback content
            const sourceSnippet = streamState.sources.find(s => s.url === url)?.snippet
            if (sourceSnippet) {
              scrapedContent.push(`[Source: ${url}]\n${sourceSnippet}`)
            }
          } else {
            send({
              type: 'scrape_result',
              data: {
                url,
                title: scrapeResult.title,
                content: scrapeResult.content.slice(0, 500),
                success: true,
              },
            })
            scrapedContent.push(`[Source: ${url}]\n${scrapeResult.content.slice(0, 2000)}`)
          }
        }

        // Phase 5: Synthesize with streaming LLM
        streamState.phase = 'synthesizing'
        send({
          type: 'thinking',
          data: {
            blockNumber: nextThinkingBlock(),
            content: scrapeFailures > 0
              ? `Synthesizing findings (${scrapeFailures} source${scrapeFailures > 1 ? 's' : ''} using fallback snippets)...`
              : 'Synthesizing findings into intelligence brief...',
          },
        })

        send({ type: 'synthesis_start', data: { sourceCount: streamState.sources.length } })

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

Be direct, tactical, and actionable. Include specific data points and statistics when available.
When citing information, reference the source URL inline where appropriate.`,
          prompt: `Research Query: ${query}

Research Data:
${contextText}

Sources Found:
${streamState.sources.map(s => `- ${s.title}: ${s.url}`).join('\n')}

Synthesize these findings into an intelligence brief.`,
        })

        let fullSummary = ''
        for await (const chunk of textStream) {
          fullSummary += chunk
          send({ type: 'synthesis_chunk', data: { content: chunk } })
        }

        streamState.synthesis = fullSummary

        // Phase 6: Extract citations from synthesis (T-011)
        const citations = extractCitations(fullSummary, streamState.sources)
        streamState.citations = citations

        // Emit citation events
        for (const citation of citations) {
          send({
            type: 'citation_found',
            data: {
              id: citation.id,
              sourceUrl: citation.sourceUrl,
              sourceTitle: citation.sourceTitle,
              textSnippet: citation.textSnippet,
            },
          })
        }

        // Reconcile stream state and log warnings (T-011)
        const reconciliation = reconcileStreamState(streamState)
        if (reconciliation.warnings.length > 0) {
          console.log('[Agent] Stream reconciliation warnings:', reconciliation.warnings)
        }

        // Generate tool summary for logging
        const toolSummary = generateToolSummary(streamState)

        // Save session to database
        streamState.phase = 'complete'
        const totalDuration = Date.now() - streamState.startTime
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
              ${JSON.stringify(streamState.sources.map(s => ({ url: s.url, title: s.title, snippet: s.snippet })))},
              ${fullSummary},
              ${userId}
            )
            RETURNING id
          `
          missionId = mission?.id || null
        } catch (dbError) {
          console.error('[Agent] DB save error:', dbError)
        }

        // Log usage event with enhanced metadata
        try {
          await sql`
            INSERT INTO usage_events (event_type, module, input_value, status, metadata, user_id)
            VALUES (
              'agent',
              'agent_research',
              ${query},
              'success',
              ${JSON.stringify({
                sources_count: streamState.sources.length,
                citations_count: citations.length,
                duration_ms: totalDuration,
                session_id: missionId,
                tool_summary: toolSummary,
                failed_tools: streamState.failedTools,
                reconciliation_warnings: reconciliation.warnings,
              })},
              ${userId}
            )
          `
        } catch (usageError) {
          console.error('[Agent] Usage log error:', usageError)
        }

        // Complete with enhanced metadata (T-011)
        send({
          type: 'complete',
          data: {
            summary: fullSummary,
            sources: streamState.sources,
            citations: citations.map(c => ({
              id: c.id,
              sourceUrl: c.sourceUrl,
              sourceTitle: c.sourceTitle,
              textSnippet: c.textSnippet,
            })),
            duration: totalDuration,
            missionId,
            toolSummary,
          },
        })

      } catch (error) {
        streamState.phase = 'error'
        const errorMessage = error instanceof Error ? error.message : 'Agent session failed'
        console.error('[Agent] Session error:', error)

        send({
          type: 'error',
          data: {
            message: errorMessage,
            code: 'AGENT_ERROR',
            recoverable: false,
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
