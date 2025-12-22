// Types for streaming enrichment

export type EnrichStreamEventType =
  | 'phase_start'
  | 'phase_progress'
  | 'phase_complete'
  | 'phase_error'
  | 'source_found'
  | 'data_extracted'
  | 'complete'
  | 'error'

export interface PhaseStartEvent {
  type: 'phase_start'
  data: {
    phase: string
    message: string
  }
}

export interface PhaseProgressEvent {
  type: 'phase_progress'
  data: {
    phase: string
    progress: number
    message: string
  }
}

export interface PhaseCompleteEvent {
  type: 'phase_complete'
  data: {
    phase: string
    message: string
    result: unknown
  }
}

export interface PhaseErrorEvent {
  type: 'phase_error'
  data: {
    phase: string
    error: string
    recoverable: boolean
  }
}

export interface SourceFoundEvent {
  type: 'source_found'
  data: {
    url: string
    phase: string
  }
}

export interface DataExtractedEvent {
  type: 'data_extracted'
  data: {
    phase: string
    field: string
    value: unknown
  }
}

export interface EnrichCompleteEvent {
  type: 'complete'
  data: {
    success: boolean
    result: unknown
    duration_ms: number
    errors?: Array<{ phase: string; error: string }>
  }
}

export interface EnrichErrorEvent {
  type: 'error'
  data: {
    message: string
    code?: string
  }
}

export type EnrichStreamEvent =
  | PhaseStartEvent
  | PhaseProgressEvent
  | PhaseCompleteEvent
  | PhaseErrorEvent
  | SourceFoundEvent
  | DataExtractedEvent
  | EnrichCompleteEvent
  | EnrichErrorEvent
