"use client"

import { motion } from "framer-motion"
import { Zap, TrendingUp, DollarSign, Users, Rocket, ShieldCheck } from "lucide-react"

interface BuyingSignal {
  signal: string
  confidence: number
}

interface BuyingSignalsProps {
  signals: BuyingSignal[]
  compact?: boolean
}

const SIGNAL_ICONS: Record<string, typeof Zap> = {
  funding: DollarSign,
  growth: TrendingUp,
  hiring: Users,
  innovation: Rocket,
  default: Zap,
}

function getSignalIcon(signal: string) {
  const lower = signal.toLowerCase()
  if (lower.includes("funding") || lower.includes("investment")) return DollarSign
  if (lower.includes("growth") || lower.includes("budget")) return TrendingUp
  if (lower.includes("hiring") || lower.includes("team")) return Users
  if (lower.includes("innovation") || lower.includes("adopter") || lower.includes("ai")) return Rocket
  if (lower.includes("security") || lower.includes("compliance")) return ShieldCheck
  return Zap
}

function getConfidenceColor(confidence: number) {
  if (confidence >= 0.8) return "bg-green-500"
  if (confidence >= 0.6) return "bg-orange-500"
  if (confidence >= 0.4) return "bg-yellow-500"
  return "bg-zinc-500"
}

export function BuyingSignals({ signals, compact = false }: BuyingSignalsProps) {
  if (signals.length === 0) return null

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {signals.slice(0, 3).map((s, i) => {
          const Icon = getSignalIcon(s.signal)
          return (
            <div
              key={i}
              className="w-6 h-6 rounded bg-orange-500/10 flex items-center justify-center"
              title={s.signal}
            >
              <Icon className="w-3 h-3 text-orange-500" />
            </div>
          )
        })}
        {signals.length > 3 && (
          <span className="text-xs text-zinc-500">+{signals.length - 3}</span>
        )}
      </div>
    )
  }

  return (
    <div className="border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded bg-orange-500/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-100">Buying Signals</h3>
          <p className="text-xs text-zinc-500">{signals.length} signals detected</p>
        </div>
      </div>

      <div className="space-y-4">
        {signals.map((signal, i) => {
          const Icon = getSignalIcon(signal.signal)
          const confidencePercent = Math.round(signal.confidence * 100)

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-zinc-400 group-hover:text-orange-500 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-zinc-200">{signal.signal}</span>
                    <span className={`
                      text-xs font-mono px-1.5 py-0.5 rounded
                      ${confidencePercent >= 80 ? "bg-green-500/20 text-green-400" : ""}
                      ${confidencePercent >= 60 && confidencePercent < 80 ? "bg-orange-500/20 text-orange-400" : ""}
                      ${confidencePercent < 60 ? "bg-zinc-500/20 text-zinc-400" : ""}
                    `}>
                      {confidencePercent}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${getConfidenceColor(signal.confidence)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${confidencePercent}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
