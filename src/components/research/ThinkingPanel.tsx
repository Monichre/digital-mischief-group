'use client'

import {useEffect, useRef} from 'react'
import {
  Brain,
  Search,
  Globe,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import type {ResearchStreamEvent} from '@/daedalus/agent/research/stream-types'

interface ThinkingPanelProps {
  events: ResearchStreamEvent[]
  isComplete: boolean
}

export function ThinkingPanel({events, isComplete}: ThinkingPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current
      el.scrollTo({top: el.scrollHeight, behavior: 'smooth'})
    }
  }, [events])

  const getEventIcon = (type: ResearchStreamEvent['type']) => {
    switch (type) {
      case 'thinking':
        return <Brain className='w-4 h-4 text-orange-500' />
      case 'search_start':
      case 'search_result':
        return <Search className='w-4 h-4 text-blue-400' />
      case 'scrape_start':
      case 'scrape_result':
        return <Globe className='w-4 h-4 text-green-400' />
      case 'source_found':
        return <FileText className='w-4 h-4 text-purple-400' />
      case 'synthesis_start':
      case 'synthesis_chunk':
        return <Brain className='w-4 h-4 text-orange-500 animate-pulse' />
      case 'complete':
        return <CheckCircle2 className='w-4 h-4 text-green-500' />
      case 'error':
        return <AlertCircle className='w-4 h-4 text-red-500' />
      default:
        return <Loader2 className='w-4 h-4 text-zinc-500 animate-spin' />
    }
  }

  const renderEvent = (event: ResearchStreamEvent, index: number) => {
    switch (event.type) {
      case 'thinking':
        return (
          <div
            key={index}
            className='flex items-start gap-3 p-3 bg-zinc-900/50 rounded border border-zinc-800 animate-fade-in'
          >
            {getEventIcon(event.type)}
            <div className='flex-1'>
              <div className='text-xs text-orange-500 font-mono mb-1'>
                Thinking Block #{event.data.blockNumber}
              </div>
              <p className='text-sm text-zinc-300'>{event.data.content}</p>
            </div>
          </div>
        )

      case 'search_start':
        return (
          <div
            key={index}
            className='flex items-center gap-3 p-2 text-sm animate-fade-in'
          >
            <Loader2 className='w-3 h-3 text-blue-400 animate-spin' />
            <span className='text-zinc-400'>
              Searching{' '}
              <span className='text-blue-400 font-mono'>
                {event.data.source}
              </span>
              ...
            </span>
          </div>
        )

      case 'search_result':
        return (
          <div
            key={index}
            className='flex items-center gap-3 p-2 text-sm animate-fade-in'
          >
            <CheckCircle2 className='w-3 h-3 text-green-500' />
            <span className='text-zinc-300'>
              <span className='text-blue-400 font-mono'>
                {event.data.source}
              </span>{' '}
              returned {event.data.resultCount} results
              <span className='text-zinc-500 ml-2'>
                ({event.data.duration}ms)
              </span>
            </span>
          </div>
        )

      case 'scrape_start':
        return (
          <div
            key={index}
            className='flex items-start gap-3 p-2 text-sm animate-fade-in'
          >
            <Loader2 className='w-3 h-3 text-green-400 animate-spin mt-0.5' />
            <div>
              <span className='text-zinc-400'>Deep Scrape: </span>
              <span className='text-green-400 font-mono text-xs break-all'>
                {event.data.url.slice(0, 50)}...
              </span>
            </div>
          </div>
        )

      case 'scrape_result':
        return (
          <div
            key={index}
            className='flex items-start gap-3 p-2 text-sm animate-fade-in'
          >
            {event.data.success ? (
              <CheckCircle2 className='w-3 h-3 text-green-500 mt-0.5' />
            ) : (
              <AlertCircle className='w-3 h-3 text-yellow-500 mt-0.5' />
            )}
            <div>
              <span className='text-zinc-300'>{event.data.title}</span>
              {event.data.success && (
                <span className='text-zinc-500 ml-2'>
                  ({event.data.content.length} chars)
                </span>
              )}
            </div>
          </div>
        )

      case 'source_found':
        return (
          <div
            key={index}
            className='flex items-center gap-2 p-2 text-sm animate-fade-in'
          >
            <FileText className='w-3 h-3 text-purple-400' />
            <span className='text-zinc-400'>Source:</span>
            <span className='text-purple-400 font-mono text-xs truncate max-w-[200px]'>
              {event.data.title}
            </span>
          </div>
        )

      case 'synthesis_start':
        return (
          <div
            key={index}
            className='flex items-center gap-3 p-3 bg-orange-500/10 rounded border border-orange-500/30 mt-2 animate-fade-in'
          >
            <Brain className='w-4 h-4 text-orange-500 animate-pulse' />
            <span className='text-orange-500 font-mono text-sm'>
              Synthesizing {event.data.sourceCount} sources...
            </span>
          </div>
        )

      case 'complete':
        return (
          <div
            key={index}
            className='flex items-center gap-3 p-3 bg-green-500/10 rounded border border-green-500/30 mt-2 animate-fade-in'
          >
            <CheckCircle2 className='w-4 h-4 text-green-500' />
            <span className='text-green-500 font-mono text-sm'>
              Research complete in {(event.data.duration / 1000).toFixed(1)}s
            </span>
          </div>
        )

      case 'error':
        return (
          <div
            key={index}
            className='flex items-center gap-3 p-3 bg-red-500/10 rounded border border-red-500/30 mt-2 animate-fade-in'
          >
            <AlertCircle className='w-4 h-4 text-red-500' />
            <span className='text-red-500 font-mono text-sm'>
              {event.data.message}
            </span>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className='h-full min-h-0 flex flex-col bg-zinc-950'>
      <div className='p-4 border-b border-zinc-800'>
        <h3 className='font-mono text-sm text-orange-500 flex items-center gap-2'>
          <Brain className='w-4 h-4' />
          // THINKING LOG
        </h3>
      </div>

      <div ref={scrollRef} className='flex-1 overflow-y-auto p-4 space-y-2'>
        {events.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full text-zinc-600'>
            <Brain className='w-8 h-8 mb-2 opacity-50' />
            <p className='font-mono text-sm'>Enter a query to begin research</p>
          </div>
        ) : (
          events.map((event, i) => renderEvent(event, i))
        )}

        {!isComplete && events.length > 0 && (
          <div className='flex items-center gap-2 p-2 text-zinc-500'>
            <Loader2 className='w-3 h-3 animate-spin' />
            <span className='text-xs font-mono'>Researching...</span>
          </div>
        )}
      </div>
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 200ms ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
