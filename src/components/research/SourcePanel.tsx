'use client'

import {useEffect, useRef, useState} from 'react'
import {
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  Globe,
  Loader2,
} from 'lucide-react'
import type {SourceFoundEvent} from '@/daedalus/agent/research/stream-types'

interface SourcePanelProps {
  sources: SourceFoundEvent['data'][]
  isLoading: boolean
  highlightedUrl?: string | null
}

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '').toLowerCase()
}

function SourceCard({
  source,
  cardId,
  isHighlighted,
}: {
  source: SourceFoundEvent['data'] & {isLoading?: boolean; fullContent?: string}
  cardId: string
  isHighlighted: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getSourceColor = (sourceName: string) => {
    switch (sourceName) {
      case 'perplexity':
        return 'border-blue-500/30 bg-blue-500/5'
      case 'exa':
        return 'border-purple-500/30 bg-purple-500/5'
      case 'serper':
        return 'border-green-500/30 bg-green-500/5'
      default:
        return 'border-zinc-700 bg-zinc-900/50'
    }
  }

  const getSourceBadgeColor = (sourceName: string) => {
    switch (sourceName) {
      case 'perplexity':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'exa':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'serper':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-zinc-700 text-zinc-300 border-zinc-600'
    }
  }

  return (
    <div
      id={cardId}
      className={`rounded-lg border ${getSourceColor(
        source.source
      )} overflow-hidden transition-all ${isHighlighted ? 'ring-2 ring-orange-500/80 ring-offset-1 ring-offset-zinc-900' : ''}`}
    >
      <div className='p-4'>
        <div className='flex items-start gap-3'>
          {source.favicon ? (
            <img
              src={source.favicon}
              alt=''
              className='w-5 h-5 rounded mt-0.5'
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <Globe className='w-5 h-5 text-zinc-500 mt-0.5' />
          )}

          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-1'>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getSourceBadgeColor(
                  source.source
                )}`}
              >
                {source.source}
              </span>
              {source.isLoading && (
                <span className='text-[10px] text-orange-500 flex items-center gap-1'>
                  <Loader2 className='w-3 h-3 animate-spin' />
                  Analyzing...
                </span>
              )}
            </div>

            <h4 className='font-medium text-zinc-200 text-sm mb-1 line-clamp-2'>
              {source.title}
            </h4>

            <a
              href={source.url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-xs text-zinc-500 hover:text-orange-500 flex items-center gap-1 truncate'
            >
              {source.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40)}...
              <ExternalLink className='w-3 h-3 flex-shrink-0' />
            </a>
          </div>
        </div>

        {source.snippet && (
          <p className='text-xs text-zinc-400 mt-3 line-clamp-3'>
            {source.snippet}
          </p>
        )}

        {source.fullContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='flex items-center gap-1 mt-3 text-xs text-orange-500 hover:text-orange-400'
          >
            {isExpanded ? (
              <>
                <ChevronUp className='w-3 h-3' />
                Hide full content
              </>
            ) : (
              <>
                <ChevronDown className='w-3 h-3' />
                Show full content
              </>
            )}
          </button>
        )}
      </div>

      {isExpanded && source.fullContent && (
        <div className='border-t border-zinc-800 p-4 bg-zinc-950/50'>
          <p className='text-xs text-zinc-400 whitespace-pre-wrap max-h-64 overflow-y-auto'>
            {source.fullContent}
          </p>
        </div>
      )}
    </div>
  )
}

export function SourcePanel({sources, isLoading, highlightedUrl}: SourcePanelProps) {
  const groupedSources = sources.reduce((acc, source) => {
    if (!acc[source.source]) acc[source.source] = []
    acc[source.source].push(source)
    return acc
  }, {} as Record<string, SourceFoundEvent['data'][]>)

  const scrollRef = useRef<HTMLDivElement>(null)
  const highlightedNormalizedUrl = highlightedUrl ? normalizeUrl(highlightedUrl) : null

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current
      el.scrollTo({top: el.scrollHeight, behavior: 'smooth'})
    }
  }, [sources])

  useEffect(() => {
    if (!highlightedUrl) return

    const normalizedHighlighted = normalizeUrl(highlightedUrl)
    const sourceIndex = sources.findIndex(
      (source) => normalizeUrl(source.url) === normalizedHighlighted
    )

    if (sourceIndex < 0) return

    const nextCardId = `source-card-${sourceIndex}`

    const node = document.getElementById(nextCardId)
    if (node) {
      node.scrollIntoView({behavior: 'smooth', block: 'center'})
    }
  }, [highlightedUrl, sources])

  return (
    <div className='h-full min-h-0 flex flex-col bg-zinc-900/30'>
      <div className='p-4 border-b border-zinc-800 flex items-center justify-between'>
        <h3 className='font-mono text-sm text-orange-500 flex items-center gap-2'>
          <FileText className='w-4 h-4' />
          // SOURCES
        </h3>
        {sources.length > 0 && (
          <span className='text-xs text-zinc-500 font-mono'>
            {sources.length} found
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        className='flex-1 min-h-0 overflow-y-auto p-4 space-y-6 scroll-smooth'
      >
        {sources.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full text-zinc-600'>
            {isLoading ? (
              <>
                <Loader2 className='w-8 h-8 mb-2 animate-spin text-orange-500' />
                <p className='font-mono text-sm'>Discovering sources...</p>
              </>
            ) : (
              <>
                <Globe className='w-8 h-8 mb-2 opacity-50' />
                <p className='font-mono text-sm'>Sources will appear here</p>
              </>
            )}
          </div>
        ) : (
          <>
            {Object.entries(groupedSources).map(([sourceName, sourceList]) => (
              <div key={sourceName} className='space-y-3'>
                <h4 className='text-xs font-mono text-zinc-500 uppercase tracking-wider'>
                  {sourceName} ({sourceList.length})
                </h4>
                <div className='space-y-3'>
                  {sourceList.map((source, i) => {
                    const sourceIndex = sources.findIndex((candidate) => candidate === source)
                    const cardId = `source-card-${sourceIndex}`

                    return (
                    <div key={`${source.url}-${i}`} className='animate-fade-in'>
                      <SourceCard
                        source={source}
                        cardId={cardId}
                        isHighlighted={
                          highlightedNormalizedUrl !== null
                          && normalizeUrl(source.url) === highlightedNormalizedUrl
                        }
                      />
                    </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 220ms ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
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
