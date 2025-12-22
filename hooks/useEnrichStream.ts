'use client'

import { useState, useCallback } from 'react'
import type { EnrichStreamEvent } from '@/lib/enrich/stream-types'

export type PhaseStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface PhaseState {
  status: PhaseStatus
  progress: number
  message: string
  error?: string
  result?: unknown
}

export interface EnrichStreamState {
  isLoading: boolean
  phases: Record<string, PhaseState>
  events: EnrichStreamEvent[]
  result: unknown | null
  error: string | null
  duration: number | null
}

const PHASE_ORDER = ['discovery', 'company_profile', 'funding', 'tech_stack', 'custom_fields', 'branding']

const initialPhases: Record<string, PhaseState> = {
  discovery: { status: 'pending', progress: 0, message: 'Identifying company...' },
  company_profile: { status: 'pending', progress: 0, message: 'Gathering firmographics...' },
  funding: { status: 'pending', progress: 0, message: 'Researching funding...' },
  tech_stack: { status: 'pending', progress: 0, message: 'Detecting tech stack...' },
  custom_fields: { status: 'pending', progress: 0, message: 'Calculating ICP & leadership...' },
  branding: { status: 'pending', progress: 0, message: 'Extracting brand assets...' },
}

export function useEnrichStream() {
  const [state, setState] = useState<EnrichStreamState>({
    isLoading: false,
    phases: { ...initialPhases },
    events: [],
    result: null,
    error: null,
    duration: null,
  })

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      phases: { ...initialPhases },
      events: [],
      result: null,
      error: null,
      duration: null,
    })
  }, [])

  const enrich = useCallback(async (input: string) => {
    reset()
    setState(s => ({ ...s, isLoading: true }))

    try {
      const response = await fetch('/api/enrich/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Enrichment failed')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6)) as EnrichStreamEvent & { timestamp: number }
              
              setState(s => {
                const newState = { ...s, events: [...s.events, event] }

                switch (event.type) {
                  case 'phase_start':
                    newState.phases = {
                      ...s.phases,
                      [event.data.phase]: {
                        ...s.phases[event.data.phase],
                        status: 'running',
                        message: event.data.message,
                      },
                    }
                    break

                  case 'phase_progress':
                    newState.phases = {
                      ...s.phases,
                      [event.data.phase]: {
                        ...s.phases[event.data.phase],
                        progress: event.data.progress,
                        message: event.data.message,
                      },
                    }
                    break

                  case 'phase_complete':
                    newState.phases = {
                      ...s.phases,
                      [event.data.phase]: {
                        ...s.phases[event.data.phase],
                        status: 'completed',
                        progress: 100,
                        message: event.data.message,
                        result: event.data.result,
                      },
                    }
                    break

                  case 'phase_error':
                    newState.phases = {
                      ...s.phases,
                      [event.data.phase]: {
                        ...s.phases[event.data.phase],
                        status: 'failed',
                        error: event.data.error,
                      },
                    }
                    break

                  case 'complete':
                    newState.isLoading = false
                    newState.result = event.data.result
                    newState.duration = event.data.duration_ms
                    break

                  case 'error':
                    newState.isLoading = false
                    newState.error = event.data.message
                    break
                }

                return newState
              })
            } catch {
              // Skip malformed events
            }
          }
        }
      }
    } catch (error) {
      setState(s => ({
        ...s,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Enrichment failed',
      }))
    }
  }, [reset])

  // Calculate overall progress
  const overallProgress = Object.values(state.phases).reduce((sum, p) => sum + p.progress, 0) / PHASE_ORDER.length

  return {
    ...state,
    overallProgress,
    enrich,
    reset,
  }
}
