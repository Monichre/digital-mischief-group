'use client'

import { useEffect, useRef } from 'react'
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
  Sparkles
} from 'lucide-react'
import type { EnrichStreamEvent } from '@/lib/enrich/stream-types'
import type { PhaseState } from '@/hooks/useEnrichStream'

interface EnrichThinkingPanelProps {
  phases: Record<string, PhaseState>
  events: EnrichStreamEvent[]
  isComplete: boolean
}

const PHASE_CONFIG = {
  discovery: { icon: Search, label: 'Discovery Agent', color: 'text-blue-400' },
  company_profile: { icon: Building2, label: 'Company Profile Agent', color: 'text-purple-400' },
  funding: { icon: DollarSign, label: 'Funding Agent', color: 'text-green-400' },
  tech_stack: { icon: Code, label: 'Tech Stack Agent', color: 'text-cyan-400' },
  custom_fields: { icon: Users, label: 'Custom Fields Agent', color: 'text-yellow-400' },
  branding: { icon: Palette, label: 'Brand Extraction', color: 'text-pink-400' },
}

export function EnrichThinkingPanel({ phases, events, isComplete }: EnrichThinkingPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [events])

  const getStatusIcon = (status: PhaseState['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <div className="w-4 h-4 rounded-full border border-zinc-600" />
    }
  }

  const renderEvent = (event: EnrichStreamEvent, index: number) => {
    switch (event.type) {
      case 'phase_start': {
        const config = PHASE_CONFIG[event.data.phase as keyof typeof PHASE_CONFIG]
        const Icon = config?.icon || Brain
        return (
          <div key={index} className="flex items-center gap-3 p-2 text-sm border-l-2 border-orange-500/50">
            <Loader2 className="w-3 h-3 text-orange-500 animate-spin" />
            <Icon className={`w-4 h-4 ${config?.color || 'text-zinc-400'}`} />
            <span className="text-zinc-300">
              <span className={`font-mono ${config?.color || 'text-zinc-400'}`}>
                {config?.label || event.data.phase}
              </span>
              {' '}starting...
            </span>
          </div>
        )
      }

      case 'phase_progress': {
        const config = PHASE_CONFIG[event.data.phase as keyof typeof PHASE_CONFIG]
        return (
          <div key={index} className="flex items-center gap-3 p-2 text-sm pl-6">
            <div className={`w-1.5 h-1.5 rounded-full ${config?.color?.replace('text-', 'bg-') || 'bg-zinc-500'}`} />
            <span className="text-zinc-400">{event.data.message}</span>
          </div>
        )
      }

      case 'phase_complete': {
        const config = PHASE_CONFIG[event.data.phase as keyof typeof PHASE_CONFIG]
        const Icon = config?.icon || Brain
        return (
          <div key={index} className="flex items-center gap-3 p-2 text-sm border-l-2 border-green-500/50">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <Icon className={`w-4 h-4 ${config?.color || 'text-zinc-400'}`} />
            <span className="text-zinc-300">
              <span className={`font-mono ${config?.color || 'text-zinc-400'}`}>
                {config?.label || event.data.phase}
              </span>
              {' '}complete
            </span>
            {event.data.message && (
              <span className="text-zinc-500 text-xs ml-2">— {event.data.message}</span>
            )}
          </div>
        )
      }

      case 'phase_error': {
        const config = PHASE_CONFIG[event.data.phase as keyof typeof PHASE_CONFIG]
        return (
          <div key={index} className="flex items-center gap-3 p-2 text-sm border-l-2 border-red-500/50">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span className="text-red-400">
              <span className="font-mono">{config?.label || event.data.phase}</span>
              {' '}failed: {event.data.error}
            </span>
            {event.data.recoverable && (
              <span className="text-zinc-500 text-xs">(non-critical)</span>
            )}
          </div>
        )
      }

      case 'complete':
        return (
          <div key={index} className="flex items-center gap-3 p-3 mt-2 bg-green-500/10 border border-green-500/30 rounded">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className="text-green-400 font-medium">
              Enrichment complete in {((event.data.duration_ms || 0) / 1000).toFixed(1)}s
            </span>
          </div>
        )

      case 'error':
        return (
          <div key={index} className="flex items-center gap-3 p-3 mt-2 bg-red-500/10 border border-red-500/30 rounded">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-400">{event.data.message}</span>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col border border-zinc-800 bg-zinc-900/30 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <Brain className="w-5 h-5 text-orange-500" />
        <span className="font-mono text-sm font-bold">Agent Pipeline</span>
        {!isComplete && (
          <Loader2 className="w-4 h-4 text-orange-500 animate-spin ml-auto" />
        )}
      </div>

      {/* Phase Status */}
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/20">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(phases).map(([phase, state]) => {
            const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG]
            const Icon = config?.icon || Brain
            return (
              <div 
                key={phase} 
                className={`flex items-center gap-2 p-2 rounded text-xs ${
                  state.status === 'running' ? 'bg-orange-500/10 border border-orange-500/30' :
                  state.status === 'completed' ? 'bg-green-500/10 border border-green-500/30' :
                  state.status === 'failed' ? 'bg-red-500/10 border border-red-500/30' :
                  'bg-zinc-800/50 border border-zinc-700'
                }`}
              >
                {getStatusIcon(state.status)}
                <Icon className={`w-3 h-3 ${config?.color || 'text-zinc-400'}`} />
                <span className="truncate text-zinc-300">{config?.label?.replace(' Agent', '') || phase}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Event Log */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Starting enrichment pipeline...
          </div>
        ) : (
          events.map((event, index) => renderEvent(event, index))
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300"
              style={{ 
                width: `${Object.values(phases).reduce((sum, p) => sum + p.progress, 0) / Object.keys(phases).length}%` 
              }}
            />
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {Math.round(Object.values(phases).reduce((sum, p) => sum + p.progress, 0) / Object.keys(phases).length)}%
          </span>
        </div>
      </div>
    </div>
  )
}
