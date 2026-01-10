"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"

interface EnrichedRow {
  id: string
  status: "pending" | "processing" | "completed" | "failed"
  original: Record<string, string>
  enriched?: {
    company_name?: string
    company_description?: string
    company_industry?: string
    company_size?: string
    company_website?: string
    company_logo?: string
    linkedin_url?: string
    twitter_url?: string
    contact_emails?: string[]
    contact_phones?: string[]
    tech_stack?: string[]
    funding_total?: string
    key_people?: Array<{ name: string; title: string; linkedin?: string }>
  }
  error?: string
}

interface EnrichmentTableProps {
  rows: EnrichedRow[]
  originalHeaders: string[]
}

export function EnrichmentTable({ rows, originalHeaders }: EnrichmentTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const StatusIcon = ({ status }: { status: EnrichedRow["status"] }) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-zinc-500" />
      case "processing":
        return <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  return (
    <div className="border border-zinc-800 overflow-hidden">
      {/* Table Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 grid grid-cols-12 gap-4 text-xs uppercase tracking-wider text-zinc-500">
        <div className="col-span-1">Status</div>
        <div className="col-span-3">Input</div>
        <div className="col-span-3">Company</div>
        <div className="col-span-2">Industry</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-1">Details</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-zinc-800">
        {rows.map((row) => (
          <div key={row.id}>
            {/* Main Row */}
            <div
              className={`
                px-4 py-3 grid grid-cols-12 gap-4 items-center text-sm cursor-pointer hover:bg-zinc-900/50 transition-colors
                ${expandedRow === row.id ? "bg-zinc-900/50" : ""}
              `}
              onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
            >
              <div className="col-span-1">
                <StatusIcon status={row.status} />
              </div>

              <div className="col-span-3 truncate text-zinc-400">
                {row.original.domain || row.original.email || row.original.company_name || "-"}
              </div>

              <div className="col-span-3 flex items-center gap-2">
                {row.enriched?.company_logo ? (
                  <img
                    src={row.enriched.company_logo || "/placeholder.svg"}
                    alt=""
                    className="w-6 h-6 object-contain bg-white rounded"
                  />
                ) : (
                  <Building2 className="w-5 h-5 text-zinc-600" />
                )}
                <span className="truncate text-zinc-200">{row.enriched?.company_name || "-"}</span>
              </div>

              <div className="col-span-2 truncate text-zinc-400">{row.enriched?.company_industry || "-"}</div>

              <div className="col-span-2 truncate text-zinc-400">{row.enriched?.company_size || "-"}</div>

              <div className="col-span-1 flex justify-end">
                {expandedRow === row.id ? (
                  <ChevronUp className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedRow === row.id && row.status === "completed" && row.enriched && (
              <div className="px-4 py-4 bg-zinc-900/30 border-t border-zinc-800/50">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Company Info */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Company</h4>
                    <div className="space-y-2 text-sm">
                      {row.enriched.company_description && (
                        <p className="text-zinc-400 text-xs line-clamp-3">{row.enriched.company_description}</p>
                      )}
                      {row.enriched.company_website && (
                        <a
                          href={row.enriched.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-orange-500 hover:text-orange-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {row.enriched.company_website}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Contact</h4>
                    <div className="space-y-2 text-sm">
                      {row.enriched.contact_emails?.slice(0, 3).map((email, i) => (
                        <div key={i} className="flex items-center gap-2 group">
                          <span className="text-zinc-400 truncate">{email}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(email, `${row.id}-email-${i}`)
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedField === `${row.id}-email-${i}` ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3 text-zinc-600" />
                            )}
                          </button>
                        </div>
                      ))}
                      {row.enriched.linkedin_url && (
                        <a
                          href={row.enriched.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-orange-500 hover:text-orange-400"
                          onClick={(e) => e.stopPropagation()}
                        >
                          LinkedIn
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Tech & Funding */}
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Intelligence</h4>
                    <div className="space-y-2 text-sm">
                      {row.enriched.funding_total && (
                        <p className="text-zinc-400">
                          Funding: <span className="text-zinc-200">{row.enriched.funding_total}</span>
                        </p>
                      )}
                      {row.enriched.tech_stack && row.enriched.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {row.enriched.tech_stack.slice(0, 5).map((tech, i) => (
                            <span key={i} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs">
                              {tech}
                            </span>
                          ))}
                          {row.enriched.tech_stack.length > 5 && (
                            <span className="px-2 py-0.5 text-zinc-600 text-xs">
                              +{row.enriched.tech_stack.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error */}
                {row.error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {row.error}
                  </div>
                )}
              </div>
            )}

            {/* Failed Row Details */}
            {expandedRow === row.id && row.status === "failed" && (
              <div className="px-4 py-4 bg-zinc-900/30 border-t border-zinc-800/50">
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {row.error || "Enrichment failed"}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
