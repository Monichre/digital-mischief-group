"use client"

import { TrendingUp, Target, AlertTriangle, Lightbulb, CheckCircle } from "lucide-react"
import type { AIInsight } from "@/lib/scouts/stream-types"

interface StreamingInsightCardProps {
  insight: AIInsight
}

const insightIcons = {
  competitive: Target,
  trend: TrendingUp,
  opportunity: Lightbulb,
  threat: AlertTriangle,
}

const insightColors = {
  competitive: "text-blue-600",
  trend: "text-purple-600",
  opportunity: "text-green-600",
  threat: "text-red-600",
}

const insightBgColors = {
  competitive: "bg-blue-50",
  trend: "bg-purple-50",
  opportunity: "bg-green-50",
  threat: "bg-red-50",
}

const priorityColors = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
}

export function StreamingInsightCard({ insight }: StreamingInsightCardProps) {
  const Icon = insightIcons[insight.type]
  const iconColor = insightColors[insight.type]
  const bgColor = insightBgColors[insight.type]

  return (
    <div className="border border-zinc-200 bg-white rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`${bgColor} p-2 rounded-lg`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h5 className="font-semibold text-zinc-900">{insight.title}</h5>
              {insight.actionable && (
                <CheckCircle className="w-4 h-4 text-green-600" title="Actionable" />
              )}
            </div>

            <p className="text-sm text-zinc-600 mt-1">{insight.description}</p>

            <div className="flex items-center gap-2 mt-3">
              <span className={`px-2 py-1 text-xs rounded ${priorityColors[insight.priority]}`}>
                {insight.priority} priority
              </span>

              <span className="text-xs text-zinc-500">
                {insight.confidence}% confidence
              </span>

              <span className="text-xs text-zinc-400 capitalize">
                {insight.type}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
