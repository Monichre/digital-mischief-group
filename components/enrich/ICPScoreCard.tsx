"use client"

import { motion } from "framer-motion"
import { Target, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react"

interface ICPScoreCardProps {
  score: number
  reasons: string[]
  compact?: boolean
}

function getScoreConfig(score: number) {
  if (score >= 80) return { label: "Excellent Fit", color: "green", gradient: "from-green-500 to-emerald-400" }
  if (score >= 60) return { label: "Good Fit", color: "orange", gradient: "from-orange-500 to-amber-400" }
  if (score >= 40) return { label: "Moderate Fit", color: "yellow", gradient: "from-yellow-500 to-amber-400" }
  return { label: "Low Fit", color: "zinc", gradient: "from-zinc-500 to-zinc-400" }
}

export function ICPScoreCard({ score, reasons, compact = false }: ICPScoreCardProps) {
  const config = getScoreConfig(score)

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
          ${score >= 80 ? "bg-green-500/20 text-green-500" : ""}
          ${score >= 60 && score < 80 ? "bg-orange-500/20 text-orange-500" : ""}
          ${score >= 40 && score < 60 ? "bg-yellow-500/20 text-yellow-500" : ""}
          ${score < 40 ? "bg-zinc-500/20 text-zinc-500" : ""}
        `}>
          {score}
        </div>
        <span className="text-xs text-zinc-500">{config.label}</span>
      </div>
    )
  }

  return (
    <div className="border border-zinc-800 bg-zinc-900/50 p-6 relative overflow-hidden">
      {/* Background accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${config.gradient} opacity-5 blur-2xl`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-orange-500/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">ICP Fit Score</h3>
            <p className="text-xs text-zinc-500">Ideal Customer Profile Match</p>
          </div>
        </div>
      </div>

      {/* Score Display */}
      <div className="flex items-end gap-4 mb-6">
        <div className="relative">
          <svg className="w-24 h-24 -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-zinc-800"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="40"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={251.2}
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={score >= 60 ? "#f97316" : "#71717a"} />
                <stop offset="100%" stopColor={score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#a1a1aa"} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-zinc-100">{score}</span>
          </div>
        </div>
        <div className="pb-2">
          <div className={`
            inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium
            ${score >= 80 ? "bg-green-500/20 text-green-400" : ""}
            ${score >= 60 && score < 80 ? "bg-orange-500/20 text-orange-400" : ""}
            ${score >= 40 && score < 60 ? "bg-yellow-500/20 text-yellow-400" : ""}
            ${score < 40 ? "bg-zinc-500/20 text-zinc-400" : ""}
          `}>
            <TrendingUp className="w-3 h-3" />
            {config.label}
          </div>
        </div>
      </div>

      {/* Reasons */}
      {reasons.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Match Factors</p>
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-zinc-300">{reason}</span>
            </motion.div>
          ))}
        </div>
      )}

      {reasons.length === 0 && (
        <div className="flex items-center gap-2 text-zinc-500">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Insufficient data for fit analysis</span>
        </div>
      )}
    </div>
  )
}
