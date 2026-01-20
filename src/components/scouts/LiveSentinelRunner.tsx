'use client'

import {useState, useEffect, useRef, useCallback} from 'react'
import {
  Play,
  Loader2,
  AlertCircle,
  Brain,
  TrendingUp,
  Target,
} from 'lucide-react'
import {Button} from '@/components/ui/button'
import type {
  SentinelStreamEvent,
  AIInsight,
  CompetitiveIntel,
  TrendSignal,
} from '@/daedalus/scout/stream-types'
import {SearchProgressIndicator} from './SearchProgressIndicator'
import {AIThinkingStream} from './AIThinkingStream'
import {StreamingInsightCard} from './StreamingInsightCard'

interface LiveSentinelRunnerProps {
  scoutId: string
  scoutName: string
  onComplete?: () => void
  autoRun?: boolean
}

export function LiveSentinelRunner({
  scoutId,
  scoutName,
  onComplete,
  autoRun = false,
}: LiveSentinelRunnerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [status, setStatus] = useState<string>('idle')
  const [events, setEvents] = useState<SentinelStreamEvent[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [competitiveIntel, setCompetitiveIntel] = useState<CompetitiveIntel[]>(
    []
  )
  const [trends, setTrends] = useState<TrendSignal[]>([])
  const [hasRun, setHasRun] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchProgress, setSearchProgress] = useState({
    serper: {status: 'idle' as const, found: 0},
    exa: {status: 'idle' as const, found: 0},
    firecrawl: {status: 'idle' as const, found: 0},
  })

  const eventSourceRef = useRef<EventSource | null>(null)
  const eventsEndRef = useRef<HTMLDivElement>(null)
  const hasAutoRunRef = useRef(false)

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({behavior: 'smooth'})
  }, [events])

  const runSentinel = useCallback(() => {
    setIsRunning(true)
    setHasRun(true)
    setError(null)
    setEvents([])
    setInsights([])
    setCompetitiveIntel([])
    setTrends([])
    setStatus('Starting sentinel...')
    setSearchProgress({
      serper: {status: 'idle', found: 0},
      exa: {status: 'idle', found: 0},
      firecrawl: {status: 'idle', found: 0},
    })

    const eventSource = new EventSource(`/api/scouts/${scoutId}/run/stream`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (e) => {
      const event: SentinelStreamEvent = JSON.parse(e.data)
      setEvents((prev) => [...prev, event])

      // Update status based on event type
      switch (event.type) {
        case 'search_start':
          setStatus(`Searching ${event.data.engine}...`)
          setSearchProgress((prev) => ({
            ...prev,
            [event.data.engine]: {status: 'searching', found: 0},
          }))
          break

        case 'search_complete':
          setSearchProgress((prev) => ({
            ...prev,
            [event.data.engine]: {status: 'completed', found: event.data.total},
          }))
          break

        case 'deduplication':
          setStatus(`Found ${event.data.after} new results`)
          break

        case 'ai_analysis_start':
          setStatus('AI analyzing results...')
          break

        case 'insight_generated':
          setInsights((prev) => [...prev, event.data])
          break

        case 'competitive_intel':
          setCompetitiveIntel((prev) => [...prev, event.data])
          break

        case 'trend_detected':
          setTrends((prev) => [...prev, event.data])
          break

        case 'complete':
          setStatus('Complete!')
          setIsRunning(false)
          eventSource.close()
          if (onComplete) onComplete()
          break

        case 'error':
          setError(event.data.message)
          setStatus('Error occurred')
          setIsRunning(false)
          eventSource.close()
          break
      }
    }

    eventSource.onerror = () => {
      setError('Connection lost')
      setStatus('Error')
      setIsRunning(false)
      eventSource.close()
    }
  }, [onComplete, scoutId])

  useEffect(() => {
    if (autoRun && !hasAutoRunRef.current && !isRunning) {
      hasAutoRunRef.current = true
      const timer = setTimeout(() => {
        runSentinel()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [autoRun, isRunning, runSentinel])

  const stopSentinel = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsRunning(false)
    setStatus('Stopped')
  }

  const hasResults =
    insights.length > 0 || competitiveIntel.length > 0 || trends.length > 0

  return (
    <div className='space-y-6'>
      {/* Control Panel - Open Scouts Style */}
      <div className='border border-zinc-800 bg-zinc-900/60 p-6 rounded-lg'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='font-semibold text-white'>{scoutName}</h3>
            <p className='text-sm text-zinc-400 mt-1'>{status}</p>
          </div>

          <Button
            onClick={isRunning ? stopSentinel : runSentinel}
            disabled={isRunning}
            className={
              isRunning
                ? 'bg-zinc-700 text-white'
                : 'bg-[#fa5d19] hover:bg-[#e54d0f] text-white'
            }
          >
            {isRunning ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Running...
              </>
            ) : (
              <>
                <Play className='w-4 h-4 mr-2' />
                {hasRun ? 'Restart Sentinel' : 'Run Sentinel'}
              </>
            )}
          </Button>
        </div>

        {/* Search Progress */}
        {(isRunning || hasRun) && (
          <div className='mt-3'>
            <SearchProgressIndicator searchProgress={searchProgress} />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3'>
            <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
            <div>
              <p className='text-sm font-medium text-red-900'>Error</p>
              <p className='text-sm text-red-700 mt-1'>{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Thinking Stream */}
      {events.some((e) => e.type === 'ai_thought') && (
        <AIThinkingStream
          events={events.filter((e) => e.type === 'ai_thought')}
        />
      )}

      {/* Results Summary */}
      {hasResults && (
        <div className='grid grid-cols-3 gap-4'>
          <div className='border border-zinc-200 bg-white p-4 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <Brain className='w-4 h-4 text-[#fa5d19]' />
              <span className='text-sm font-medium text-zinc-700'>
                Insights
              </span>
            </div>
            <p className='text-2xl font-bold text-zinc-900'>
              {insights.length}
            </p>
          </div>

          <div className='border border-zinc-200 bg-white p-4 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <Target className='w-4 h-4 text-[#fa5d19]' />
              <span className='text-sm font-medium text-zinc-700'>
                Competitive Intel
              </span>
            </div>
            <p className='text-2xl font-bold text-zinc-900'>
              {competitiveIntel.length}
            </p>
          </div>

          <div className='border border-zinc-200 bg-white p-4 rounded-lg'>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingUp className='w-4 h-4 text-[#fa5d19]' />
              <span className='text-sm font-medium text-zinc-700'>Trends</span>
            </div>
            <p className='text-2xl font-bold text-zinc-900'>{trends.length}</p>
          </div>
        </div>
      )}

      {/* Insights Display */}
      {insights.length > 0 && (
        <div className='space-y-3'>
          <h4 className='text-sm font-semibold text-zinc-900'>
            AI-Generated Insights
          </h4>
          {insights.map((insight, i) => (
            <StreamingInsightCard key={i} insight={insight} />
          ))}
        </div>
      )}

      {/* Competitive Intel Display */}
      {competitiveIntel.length > 0 && (
        <div className='space-y-3'>
          <h4 className='text-sm font-semibold text-zinc-900'>
            Competitive Intelligence
          </h4>
          {competitiveIntel.map((intel, i) => (
            <div
              key={i}
              className='border border-zinc-200 bg-white p-4 rounded-lg'
            >
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <p className='font-medium text-zinc-900'>
                    {intel.competitor_name || 'Unknown Competitor'}
                  </p>
                  <p className='text-sm text-zinc-600 mt-1'>{intel.summary}</p>
                  <a
                    href={intel.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-xs text-[#fa5d19] hover:underline mt-2 inline-block'
                  >
                    View source →
                  </a>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    intel.impact === 'high'
                      ? 'bg-red-100 text-red-700'
                      : intel.impact === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {intel.impact} impact
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trends Display */}
      {trends.length > 0 && (
        <div className='space-y-3'>
          <h4 className='text-sm font-semibold text-zinc-900'>Market Trends</h4>
          {trends.map((trend, i) => (
            <div
              key={i}
              className='border border-zinc-200 bg-white p-4 rounded-lg'
            >
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <div className='flex items-center gap-2'>
                    <p className='font-medium text-zinc-900'>
                      {trend.trend_name}
                    </p>
                    {trend.emerging && (
                      <span className='px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded'>
                        Emerging
                      </span>
                    )}
                  </div>
                  <div className='flex items-center gap-2 mt-2'>
                    <div className='flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-[#fa5d19]'
                        style={{width: `${trend.strength}%`}}
                      />
                    </div>
                    <span className='text-xs text-zinc-600'>
                      {trend.strength}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div ref={eventsEndRef} />
    </div>
  )
}
