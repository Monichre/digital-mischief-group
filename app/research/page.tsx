"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Brain,
  Target,
  ChevronDown,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/scroll-animations"
import type { ResearchMission, ResearchDepth } from "@/lib/research/types"

const DEPTH_OPTIONS: { value: ResearchDepth; label: string; description: string }[] = [
  { value: "quick", label: "Quick Scan", description: "~30 seconds, surface-level intel" },
  { value: "standard", label: "Standard", description: "~2 minutes, balanced depth" },
  { value: "deep", label: "Deep Dive", description: "~5 minutes, comprehensive analysis" },
]

const SOURCE_OPTIONS = [
  { value: "perplexity", label: "Perplexity", icon: Brain },
  { value: "exa", label: "Exa Neural", icon: Zap },
  { value: "serper", label: "Serper", icon: Search },
]

export default function ResearchPage() {
  const [missions, setMissions] = useState<ResearchMission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [runningId, setRunningId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [query, setQuery] = useState("")
  const [depth, setDepth] = useState<ResearchDepth>("standard")
  const [sources, setSources] = useState<string[]>(["perplexity", "exa"])

  const fetchMissions = useCallback(async () => {
    try {
      const res = await fetch("/api/research")
      const data = await res.json()
      setMissions(data.missions || [])
    } catch (error) {
      console.error("Failed to fetch missions:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMissions()
  }, [fetchMissions])

  const handleCreate = async () => {
    if (!name || !query) return
    setIsCreating(true)

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, query, depth, sources }),
      })
      const data = await res.json()

      if (data.mission) {
        setMissions((prev) => [data.mission, ...prev])
        setShowCreate(false)
        setName("")
        setQuery("")
        // Auto-run the mission
        handleRun(data.mission.id)
      }
    } catch (error) {
      console.error("Failed to create mission:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleRun = async (missionId: string) => {
    setRunningId(missionId)
    setMissions((prev) => prev.map((m) => (m.id === missionId ? { ...m, status: "running" } : m)))

    try {
      const res = await fetch(`/api/research/${missionId}/run`, { method: "POST" })
      const data = await res.json()

      if (data.mission) {
        setMissions((prev) => prev.map((m) => (m.id === missionId ? data.mission : m)))
      }
    } catch (error) {
      console.error("Mission failed:", error)
      setMissions((prev) => prev.map((m) => (m.id === missionId ? { ...m, status: "failed" } : m)))
    } finally {
      setRunningId(null)
    }
  }

  const toggleSource = (source: string) => {
    setSources((prev) => (prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "running":
        return <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-zinc-500" />
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-orange-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono text-sm">Back to HQ</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-orange-500 font-mono text-xs">[</span>
            <Target className="w-4 h-4 text-orange-500" />
            <span className="font-mono text-sm tracking-wider">OPEN-RESEARCHER</span>
            <span className="text-orange-500 font-mono text-xs">]</span>
          </div>
        </div>
      </header>

      <div className="pt-24 pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            {/* Title Section */}
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 border-orange-500/30 text-orange-500 font-mono">
                <Brain className="w-3 h-3 mr-1" />
                // AUTONOMOUS INTELLIGENCE
              </Badge>
              <h1 className="text-4xl md:text-5xl font-mono mb-4">
                Open-<span className="text-orange-500">Researcher</span>
              </h1>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Deploy autonomous research missions across multiple intelligence sources. Get synthesized, actionable
                briefs in minutes.
              </p>
            </div>
          </ScrollReveal>

          {/* Create Mission */}
          <ScrollReveal delay={0.1}>
            <div className="mb-8">
              {!showCreate ? (
                <Button
                  onClick={() => setShowCreate(true)}
                  className="w-full bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 text-zinc-100 font-mono"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Research Mission
                </Button>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-mono text-orange-500">// NEW MISSION</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCreate(false)}
                      className="text-zinc-500 hover:text-zinc-100"
                    >
                      Cancel
                    </Button>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-500 mb-2">MISSION NAME</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Competitor Analysis Q1"
                      className="bg-zinc-950 border-zinc-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-500 mb-2">RESEARCH QUERY</label>
                    <Textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g., What are the latest AI marketing trends in 2025? Focus on enterprise adoption and emerging tools."
                      className="bg-zinc-950 border-zinc-700 font-mono min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-500 mb-2">DEPTH</label>
                    <div className="grid grid-cols-3 gap-2">
                      {DEPTH_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setDepth(opt.value)}
                          className={`p-3 rounded border text-left transition-colors ${
                            depth === opt.value
                              ? "bg-orange-500/10 border-orange-500 text-orange-500"
                              : "bg-zinc-950 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                          }`}
                        >
                          <div className="font-mono text-sm">{opt.label}</div>
                          <div className="text-xs opacity-60">{opt.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-500 mb-2">SOURCES</label>
                    <div className="flex gap-2">
                      {SOURCE_OPTIONS.map((src) => {
                        const Icon = src.icon
                        const isActive = sources.includes(src.value)
                        return (
                          <button
                            key={src.value}
                            onClick={() => toggleSource(src.value)}
                            className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${
                              isActive
                                ? "bg-orange-500/10 border-orange-500 text-orange-500"
                                : "bg-zinc-950 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="font-mono text-sm">{src.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <Button
                    onClick={handleCreate}
                    disabled={!name || !query || isCreating}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-zinc-950 font-mono"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deploying Mission...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Deploy Research Mission
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Missions List */}
          <ScrollReveal delay={0.2}>
            <div className="space-y-4">
              <h3 className="font-mono text-zinc-500 text-sm">// MISSION LOG</h3>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                </div>
              ) : missions.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="font-mono">No missions deployed yet</p>
                </div>
              ) : (
                missions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    isRunning={runningId === mission.id}
                    onRun={() => handleRun(mission.id)}
                    getStatusIcon={getStatusIcon}
                  />
                ))
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </main>
  )
}

function MissionCard({
  mission,
  isRunning,
  onRun,
  getStatusIcon,
}: {
  mission: ResearchMission
  isRunning: boolean
  onRun: () => void
  getStatusIcon: (status: string) => React.ReactNode
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          {getStatusIcon(mission.status)}
          <div>
            <h4 className="font-mono text-zinc-100">{mission.name}</h4>
            <p className="text-xs text-zinc-500 font-mono truncate max-w-md">{mission.query}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-zinc-700 text-zinc-400 font-mono text-xs">
            {mission.depth}
          </Badge>
          <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-zinc-800 p-4 space-y-4">
          {mission.status === "pending" && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onRun()
              }}
              disabled={isRunning}
              className="bg-orange-500 hover:bg-orange-600 text-zinc-950 font-mono"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Mission
                </>
              )}
            </Button>
          )}

          {mission.status === "running" && (
            <div className="flex items-center gap-2 text-orange-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="font-mono text-sm">Research in progress...</span>
            </div>
          )}

          {mission.status === "completed" && mission.summary && (
            <div className="space-y-4">
              <div>
                <h5 className="font-mono text-xs text-zinc-500 mb-2">// INTELLIGENCE BRIEF</h5>
                <div className="bg-zinc-950 border border-zinc-800 rounded p-4">
                  <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-mono leading-relaxed">
                    {mission.summary}
                  </pre>
                </div>
              </div>

              {mission.findings && mission.findings.length > 0 && (
                <div>
                  <h5 className="font-mono text-xs text-zinc-500 mb-2">// RAW FINDINGS ({mission.findings.length})</h5>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {mission.findings.slice(0, 10).map((finding, i) => (
                      <div key={i} className="bg-zinc-950 border border-zinc-800 rounded p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="border-zinc-700 text-xs">
                            {finding.source}
                          </Badge>
                          {finding.url && (
                            <a
                              href={finding.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-orange-500 hover:underline truncate max-w-xs"
                            >
                              {finding.url}
                            </a>
                          )}
                        </div>
                        <h6 className="font-mono text-sm text-zinc-200 mb-1">{finding.title}</h6>
                        <p className="text-xs text-zinc-400 line-clamp-3">{finding.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {mission.status === "failed" && (
            <div className="text-red-500 font-mono text-sm">Mission failed. Check logs for details.</div>
          )}

          <div className="text-xs text-zinc-600 font-mono">
            Created: {new Date(mission.created_at).toLocaleString()}
            {mission.completed_at && ` • Completed: ${new Date(mission.completed_at).toLocaleString()}`}
          </div>
        </div>
      )}
    </div>
  )
}
