"use client"

import { Radar, Crosshair, TrendingUp } from "lucide-react"

interface PositioningMatrixProps {
  positioning_statement: string
  value_propositions: string[]
  target_segments: string[]
  differentiation_points: string[]
  price_tier: string
  pricing_model: string
}

export function PositioningMatrix({
  positioning_statement,
  value_propositions,
  target_segments,
  differentiation_points,
  price_tier,
  pricing_model,
}: PositioningMatrixProps) {
  return (
    <div className="space-y-6">
      {/* Strategic Positioning Header */}
      <div className="border border-orange-900/30 bg-orange-950/20 p-4">
        <div className="flex items-center gap-3">
          <Radar className="w-6 h-6 text-orange-500" />
          <div>
            <h3 className="text-lg font-bold text-zinc-100 font-mono tracking-wider">
              STRATEGIC POSITIONING ANALYSIS
            </h3>
            <p className="text-xs text-orange-400 font-mono mt-1">
              MARKET INTELLIGENCE • TACTICAL ADVANTAGE ASSESSMENT
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Positioning */}
        <div className="border border-zinc-800 bg-zinc-900/80 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Crosshair className="w-5 h-5 text-orange-500" />
            <h4 className="text-sm font-mono text-zinc-400 tracking-wide">PRIMARY POSITION</h4>
          </div>
          <p className="text-lg text-zinc-100 leading-relaxed">
            {positioning_statement}
          </p>

          {/* Price Tier & Model */}
          <div className="mt-6 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-600 font-mono mb-1">PRICE TIER</p>
              <p className="text-sm text-orange-400 font-mono font-bold">
                {price_tier.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-600 font-mono mb-1">PRICING MODEL</p>
              <p className="text-sm text-orange-400 font-mono font-bold">
                {pricing_model.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Value Propositions - Arsenal */}
        <div className="border border-zinc-800 bg-zinc-900/80 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h4 className="text-sm font-mono text-zinc-400 tracking-wide">TACTICAL ADVANTAGES</h4>
          </div>
          <div className="space-y-3">
            {value_propositions.map((vp, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-zinc-800/50 border border-zinc-700"
              >
                <div className="text-green-500 font-mono text-xs font-bold mt-0.5">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <p className="text-sm text-zinc-300 flex-1">{vp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Target Segments & Differentiation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Target Sectors */}
        <div className="border border-zinc-800 bg-zinc-900/80 p-6">
          <h4 className="text-sm font-mono text-zinc-400 tracking-wide mb-4">
            TARGET SECTORS
          </h4>
          <div className="space-y-2">
            {target_segments.map((segment, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/30"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-blue-400 font-mono">{segment}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Advantages - Differentiation */}
        <div className="border border-zinc-800 bg-zinc-900/80 p-6">
          <h4 className="text-sm font-mono text-zinc-400 tracking-wide mb-4">
            STRATEGIC DIFFERENTIATORS
          </h4>
          <div className="space-y-2">
            {differentiation_points.map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-3 px-4 py-3 bg-orange-500/10 border border-orange-500/30"
              >
                <div className="text-orange-500 text-lg font-bold">›</div>
                <span className="text-sm text-zinc-300">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Classification Footer */}
      <div className="border border-zinc-800 bg-zinc-900/30 p-3 text-center">
        <p className="text-xs text-zinc-600 font-mono">
          STRATEGIC ANALYSIS • CONFIDENTIAL • FOR INTERNAL USE ONLY
        </p>
      </div>
    </div>
  )
}
