"use client"

import { motion } from "framer-motion"
import { Brain, Sparkles, Cloud, Cpu, CheckCircle2, XCircle } from "lucide-react"

interface TechSignalsProps {
  signals: {
    ai_adoption: boolean
    modern_stack: boolean
    cloud_native: boolean
  }
  technologies?: string[]
  compact?: boolean
}

const SIGNAL_CONFIG = {
  ai_adoption: {
    icon: Brain,
    label: "AI Adoption",
    description: "Using AI/ML technologies",
    activeColor: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  },
  modern_stack: {
    icon: Sparkles,
    label: "Modern Stack",
    description: "Contemporary frameworks & tools",
    activeColor: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  },
  cloud_native: {
    icon: Cloud,
    label: "Cloud Native",
    description: "Cloud-first infrastructure",
    activeColor: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30",
  },
}

export function TechSignals({ signals, technologies = [], compact = false }: TechSignalsProps) {
  const activeSignals = Object.entries(signals).filter(([_, active]) => active)

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {Object.entries(signals).map(([key, active]) => {
          const config = SIGNAL_CONFIG[key as keyof typeof SIGNAL_CONFIG]
          const Icon = config.icon
          return (
            <div
              key={key}
              className={`
                w-6 h-6 rounded flex items-center justify-center
                ${active ? config.activeColor : "bg-zinc-800 text-zinc-600"}
              `}
              title={`${config.label}: ${active ? "Yes" : "No"}`}
            >
              <Icon className="w-3 h-3" />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded bg-orange-500/10 flex items-center justify-center">
          <Cpu className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-100">Tech Signals</h3>
          <p className="text-xs text-zinc-500">
            {activeSignals.length} of 3 indicators active
          </p>
        </div>
      </div>

      {/* Signal Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {Object.entries(signals).map(([key, active], i) => {
          const config = SIGNAL_CONFIG[key as keyof typeof SIGNAL_CONFIG]
          const Icon = config.icon

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`
                relative p-4 rounded border text-center transition-all
                ${active ? config.activeColor : "bg-zinc-900 border-zinc-800"}
              `}
            >
              <div className={`
                w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center
                ${active ? "bg-white/10" : "bg-zinc-800"}
              `}>
                <Icon className={`w-5 h-5 ${active ? "" : "text-zinc-600"}`} />
              </div>
              <p className={`text-xs font-medium ${active ? "" : "text-zinc-500"}`}>
                {config.label}
              </p>
              <div className="absolute top-2 right-2">
                {active ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-zinc-700" />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Tech Stack */}
      {technologies.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Detected Technologies</p>
          <div className="flex flex-wrap gap-2">
            {technologies.slice(0, 12).map((tech, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded"
              >
                {tech}
              </motion.span>
            ))}
            {technologies.length > 12 && (
              <span className="px-2 py-1 text-zinc-500 text-xs">
                +{technologies.length - 12} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
