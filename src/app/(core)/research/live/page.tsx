'use client'

import {useState, useCallback} from 'react'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {ArrowLeft, Search, Loader2, Brain, Zap} from 'lucide-react'
import {ThinkingPanel} from '@/components/research/ThinkingPanel'
import {SourcePanel} from '@/components/research/SourcePanel'
import {SynthesisPanel} from '@/components/research/SynthesisPanel'
import {AuthLinks} from '@/components/AuthLinks'
import type {
  ResearchStreamEvent,
} from '@/daedalus/agent/research/stream-types'
import {
  applyLiveResearchEvent,
  getApiErrorMessage,
  type LiveResearchUiState,
} from '@/lib/core-flow-ux'

export default function LiveResearchPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('query') || '')
  const [isResearching, setIsResearching] = useState(false)
  const [streamState, setStreamState] = useState<LiveResearchUiState>({
    events: [],
    sources: [],
    synthesis: '',
    isComplete: false,
    isSynthesizing: false,
    error: null,
  })

  const {events, sources, synthesis, isComplete, isSynthesizing, error} =
    streamState

  const handleResearch = useCallback(async () => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery || isResearching) return

    // Reset state
    setIsResearching(true)
    setQuery(trimmedQuery)
    setStreamState({
      events: [],
      sources: [],
      synthesis: '',
      isComplete: false,
      isSynthesizing: false,
      error: null,
    })

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({query: trimmedQuery}),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(getApiErrorMessage(data, 'Research failed'))
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const {done, value} = await reader.read()
        if (done) break

        buffer += decoder.decode(value, {stream: true})
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6)) as ResearchStreamEvent
              setStreamState((prev) => applyLiveResearchEvent(prev, event))
            } catch {
              // Skip malformed events
            }
          }
        }
      }
    } catch (error) {
      console.error('Research error:', error)
      setStreamState((prev) =>
        applyLiveResearchEvent(prev, {
          type: 'error',
          data: {
            message:
              error instanceof Error ? error.message : 'Research failed',
          },
        })
      )
    } finally {
      setIsResearching(false)
    }
  }, [query, isResearching])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleResearch()
    }
  }

  return (
    <main className='relative flex min-h-screen flex-col bg-zinc-950 text-zinc-100'>
      <div className='fixed inset-0 pointer-events-none z-0'>
        <div className='absolute inset-0 dmg-grid-bg opacity-70' />
        <div className='absolute inset-0 dmg-page-glow opacity-60' />
      </div>

      {/* Header */}
      <header className='relative z-10 border-b border-white/10 bg-zinc-950/88 backdrop-blur-xl'>
        <div className='max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between'>
          <Link
            href='/'
            className='flex items-center gap-2 text-zinc-400 hover:text-orange-500 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            <span className='font-mono text-sm'>Back to HQ</span>
          </Link>

          <div className='flex items-center gap-2'>
            <span className='text-orange-500 font-mono text-xs'>[</span>
            <Brain className='w-4 h-4 text-orange-500' />
            <span className='font-mono text-sm tracking-wider'>
              DEEP INTEL
            </span>
            <span className='text-orange-500 font-mono text-xs'>]</span>
          </div>

          <div className='flex items-center gap-4'>
            <div className='dmg-chip border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-[10px] text-zinc-500'>
              <Zap className='w-4 h-4 text-orange-500' />
              <span>LIVE MODE</span>
            </div>
            <AuthLinks
              linkClassName='text-[10px] text-zinc-500 hover:text-white transition-colors'
              ctaClassName='px-2.5 py-1 border border-zinc-700 text-[10px] text-zinc-400 hover:border-orange-500/60 hover:text-orange-500 transition-colors'
            />
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className='relative z-10 border-b border-zinc-800/80 bg-zinc-900/35'>
        <div className='max-w-[1800px] mx-auto px-6 py-4'>
          <div className='dmg-surface relative rounded-xl p-2'>
            <input
              type='text'
              aria-label='Research query'
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (error) {
                  setStreamState((prev) => ({...prev, error: null}))
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder='Enter your research query... (e.g., What are the latest AI trends in 2025?)'
              aria-describedby={error ? 'live-research-error' : undefined}
              className='w-full rounded-lg border border-zinc-800 bg-zinc-950/90 px-4 py-3 pl-12 pr-32 font-mono text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none'
              disabled={isResearching}
            />
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500' />
            <button
              onClick={handleResearch}
              disabled={!query.trim() || isResearching}
              className='absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2 rounded-md bg-orange-500 px-4 py-1.5 font-mono text-sm text-zinc-950 transition-colors hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-500'
            >
              {isResearching ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  Researching...
                </>
              ) : (
                <>
                  <Search className='w-4 h-4' />
                  Research
                </>
              )}
            </button>
          </div>

          {error && (
            <div
              id='live-research-error'
              role='alert'
              aria-live='polite'
              className='mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300'
            >
              {error}
            </div>
          )}

          {query && !isResearching && events.length === 0 && (
            <p className='mt-2 font-sans text-sm text-zinc-500'>
              Press Enter or click Research to begin
            </p>
          )}
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className='relative z-10 flex min-h-0 flex-1 overflow-hidden'>
        {/* Left Panel - Thinking Log */}
        <div className='w-[400px] flex-shrink-0 overflow-hidden min-h-0 border-r border-zinc-800'>
          <ThinkingPanel events={events} isComplete={isComplete} />
        </div>

        {/* Right Panel - Sources + Synthesis */}
        <div className='flex-1 flex flex-col overflow-hidden min-h-0'>
          {/* Sources */}
          <div className='flex-1 overflow-hidden min-h-0'>
            <SourcePanel
              sources={sources}
              isLoading={isResearching && sources.length === 0}
            />
          </div>

          {/* Synthesis */}
          {(synthesis || isSynthesizing) && (
            <div className='max-h-[40vh] min-h-[220px] overflow-hidden border-t border-zinc-800'>
              <SynthesisPanel
                content={synthesis}
                isStreaming={isSynthesizing}
                isComplete={isComplete}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
