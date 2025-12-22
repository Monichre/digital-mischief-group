"use client"

import { Crosshair, ExternalLink, AlertTriangle, Shield, Target, Skull } from "lucide-react"

interface Competitor {
  name: string
  domain: string
  website: string
  positioning: string
  value_props: string[]
  price_tier: "budget" | "mid-market" | "premium" | "enterprise"
  segment: string
  confidence: number
}

interface CompetitorGridProps {
  competitors: Competitor[]
}

const threatLevelColors = {
  budget: "bg-green-500/10 text-green-400 border-green-500/30",
  "mid-market": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  premium: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  enterprise: "bg-red-500/10 text-red-400 border-red-500/30",
}

const threatLevelLabels = {
  budget: "THREAT: LOW",
  "mid-market": "THREAT: MEDIUM",
  premium: "THREAT: HIGH",
  enterprise: "THREAT: CRITICAL",
}

const threatIcons = {
  budget: Shield,
  "mid-market": AlertTriangle,
  premium: Target,
  enterprise: Skull,
}

export function CompetitorGrid({ competitors }: CompetitorGridProps) {
  if (competitors.length === 0) {
    return (
      <div className="text-center py-12 border border-zinc-800 bg-zinc-900/30">
        <Crosshair className="w-16 h-16 text-zinc-600 mx-auto mb-4 animate-pulse" />
        <p className="text-zinc-400 font-mono text-sm">SCANNING FOR TARGETS...</p>
        <p className="text-zinc-600 text-xs mt-2">NO HOSTILE ENTITIES DETECTED</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tactical Header */}
      <div className="border border-red-900/30 bg-red-950/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crosshair className="w-6 h-6 text-red-500 animate-pulse" />
            <div>
              <h3 className="text-lg font-bold text-zinc-100 font-mono tracking-wider">
                TARGET ACQUISITION: COMPETITIVE THREATS
              </h3>
              <p className="text-xs text-red-400 font-mono mt-1">
                {competitors.length} HOSTILE ENTITIES IDENTIFIED • ENGAGEMENT AUTHORIZED
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-mono">
            CLASSIFIED
          </div>
        </div>
      </div>

      {/* Target Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {competitors.map((target, index) => {
          const ThreatIcon = threatIcons[target.price_tier]

          return (
            <div
              key={`${target.domain}-${index}`}
              className="border border-zinc-800 bg-zinc-900/80 hover:border-red-500/50 transition-all group relative overflow-hidden"
            >
              {/* Threat Level Indicator */}
              <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-red-500/50 to-transparent" />

              {/* Target Header */}
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs text-zinc-500 font-mono">TARGET #{index + 1}</span>
                    </div>
                    <h4 className="text-lg font-bold text-zinc-100 font-mono tracking-wide group-hover:text-red-400 transition-colors">
                      {target.name.toUpperCase()}
                    </h4>
                    <a
                      href={target.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-600 hover:text-red-500 flex items-center gap-1 mt-1 font-mono"
                    >
                      {target.domain}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Threat Icon */}
                  <ThreatIcon className="w-5 h-5 text-red-500" />
                </div>
              </div>

              {/* Target Intel */}
              <div className="p-4 space-y-4">
                {/* Positioning (Mission Statement) */}
                <div>
                  <p className="text-xs text-zinc-500 font-mono mb-2">MISSION STATEMENT</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {target.positioning}
                  </p>
                </div>

                {/* Capabilities (Value Props) */}
                {target.value_props.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-500 font-mono mb-2">KNOWN CAPABILITIES</p>
                    <div className="space-y-1.5">
                      {target.value_props.slice(0, 3).map((prop, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5" />
                          <span className="text-xs text-zinc-400">{prop}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Threat Assessment */}
                <div className="pt-3 border-t border-zinc-800">
                  <div
                    className={`px-3 py-2 text-xs font-mono border ${threatLevelColors[target.price_tier]} flex items-center justify-between`}
                  >
                    <span>{threatLevelLabels[target.price_tier]}</span>
                    <span>{Math.round(target.confidence * 100)}%</span>
                  </div>
                  <div className="mt-2 text-xs text-zinc-600 font-mono">
                    SECTOR: {target.segment.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tactical Footer */}
      <div className="border border-zinc-800 bg-zinc-900/30 p-3 text-center">
        <p className="text-xs text-zinc-600 font-mono">
          INTEL CLASSIFICATION: SECRET • DISTRIBUTION: AUTHORIZED PERSONNEL ONLY
        </p>
      </div>
    </div>
  )
}
