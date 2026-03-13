import type {
  ResearchStreamEvent,
  SourceFoundEvent,
} from '@/daedalus/agent/research/stream-types'

export function getSafeCallbackUrl(
  callbackUrl: string | null | undefined
): string {
  const trimmed = callbackUrl?.trim()

  if (!trimmed || !trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return '/'
  }

  return trimmed
}

export function normalizeOptionalEmail(value: string): string | null {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function getApiErrorMessage(
  payload: unknown,
  fallback: string
): string {
  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    typeof payload.error === 'string' &&
    payload.error.trim().length > 0
  ) {
    return payload.error
  }

  return fallback
}

export function normalizeMonitorDetailResponse<TMonitor = unknown, TChange = unknown>(
  payload: unknown
): {
  monitor: TMonitor | null
  changes: TChange[]
} {
  if (!payload || typeof payload !== 'object') {
    return {monitor: null, changes: []}
  }

  const record = payload as {
    monitor?: TMonitor | null
    changes?: TChange[]
  }

  return {
    monitor: record.monitor ?? null,
    changes: Array.isArray(record.changes) ? record.changes : [],
  }
}

export type LiveResearchUiState = {
  events: ResearchStreamEvent[]
  sources: SourceFoundEvent['data'][]
  synthesis: string
  isComplete: boolean
  isSynthesizing: boolean
  error: string | null
}

function dedupeResearchSources(
  sources: SourceFoundEvent['data'][]
): SourceFoundEvent['data'][] {
  const seenUrls = new Set<string>()

  return sources.filter((source) => {
    const key = source.url.trim()

    if (!key || seenUrls.has(key)) {
      return false
    }

    seenUrls.add(key)
    return true
  })
}

export function applyLiveResearchEvent(
  state: LiveResearchUiState,
  event: ResearchStreamEvent
): LiveResearchUiState {
  const nextState = {
    ...state,
    events: [...state.events, event],
  }

  switch (event.type) {
    case 'source_found':
      return {
        ...nextState,
        sources: dedupeResearchSources([...state.sources, event.data]),
        error: null,
      }

    case 'synthesis_start':
      return {
        ...nextState,
        isSynthesizing: true,
        error: null,
      }

    case 'synthesis_chunk':
      return {
        ...nextState,
        synthesis: `${state.synthesis}${event.data.content}`,
        error: null,
      }

    case 'complete':
      return {
        ...nextState,
        sources: dedupeResearchSources(
          event.data.sources.length > 0 ? event.data.sources : state.sources
        ),
        synthesis: event.data.summary || state.synthesis,
        isComplete: true,
        isSynthesizing: false,
        error: null,
      }

    case 'error':
      return {
        ...nextState,
        error: event.data.message || 'Research failed',
        isComplete: false,
        isSynthesizing: false,
      }

    default:
      return nextState
  }
}

export function toCompetitorEntry(draft: {
  name: string
  domain: string
}): {name: string; domain: string} | null {
  const domain = draft.domain.trim()

  if (!domain) {
    return null
  }

  return {
    name: draft.name.trim(),
    domain,
  }
}

export function validateResearchMissionForm({
  name,
  query,
  sources,
}: {
  name: string
  query: string
  sources: string[]
}): string | null {
  if (!name.trim()) {
    return 'Mission name is required'
  }

  if (!query.trim()) {
    return 'Research query is required'
  }

  if (sources.length === 0) {
    return 'Select at least one source'
  }

  return null
}
