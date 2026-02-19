import type {
  ResearchStreamEvent,
  StreamEventType,
} from '@/daedalus/agent/research/stream-types'

const KNOWN_EVENT_TYPES: Set<StreamEventType> = new Set([
  'thinking',
  'reasoning',
  'search_start',
  'search_result',
  'search_fallback',
  'scrape_start',
  'scrape_result',
  'scrape_fallback',
  'source_found',
  'citation_found',
  'synthesis_start',
  'synthesis_chunk',
  'complete',
  'error',
])

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toStringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function normalizeReasoningEvent(raw: Record<string, unknown>): ResearchStreamEvent | null {
  const candidates = [
    raw.content,
    raw.delta,
    raw.text,
    isObject(raw.data) ? raw.data.content : null,
    isObject(raw.data) ? raw.data.delta : null,
    isObject(raw.data) ? raw.data.text : null,
  ]

  const content = candidates.map(toStringValue).find(Boolean)
  if (!content) return null

  const blockNumberRaw = isObject(raw.data) ? raw.data.blockNumber : undefined
  const blockNumber = typeof blockNumberRaw === 'number' ? blockNumberRaw : 0

  return {
    type: 'reasoning',
    data: {
      blockNumber,
      content,
    },
  }
}

export function normalizeResearchStreamEvent(raw: unknown): ResearchStreamEvent | null {
  if (!isObject(raw)) return null

  const type = toStringValue(raw.type)

  if (type === 'reasoning' || type === 'reasoning_delta' || type === 'reasoning_step') {
    return normalizeReasoningEvent(raw)
  }

  if (!type || !KNOWN_EVENT_TYPES.has(type as StreamEventType) || !('data' in raw)) {
    return null
  }

  return {
    type: type as ResearchStreamEvent['type'],
    data: raw.data,
  } as ResearchStreamEvent
}
