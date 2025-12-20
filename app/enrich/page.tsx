"use client"

import type React from "react"
import { useState, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  AlertCircle,
  Building2,
  Globe,
  Users,
  MapPin,
  Calendar,
  Linkedin,
  Twitter,
  Mail,
  DollarSign,
  Cpu,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Download,
} from "lucide-react"
import type { EnrichmentJob } from "@/lib/firecrawl/types"
import { UnifiedInput } from "@/components/enrich/UnifiedInput"
import { FieldMapper } from "@/components/enrich/FieldMapper"
import { EnrichmentProgress } from "@/components/enrich/EnrichmentProgress"
import { EnrichmentTable } from "@/components/enrich/EnrichmentTable"

type EnrichStatus = "idle" | "loading" | "success" | "error"
type BulkStep = "input" | "mapping" | "processing" | "complete"

interface EnrichmentResult extends Partial<EnrichmentJob> {
  screenshot?: string
  raw?: unknown
}

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

export default function EnrichPage() {
  // Single enrichment state
  const [status, setStatus] = useState<EnrichStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EnrichmentResult | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Bulk enrichment state
  const [bulkStep, setBulkStep] = useState<BulkStep>("input")
  const [csvData, setCsvData] = useState<Record<string, string>[]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [enrichedRows, setEnrichedRows] = useState<EnrichedRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [batchId, setBatchId] = useState<string | null>(null)

  const handleTextSubmit = async (input: string) => {
    setStatus("loading")
    setError(null)
    setResult(null)
    setBulkStep("input") // Reset bulk state

    try {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to enrich data")
      }

      setResult(data.data)
      setStatus("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      setStatus("error")
    }
  }

  const handleCsvUpload = useCallback((data: Record<string, string>[], headers: string[]) => {
    setResult(null) // Clear single result
    setStatus("idle")
    setCsvData(data)
    setCsvHeaders(headers)
    setBulkStep("mapping")
  }, [])

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleMappingComplete = useCallback(
    async (mapping: Record<string, string | null>) => {
      setBulkStep("processing")
      setIsProcessing(true)

      const initialRows: EnrichedRow[] = csvData.map((row, idx) => ({
        id: `row-${idx}`,
        status: "pending",
        original: row,
      }))
      setEnrichedRows(initialRows)

      try {
        const batchResponse = await fetch("/api/enrich/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: csvData, mapping }),
        })
        const batchData = await batchResponse.json()

        if (!batchData.success) {
          throw new Error(batchData.error)
        }

        setBatchId(batchData.data.batchId)

        for (let i = 0; i < csvData.length; i++) {
          const row = csvData[i]

          setEnrichedRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, status: "processing" } : r)))

          try {
            const response = await fetch("/api/enrich/batch", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                rowId: `row-${i}`,
                batchId: batchData.data.batchId,
                domain: mapping.domain ? row[mapping.domain] : undefined,
                email: mapping.email ? row[mapping.email] : undefined,
                company_name: mapping.company_name ? row[mapping.company_name] : undefined,
              }),
            })

            const result = await response.json()

            setEnrichedRows((prev) =>
              prev.map((r, idx) =>
                idx === i
                  ? {
                      ...r,
                      status: result.data.status,
                      enriched: result.data.enriched,
                      error: result.data.error,
                    }
                  : r,
              ),
            )
          } catch (err) {
            setEnrichedRows((prev) =>
              prev.map((r, idx) => (idx === i ? { ...r, status: "failed", error: "Request failed" } : r)),
            )
          }

          if (i < csvData.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500))
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Batch processing failed")
      } finally {
        setIsProcessing(false)
        setBulkStep("complete")
      }
    },
    [csvData],
  )

  const handleExportCsv = useCallback(() => {
    if (enrichedRows.length === 0) return

    const originalHeaders = csvHeaders
    const enrichedHeaders = [
      "enriched_company_name",
      "enriched_industry",
      "enriched_size",
      "enriched_website",
      "enriched_linkedin",
      "enriched_twitter",
      "enriched_emails",
      "enriched_phones",
      "enriched_funding",
      "enriched_tech_stack",
      "enrichment_status",
    ]
    const allHeaders = [...originalHeaders, ...enrichedHeaders]

    const csvRows = enrichedRows.map((row) => {
      const originalValues = originalHeaders.map((h) => row.original[h] || "")
      const enrichedValues = [
        row.enriched?.company_name || "",
        row.enriched?.company_industry || "",
        row.enriched?.company_size || "",
        row.enriched?.company_website || "",
        row.enriched?.linkedin_url || "",
        row.enriched?.twitter_url || "",
        (row.enriched?.contact_emails || []).join("; "),
        (row.enriched?.contact_phones || []).join("; "),
        row.enriched?.funding_total || "",
        (row.enriched?.tech_stack || []).join("; "),
        row.status,
      ]
      return [...originalValues, ...enrichedValues]
    })

    const csvContent = [
      allHeaders.join(","),
      ...csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `enriched-leads-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [enrichedRows, csvHeaders])

  const resetAll = () => {
    setBulkStep("input")
    setCsvData([])
    setCsvHeaders([])
    setEnrichedRows([])
    setBatchId(null)
    setError(null)
    setResult(null)
    setStatus("idle")
  }

  const InfoCard = ({
    icon: Icon,
    label,
    value,
    href,
    copyable = false,
  }: {
    icon: React.ElementType
    label: string
    value?: string | null
    href?: string
    copyable?: boolean
  }) => {
    if (!value) return null
    return (
      <div className="flex items-start gap-3 p-3 bg-zinc-900/50 border border-zinc-800 group">
        <Icon className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">{label}</p>
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-200 hover:text-orange-500 transition-colors flex items-center gap-1 truncate"
            >
              {value}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          ) : (
            <p className="text-sm text-zinc-200 truncate">{value}</p>
          )}
        </div>
        {copyable && (
          <button
            onClick={() => copyToClipboard(value, label)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-800 rounded"
          >
            {copiedField === label ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3 text-zinc-500" />
            )}
          </button>
        )}
      </div>
    )
  }

  const completedCount = enrichedRows.filter((r) => r.status === "completed").length
  const failedCount = enrichedRows.filter((r) => r.status === "failed").length

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b border-white/10 bg-zinc-950/90 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-zinc-400 hover:text-orange-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to HQ</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
            <span className="font-mono font-bold tracking-tighter text-lg">[ FIRE-ENRICH ]</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-zinc-800 text-xs text-zinc-500 mb-6">
              <Building2 className="w-3 h-3 text-orange-500" />
              <span>// COMPANY INTELLIGENCE</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="text-zinc-100">Fire</span>
              <span className="text-orange-500">-Enrich</span>
            </h1>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Transform any URL, email, or domain into comprehensive company intelligence. Upload a CSV for bulk
              enrichment or enrich one at a time.
            </p>
          </div>

          {bulkStep === "input" && status !== "loading" && status !== "success" && (
            <div className="mb-12">
              <UnifiedInput
                onTextSubmit={handleTextSubmit}
                onCsvUpload={handleCsvUpload}
                isLoading={status === "loading"}
              />
            </div>
          )}

          {/* Error State */}
          {status === "error" && error && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-2 border-orange-500/30 rounded-full animate-ping" />
                <div className="absolute inset-2 border border-orange-500/50 rounded-full animate-pulse" />
                <Building2 className="absolute inset-0 m-auto w-8 h-8 text-orange-500" />
              </div>
              <p className="text-zinc-500 text-sm animate-pulse">Extracting company intelligence...</p>
            </div>
          )}

          {/* Single Enrichment Results */}
          {status === "success" && result && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Back Button */}
              <button
                onClick={resetAll}
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-orange-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Enrich another
              </button>

              {/* Company Header */}
              <div className="relative border border-zinc-800 bg-zinc-900/30 p-6">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-orange-500" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-orange-500" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-orange-500" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-orange-500" />

                <div className="flex items-start gap-6">
                  {result.company_logo ? (
                    <img
                      src={result.company_logo || "/placeholder.svg"}
                      alt={result.company_name || "Company logo"}
                      className="w-16 h-16 object-contain bg-white rounded p-2"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-zinc-800 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-zinc-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-zinc-100 mb-2">
                      {result.company_name || result.domain || "Unknown Company"}
                    </h2>
                    {result.company_description && (
                      <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{result.company_description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {result.company_industry && (
                        <span className="px-2 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs">
                          {result.company_industry}
                        </span>
                      )}
                      {result.company_size && (
                        <span className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs">
                          {result.company_size}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-orange-500" />
                    <span className="text-xs uppercase tracking-widest text-zinc-500">Company Details</span>
                  </div>
                  <div className="space-y-2">
                    <InfoCard
                      icon={Globe}
                      label="Website"
                      value={result.company_website}
                      href={result.company_website}
                    />
                    <InfoCard icon={MapPin} label="Headquarters" value={result.company_headquarters} />
                    <InfoCard icon={Calendar} label="Founded" value={result.company_founded} />
                    <InfoCard icon={Users} label="Company Size" value={result.company_size} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-orange-500" />
                    <span className="text-xs uppercase tracking-widest text-zinc-500">Social & Funding</span>
                  </div>
                  <div className="space-y-2">
                    <InfoCard icon={Linkedin} label="LinkedIn" value={result.linkedin_url} href={result.linkedin_url} />
                    <InfoCard icon={Twitter} label="Twitter" value={result.twitter_url} href={result.twitter_url} />
                    <InfoCard icon={DollarSign} label="Funding" value={result.funding_total} />
                  </div>
                </div>
              </div>

              {/* Tech Stack */}
              {result.technologies && Array.isArray(result.technologies) && result.technologies.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-orange-500" />
                    <span className="text-xs uppercase tracking-widest text-zinc-500">Tech Stack</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.technologies.map((tech: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs">
                        <Cpu className="w-3 h-3 inline mr-1" />
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contacts */}
              {result.contacts && Array.isArray(result.contacts) && result.contacts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-orange-500" />
                    <span className="text-xs uppercase tracking-widest text-zinc-500">Key Contacts</span>
                  </div>
                  <div className="grid gap-2">
                    {result.contacts
                      .slice(0, 5)
                      .map((contact: { email?: string; name?: string; title?: string }, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800">
                          <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-200 truncate">{contact.email}</p>
                            {contact.name && (
                              <p className="text-xs text-zinc-500">
                                {contact.name} {contact.title && `• ${contact.title}`}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => copyToClipboard(contact.email || "", `contact-${i}`)}
                            className="p-1 hover:bg-zinc-800 rounded"
                          >
                            {copiedField === `contact-${i}` ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3 text-zinc-500" />
                            )}
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bulk Enrichment: Field Mapping Step */}
          {bulkStep === "mapping" && (
            <div className="space-y-6">
              <button
                onClick={resetAll}
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-orange-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Start over
              </button>
              <FieldMapper
                headers={csvHeaders}
                sampleData={csvData.slice(0, 3)}
                onMappingComplete={handleMappingComplete}
              />
            </div>
          )}

          {/* Bulk Enrichment: Processing Step */}
          {(bulkStep === "processing" || bulkStep === "complete") && (
            <div className="space-y-6">
              <EnrichmentProgress
                total={enrichedRows.length}
                completed={completedCount}
                failed={failedCount}
                isProcessing={isProcessing}
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={resetAll}
                  className="flex items-center gap-2 text-sm text-zinc-500 hover:text-orange-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Start Over
                </button>

                {bulkStep === "complete" && (
                  <button
                    onClick={handleExportCsv}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm hover:bg-orange-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export Enriched CSV
                  </button>
                )}
              </div>

              <EnrichmentTable rows={enrichedRows} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
