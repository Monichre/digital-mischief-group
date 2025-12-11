"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ArrowLeft, Crosshair, RefreshCw, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Monitor, MonitorChange } from "@/lib/scouts/types"

export default function MonitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [monitor, setMonitor] = useState<Monitor | null>(null)
  const [changes, setChanges] = useState<MonitorChange[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  const fetchData = async () => {
    const res = await fetch(`/api/monitors/${id}`)
    const data = await res.json()
    setMonitor(data.monitor)
    setChanges(data.changes || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const checkNow = async () => {
    setChecking(true)
    await fetch(`/api/monitors/${id}/check`, { method: "POST" })
    setChecking(false)
    fetchData()
  }

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading...</div>
  }

  if (!monitor) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-500">Target not found</div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-mono">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/observe" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Recon</span>
          </Link>
          <Button
            onClick={checkNow}
            disabled={checking}
            className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
          >
            {checking ? (
              "Checking..."
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Now
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-orange-500 text-sm mb-2">
            <Crosshair className="w-4 h-4" />
            <span>// RECON TARGET</span>
          </div>
          <h1 className="text-3xl font-black mb-2">{monitor.name}</h1>
          <a
            href={monitor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-orange-500"
          >
            {monitor.url}
          </a>
          {monitor.last_checked_at && (
            <p className="text-xs text-zinc-600 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last checked: {new Date(monitor.last_checked_at).toLocaleString()}
            </p>
          )}
        </div>

        <h2 className="text-lg font-bold mb-4 text-orange-500">// CHANGE HISTORY ({changes.length})</h2>

        {changes.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800">
            <p className="text-zinc-500">No changes detected yet.</p>
            <p className="text-zinc-600 text-sm">Check the target to establish a baseline.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {changes.map((change) => (
              <div key={change.id} className="border border-zinc-800 bg-zinc-900/30 p-4">
                <div className="flex items-center gap-2 text-xs text-zinc-600 mb-3">
                  <Clock className="w-3 h-3" />
                  {new Date(change.created_at).toLocaleString()}
                </div>

                {change.ai_summary && (
                  <div className="bg-orange-500/10 border border-orange-500/30 p-3 mb-4">
                    <p className="text-sm text-orange-200">{change.ai_summary}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">BEFORE</p>
                    <div className="bg-zinc-900 p-3 text-sm text-zinc-400 max-h-32 overflow-auto">
                      {change.old_excerpt || "N/A"}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ArrowRight className="w-4 h-4 text-orange-500 hidden md:block" />
                    <div className="flex-1">
                      <p className="text-xs text-zinc-500 mb-1">AFTER</p>
                      <div className="bg-zinc-900 p-3 text-sm text-zinc-400 max-h-32 overflow-auto">
                        {change.new_excerpt || "N/A"}
                      </div>
                    </div>
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
