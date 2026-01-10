// Types for streaming research

export type StreamEventType =
  | 'thinking'
  | 'search_start'
  | 'search_result'
  | 'scrape_start'
  | 'scrape_result'
  | 'source_found'
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
    duration: number
    missionId?: string | null
  }
}

export interface ErrorEvent {
  type: 'error'
  data: {
    message: string
    code?: string
  }
}

export type ResearchStreamEvent =
  | ThinkingEvent
  | SearchStartEvent
  | SearchResultEvent
  | ScrapeStartEvent
  | ScrapeResultEvent
  | SourceFoundEvent
  | SynthesisStartEvent
  | SynthesisChunkEvent
  | CompleteEvent
  | ErrorEvent
