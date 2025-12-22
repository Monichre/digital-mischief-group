'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Loader2, Target, Zap } from 'lucide-react'
import { ThinkingPanel } from '@/components/research/ThinkingPanel'
import { SourcePanel } from '@/components/research/SourcePanel'
import { SynthesisPanel } from '@/components/research/SynthesisPanel'
import type { ResearchStreamEvent, SourceFoundEvent } from '@/lib/research/stream-types'

export default function LiveResearchPage() {
  const [query, setQuery] = useState('')
  const [isResearching, setIsResearching] = useState(false)
  const [events, setEvents] = useState<ResearchStreamEvent[]>([])
  const [sources, setSources] = useState<SourceFoundEvent['data'][]>([])
  const [synthesis, setSynthesis] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [isSynthesizing, setIsSynthesizing] = useState(false)

  const handleResearch = useCallback(async () => {
    if (!query.trim() || isResearching) return

    // Reset state
    setIsResearching(true)
    setIsComplete(false)
    setEvents([])
    setSources([])
    setSynthesis('')
    setIsSynthesizing(false)

    try {
      const response = await fetch('/api/research/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) throw new Error('Research failed')

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
              const event = JSON.parse(line.slice(6)) as ResearchStreamEvent
              setEvents(prev => [...prev, event])

              // Handle specific events
              if (event.type === 'source_found') {
                setSources(prev => [...prev, event.data])
              } else if (event.type === 'synthesis_start') {
                setIsSynthesizing(true)
              } else if (event.type === 'synthesis_chunk') {
                setSynthesis(prev => prev + event.data.content)
              } else if (event.type === 'complete') {
                setIsComplete(true)
                setIsSynthesizing(false)
              }
            } catch {
              // Skip malformed events
            }
          }
        }
      }
    } catch (error) {
      console.error('Research error:', error)
      setEvents(prev => [
        ...prev,
        {
          type: 'error',
          data: { message: error instanceof Error ? error.message : 'Research failed' },
        },
      ])
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
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono text-sm">Back to HQ</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-orange-500 font-mono text-xs">[</span>
            <Target className="w-4 h-4 text-orange-500" />
            <span className="font-mono text-sm tracking-wider">OPEN-RESEARCHER</span>
            <span className="text-orange-500 font-mono text-xs">]</span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-mono text-zinc-500">LIVE MODE</span>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your research query... (e.g., What are the latest AI trends in 2025?)"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 pl-12 pr-32 font-mono text-sm focus:outline-none focus:border-orange-500 transition-colors"
              disabled={isResearching}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <button
              onClick={handleResearch}
              disabled={!query.trim() || isResearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-mono text-sm rounded transition-colors flex items-center gap-2"
            >
              {isResearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Research
                </>
              )}
            </button>
          </div>

          {query && !isResearching && events.length === 0 && (
            <p className="text-xs text-zinc-500 mt-2 font-mono">
              Press Enter or click Research to begin
            </p>
          )}
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Thinking Log */}
        <div className="w-[400px] flex-shrink-0 overflow-hidden">
          <ThinkingPanel events={events} isComplete={isComplete} />
        </div>

        {/* Right Panel - Sources + Synthesis */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sources */}
          <div className="flex-1 overflow-hidden">
            <SourcePanel sources={sources} isLoading={isResearching && sources.length === 0} />
          </div>

          {/* Synthesis */}
          {(synthesis || isSynthesizing) && (
            <SynthesisPanel
              content={synthesis}
              isStreaming={isSynthesizing}
              isComplete={isComplete}
            />
          )}
        </div>
      </div>
    </main>
  )
}
