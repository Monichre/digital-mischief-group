'use client'

import {useEffect, useRef, useState} from 'react'
import {
  Brain,
  Search,
  Building2,
  DollarSign,
  Code,
  Users,
  Palette,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  Lightbulb,
  ArrowRight,
  Play,
  SkipForward,
} from 'lucide-react'
import type {EnrichStreamEvent} from '@/daedalus/enrich/stream-types'
import type {
  PhaseState,
  ConductorThought,
  ConductorDecision,
} from '@/hooks/useEnrichStream'

interface EnrichThinkingPanelProps {
  phases: Record<string, PhaseState>
  events: EnrichStreamEvent[]
  thoughts?: ConductorThought[]
  decisions?: ConductorDecision[]
  isComplete: boolean
  synthesis?: string
}

const PHASE_CONFIG = {
  discovery: {icon: Search, label: 'Discovery Agent', color: 'text-blue-400'},
  company_profile: {
    icon: Building2,
    label: 'Company Profile Agent',
    color: 'text-purple-400',
  },
  funding: {icon: DollarSign, label: 'Funding Agent', color: 'text-green-400'},
  tech_stack: {icon: Code, label: 'Tech Stack Agent', color: 'text-cyan-400'},
  custom_fields: {
    icon: Users,
    label: 'Custom Fields Agent',
    color: 'text-yellow-400',
  },
  branding: {icon: Palette, label: 'Brand Extraction', color: 'text-pink-400'},
}

const thoughtIcons = {
  observation: Eye,
  reasoning: Brain,
  decision: ArrowRight,
  action: Play,
  insight: Lightbulb,
}

const thoughtColors = {
  observation: 'text-blue-400',
  reasoning: 'text-purple-400',
  decision: 'text-orange-400',
  action: 'text-green-400',
  insight: 'text-yellow-400',
}

export function EnrichThinkingPanel({
  phases,
  events,
  thoughts = [],
  decisions = [],
  isComplete,
  synthesis,
}: EnrichThinkingPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<'conductor' | 'pipeline'>(
    'conductor'
  )

  // Default to conductor view if we have thoughts
  useEffect(() => {
    if (thoughts.length > 0 && viewMode !== 'conductor') {
      setViewMode('conductor')
    }
  }, [thoughts.length])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events, thoughts])

  const getStatusIcon = (status: PhaseState['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className='w-4 h-4 animate-spin' />
      case 'completed':
        return <CheckCircle2 className='w-4 h-4 text-green-500' />
      case 'failed':
        return <AlertCircle className='w-4 h-4 text-red-500' />
      case 'skipped':
        return <SkipForward className='w-4 h-4 text-zinc-500' />
      default:
        return <div className='w-4 h-4 rounded-full border border-zinc-600' />
    }
  }

  const renderThought = (thought: ConductorThought, index: number) => {
    const Icon = thoughtIcons[thought.type]
    const colorClass = thoughtColors[thought.type]

    return (
      <div
        key={index}
        className='flex items-start gap-2 p-2.5 rounded bg-zinc-800/50 border border-zinc-700/50'
      >
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colorClass}`} />
        <div className='flex-1 min-w-0'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            {thought.content}
          </p>
          {thought.relatedPhase && (
            <span className='text-[10px] text-zinc-600 mt-1 inline-block'>
              →{' '}
              {PHASE_CONFIG[thought.relatedPhase as keyof typeof PHASE_CONFIG]
                ?.label || thought.relatedPhase}
            </span>
          )}
        </div>
      </div>
    )
  }

  const renderEvent = (event: EnrichStreamEvent, index: number) => {
    switch (event.type) {
      case 'phase_start': {
        const config =
          PHASE_CONFIG[event.data.phase as keyof typeof PHASE_CONFIG]
        const Icon = config?.icon || Brain
        return (
          <div
            key={index}
            className='flex items-center gap-3 p-2 text-sm border-l-2 border-orange-500/50'
          >
            <Loader2 className='w-3 h-3 text-orange-500 animate-spin' />
            <Icon className={`w-4 h-4 ${config?.color || 'text-zinc-400'}`} />
            <span className='text-zinc-300'>
              <span className={`font-mono ${config?.color || 'text-zinc-400'}`}>
                {config?.label || event.data.phase}
              </span>{' '}
              starting...
            </span>
          </div>
        )
      }

      case 'phase_progress': {
        const config =
          PHASE_CONFIG[event.data.phase as keyof typeof PHASE_CONFIG]
        return (
          <div key={index} className='flex items-center gap-3 p-2 text-sm pl-6'>
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                config?.color?.replace('text-', 'bg-') || 'bg-zinc-500'
              }`}
            />
            <span className='text-zinc-400'>{event.data.message}</span>
          </div>
        )
      }

      case 'phase_complete': {
        const config =
          PHASE_CONFIG[event.data.phase as keyof typeof PHASE_CONFIG]
        const Icon = config?.icon || Brain
        return (
          <div
            key={index}
            className='flex items-center gap-3 p-2 text-sm border-l-2 border-green-500/50'
          >
            <CheckCircle2 className='w-3 h-3 text-green-500' />
            <Icon className={`w-4 h-4 ${config?.color || 'text-zinc-400'}`} />
            <span className='text-zinc-300'>
              <span className={`font-mono ${config?.color || 'text-zinc-400'}`}>
                {config?.label || event.data.phase}
              </span>{' '}
              complete
            </span>
            {event.data.message && (
              <span className='text-zinc-500 text-xs ml-2'>
                — {event.data.message}
              </span>
            )}
          </div>
        )
      }

      case 'phase_error': {
        const config =
          PHASE_CONFIG[event.data.phase as keyof typeof PHASE_CONFIG]
        return (
          <div
            key={index}
            className='flex items-center gap-3 p-2 text-sm border-l-2 border-red-500/50'
          >
            <AlertCircle className='w-3 h-3 text-red-500' />
            <span className='text-red-400'>
              <span className='font-mono'>
                {config?.label || event.data.phase}
              </span>{' '}
              failed: {event.data.error}
            </span>
            {event.data.recoverable && (
              <span className='text-zinc-500 text-xs'>(non-critical)</span>
            )}
          </div>
        )
      }

      case 'complete':
        return (
          <div
            key={index}
            className='flex items-center gap-3 p-3 mt-2 bg-green-500/10 border border-green-500/30 rounded'
          >
            <Sparkles className='w-4 h-4 text-green-500' />
            <span className='text-green-400 font-medium'>
              Enrichment complete in{' '}
              {((event.data.duration_ms || 0) / 1000).toFixed(1)}s
            </span>
          </div>
        )

      case 'error':
        return (
          <div
            key={index}
            className='flex items-center gap-3 p-3 mt-2 bg-red-500/10 border border-red-500/30 rounded'
          >
            <AlertCircle className='w-4 h-4 text-red-500' />
            <span className='text-red-400'>{event.data.message}</span>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className='h-full flex flex-col border border-zinc-800 bg-zinc-900/30 rounded-lg overflow-hidden'>
      {/* Header */}
      <div className='flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50'>
        <div className='w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center'>
          <Brain className='w-4 h-4 text-white' />
        </div>
        <div className='flex-1'>
          <span className='font-mono text-sm font-bold'>Conductor</span>
          <p className='text-[10px] text-zinc-500'>Intelligent Orchestration</p>
        </div>
        {!isComplete && (
          <div className='flex items-center gap-1.5'>
            <span className='w-2 h-2 rounded-full bg-orange-500 animate-pulse' />
            <span className='text-xs text-zinc-500'>Live</span>
          </div>
        )}
        {/* View Toggle */}
        <div className='flex items-center gap-1 p-0.5 bg-zinc-800 rounded text-xs'>
          <button
            onClick={() => setViewMode('conductor')}
            className={`px-2 py-1 rounded transition-colors ${
              viewMode === 'conductor'
                ? 'bg-orange-500/20 text-orange-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Thinking
          </button>
          <button
            onClick={() => setViewMode('pipeline')}
            className={`px-2 py-1 rounded transition-colors ${
              viewMode === 'pipeline'
                ? 'bg-orange-500/20 text-orange-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Pipeline
          </button>
        </div>
      </div>

      {/* Phase Status */}
      <div className='px-4 py-2 border-b border-zinc-800 bg-zinc-900/20'>
        <div className='flex items-center gap-2 overflow-x-auto'>
          {Object.entries(phases).map(([phase, state]) => {
            const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG]
            const Icon = config?.icon || Brain
            return (
              <div
                key={phase}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs flex-shrink-0 ${
                  state.status === 'running'
                    ? 'bg-orange-500/20 text-orange-400'
                    : state.status === 'completed'
                    ? 'bg-green-500/20 text-green-400'
                    : state.status === 'failed'
                    ? 'bg-red-500/20 text-red-400'
                    : state.status === 'skipped'
                    ? 'bg-zinc-800 text-zinc-500'
                    : 'bg-zinc-800 text-zinc-500'
                }`}
              >
                {getStatusIcon(state.status)}
                <span className='truncate'>
                  {config?.label?.replace(' Agent', '') || phase}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div ref={scrollRef} className='flex-1 overflow-y-auto p-4 space-y-2'>
        {viewMode === 'conductor' ? (
          // Conductor Thinking View
          <>
            {thoughts.length === 0 && !isComplete ? (
              <div className='flex items-center justify-center h-full text-zinc-500 text-sm'>
                <Loader2 className='w-4 h-4 animate-spin mr-2' />
                Conductor initializing...
              </div>
            ) : (
              <>
                {thoughts.map((thought, index) =>
                  renderThought(thought, index)
                )}
                {!isComplete && thoughts.length > 0 && (
                  <div className='flex items-center gap-2 text-zinc-500 text-sm py-2'>
                    <Loader2 className='w-3 h-3 animate-spin' />
                    <span>Thinking...</span>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          // Pipeline Events View
          <>
            {events.length === 0 ? (
              <div className='flex items-center justify-center h-full text-zinc-500 text-sm'>
                <Loader2 className='w-4 h-4 animate-spin mr-2' />
                Starting enrichment pipeline...
              </div>
            ) : (
              events.map((event, index) => renderEvent(event, index))
            )}
          </>
        )}
      </div>

      {/* Synthesis Panel */}
      {synthesis && isComplete && (
        <div className='border-t border-zinc-800 bg-gradient-to-r from-orange-500/5 to-purple-500/5 p-4'>
          <div className='flex items-start gap-3'>
            <div className='w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0'>
              <Sparkles className='w-4 h-4 text-orange-400' />
            </div>
            <div>
              <p className='text-[10px] uppercase tracking-wider text-zinc-500 mb-1'>
                Executive Brief
              </p>
              <p className='text-sm text-zinc-300 leading-relaxed'>
                {synthesis}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className='px-4 py-2 border-t border-zinc-800 bg-zinc-900/50'>
        <div className='flex items-center gap-3'>
          <div className='flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden'>
            <div
              className='h-full bg-gradient-to-r from-orange-500 to-purple-500 transition-all duration-300'
              style={{
                width: `${
                  Object.values(phases).reduce(
                    (sum, p) =>
                      sum + (p.status === 'skipped' ? 100 : p.progress),
                    0
                  ) / Object.keys(phases).length
                }%`,
              }}
            />
          </div>
          <span className='text-xs text-zinc-500 font-mono'>
            {Math.round(
              Object.values(phases).reduce(
                (sum, p) => sum + (p.status === 'skipped' ? 100 : p.progress),
                0
              ) / Object.keys(phases).length
            )}
            %
          </span>
        </div>
      </div>
    </div>
  )
}
