'use client'

import {useEffect, useMemo, useRef, useState} from 'react'
import ReactMarkdown from 'react-markdown'
import {Brain, Loader2, FileDown, Copy, CheckCircle2} from 'lucide-react'
import type {
  CitationFoundEvent,
  SourceFoundEvent,
} from '@/daedalus/agent/research/stream-types'

interface SynthesisPanelProps {
  content: string
  isStreaming: boolean
  isComplete: boolean
  sources: SourceFoundEvent['data'][]
  citations: CitationFoundEvent['data'][]
  onSelectSource?: (url: string) => void
}

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '').toLowerCase()
}

export function SynthesisPanel({
  content,
  isStreaming,
  isComplete,
  sources,
  citations,
  onSelectSource,
}: SynthesisPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const sourceIndexByUrl = useMemo(() => {
    const lookup = new Map<string, number>()

    sources.forEach((source, index) => {
      lookup.set(normalizeUrl(source.url), index + 1)
    })

    return lookup
  }, [sources])

  useEffect(() => {
    if (scrollRef.current && isStreaming) {
      const el = scrollRef.current
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [content, isStreaming])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], {type: 'text/markdown'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `research-brief-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!content && !isStreaming) {
    return null
  }

  return (
    <div className='h-full min-h-0 flex flex-col bg-zinc-950'>
      <div className='p-4 border-b border-zinc-800 flex items-center justify-between'>
        <h3 className='font-mono text-sm text-orange-500 flex items-center gap-2'>
          <Brain className='w-4 h-4' />
          // INTELLIGENCE BRIEF
          {isStreaming && <Loader2 className='w-3 h-3 animate-spin ml-2' />}
        </h3>

        {isComplete && content && (
          <div className='flex items-center gap-2'>
            <button
              onClick={handleCopy}
              className='flex items-center gap-1 px-2 py-1 text-xs font-mono text-zinc-400 hover:text-orange-500 transition-colors'
            >
              {copied ? (
                <>
                  <CheckCircle2 className='w-3 h-3' />
                  Copied
                </>
              ) : (
                <>
                  <Copy className='w-3 h-3' />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className='flex items-center gap-1 px-2 py-1 text-xs font-mono text-zinc-400 hover:text-orange-500 transition-colors'
            >
              <FileDown className='w-3 h-3' />
              Download
            </button>
          </div>
        )}
      </div>

      {citations.length > 0 && (
        <div className='px-6 py-3 border-b border-zinc-800 bg-zinc-900/30 flex flex-wrap items-center gap-2'>
          <span className='text-[10px] uppercase tracking-widest text-zinc-500'>
            Citations
          </span>
          {citations.map((citation) => {
            const sourceIndex = sourceIndexByUrl.get(normalizeUrl(citation.sourceUrl))

            return (
              <button
                key={citation.id}
                onClick={() => onSelectSource?.(citation.sourceUrl)}
                className='text-xs font-mono px-2 py-1 border border-zinc-700 text-zinc-400 hover:border-orange-500/60 hover:text-orange-400 transition-colors'
              >
                [{sourceIndex ? `S${sourceIndex}` : 'SRC'}] {citation.sourceTitle}
              </button>
            )
          })}
        </div>
      )}

      <div ref={scrollRef} className='p-6 flex-1 min-h-0 overflow-y-auto scroll-smooth'>
        <div className='prose prose-invert prose-sm max-w-none animate-fade-in'>
          <ReactMarkdown
            components={{
              h1: ({children}) => (
                <h1 className='text-2xl font-mono text-orange-500 mb-4 pb-2 border-b border-zinc-800'>
                  {children}
                </h1>
              ),
              h2: ({children}) => (
                <h2 className='text-lg font-mono text-orange-400 mt-6 mb-3'>
                  {children}
                </h2>
              ),
              h3: ({children}) => (
                <h3 className='text-base font-mono text-orange-300 mt-4 mb-2'>
                  {children}
                </h3>
              ),
              p: ({children}) => (
                <p className='text-sm text-zinc-300 mb-3 leading-relaxed'>
                  {children}
                </p>
              ),
              ul: ({children}) => (
                <ul className='list-disc list-inside space-y-1 mb-4 ml-2'>
                  {children}
                </ul>
              ),
              ol: ({children}) => (
                <ol className='list-decimal list-inside space-y-1 mb-4 ml-2'>
                  {children}
                </ol>
              ),
              li: ({children}) => (
                <li className='text-sm text-zinc-300'>{children}</li>
              ),
              strong: ({children}) => (
                <strong className='text-zinc-100 font-semibold'>{children}</strong>
              ),
              em: ({children}) => (
                <em className='text-zinc-400 italic'>{children}</em>
              ),
              a: ({href, children}) => {
                const normalizedHref = href ? normalizeUrl(href) : null
                const sourceIndex = normalizedHref
                  ? sourceIndexByUrl.get(normalizedHref)
                  : undefined

                return (
                  <span className='inline-flex items-center gap-1'>
                    <a
                      href={href}
                      className='text-orange-500 hover:underline'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {children}
                    </a>
                    {href && sourceIndex && (
                      <button
                        type='button'
                        onClick={(event) => {
                          event.preventDefault()
                          onSelectSource?.(href)
                        }}
                        className='text-[10px] font-mono px-1.5 py-0.5 border border-zinc-700 text-zinc-400 hover:border-orange-500/60 hover:text-orange-400 transition-colors'
                      >
                        [S{sourceIndex}]
                      </button>
                    )}
                  </span>
                )
              },
              code: ({children}) => (
                <code className='bg-zinc-800 px-1.5 py-0.5 rounded text-orange-400 text-xs font-mono'>
                  {children}
                </code>
              ),
              blockquote: ({children}) => (
                <blockquote className='border-l-2 border-orange-500 pl-4 italic text-zinc-400 my-4'>
                  {children}
                </blockquote>
              ),
            }}
          >
            {content}
          </ReactMarkdown>

          {isStreaming && (
            <span className='inline-block w-2 h-4 bg-orange-500 animate-pulse ml-1' />
          )}
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 240ms ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
