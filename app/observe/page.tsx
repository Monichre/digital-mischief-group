"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Crosshair, RefreshCw, Trash2, ExternalLink, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Monitor } from "@/lib/scouts/types"

export default function ObservePage() {
  const [monitors, setMonitors] = useState<(Monitor & { change_count: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", url: "", notification_email: "" })

  const fetchMonitors = async () => {
    const res = await fetch("/api/monitors")
    const data = await res.json()
    setMonitors(data.monitors || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchMonitors()
  }, [])

  const createMonitor = async () => {
    if (!form.name || !form.url) return
    setCreating(true)
    await fetch("/api/monitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setForm({ name: "", url: "", notification_email: "" })
    setShowCreate(false)
    setCreating(false)
    fetchMonitors()
  }

  const checkMonitor = async (id: string) => {
    setCheckingId(id)
    await fetch(`/api/monitors/${id}/check`, { method: "POST" })
    setCheckingId(null)
    fetchMonitors()
  }

  const deleteMonitor = async (id: string) => {
    if (!confirm("Delete this recon target?")) return
    await fetch(`/api/monitors/${id}`, { method: "DELETE" })
    fetchMonitors()
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-mono">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to HQ</span>
          </Link>
          <div className="flex items-center gap-1 text-orange-500">
            <span className="text-zinc-600">{"<"}</span>
            <Crosshair className="w-4 h-4" />
            <span className="font-bold">[ RECON ]</span>
            <span className="text-zinc-600">{">"}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-zinc-800 text-xs text-zinc-500 mb-6">
            <Crosshair className="w-3 h-3 text-orange-500" />
            <span>// CHANGE DETECTION</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Fire-<span className="text-orange-500">Recon</span>
          </h1>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Deploy recon targets to monitor websites for changes. Get AI-powered summaries when content updates.
          </p>
        </div>

        <div className="flex justify-end mb-8">
          <Button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Target
          </Button>
        </div>

        {showCreate && (
          <div className="border border-zinc-800 bg-zinc-900/50 p-6 mb-8 relative">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-orange-500" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-orange-500" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-orange-500" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-orange-500" />

            <h3 className="text-lg font-bold mb-4 text-orange-500">// DEPLOY RECON TARGET</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Target Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Competitor Pricing Page"
                  className="bg-zinc-900 border-zinc-700"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">URL to Monitor</label>
                <Input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://example.com/pricing"
                  className="bg-zinc-900 border-zinc-700"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={createMonitor}
                disabled={creating || !form.name || !form.url}
                className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
              >
                {creating ? "Deploying..." : "Deploy Target"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-zinc-500">Loading targets...</div>
        ) : monitors.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800">
            <Crosshair className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
            <p className="text-zinc-500">No recon targets deployed yet</p>
            <p className="text-zinc-600 text-sm">Deploy your first target to start tracking changes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {monitors.map((monitor) => (
              <div
                key={monitor.id}
                className="border border-zinc-800 bg-zinc-900/30 p-4 relative group hover:border-zinc-700 transition-colors"
              >
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-orange-500/50" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-orange-500/50" />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{monitor.name}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs ${monitor.is_active ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"}`}
                      >
                        {monitor.is_active ? "ACTIVE" : "PAUSED"}
                      </span>
                    </div>
                    <a
                      href={monitor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-zinc-500 hover:text-orange-500 flex items-center gap-1"
                    >
                      {monitor.url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <div className="flex items-center gap-4 text-xs text-zinc-600 mt-2">
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {monitor.change_count} changes detected
                      </span>
                      {monitor.last_checked_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Checked: {new Date(monitor.last_checked_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => checkMonitor(monitor.id)}
                      disabled={checkingId === monitor.id}
                      className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                    >
                      {checkingId === monitor.id ? (
                        <span className="animate-pulse">Checking...</span>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Check
                        </>
                      )}
                    </Button>
                    <Link href={`/observe/${monitor.id}`}>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMonitor(monitor.id)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
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
