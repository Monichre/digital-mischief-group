/**
 * Research Stream Handler
 *
 * Manages streaming research sessions with:
 * - Tool failure fallback handling
 * - Citation tracking (maps sources to synthesis text)
 * - Stream synchronization across providers
 * - Orphaned result handling
 */

import type {
  ResearchStreamEvent,
  SourceFoundEvent,
} from './stream-types'

// Tool execution status for tracking
export type ToolStatus = 'pending' | 'running' | 'success' | 'failed' | 'fallback'

export interface ToolResult<T = unknown> {
  tool: string
  status: ToolStatus
  data: T | null
  error?: string
  duration: number
  retries: number
  fallbackUsed: boolean
}

// Citation tracking
export interface Citation {
  id: string
  sourceUrl: string
  sourceTitle: string
  textSnippet: string
  position: number // Position in synthesis where this was cited
}

// Stream state manager for synchronization
export interface StreamState {
  phase: 'idle' | 'searching' | 'scraping' | 'synthesizing' | 'complete' | 'error'
  toolResults: Map<string, ToolResult>
  sources: SourceFoundEvent['data'][]
  citations: Citation[]
  failedTools: string[]
  synthesis: string
  startTime: number
  errors: Array<{ tool: string; message: string; timestamp: number }>
}

/**
 * Creates an initial stream state
 */
export function createStreamState(): StreamState {
  return {
    phase: 'idle',
    toolResults: new Map(),
    sources: [],
    citations: [],
    failedTools: [],
    synthesis: '',
    startTime: Date.now(),
    errors: [],
  }
}

/**
 * Executes a tool with retry and fallback support
 */
export async function executeWithFallback<T>(
  toolName: string,
  primaryFn: () => Promise<T>,
  fallbackFn?: () => Promise<T>,
  options: {
    maxRetries?: number
    retryDelay?: number
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<ToolResult<T>> {
  const { maxRetries = 2, retryDelay = 1000, onRetry } = options
  const startTime = Date.now()
  let retries = 0
  let lastError: Error | undefined

  // Try primary function with retries
  while (retries <= maxRetries) {
    try {
      const data = await primaryFn()
      return {
        tool: toolName,
        status: 'success',
        data,
        duration: Date.now() - startTime,
        retries,
        fallbackUsed: false,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      retries++

      if (retries <= maxRetries) {
        onRetry?.(retries, lastError)
        await new Promise(resolve => setTimeout(resolve, retryDelay * retries))
      }
    }
  }

  // Try fallback if available
  if (fallbackFn) {
    try {
      const data = await fallbackFn()
      return {
        tool: toolName,
        status: 'fallback',
        data,
        duration: Date.now() - startTime,
        retries,
        fallbackUsed: true,
      }
    } catch (fallbackError) {
      // Fallback also failed
      const fbError = fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError))
      return {
        tool: toolName,
        status: 'failed',
        data: null,
        error: `Primary: ${lastError?.message}. Fallback: ${fbError.message}`,
        duration: Date.now() - startTime,
        retries,
        fallbackUsed: true,
      }
    }
  }

  // No fallback, return failure
  return {
    tool: toolName,
    status: 'failed',
    data: null,
    error: lastError?.message || 'Unknown error',
    duration: Date.now() - startTime,
    retries,
    fallbackUsed: false,
  }
}

/**
 * Extracts citations from synthesis text by matching source URLs
 */
export function extractCitations(
  synthesisText: string,
  sources: SourceFoundEvent['data'][]
): Citation[] {
  const citations: Citation[] = []
  let citationId = 0

  // Look for URL references in the text
  for (const source of sources) {
    // Check for explicit URL mentions
    const urlPattern = new RegExp(escapeRegex(source.url), 'gi')
    let match = urlPattern.exec(synthesisText)

    while (match) {
      citations.push({
        id: `cite-${citationId++}`,
        sourceUrl: source.url,
        sourceTitle: source.title,
        textSnippet: synthesisText.slice(Math.max(0, match.index - 50), match.index + match[0].length + 50),
        position: match.index,
      })
      match = urlPattern.exec(synthesisText)
    }

    // Check for title mentions (case-insensitive, partial match)
    if (source.title && source.title.length > 5) {
      const titleWords = source.title.split(/\s+/).filter(w => w.length > 4).slice(0, 3)
      if (titleWords.length > 0) {
        const titlePattern = new RegExp(titleWords.map(escapeRegex).join('.*?'), 'gi')
        const titleMatch = titlePattern.exec(synthesisText)
        if (titleMatch && !citations.some(c => c.sourceUrl === source.url && Math.abs(c.position - titleMatch.index) < 100)) {
          citations.push({
            id: `cite-${citationId++}`,
            sourceUrl: source.url,
            sourceTitle: source.title,
            textSnippet: synthesisText.slice(Math.max(0, titleMatch.index - 50), titleMatch.index + titleMatch[0].length + 50),
            position: titleMatch.index,
          })
        }
      }
    }
  }

  // Sort by position
  return citations.sort((a, b) => a.position - b.position)
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Validates and reconciles stream state to prevent orphaned results
 */
export function reconcileStreamState(state: StreamState): {
  isValid: boolean
  orphanedSources: SourceFoundEvent['data'][]
  uncitedSources: SourceFoundEvent['data'][]
  warnings: string[]
} {
  const warnings: string[] = []

  // Check for sources without corresponding tool results
  const orphanedSources = state.sources.filter(source => {
    const toolResult = state.toolResults.get(source.source)
    return !toolResult || toolResult.status === 'failed'
  })

  if (orphanedSources.length > 0) {
    warnings.push(`${orphanedSources.length} sources from failed tools may be incomplete`)
  }

  // Check for sources not cited in synthesis
  const citedUrls = new Set(state.citations.map(c => c.sourceUrl))
  const uncitedSources = state.sources.filter(s => !citedUrls.has(s.url))

  if (uncitedSources.length > 0 && state.synthesis.length > 0) {
    warnings.push(`${uncitedSources.length} sources not explicitly cited in synthesis`)
  }

  // Check for failed tools
  if (state.failedTools.length > 0) {
    warnings.push(`Tools failed: ${state.failedTools.join(', ')}`)
  }

  return {
    isValid: state.errors.length === 0 && state.synthesis.length > 0,
    orphanedSources,
    uncitedSources,
    warnings,
  }
}

/**
 * Creates a fallback event when a tool fails
 */
export function createFallbackEvent(
  toolName: string,
  error: string,
  fallbackAction: string
): ResearchStreamEvent {
  return {
    type: 'thinking',
    data: {
      blockNumber: 0, // Will be assigned by the caller
      content: `⚠️ ${toolName} encountered an error: ${error}. ${fallbackAction}`,
    },
  }
}

/**
 * Generates a summary of tool execution for logging
 */
export function generateToolSummary(state: StreamState): {
  totalTools: number
  succeeded: number
  failed: number
  fallbackUsed: number
  totalDuration: number
} {
  const results = Array.from(state.toolResults.values())

  return {
    totalTools: results.length,
    succeeded: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'failed').length,
    fallbackUsed: results.filter(r => r.fallbackUsed).length,
    totalDuration: Date.now() - state.startTime,
  }
}

/**
 * Maps synthesis sections to their source citations
 */
export interface SynthesisSection {
  heading: string
  content: string
  citations: Citation[]
}

export function mapSynthesisSections(
  synthesisText: string,
  citations: Citation[]
): SynthesisSection[] {
  const sections: SynthesisSection[] = []

  // Split by markdown headings
  const headingPattern = /^(#{1,3})\s+(.+)$/gm
  const matches = [...synthesisText.matchAll(headingPattern)]

  if (matches.length === 0) {
    // No headings, treat as single section
    return [{
      heading: 'Analysis',
      content: synthesisText,
      citations,
    }]
  }

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const nextMatch = matches[i + 1]

    const heading = match[2]
    const startPos = match.index! + match[0].length
    const endPos = nextMatch?.index || synthesisText.length
    const content = synthesisText.slice(startPos, endPos).trim()

    // Find citations within this section's position range
    const sectionCitations = citations.filter(
      c => c.position >= startPos && c.position < endPos
    )

    sections.push({
      heading,
      content,
      citations: sectionCitations,
    })
  }

  return sections
}
