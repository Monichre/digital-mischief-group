"use client"

import { useState, useEffect } from "react"
import { Loader2, FileText, Activity, AlertTriangle } from "lucide-react"
import { CompetitorGrid } from "./CompetitorGrid"
import { PositioningMatrix } from "./PositioningMatrix"

interface BrandReconData {
  id: string
  status: "processing" | "completed" | "failed"
  competitors: any[]
  positioning_statement: string
  value_propositions: string[]
  target_segments: string[]
  differentiation_points: string[]
  price_tier: string
  pricing_model: string
  sources: string[]
  error_message?: string
  created_at: string
  completed_at?: string
}

interface BrandReconDashboardProps {
  enrichmentJobId: string
}

export function BrandReconDashboard({ enrichmentJobId }: BrandReconDashboardProps) {
  const [data, setData] = useState<BrandReconData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    startBrandRecon()
  }, [enrichmentJobId])

  async function startBrandRecon() {
    try {
      setLoading(true)
      setError(null)

      // Start brand recon analysis
      const response = await fetch("/api/brand-recon/competitive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrichmentJobId }),
      })

      if (!response.ok) {
        throw new Error("Failed to start brand recon")
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || "Failed to start brand recon")
      }

      // Poll for results
      pollResults(result.data.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setLoading(false)
    }
  }

  async function pollResults(brandReconId: string) {
    const maxAttempts = 60 // 2 minutes max
    let attempts = 0

    const poll = setInterval(async () => {
      attempts++

      try {
        const response = await fetch(
          `/api/brand-recon/competitive?id=${brandReconId}`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch results")
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || "Failed to fetch results")
        }

        const brandReconData = result.data

        if (brandReconData.status === "completed") {
          setData(brandReconData)
          setLoading(false)
          clearInterval(poll)
        } else if (brandReconData.status === "failed") {
          setError(brandReconData.error_message || "Analysis failed")
          setLoading(false)
          clearInterval(poll)
        }

        // Timeout after max attempts
        if (attempts >= maxAttempts) {
          setError("Analysis timeout - please try again")
          setLoading(false)
          clearInterval(poll)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        setLoading(false)
        clearInterval(poll)
      }
    }, 2000) // Poll every 2 seconds
  }

  if (loading) {
    return (
      <div className="border border-zinc-800 bg-zinc-900/50 p-12">
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <Activity className="w-16 h-16 text-orange-500 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100 font-mono tracking-wider">
              INTELLIGENCE GATHERING IN PROGRESS
            </h3>
            <p className="text-sm text-zinc-500 font-mono mt-2">
              Scanning competitive landscape • Analyzing threat vectors • Extracting tactical intel
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-600 font-mono">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>ESTIMATED TIME: 30-60 SECONDS</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-red-900/30 bg-red-950/20 p-8">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-red-400 font-mono">
              INTELLIGENCE GATHERING FAILED
            </h3>
            <p className="text-sm text-zinc-400 mt-2">{error}</p>
            <button
              onClick={() => startBrandRecon()}
              className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-mono hover:bg-red-500/30 transition-colors"
            >
              RETRY MISSION
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Mission Header */}
      <div className="border-l-4 border-orange-500 bg-zinc-900/80 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 font-mono tracking-wider">
              COMPETITIVE INTELLIGENCE BRIEFING
            </h2>
            <p className="text-sm text-zinc-500 font-mono mt-2">
              MISSION COMPLETE • {data.competitors.length} TARGETS IDENTIFIED •{" "}
              {data.sources.length} SOURCES ANALYZED
            </p>
          </div>
          <div className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-mono">
            STATUS: OPERATIONAL
          </div>
        </div>
      </div>

      {/* Strategic Positioning */}
      <PositioningMatrix
        positioning_statement={data.positioning_statement}
        value_propositions={data.value_propositions}
        target_segments={data.target_segments}
        differentiation_points={data.differentiation_points}
        price_tier={data.price_tier}
        pricing_model={data.pricing_model}
      />

      {/* Competitive Targets */}
      <CompetitorGrid competitors={data.competitors} />

      {/* Intel Sources */}
      <div className="border border-zinc-800 bg-zinc-900/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-zinc-500" />
          <h4 className="text-xs font-mono text-zinc-500 tracking-wide">
            INTELLIGENCE SOURCES ({data.sources.length})
          </h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {data.sources.slice(0, 8).map((source, index) => (
            <a
              key={index}
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-600 hover:text-orange-500 font-mono truncate"
            >
              {new URL(source).hostname}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
