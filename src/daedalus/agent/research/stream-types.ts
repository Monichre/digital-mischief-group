// Types for streaming research

export type StreamEventType =
  | 'thinking'
  | 'search_start'
  | 'search_result'
  | 'search_fallback'
  | 'scrape_start'
  | 'scrape_result'
  | 'scrape_fallback'
  | 'source_found'
  | 'citation_found'
  | 'synthesis_start'
  | 'synthesis_chunk'
  | 'complete'
  | 'error'

export interface StreamEvent {
  type: StreamEventType
  data: unknown
  timestamp: number
}

export interface ThinkingEvent {
  type: 'thinking'
  data: {
    blockNumber: number
    content: string
  }
}

export interface SearchStartEvent {
  type: 'search_start'
  data: {
    source: string
    query: string
  }
}

export interface SearchResultEvent {
  type: 'search_result'
  data: {
    source: string
    resultCount: number
    duration: number
  }
}

export interface ScrapeStartEvent {
  type: 'scrape_start'
  data: {
    url: string
    reason: string
  }
}

export interface ScrapeResultEvent {
  type: 'scrape_result'
  data: {
    url: string
    title: string
    content: string
    success: boolean
  }
}

export interface SourceFoundEvent {
  type: 'source_found'
  data: {
    url: string
    title: string
    snippet: string
    source: string
    favicon?: string
  }
}

export interface SynthesisStartEvent {
  type: 'synthesis_start'
  data: {
    sourceCount: number
  }
}

export interface SynthesisChunkEvent {
  type: 'synthesis_chunk'
  data: {
    content: string
  }
}

export interface CompleteEvent {
  type: 'complete'
  data: {
    summary: string
    sources: SourceFoundEvent['data'][]
    citations: CitationFoundEvent['data'][]
    duration: number
    missionId?: string | null
    toolSummary?: {
      totalTools: number
      succeeded: number
      failed: number
      fallbackUsed: number
    }
  }
}

export interface ErrorEvent {
  type: 'error'
  data: {
    message: string
    code?: string
    recoverable?: boolean
  }
}

// Fallback events for when a search provider fails
export interface SearchFallbackEvent {
  type: 'search_fallback'
  data: {
    source: string
    error: string
    fallbackAction: string
  }
}

// Fallback events for when scraping fails
export interface ScrapeFallbackEvent {
  type: 'scrape_fallback'
  data: {
    url: string
    error: string
    fallbackAction: string
  }
}

// Citation tracking - maps source to synthesis text
export interface CitationFoundEvent {
  type: 'citation_found'
  data: {
    id: string
    sourceUrl: string
    sourceTitle: string
    textSnippet: string
    sectionHeading?: string
  }
}

export type ResearchStreamEvent =
  | ThinkingEvent
  | SearchStartEvent
  | SearchResultEvent
  | SearchFallbackEvent
  | ScrapeStartEvent
  | ScrapeResultEvent
  | ScrapeFallbackEvent
  | SourceFoundEvent
  | CitationFoundEvent
  | SynthesisStartEvent
  | SynthesisChunkEvent
  | CompleteEvent
  | ErrorEvent
