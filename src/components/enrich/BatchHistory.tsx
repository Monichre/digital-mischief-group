"use client"

import { useState, useEffect, useCallback } from "react"
import { formatDistanceToNow } from "date-fns"
import {
  History,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Play,
} from "lucide-react"

interface BatchSummary {
  id: string
  totalRows: number
  completedRows: number
  failedRows: number
  status: "processing" | "completed" | "failed" | "paused"
  createdAt: string
  updatedAt: string
  successRate: number
}

interface BatchHistoryProps {
  onSelect: (batchId: string) => void
  onExport: (batchId: string) => void
  onResume?: (batchId: string) => void
}

export function BatchHistory({ onSelect, onExport, onResume }: BatchHistoryProps) {
  const [batches, setBatches] = useState<BatchSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  })

  const fetchBatches = useCallback(async (offset = 0) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: "10",
        offset: offset.toString(),
      })

      const res = await fetch(`/api/enrich/batch/history?${params}`)
      if (!res.ok) throw new Error("Failed to fetch batch history")

      const data = await res.json()
      setBatches(offset === 0 ? data.batches : [...batches, ...data.batches])
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load batch history")
    } finally {
      setLoading(false)
    }
  }, [batches])

  useEffect(() => {
    fetchBatches()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "processing":
        return <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
      case "paused":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-zinc-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "failed":
        return "Failed"
      case "processing":
        return "In Progress"
      case "paused":
        return "Paused"
      default:
        return status
    }
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-400"
    if (rate >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  const handleExport = (e: React.MouseEvent, batchId: string) => {
    e.stopPropagation()
    onExport(batchId)
  }

  const handleResume = (e: React.MouseEvent, batchId: string) => {
    e.stopPropagation()
    onResume?.(batchId)
  }

  if (loading && batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin mb-2" />
        <p className="text-sm">Loading batch history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-red-400">
        <AlertCircle className="w-6 h-6 mb-2" />
        <p className="text-sm">{error}</p>
        <button
          onClick={() => fetchBatches(0)}
          className="mt-2 text-xs text-zinc-500 hover:text-orange-500"
        >
          Try again
        </button>
      </div>
    )
  }

  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
        <FileSpreadsheet className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">No batch enrichments yet</p>
        <p className="text-xs text-zinc-600 mt-1">Upload a CSV to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <History className="w-4 h-4" />
          <span>Batch History</span>
          <span className="text-xs text-zinc-600">({pagination.total})</span>
        </div>
        <button
          onClick={() => fetchBatches(0)}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Batch List */}
      <div className="space-y-2">
        {batches.map((batch) => {
          const isIncomplete = batch.status === "processing" || batch.status === "paused"
          const canExport = batch.completedRows > 0

          return (
            <button
              key={batch.id}
              onClick={() => onSelect(batch.id)}
              className="w-full p-4 border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all text-left group"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Batch Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(batch.status)}
                    <span className="text-sm font-medium text-zinc-200 truncate">
                      Batch {batch.id.slice(0, 8)}...
                    </span>
                    <span className="text-xs text-zinc-600">
                      {getStatusLabel(batch.status)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                    <div className="h-full flex">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{
                          width: `${(batch.completedRows / batch.totalRows) * 100}%`,
                        }}
                      />
                      <div
                        className="h-full bg-red-500 transition-all"
                        style={{
                          width: `${(batch.failedRows / batch.totalRows) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>{batch.totalRows} rows</span>
                    <span className="text-green-400">{batch.completedRows} ✓</span>
                    {batch.failedRows > 0 && (
                      <span className="text-red-400">{batch.failedRows} ✗</span>
                    )}
                    <span className={getSuccessRateColor(batch.successRate)}>
                      {batch.successRate}% success
                    </span>
                  </div>

                  {/* Timestamp */}
                  <p className="text-xs text-zinc-600 mt-1">
                    {formatDistanceToNow(new Date(batch.createdAt), { addSuffix: true })}
                  </p>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isIncomplete && onResume && (
                    <button
                      onClick={(e) => handleResume(e, batch.id)}
                      className="p-2 rounded bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 transition-colors"
                      title="Resume batch"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  {canExport && (
                    <button
                      onClick={(e) => handleExport(e, batch.id)}
                      className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                      title="Export CSV"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Load More */}
      {pagination.hasMore && (
        <button
          onClick={() => fetchBatches(pagination.offset + pagination.limit)}
          disabled={loading}
          className="w-full py-2 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
          ) : (
            "Load more"
          )}
        </button>
      )}
    </div>
  )
}
