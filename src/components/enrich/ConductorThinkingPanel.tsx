"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  Eye,
  Lightbulb,
  ArrowRight,
  Sparkles,
  SkipForward,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react"

export interface ConductorThought {
  type: "observation" | "reasoning" | "decision" | "action" | "insight"
  content: string
  timestamp: number
  relatedPhase?: string
}

export interface ConductorDecision {
  phase: string
  action: "run" | "skip" | "modify"
  reason: string
}

export interface PhaseStatus {
  phase: string
  status: "pending" | "running" | "completed" | "failed" | "skipped"
  message?: string
}

interface ConductorThinkingPanelProps {
  thoughts: ConductorThought[]
  decisions: ConductorDecision[]
  phases: PhaseStatus[]
  isComplete: boolean
  synthesis?: string
}

const thoughtIcons = {
  observation: Eye,
  reasoning: Brain,
  decision: ArrowRight,
  action: Play,
  insight: Lightbulb,
}

const thoughtColors = {
  observation: "text-blue-400",
  reasoning: "text-purple-400",
  decision: "text-orange-400",
  action: "text-green-400",
  insight: "text-yellow-400",
}

const thoughtBgColors = {
  observation: "bg-blue-500/10 border-blue-500/20",
  reasoning: "bg-purple-500/10 border-purple-500/20",
  decision: "bg-orange-500/10 border-orange-500/20",
  action: "bg-green-500/10 border-green-500/20",
  insight: "bg-yellow-500/10 border-yellow-500/20",
}

export function ConductorThinkingPanel({
  thoughts,
  decisions,
  phases,
  isComplete,
  synthesis,
}: ConductorThinkingPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom as new thoughts come in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [thoughts.length])

  return (
    <div className="h-full flex flex-col bg-zinc-950 border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Conductor</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {isComplete ? "Analysis Complete" : "Analyzing..."}
              </p>
            </div>
          </div>
          {!isComplete && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs text-zinc-500">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Phase Status Bar */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-zinc-800 bg-zinc-900/30">
        <div className="flex items-center gap-2 overflow-x-auto">
          {phases.map((phase) => (
            <PhaseChip key={phase.phase} {...phase} />
          ))}
        </div>
      </div>

      {/* Thinking Stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scroll-smooth"
      >
        <AnimatePresence mode="popLayout">
          {thoughts.map((thought, index) => (
            <ThoughtBubble key={index} thought={thought} index={index} />
          ))}
        </AnimatePresence>

        {/* Typing indicator when not complete */}
        {!isComplete && thoughts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-zinc-500 text-sm py-2"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Thinking...</span>
          </motion.div>
        )}
      </div>

      {/* Synthesis Panel */}
      {synthesis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 border-t border-zinc-800 bg-gradient-to-r from-orange-500/5 to-purple-500/5 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                Executive Brief
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">{synthesis}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Decision Summary */}
      {decisions.length > 0 && isComplete && (
        <div className="flex-shrink-0 border-t border-zinc-800 px-4 py-3 bg-zinc-900/30">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
            Decisions Made
          </p>
          <div className="flex flex-wrap gap-2">
            {decisions.map((decision, i) => (
              <DecisionChip key={i} decision={decision} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ThoughtBubble({ thought, index }: { thought: ConductorThought; index: number }) {
  const Icon = thoughtIcons[thought.type]
  const colorClass = thoughtColors[thought.type]
  const bgClass = thoughtBgColors[thought.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className={`flex items-start gap-2 p-2.5 rounded border ${bgClass}`}
    >
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colorClass}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300 leading-relaxed">{thought.content}</p>
        {thought.relatedPhase && (
          <span className="text-[10px] text-zinc-600 mt-1 inline-block">
            → {thought.relatedPhase}
          </span>
        )}
      </div>
    </motion.div>
  )
}

function PhaseChip({ phase, status, message }: PhaseStatus) {
  const statusConfig: Record<PhaseStatus['status'], { icon: typeof Pause; color: string; bg: string; animate?: boolean }> = {
    pending: { icon: Pause, color: "text-zinc-500", bg: "bg-zinc-800" },
    running: { icon: Loader2, color: "text-orange-400", bg: "bg-orange-500/20", animate: true },
    completed: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/20" },
    failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/20" },
    skipped: { icon: SkipForward, color: "text-zinc-500", bg: "bg-zinc-800" },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  const phaseLabels: Record<string, string> = {
    discovery: "Discover",
    company_profile: "Profile",
    funding: "Funding",
    tech_stack: "Tech",
    custom_fields: "Intel",
    branding: "Brand",
  }

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${config.bg} ${config.color} flex-shrink-0`}
      title={message}
    >
      <Icon className={`w-3 h-3 ${config.animate ? "animate-spin" : ""}`} />
      <span>{phaseLabels[phase] || phase}</span>
    </div>
  )
}

function DecisionChip({ decision }: { decision: ConductorDecision }) {
  const actionConfig = {
    run: { icon: Play, color: "text-green-400", label: "Run" },
    skip: { icon: SkipForward, color: "text-zinc-500", label: "Skip" },
    modify: { icon: Sparkles, color: "text-orange-400", label: "Modify" },
  }

  const config = actionConfig[decision.action]
  const Icon = config.icon

  const phaseLabels: Record<string, string> = {
    discovery: "Discovery",
    company_profile: "Profile",
    funding: "Funding",
    tech_stack: "Tech Stack",
    custom_fields: "Custom Fields",
  }

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800/50 text-xs"
      title={decision.reason}
    >
      <Icon className={`w-3 h-3 ${config.color}`} />
      <span className="text-zinc-400">{phaseLabels[decision.phase] || decision.phase}</span>
      <span className={config.color}>{config.label}</span>
    </div>
  )
}
