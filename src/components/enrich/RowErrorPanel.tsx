"use client"

import { useState, useCallback } from "react"
import {
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  XCircle,
  CheckCircle2,
  Loader2,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react"

interface FailedRow {
  id: string
  inputValue: string
  inputType: string
  error: string
  rowIndex?: number
}

interface RowErrorPanelProps {
  failedRows: FailedRow[]
  onRetry: (rowId: string) => Promise<void>
  onRetryAll: () => Promise<void>
  batchId?: string
}

/**
 * T-008: CSV Enrichment Flow
 * 
 * Row-level error display with actionable messages and retry capability.
 * Provides clear error categorization and suggested resolutions.
 */

type ErrorCategory = "input" | "network" | "limit" | "provider" | "unknown"

function categorizeError(error: string): ErrorCategory {
  const lowerError = error.toLowerCase()
  
  if (
    lowerError.includes("no domain") ||
    lowerError.includes("no email") ||
    lowerError.includes("invalid") ||
    lowerError.includes("format")
  ) {
    return "input"
  }
  
  if (
    lowerError.includes("timeout") ||
    lowerError.includes("network") ||
    lowerError.includes("fetch") ||
    lowerError.includes("connection")
  ) {
    return "network"
  }
  
  if (
    lowerError.includes("rate limit") ||
    lowerError.includes("too many") ||
    lowerError.includes("quota")
  ) {
    return "limit"
  }
  
  if (
    lowerError.includes("api") ||
    lowerError.includes("provider") ||
    lowerError.includes("llm") ||
    lowerError.includes("model")
  ) {
    return "provider"
  }
  
  return "unknown"
}

function getErrorIcon(category: ErrorCategory) {
  switch (category) {
    case "input":
      return <AlertCircle className="w-4 h-4 text-yellow-500" />
    case "network":
      return <RefreshCw className="w-4 h-4 text-blue-500" />
    case "limit":
      return <XCircle className="w-4 h-4 text-orange-500" />
    case "provider":
      return <HelpCircle className="w-4 h-4 text-purple-500" />
    default:
      return <AlertCircle className="w-4 h-4 text-red-500" />
  }
}

function getActionableMessage(category: ErrorCategory, error: string): string {
  switch (category) {
    case "input":
      return "Check input data - ensure domain, email, or company name is valid"
    case "network":
      return "Network issue - retry should resolve this"
    case "limit":
      return "Rate limit reached - wait a moment before retrying"
    case "provider":
      return "Provider issue - retry may resolve, or contact support"
    default:
      return "Unexpected error - retry or check the input data"
  }
}

export function RowErrorPanel({
  failedRows,
  onRetry,
  onRetryAll,
  batchId,
}: RowErrorPanelProps) {
  const [expanded, setExpanded] = useState(true)
  const [retryingRows, setRetryingRows] = useState<Set<string>>(new Set())
  const [retryingAll, setRetryingAll] = useState(false)
  const [retryResults, setRetryResults] = useState<Record<string, "success" | "failed">>({})
  const [copied, setCopied] = useState<string | null>(null)

  const handleRetry = useCallback(async (rowId: string) => {
    setRetryingRows((prev) => new Set(prev).add(rowId))
    try {
      await onRetry(rowId)
      setRetryResults((prev) => ({ ...prev, [rowId]: "success" }))
    } catch {
      setRetryResults((prev) => ({ ...prev, [rowId]: "failed" }))
    } finally {
      setRetryingRows((prev) => {
        const next = new Set(prev)
        next.delete(rowId)
        return next
      })
    }
  }, [onRetry])

  const handleRetryAll = useCallback(async () => {
    setRetryingAll(true)
    try {
      await onRetryAll()
    } finally {
      setRetryingAll(false)
    }
  }, [onRetryAll])

  const copyError = useCallback(async (rowId: string, error: string) => {
    await navigator.clipboard.writeText(error)
    setCopied(rowId)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  if (failedRows.length === 0) {
    return null
  }

  // Group errors by category
  const errorsByCategory = failedRows.reduce(
    (acc, row) => {
      const category = categorizeError(row.error)
      if (!acc[category]) acc[category] = []
      acc[category].push(row)
      return acc
    },
    {} as Record<ErrorCategory, FailedRow[]>
  )

  const retryableCount = failedRows.filter(
    (row) => categorizeError(row.error) !== "input"
  ).length

  return (
    <div className="border border-red-500/30 bg-red-500/5 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium text-red-400">
              {failedRows.length} Row{failedRows.length > 1 ? "s" : ""} Failed
            </h3>
            <p className="text-xs text-zinc-500">
              {retryableCount > 0
                ? `${retryableCount} may be retryable`
                : "Review errors below"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {retryableCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRetryAll()
              }}
              disabled={retryingAll}
              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium rounded transition-colors disabled:opacity-50"
            >
              {retryingAll ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                `Retry All (${retryableCount})`
              )}
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-zinc-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-500" />
          )}
        </div>
      </button>

      {/* Error List */}
      {expanded && (
        <div className="border-t border-red-500/20">
          {/* Category Groups */}
          {(Object.entries(errorsByCategory) as [ErrorCategory, FailedRow[]][]).map(
            ([category, rows]) => (
              <div key={category} className="border-b border-red-500/10 last:border-b-0">
                {/* Category Header */}
                <div className="px-4 py-2 bg-zinc-900/50 flex items-center gap-2">
                  {getErrorIcon(category)}
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    {category === "input"
                      ? "Input Issues"
                      : category === "network"
                      ? "Network Issues"
                      : category === "limit"
                      ? "Rate Limits"
                      : category === "provider"
                      ? "Provider Issues"
                      : "Other Errors"}{" "}
                    ({rows.length})
                  </span>
                  <span className="text-xs text-zinc-600 ml-2">
                    {getActionableMessage(category, rows[0].error)}
                  </span>
                </div>

                {/* Rows in Category */}
                <div className="divide-y divide-zinc-800/50">
                  {rows.map((row) => {
                    const isRetrying = retryingRows.has(row.id)
                    const retryResult = retryResults[row.id]
                    const canRetry = category !== "input"

                    return (
                      <div
                        key={row.id}
                        className="px-4 py-3 flex items-start justify-between gap-4 hover:bg-zinc-900/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-zinc-200 font-mono truncate">
                              {row.inputValue}
                            </span>
                            <span className="text-xs text-zinc-600 px-1.5 py-0.5 bg-zinc-800 rounded">
                              {row.inputType}
                            </span>
                            {row.rowIndex !== undefined && (
                              <span className="text-xs text-zinc-600">
                                Row {row.rowIndex + 1}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-red-400/80 truncate" title={row.error}>
                            {row.error}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Copy Error */}
                          <button
                            onClick={() => copyError(row.id, row.error)}
                            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                            title="Copy error"
                          >
                            {copied === row.id ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Retry Button */}
                          {canRetry && (
                            <button
                              onClick={() => handleRetry(row.id)}
                              disabled={isRetrying || retryResult === "success"}
                              className={`
                                p-1.5 rounded transition-colors
                                ${
                                  retryResult === "success"
                                    ? "bg-green-500/20 text-green-400"
                                    : "hover:bg-zinc-800 text-zinc-500 hover:text-orange-400"
                                }
                                disabled:opacity-50
                              `}
                              title={retryResult === "success" ? "Retry successful" : "Retry"}
                            >
                              {isRetrying ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : retryResult === "success" ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <RefreshCw className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          )}

          {/* Footer Help */}
          <div className="px-4 py-3 bg-zinc-900/50 border-t border-zinc-800/50">
            <p className="text-xs text-zinc-600">
              <strong className="text-zinc-500">Tip:</strong> Input issues require fixing the
              source data. Network and provider issues often resolve with a retry.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
