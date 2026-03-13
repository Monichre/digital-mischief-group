import {describe, expect, it} from 'bun:test'

import {
  applyLiveResearchEvent,
  getApiErrorMessage,
  getSafeCallbackUrl,
  normalizeMonitorDetailResponse,
  normalizeOptionalEmail,
  toCompetitorEntry,
  validateResearchMissionForm,
} from './core-flow-ux'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectAny = expect as any

describe('core flow UX helpers', () => {
  describe('getSafeCallbackUrl', () => {
    it('returns the root path when the callback is missing', () => {
      expect(getSafeCallbackUrl(null)).toBe('/')
      expect(getSafeCallbackUrl(undefined)).toBe('/')
    })

    it('keeps internal callback paths', () => {
      expect(getSafeCallbackUrl('/research/live')).toBe('/research/live')
      expect(getSafeCallbackUrl('/sign-in?callbackUrl=%2Fobserve')).toBe(
        '/sign-in?callbackUrl=%2Fobserve'
      )
    })

    it('rejects external or protocol-relative callback paths', () => {
      expect(getSafeCallbackUrl('https://evil.example')).toBe('/')
      expect(getSafeCallbackUrl('//evil.example')).toBe('/')
      expect(getSafeCallbackUrl('javascript:alert(1)')).toBe('/')
    })
  })

  describe('normalizeOptionalEmail', () => {
    it('returns null for blank input', () => {
      expectAny(normalizeOptionalEmail('')).toBeNull()
      expectAny(normalizeOptionalEmail('   ')).toBeNull()
    })

    it('trims valid email input', () => {
      expect(normalizeOptionalEmail('  ops@dmg.io  ')).toBe('ops@dmg.io')
    })
  })

  describe('getApiErrorMessage', () => {
    it('prefers the API error field when present', () => {
      expect(getApiErrorMessage({error: 'Unauthorized'}, 'Fallback')).toBe(
        'Unauthorized'
      )
    })

    it('falls back when the payload is missing a usable error', () => {
      expect(getApiErrorMessage({}, 'Fallback')).toBe('Fallback')
      expect(getApiErrorMessage('oops', 'Fallback')).toBe('Fallback')
    })
  })

  describe('normalizeMonitorDetailResponse', () => {
    it('returns empty state for invalid payloads', () => {
      expect(normalizeMonitorDetailResponse(null)).toEqual({
        monitor: null,
        changes: [],
      })
      expect(normalizeMonitorDetailResponse('oops')).toEqual({
        monitor: null,
        changes: [],
      })
    })

    it('keeps monitor data and normalizes missing changes', () => {
      expect(
        normalizeMonitorDetailResponse({
          monitor: {id: 'monitor-1'},
        })
      ).toEqual({
        monitor: {id: 'monitor-1'},
        changes: [],
      })
    })
  })

  describe('applyLiveResearchEvent', () => {
    it('deduplicates sources and appends synthesis chunks', () => {
      let state = applyLiveResearchEvent(
        {
          events: [],
          sources: [],
          synthesis: '',
          isComplete: false,
          isSynthesizing: false,
          error: null,
        },
        {
          type: 'source_found',
          data: {
            url: 'https://example.com',
            title: 'Example',
            snippet: 'Snippet',
            source: 'exa',
          },
        }
      )

      state = applyLiveResearchEvent(state, {
        type: 'source_found',
        data: {
          url: 'https://example.com',
          title: 'Example',
          snippet: 'Snippet',
          source: 'exa',
        },
      })

      state = applyLiveResearchEvent(state, {
        type: 'synthesis_start',
        data: {sourceCount: 1},
      })

      state = applyLiveResearchEvent(state, {
        type: 'synthesis_chunk',
        data: {content: 'Intel summary'},
      })

      expect(state.sources).toEqual([
        {
          url: 'https://example.com',
          title: 'Example',
          snippet: 'Snippet',
          source: 'exa',
        },
      ])
      expect(state.synthesis).toBe('Intel summary')
      expect(state.isSynthesizing).toBe(true)
      expectAny(state.events).toHaveLength(4)
    })

    it('finishes on complete and surfaces error events', () => {
      const completedState = applyLiveResearchEvent(
        {
          events: [],
          sources: [],
          synthesis: '',
          isComplete: false,
          isSynthesizing: true,
          error: null,
        },
        {
          type: 'complete',
          data: {
            summary: 'Final brief',
            sources: [
              {
                url: 'https://briefing.com',
                title: 'Briefing',
                snippet: 'Summary',
                source: 'perplexity',
              },
            ],
            citations: [],
            duration: 1200,
          },
        }
      )

      expect(completedState.isComplete).toBe(true)
      expect(completedState.isSynthesizing).toBe(false)
      expect(completedState.synthesis).toBe('Final brief')

      const erroredState = applyLiveResearchEvent(completedState, {
        type: 'error',
        data: {message: 'Rate limit exceeded'},
      })

      expect(erroredState.error).toBe('Rate limit exceeded')
      expect(erroredState.isSynthesizing).toBe(false)
    })
  })

  describe('toCompetitorEntry', () => {
    it('returns null when the domain is blank', () => {
      expectAny(toCompetitorEntry({name: 'Acme', domain: '   '})).toBeNull()
    })

    it('trims values before returning an entry', () => {
      expect(toCompetitorEntry({name: '  Acme  ', domain: ' acme.com '})).toEqual(
        {
          name: 'Acme',
          domain: 'acme.com',
        }
      )
    })
  })

  describe('validateResearchMissionForm', () => {
    it('requires a mission name, query, and at least one source', () => {
      expect(
        validateResearchMissionForm({
          name: '',
          query: 'Track AI analyst firms',
          sources: ['exa'],
        })
      ).toBe('Mission name is required')

      expect(
        validateResearchMissionForm({
          name: 'AI analyst watch',
          query: '',
          sources: ['exa'],
        })
      ).toBe('Research query is required')

      expect(
        validateResearchMissionForm({
          name: 'AI analyst watch',
          query: 'Track AI analyst firms',
          sources: [],
        })
      ).toBe('Select at least one source')
    })

    it('accepts valid mission input', () => {
      expectAny(
        validateResearchMissionForm({
          name: 'AI analyst watch',
          query: 'Track AI analyst firms',
          sources: ['exa', 'perplexity'],
        })
      ).toBeNull()
    })
  })
})
