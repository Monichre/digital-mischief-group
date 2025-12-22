"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Building2,
  DollarSign,
  Cpu,
  Target,
  CheckCircle2,
  XCircle,
  Loader2,
  Circle,
} from "lucide-react"

export type AgentPhase = "discovery" | "company_profile" | "funding" | "tech_stack" | "custom_fields"
export type AgentStatus = "pending" | "running" | "completed" | "failed" | "skipped"

export interface PhaseProgress {
  phase: AgentPhase
  status: AgentStatus
  message?: string
  duration_ms?: number
}

interface AgentPhaseTrackerProps {
  phases: PhaseProgress[]
  isComplete?: boolean
}

const PHASE_CONFIG: Record<AgentPhase, { icon: typeof Search; label: string; description: string }> = {
  discovery: {
    icon: Search,
    label: "Discovery",
    description: "Identifying company & verifying domain",
  },
  company_profile: {
    icon: Building2,
    label: "Company Profile",
    description: "Extracting firmographics & industry data",
  },
  funding: {
    icon: DollarSign,
    label: "Funding Intel",
    description: "Researching investment history",
  },
  tech_stack: {
    icon: Cpu,
    label: "Tech Stack",
    description: "Detecting technologies & infrastructure",
  },
  custom_fields: {
    icon: Target,
    label: "ICP Analysis",
    description: "Calculating fit score & signals",
  },
}

const PHASE_ORDER: AgentPhase[] = ["discovery", "company_profile", "funding", "tech_stack", "custom_fields"]

export function AgentPhaseTracker({ phases, isComplete }: AgentPhaseTrackerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (isComplete) return
    const interval = setInterval(() => setElapsedTime((t) => t + 100), 100)
    return () => clearInterval(interval)
  }, [isComplete])

  const getPhaseStatus = (phase: AgentPhase): PhaseProgress => {
    return phases.find((p) => p.phase === phase) || { phase, status: "pending" }
  }

  const StatusIcon = ({ status }: { status: AgentStatus }) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "running":
        return <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
      case "skipped":
        return <Circle className="w-5 h-5 text-zinc-600" />
      default:
        return <Circle className="w-5 h-5 text-zinc-700" />
    }
  }

  const completedCount = phases.filter((p) => p.status === "completed").length
  const totalPhases = PHASE_ORDER.length
  const progressPercent = (completedCount / totalPhases) * 100

  return (
    <div className="border border-zinc-800 bg-zinc-900/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-orange-500/30 flex items-center justify-center">
              <span className="text-sm font-bold text-orange-500">{completedCount}/{totalPhases}</span>
            </div>
            {!isComplete && (
              <div className="absolute inset-0 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Multi-Agent Pipeline</h3>
            <p className="text-xs text-zinc-500">
              {isComplete ? "Enrichment complete" : "Processing..."}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">Elapsed</p>
          <p className="text-sm font-mono text-zinc-300">
            {(elapsedTime / 1000).toFixed(1)}s
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-zinc-800 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Phase Grid */}
      <div className="grid gap-3">
        {PHASE_ORDER.map((phase, idx) => {
          const config = PHASE_CONFIG[phase]
          const progress = getPhaseStatus(phase)
          const Icon = config.icon
          const isActive = progress.status === "running"
          const isParallel = phase === "funding" || phase === "tech_stack"

          return (
            <motion.div
              key={phase}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`
                relative flex items-center gap-4 p-3 rounded border transition-all
                ${isActive ? "border-orange-500/50 bg-orange-500/5" : "border-zinc-800 bg-zinc-900/30"}
                ${progress.status === "completed" ? "border-green-500/30" : ""}
                ${progress.status === "failed" ? "border-red-500/30" : ""}
              `}
            >
              {/* Parallel indicator */}
              {isParallel && (
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-2 h-8 border-l-2 border-orange-500/30 rounded-l" />
              )}

              {/* Icon */}
              <div className={`
                w-10 h-10 rounded flex items-center justify-center flex-shrink-0
                ${isActive ? "bg-orange-500/20" : "bg-zinc-800"}
              `}>
                <Icon className={`w-5 h-5 ${isActive ? "text-orange-500" : "text-zinc-500"}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${isActive ? "text-orange-500" : "text-zinc-200"}`}>
                    {config.label}
                  </span>
                  {isParallel && phase === "funding" && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded">PARALLEL</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 truncate">
                  {progress.message || config.description}
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                {progress.duration_ms && (
                  <span className="text-xs text-zinc-600 font-mono">
                    {(progress.duration_ms / 1000).toFixed(1)}s
                  </span>
                )}
                <StatusIcon status={progress.status} />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
