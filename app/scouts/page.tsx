"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Search, Play, Trash2, ExternalLink, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Scout } from "@/lib/scouts/types"

export default function ScoutsPage() {
  const [scouts, setScouts] = useState<(Scout & { result_count: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [runningId, setRunningId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", search_query: "", schedule: "manual", notification_email: "" })

  const fetchScouts = async () => {
    const res = await fetch("/api/scouts")
    const data = await res.json()
    setScouts(data.scouts || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchScouts()
  }, [])

  const createScout = async () => {
    if (!form.name || !form.search_query) return
    setCreating(true)
    await fetch("/api/scouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setForm({ name: "", search_query: "", schedule: "manual", notification_email: "" })
    setShowCreate(false)
    setCreating(false)
    fetchScouts()
  }

  const runScout = async (id: string) => {
    setRunningId(id)
    await fetch(`/api/scouts/${id}/run`, { method: "POST" })
    setRunningId(null)
    fetchScouts()
  }

  const deleteScout = async (id: string) => {
    if (!confirm("Delete this scout?")) return
    await fetch(`/api/scouts/${id}`, { method: "DELETE" })
    fetchScouts()
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-mono">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to HQ</span>
          </Link>
          <div className="flex items-center gap-1 text-orange-500">
            <span className="text-zinc-600">{"<"}</span>
            <Search className="w-4 h-4" />
            <span className="font-bold">[ SCOUTS ]</span>
            <span className="text-zinc-600">{">"}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-zinc-800 text-xs text-zinc-500 mb-6">
            <Search className="w-3 h-3 text-orange-500" />
            <span>// COMPETITIVE INTELLIGENCE</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Fire-<span className="text-orange-500">Scouts</span>
          </h1>
          <p className="text-zinc-500 max-w-xl mx-auto">
            Monitor competitors, track market trends, and discover new opportunities with automated search agents.
          </p>
        </div>

        {/* Create Button */}
        <div className="flex justify-end mb-8">
          <Button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Scout
          </Button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <div className="border border-zinc-800 bg-zinc-900/50 p-6 mb-8 relative">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-orange-500" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-orange-500" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-orange-500" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-orange-500" />

            <h3 className="text-lg font-bold mb-4 text-orange-500">// CREATE SCOUT</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Scout Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Competitor Pricing Monitor"
                  className="bg-zinc-900 border-zinc-700"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Search Query</label>
                <Input
                  value={form.search_query}
                  onChange={(e) => setForm({ ...form, search_query: e.target.value })}
                  placeholder="e.g., 'acme corp' pricing OR plans"
                  className="bg-zinc-900 border-zinc-700"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={createScout}
                disabled={creating || !form.name || !form.search_query}
                className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
              >
                {creating ? "Creating..." : "Create Scout"}
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Scouts List */}
        {loading ? (
          <div className="text-center py-12 text-zinc-500">Loading scouts...</div>
        ) : scouts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-800">
            <Search className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
            <p className="text-zinc-500">No scouts configured yet</p>
            <p className="text-zinc-600 text-sm">Create your first scout to start monitoring</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scouts.map((scout) => (
              <div
                key={scout.id}
                className="border border-zinc-800 bg-zinc-900/30 p-4 relative group hover:border-zinc-700 transition-colors"
              >
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-orange-500/50" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-orange-500/50" />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{scout.name}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs ${scout.is_active ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"}`}
                      >
                        {scout.is_active ? "ACTIVE" : "PAUSED"}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 font-mono mb-2">{scout.search_query}</p>
                    <div className="flex items-center gap-4 text-xs text-zinc-600">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {scout.result_count} results
                      </span>
                      {scout.last_run_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last run: {new Date(scout.last_run_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runScout(scout.id)}
                      disabled={runningId === scout.id}
                      className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                    >
                      {runningId === scout.id ? (
                        <span className="animate-pulse">Running...</span>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Run
                        </>
                      )}
                    </Button>
                    <Link href={`/scouts/${scout.id}`}>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteScout(scout.id)}
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
