"use client"

import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react"

interface EnrichmentProgressProps {
  total: number
  completed: number
  failed: number
  isProcessing: boolean
}

export function EnrichmentProgress({ total, completed, failed, isProcessing }: EnrichmentProgressProps) {
  const pending = total - completed - failed
  const successRate = completed > 0 ? Math.round((completed / (completed + failed)) * 100) : 0
  const progressPercent = Math.round(((completed + failed) / total) * 100)

  return (
    <div className="border border-zinc-800 bg-zinc-900/30 p-6">
      {/* Corner Accents */}
      <div className="relative">
        <div className="absolute -top-6 -left-6 w-3 h-3 border-t-2 border-l-2 border-orange-500" />
        <div className="absolute -top-6 -right-6 w-3 h-3 border-t-2 border-r-2 border-orange-500" />
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">{isProcessing ? "Processing..." : "Complete"}</span>
          <span className="text-sm font-mono text-zinc-200">{progressPercent}%</span>
        </div>
        <div className="h-2 bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-600 to-orange-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-200 font-mono">{total}</p>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Total</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {isProcessing ? (
              <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
            ) : (
              <Clock className="w-4 h-4 text-zinc-500" />
            )}
          </div>
          <p className="text-2xl font-bold text-zinc-200 font-mono">{pending}</p>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Pending</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-500 font-mono">{completed}</p>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Success</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500 font-mono">{failed}</p>
          <p className="text-[10px] uppercase tracking-wider text-zinc-600">Failed</p>
        </div>
      </div>

      {/* Success Rate */}
      {(completed > 0 || failed > 0) && (
        <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-500">
            Success Rate: <span className="text-zinc-200 font-mono">{successRate}%</span>
          </p>
        </div>
      )}
    </div>
  )
}
