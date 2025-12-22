"use client"

import { useState, useEffect, useCallback } from "react"
import { formatDistanceToNow } from "date-fns"
import {
  History,
  Search,
  Building2,
  Globe,
  Mail,
  ChevronRight,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react"

interface EnrichmentJob {
  id: string
  input_type: string
  input_value: string
  domain: string | null
  company_name: string | null
  company_description: string | null
  icp_fit_score: number | null
  status: string
  created_at: string
  completed_phases: string[] | null
}

interface EnrichHistoryProps {
  onSelect: (id: string) => void
  onClose?: () => void
}

export function EnrichHistory({ onSelect, onClose }: EnrichHistoryProps) {
  const [jobs, setJobs] = useState<EnrichmentJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  })

  const fetchHistory = useCallback(async (searchTerm = "", offset = 0) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: "20",
        offset: offset.toString(),
      })
      if (searchTerm) {
        params.set("search", searchTerm)
      }

      const res = await fetch(`/api/enrich/history?${params}`)
      if (!res.ok) throw new Error("Failed to fetch history")

      const data = await res.json()
      setJobs(offset === 0 ? data.jobs : [...jobs, ...data.jobs])
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history")
    } finally {
      setLoading(false)
    }
  }, [jobs])

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleSearch = useCallback(() => {
    fetchHistory(search, 0)
  }, [search, fetchHistory])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Delete this enrichment?")) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/enrich/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      setJobs(jobs.filter((j) => j.id !== id))
    } catch {
      // Show error toast
    } finally {
      setDeleting(null)
    }
  }

  const getInputIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="w-4 h-4" />
      case "domain":
      case "url":
        return <Globe className="w-4 h-4" />
      default:
        return <Building2 className="w-4 h-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "processing":
        return <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
      default:
        return <AlertCircle className="w-4 h-4 text-zinc-500" />
    }
  }

  const getScoreColor = (score: number | null) => {
    if (score === null || score < 0) return "text-zinc-500"
    if (score >= 70) return "text-green-400"
    if (score >= 40) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-orange-500" />
          <span className="font-semibold">Enrichment History</span>
          <span className="text-xs text-zinc-500">({pagination.total})</span>
        </div>
        <button
          onClick={() => fetchHistory(search, 0)}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search companies..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-sm transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && jobs.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-zinc-500 text-sm">
            <History className="w-8 h-8 mb-2 opacity-50" />
            <p>No enrichments yet</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => onSelect(job.id)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors text-left group"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                  {getInputIcon(job.input_type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-200 truncate">
                      {job.company_name || job.domain || job.input_value}
                    </span>
                    {getStatusIcon(job.status)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                    {job.domain && <span>{job.domain}</span>}
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                  </div>
                </div>

                {job.icp_fit_score !== null && (
                  <div className={`text-sm font-mono ${getScoreColor(job.icp_fit_score)}`}>
                    {job.icp_fit_score >= 0 ? `${job.icp_fit_score}` : "N/A"}
                  </div>
                )}

                <button
                  onClick={(e) => handleDelete(job.id, e)}
                  className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-all"
                  disabled={deleting === job.id}
                >
                  {deleting === job.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>

                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Load More */}
        {pagination.hasMore && (
          <div className="p-4">
            <button
              onClick={() => fetchHistory(search, pagination.offset + pagination.limit)}
              disabled={loading}
              className="w-full py-2 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-800 rounded transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Load more"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
