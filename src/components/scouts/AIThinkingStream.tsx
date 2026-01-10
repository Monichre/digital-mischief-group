'use client'

import {Brain, Eye, Lightbulb, Zap} from 'lucide-react'
import type {
  SentinelStreamEvent,
  ConductorThought,
} from '@/lib/scouts/stream-types'

interface AIThinkingStreamProps {
  events: SentinelStreamEvent[]
}

const thoughtIcons = {
  action: Zap,
  observation: Eye,
  reasoning: Brain,
  insight: Lightbulb,
}

const thoughtColors = {
  action: 'text-blue-600',
  observation: 'text-purple-600',
  reasoning: 'text-zinc-600',
  insight: 'text-[#fa5d19]',
}

const thoughtLabels = {
  action: 'Action',
  observation: 'Observation',
  reasoning: 'Reasoning',
  insight: 'Insight',
}

export function AIThinkingStream({events}: AIThinkingStreamProps) {
  if (events.length === 0) return null

  return (
    <div className='border border-zinc-200 bg-white rounded-lg p-4'>
      <div className='flex items-center gap-2 mb-3'>
        <Brain className='w-4 h-4 text-[#fa5d19]' />
        <h4 className='text-sm font-semibold text-zinc-900'>
          AI Analysis Stream
        </h4>
      </div>

      <div className='space-y-2 max-h-64 overflow-y-auto'>
        {events.map((event, i) => {
          if (event.type !== 'ai_thought') return null

          const thought = event.data as ConductorThought
          const Icon = thoughtIcons[thought.type]
          const color = thoughtColors[thought.type]
          const label = thoughtLabels[thought.type]

          return (
            <div key={i} className='flex items-start gap-2 text-sm'>
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`} />
              <div className='flex-1 min-w-0'>
                <span className={`font-medium ${color}`}>{label}</span>
                {thought.relatedPhase && (
                  <span className='text-xs text-zinc-500 ml-2'>
                    ({thought.relatedPhase})
                  </span>
                )}
                <p className='text-zinc-700 mt-0.5'>{thought.content}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
