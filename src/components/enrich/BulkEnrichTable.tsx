"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import {
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Linkedin,
  Building2,
  Users,
  DollarSign,
  Cpu,
  Target,
} from "lucide-react"
import { ICPScoreCard } from "./ICPScoreCard"
import { BuyingSignals } from "./BuyingSignals"
import { TechSignals } from "./TechSignals"

interface EnrichedResult {
  company_name: string | null
  company_description: string | null
  industry: string | null
  segment: string | null
  employee_count: number | string | null
  headquarters: string | null
  website: string | null
  funding_stage: string | null
  funding_total: string | null
  investors: string[]
  technologies: string[]
  tech_signals: { ai_adoption: boolean; modern_stack: boolean; cloud_native: boolean }
  leadership: Array<{ name: string; title: string; linkedin: string | null }>
  ceo_name: string | null
  icp_fit_score: number
  icp_fit_reasons: string[]
  buying_signals: Array<{ signal: string; confidence: number }>
  sources: string[]
  synthesis?: string
  contact?: {
    first_name: string | null
    last_name: string | null
    full_name: string | null
    title: string | null
    email: string | null
  } | null
}

interface BulkRow {
  id: string
  input: string
  domain?: string
  email?: string
  company_name?: string
  first_name?: string
  last_name?: string
  title?: string
  original: Record<string, string>
}

interface RowState {
  status: "pending" | "processing" | "completed" | "failed"
  currentPhase?: string
  phaseMessage?: string
  enriched?: EnrichedResult
  error?: string
}

interface BulkEnrichTableProps {
  rows: BulkRow[]
  csvHeaders: string[]
  generateSynthesis?: boolean
  onComplete?: (results: Array<{ row: BulkRow; state: RowState }>) => void
}

function normalizeUrl(value?: string | null): { href: string; host: string } | null {
  if (!value) return null
  const withProtocol = value.match(/^https?:\/\//i) ? value : `https://${value}`
  try {
    const url = new URL(withProtocol)
    return { href: withProtocol, host: url.hostname }
  } catch {
    return null
  }
}

export function BulkEnrichTable({
  rows,
  csvHeaders,
  generateSynthesis = true,
  onComplete,
}: BulkEnrichTableProps) {
  const [rowStates, setRowStates] = useState<Record<string, RowState>>(() => {
    const initial: Record<string, RowState> = {}
    rows.forEach((row) => {
      initial[row.id] = { status: "pending" }
    })
    return initial
  })

  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentRowIndex, setCurrentRowIndex] = useState<number | null>(null)
  const [batchId, setBatchId] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const completedCount = Object.values(rowStates).filter((s) => s.status === "completed").length
  const failedCount = Object.values(rowStates).filter((s) => s.status === "failed").length
  const isComplete = completedCount + failedCount === rows.length && rows.length > 0

  // Start streaming enrichment
  const startEnrichment = useCallback(async () => {
    setIsProcessing(true)

    try {
      const response = await fetch("/api/enrich/batch/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: rows.map((r) => ({
            id: r.id,
            input: r.input,
            domain: r.domain,
            email: r.email,
            company_name: r.company_name,
            first_name: r.first_name,
            last_name: r.last_name,
            title: r.title,
          })),
          generateSynthesis,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to start batch enrichment")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        let currentEvent = ""
        let currentData = ""

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7)
          } else if (line.startsWith("data: ")) {
            currentData = line.slice(6)
            if (currentEvent && currentData) {
              try {
                const data = JSON.parse(currentData)
                handleSSEEvent(currentEvent, data)
              } catch (e) {
                console.error("Failed to parse SSE data:", e)
              }
              currentEvent = ""
              currentData = ""
            }
          }
        }
      }
    } catch (error) {
      console.error("Batch enrichment error:", error)
    } finally {
      setIsProcessing(false)
      setCurrentRowIndex(null)
    }
  }, [rows, generateSynthesis])

  const handleSSEEvent = useCallback((event: string, data: unknown) => {
    const d = data as Record<string, unknown>

    switch (event) {
      case "batch_started":
        setBatchId(d.batchId as string)
        break

      case "row_started":
        setCurrentRowIndex(d.rowIndex as number)
        setRowStates((prev) => ({
          ...prev,
          [d.rowId as string]: {
            status: "processing",
            currentPhase: "discovery",
            phaseMessage: "Starting enrichment...",
          },
        }))
        break

      case "row_progress":
        setRowStates((prev) => ({
          ...prev,
          [d.rowId as string]: {
            ...prev[d.rowId as string],
            status: "processing",
            currentPhase: d.phase as string,
            phaseMessage: d.message as string || getPhaseLabel(d.phase as string),
          },
        }))
        break

      case "row_completed":
        setRowStates((prev) => ({
          ...prev,
          [d.rowId as string]: {
            status: "completed",
            enriched: d.enriched as EnrichedResult,
          },
        }))
        break

      case "row_failed":
        setRowStates((prev) => ({
          ...prev,
          [d.rowId as string]: {
            status: "failed",
            error: d.error as string,
          },
        }))
        break

      case "batch_completed":
        setIsProcessing(false)
        break
    }
  }, [])

  // Auto-start enrichment on mount
  useEffect(() => {
    if (rows.length > 0 && !isProcessing && completedCount === 0 && failedCount === 0) {
      startEnrichment()
    }
  }, [rows.length])

  // Notify parent when complete
  useEffect(() => {
    if (isComplete && onComplete) {
      const results = rows.map((row) => ({
        row,
        state: rowStates[row.id],
      }))
      onComplete(results)
    }
  }, [isComplete])

  const handleExportCsv = useCallback(async () => {
    if (!batchId) {
      console.error("No batch ID available for export")
      return
    }

    try {
      // Fetch comprehensive CSV export from server
      const response = await fetch(`/api/enrich/batch?batchId=${batchId}&format=csv`)

      if (!response.ok) {
        throw new Error("Failed to export CSV")
      }

      // Get the blob and create download link
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `enrichment_export_${batchId}_${new Date().toISOString().split("T")[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }, [batchId])

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              Enriching Data
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              {isProcessing && currentRowIndex !== null ? (
                <>Currently processing row {currentRowIndex + 1}</>
              ) : isComplete ? (
                <>
                  {completedCount} of {rows.length} complete
                  {failedCount > 0 && (
                    <span className="text-red-400 ml-1">({failedCount} failed)</span>
                  )}
                </>
              ) : (
                "Preparing..."
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isProcessing && (
              <div className="flex items-center gap-2 text-orange-500">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-sm">Processing...</span>
              </div>
            )}
            {isComplete && (
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300"
            style={{
              width: `${((completedCount + failedCount) / rows.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider w-[200px]">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider w-[200px]">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  ICP Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Signals
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Tech
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider w-[120px]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider w-[60px]">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {rows.map((row, index) => {
                const state = rowStates[row.id]
                const isExpanded = expandedRow === row.id
                const website = normalizeUrl(state.enriched?.website)

                return (
                  <React.Fragment key={row.id}>
                    <tr
                      className={`
                        transition-colors
                        ${state.status === "processing" ? "bg-orange-500/5" : "hover:bg-zinc-900/50"}
                        ${state.status === "completed" ? "bg-green-500/5" : ""}
                        ${state.status === "failed" ? "bg-red-500/5" : ""}
                      `}
                    >
                      {/* Company */}
                      <td className="px-4 py-3">
                        {state.status === "completed" && state.enriched ? (
                          <div>
                            <p className="text-zinc-200 font-medium">
                              {state.enriched.company_name || row.input}
                            </p>
                            {website && (
                              <a
                                href={website.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-zinc-500 hover:text-orange-500 flex items-center gap-1 mt-0.5"
                              >
                                {website.host}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ) : state.status === "processing" ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                            <span className="text-zinc-400">{row.input}</span>
                          </div>
                        ) : state.status === "failed" ? (
                          <div className="text-red-400">{row.input}</div>
                        ) : (
                          <div className="text-zinc-600">{row.input}</div>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        {state.status === "completed" && state.enriched?.contact ? (
                          <div className="space-y-0.5">
                            <p className="text-zinc-200 text-sm font-medium">
                              {state.enriched.contact.full_name || row.first_name || row.last_name || "-"}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">
                              {state.enriched.contact.title || row.title || ""}
                            </p>
                            {state.enriched.contact.email && (
                              <p className="text-[11px] text-zinc-500 truncate">{state.enriched.contact.email}</p>
                            )}
                          </div>
                        ) : state.status === "processing" ? (
                          <div className="h-10 w-32 bg-zinc-800 rounded animate-pulse" />
                        ) : (
                          <div className="text-zinc-700 text-sm">{row.first_name || row.last_name || row.title || "-"}</div>
                        )}
                      </td>

                      {/* Industry */}
                      <td className="px-4 py-3">
                        {state.status === "completed" && state.enriched ? (
                          <div className="flex flex-col gap-1">
                            {state.enriched.industry && (
                              <span className="text-zinc-300 text-xs">
                                {state.enriched.industry}
                              </span>
                            )}
                            {state.enriched.segment && (
                              <span className="text-xs text-zinc-500">
                                {state.enriched.segment}
                              </span>
                            )}
                          </div>
                        ) : state.status === "processing" ? (
                          <div className="h-4 w-20 bg-zinc-800 rounded animate-pulse" />
                        ) : (
                          <span className="text-zinc-700">-</span>
                        )}
                      </td>

                      {/* ICP Score */}
                      <td className="px-4 py-3">
                        {state.status === "completed" && state.enriched?.icp_fit_score !== undefined ? (
                          <ICPScoreCard score={state.enriched.icp_fit_score} reasons={[]} compact />
                        ) : state.status === "processing" ? (
                          <div className="h-8 w-12 bg-zinc-800 rounded animate-pulse" />
                        ) : (
                          <span className="text-zinc-700">-</span>
                        )}
                      </td>

                      {/* Buying Signals */}
                      <td className="px-4 py-3">
                        {state.status === "completed" && state.enriched?.buying_signals?.length ? (
                          <BuyingSignals signals={state.enriched.buying_signals} compact />
                        ) : state.status === "processing" ? (
                          <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
                        ) : (
                          <span className="text-zinc-700">-</span>
                        )}
                      </td>

                      {/* Tech Signals */}
                      <td className="px-4 py-3">
                        {state.status === "completed" && state.enriched?.tech_signals ? (
                          <TechSignals signals={state.enriched.tech_signals} compact />
                        ) : state.status === "processing" ? (
                          <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" />
                        ) : (
                          <span className="text-zinc-700">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={state.status}
                          phase={state.currentPhase}
                          message={state.phaseMessage}
                        />
                        {state.status === "failed" && state.error && (
                          <p
                            className="mt-1 text-xs text-red-400 max-w-[160px] whitespace-normal break-words"
                            title={state.error}
                          >
                            {state.error}
                          </p>
                        )}
                      </td>

                      {/* View Details */}
                      <td className="px-4 py-3">
                        {state.status === "completed" && (
                          <button
                            onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                            className="text-zinc-500 hover:text-orange-500 transition-colors p-1"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {isExpanded && state.enriched && (
                      <tr key={`${row.id}-details`}>
                        <td colSpan={8} className="px-0 py-0">
                          <ExpandedRowDetails enriched={state.enriched} row={row} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({
  status,
  phase,
  message,
}: {
  status: "pending" | "processing" | "completed" | "failed"
  phase?: string
  message?: string
}) {
  const config = {
    pending: { icon: Clock, color: "bg-zinc-500/20 text-zinc-400", label: "Pending" },
    processing: { icon: RefreshCw, color: "bg-orange-500/20 text-orange-400", label: message || getPhaseLabel(phase || "") },
    completed: { icon: Check, color: "bg-green-500/20 text-green-400", label: "Complete" },
    failed: { icon: AlertCircle, color: "bg-red-500/20 text-red-400", label: "Failed" },
  }

  const { icon: Icon, color, label } = config[status]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded ${color}`}>
      <Icon className={`w-3 h-3 ${status === "processing" ? "animate-spin" : ""}`} />
      <span className="truncate max-w-[100px]">{label}</span>
    </span>
  )
}

function getPhaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    discovery: "Discovering...",
    company_profile: "Profiling...",
    funding: "Funding data...",
    tech_stack: "Tech stack...",
    custom_fields: "Intelligence...",
    synthesis: "Synthesizing...",
    cache_hit: "From cache",
  }
  return labels[phase] || phase
}

function ExpandedRowDetails({ enriched, row }: { enriched: EnrichedResult; row: BulkRow }) {
  const formatSource = (value: string) => normalizeUrl(value)
  const contact = enriched.contact || {
    first_name: row.first_name || null,
    last_name: row.last_name || null,
    full_name: row.first_name || row.last_name ? `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() : null,
    title: row.title || null,
    email: row.email || null,
  }
  const contactName = contact?.full_name || [contact?.first_name, contact?.last_name].filter(Boolean).join(" ") || "-"

  return (
    <div className="bg-zinc-900/50 border-t border-zinc-800 p-6">
      <div className="grid md:grid-cols-5 gap-6">
        {/* Contact & Role */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider">
            <Users className="w-3 h-3" />
            Contact
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-zinc-300 font-medium">{contactName}</p>
            {contact?.title && <p className="text-zinc-500">{contact.title}</p>}
            {contact?.email && <p className="text-zinc-500 text-xs">{contact.email}</p>}
          </div>
        </div>

        {/* Company Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider">
            <Building2 className="w-3 h-3" />
            Company Details
          </div>
          <div className="space-y-2 text-sm">
            {enriched.headquarters && (
              <p className="text-zinc-300">
                <span className="text-zinc-500">HQ:</span> {enriched.headquarters}
              </p>
            )}
            {enriched.employee_count && (
              <p className="text-zinc-300">
                <span className="text-zinc-500">Employees:</span> {enriched.employee_count}
              </p>
            )}
            {enriched.website && (
              <a
                href={enriched.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-400 flex items-center gap-1"
              >
                Website <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Funding */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider">
            <DollarSign className="w-3 h-3" />
            Funding
          </div>
          <div className="space-y-2 text-sm">
            {enriched.funding_total && (
              <p className="text-zinc-300">
                <span className="text-zinc-500">Total:</span> {enriched.funding_total}
              </p>
            )}
            {enriched.funding_stage && (
              <p className="text-zinc-300">
                <span className="text-zinc-500">Stage:</span> {enriched.funding_stage}
              </p>
            )}
            {enriched.investors && enriched.investors.length > 0 && (
              <div>
                <p className="text-zinc-500 text-xs mb-1">Investors:</p>
                <div className="flex flex-wrap gap-1">
                  {enriched.investors.slice(0, 3).map((inv, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded">
                      {inv}
                    </span>
                  ))}
                  {enriched.investors.length > 3 && (
                    <span className="text-xs text-zinc-600">+{enriched.investors.length - 3}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leadership */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider">
            <Users className="w-3 h-3" />
            Leadership
          </div>
          <div className="space-y-2 text-sm">
            {enriched.ceo_name && (
              <p className="text-zinc-300">
                <span className="text-zinc-500">CEO:</span> {enriched.ceo_name}
              </p>
            )}
            {enriched.leadership && enriched.leadership.length > 0 && (
              <div className="space-y-1">
                {enriched.leadership.slice(0, 3).map((exec, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-zinc-300 text-xs">{exec.name}</p>
                      <p className="text-zinc-600 text-xs">{exec.title}</p>
                    </div>
                    {exec.linkedin && (
                      <a
                        href={exec.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Linkedin className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ICP Analysis */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider">
            <Target className="w-3 h-3" />
            ICP Analysis
          </div>
          <div className="space-y-2 text-sm">
            <ICPScoreCard score={enriched.icp_fit_score} reasons={enriched.icp_fit_reasons} />
          </div>
        </div>
      </div>

      {/* Technologies */}
      {enriched.technologies && enriched.technologies.length > 0 && (
        <div className="mt-6 pt-6 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-3">
            <Cpu className="w-3 h-3" />
            Tech Stack ({enriched.technologies.length} detected)
          </div>
          <div className="flex flex-wrap gap-1">
            {enriched.technologies.map((tech, i) => (
              <span key={i} className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Synthesis */}
      {enriched.synthesis && (
        <div className="mt-6 pt-6 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider mb-3">
            <Sparkles className="w-3 h-3 text-orange-500" />
            Intelligence Brief
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-800/50 p-4 rounded border border-zinc-700">
            {enriched.synthesis}
          </p>
        </div>
      )}

      {/* Sources */}
      {enriched.sources && enriched.sources.length > 0 && (
        <div className="mt-6 pt-6 border-t border-zinc-800">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
            Sources ({enriched.sources.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {enriched.sources.slice(0, 6).map((source, i) => {
              const normalized = formatSource(source)
              if (!normalized) return null
              return (
                <a
                  key={normalized.href || `${source}-${i}`}
                  href={normalized.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-500 hover:text-orange-500 truncate max-w-[200px]"
                >
                  {normalized.host}
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
