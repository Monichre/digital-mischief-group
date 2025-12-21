"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ArrowLeft, Shield, Play, ExternalLink, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Scout, ScoutResult } from "@/lib/scouts/types"

export default function ScoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [scout, setScout] = useState<Scout | null>(null)
  const [results, setResults] = useState<ScoutResult[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

  const fetchData = async () => {
    const res = await fetch(`/api/scouts/${id}`)
    const data = await res.json()
    setScout(data.scout)
    setResults(data.results || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const runScout = async () => {
    setRunning(true)
    await fetch(`/api/scouts/${id}/run`, { method: "POST" })
    setRunning(false)
    fetchData()
  }

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading...</div>
  }

  if (!scout) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-500">Sentinel not found</div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-mono">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/scouts" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sentinels</span>
          </Link>
          <Button
            onClick={runScout}
            disabled={running}
            className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
          >
            {running ? (
              "Running..."
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Sentinel
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-orange-500 text-sm mb-2">
            <Shield className="w-4 h-4" />
            <span>// SENTINEL DETAIL</span>
          </div>
          <h1 className="text-3xl font-black mb-2">{scout.name}</h1>
          <p className="text-zinc-500 font-mono">{scout.search_query}</p>
          {scout.last_run_at && (
            <p className="text-xs text-zinc-600 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last run: {new Date(scout.last_run_at).toLocaleString()}
            </p>
          )}
        </div>

        <h2 className="text-lg font-bold mb-4 text-orange-500">// RESULTS ({results.length})</h2>

        {results.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800">
            <p className="text-zinc-500">No results yet. Run the sentinel to discover content.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="border border-zinc-800 bg-zinc-900/30 p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:text-orange-500 transition-colors flex items-center gap-2"
                    >
                      {result.title || result.url}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                    <p className="text-xs text-zinc-600 truncate mt-1">{result.url}</p>
                    {result.snippet && <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{result.snippet}</p>}
                  </div>
                  <div className="text-xs text-zinc-600 flex-shrink-0">
                    <span className="px-2 py-0.5 bg-zinc-800">{result.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
