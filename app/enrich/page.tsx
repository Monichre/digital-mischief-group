"use client"

import type React from "react"
import { useState, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Loader2,
  AlertCircle,
  Building2,
  Globe,
  Users,
  MapPin,
  Calendar,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  DollarSign,
  Cpu,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Upload,
  Download,
} from "lucide-react"
import type { EnrichmentJob } from "@/lib/firecrawl/types"
import { CsvUploader } from "@/components/enrich/CsvUploader"
import { FieldMapper } from "@/components/enrich/FieldMapper"
import { EnrichmentProgress } from "@/components/enrich/EnrichmentProgress"
import { EnrichmentTable } from "@/components/enrich/EnrichmentTable"

type EnrichStatus = "idle" | "loading" | "success" | "error"
type ViewMode = "single" | "bulk"
type BulkStep = "upload" | "mapping" | "processing" | "complete"

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
  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("single")

  // Single enrichment state
  const [input, setInput] = useState("")
  const [status, setStatus] = useState<EnrichStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EnrichmentResult | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Bulk enrichment state
  const [bulkStep, setBulkStep] = useState<BulkStep>("upload")
  const [csvData, setCsvData] = useState<Record<string, string>[]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [enrichedRows, setEnrichedRows] = useState<EnrichedRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [batchId, setBatchId] = useState<string | null>(null)

  // Single enrichment handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setStatus("loading")
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
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

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Bulk enrichment handlers
  const handleCsvUpload = useCallback((data: Record<string, string>[], headers: string[]) => {
    setCsvData(data)
    setCsvHeaders(headers)
    setBulkStep("mapping")
  }, [])

  const handleMappingComplete = useCallback(
    async (mapping: Record<string, string | null>) => {
      setBulkStep("processing")
      setIsProcessing(true)

      // Initialize rows
      const initialRows: EnrichedRow[] = csvData.map((row, idx) => ({
        id: `row-${idx}`,
        status: "pending",
        original: row,
      }))
      setEnrichedRows(initialRows)

      // Create batch
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

        // Process rows sequentially with rate limiting
        for (let i = 0; i < csvData.length; i++) {
          const row = csvData[i]

          // Update status to processing
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

          // Rate limit: 500ms between requests
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

    // Build CSV headers
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

    // Build rows
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

    // Create CSV content
    const csvContent = [
      allHeaders.join(","),
      ...csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `enriched-leads-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [enrichedRows, csvHeaders])

  const resetBulk = () => {
    setBulkStep("upload")
    setCsvData([])
    setCsvHeaders([])
    setEnrichedRows([])
    setBatchId(null)
    setError(null)
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
        <div className="max-w-6xl mx-auto">
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
            <p className="text-zinc-400 max-w-xl mx-auto mb-8">
              Transform any URL, email, or domain into comprehensive company intelligence. Upload a CSV for bulk
              enrichment or enrich one at a time.
            </p>

            {/* View Mode Toggle */}
            <div className="inline-flex border border-zinc-800">
              <button
                onClick={() => {
                  setViewMode("single")
                  resetBulk()
                }}
                className={`px-6 py-2 text-sm transition-colors ${
                  viewMode === "single" ? "bg-orange-500 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Search className="w-4 h-4 inline mr-2" />
                Single
              </button>
              <button
                onClick={() => {
                  setViewMode("bulk")
                  setStatus("idle")
                  setResult(null)
                }}
                className={`px-6 py-2 text-sm transition-colors ${
                  viewMode === "bulk" ? "bg-orange-500 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Bulk CSV
              </button>
            </div>
          </div>

          {/* Single Enrichment Mode */}
          {viewMode === "single" && (
            <>
              {/* Input Form */}
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-16">
                <div className="relative">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-orange-500" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-orange-500" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-orange-500" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-orange-500" />

                  <div className="flex bg-zinc-900 border border-zinc-800">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Enter URL, email, or domain (e.g., stripe.com)"
                      className="flex-1 px-6 py-4 bg-transparent text-zinc-100 placeholder-zinc-600 outline-none text-sm"
                      disabled={status === "loading"}
                    />
                    <button
                      type="submit"
                      disabled={status === "loading" || !input.trim()}
                      className="px-8 py-4 bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>ENRICHING</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>ENRICH</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

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

              {/* Results */}
              {status === "success" && result && (
                <div className="space-y-8 animate-in fade-in duration-500">
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
                        <span className="text-xs uppercase tracking-widest text-zinc-500">Social Profiles</span>
                      </div>
                      <div className="space-y-2">
                        <InfoCard
                          icon={Linkedin}
                          label="LinkedIn"
                          value={result.linkedin_url}
                          href={result.linkedin_url}
                        />
                        <InfoCard icon={Twitter} label="Twitter" value={result.twitter_url} href={result.twitter_url} />
                        <InfoCard
                          icon={Globe}
                          label="Crunchbase"
                          value={result.crunchbase_url}
                          href={result.crunchbase_url}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  {(result.contact_emails?.length || result.contact_phones?.length) && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-orange-500" />
                        <span className="text-xs uppercase tracking-widest text-zinc-500">Contact Information</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        {result.contact_emails?.map((email, i) => (
                          <InfoCard key={i} icon={Mail} label={`Email ${i + 1}`} value={email} copyable />
                        ))}
                        {result.contact_phones?.map((phone, i) => (
                          <InfoCard key={i} icon={Phone} label={`Phone ${i + 1}`} value={phone} copyable />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Funding */}
                  {(result.funding_total || result.investors?.length) && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-orange-500" />
                        <span className="text-xs uppercase tracking-widest text-zinc-500">Funding</span>
                      </div>
                      <div className="space-y-2">
                        <InfoCard icon={DollarSign} label="Total Funding" value={result.funding_total} />
                        {result.investors && result.investors.length > 0 && (
                          <div className="p-3 bg-zinc-900/50 border border-zinc-800">
                            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Investors</p>
                            <div className="flex flex-wrap gap-2">
                              {result.investors.map((investor, i) => (
                                <span key={i} className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs">
                                  {investor}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tech Stack */}
                  {result.tech_stack && result.tech_stack.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-orange-500" />
                        <span className="text-xs uppercase tracking-widest text-zinc-500">Technology Stack</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.tech_stack.map((tech, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs flex items-center gap-2"
                          >
                            <Cpu className="w-3 h-3 text-orange-500" />
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key People */}
                  {result.key_people && result.key_people.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-orange-500" />
                        <span className="text-xs uppercase tracking-widest text-zinc-500">Leadership Team</span>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {result.key_people.map((person, i) => (
                          <div key={i} className="p-4 bg-zinc-900/50 border border-zinc-800">
                            <p className="font-medium text-zinc-100 mb-1">{person.name}</p>
                            <p className="text-xs text-zinc-500 mb-2">{person.title}</p>
                            {person.linkedin && (
                              <a
                                href={person.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1"
                              >
                                <Linkedin className="w-3 h-3" />
                                View Profile
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw Data */}
                  <details className="border border-zinc-800 bg-zinc-900/30">
                    <summary className="px-6 py-4 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                      View Raw JSON
                    </summary>
                    <pre className="px-6 pb-6 text-xs text-zinc-500 overflow-x-auto">
                      {JSON.stringify(result.raw, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </>
          )}

          {/* Bulk Enrichment Mode */}
          {viewMode === "bulk" && (
            <div className="max-w-4xl mx-auto">
              {/* Step: Upload */}
              {bulkStep === "upload" && (
                <div className="space-y-6">
                  <CsvUploader onUpload={handleCsvUpload} />

                  <div className="text-center text-sm text-zinc-500">
                    <p className="mb-2">Your CSV should have columns for:</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                      <span className="px-2 py-1 bg-zinc-900 border border-zinc-800">Domain / URL</span>
                      <span className="px-2 py-1 bg-zinc-900 border border-zinc-800">Email</span>
                      <span className="px-2 py-1 bg-zinc-900 border border-zinc-800">Company Name</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step: Field Mapping */}
              {bulkStep === "mapping" && (
                <div className="border border-zinc-800 bg-zinc-900/30 p-6">
                  <FieldMapper csvHeaders={csvHeaders} onMappingComplete={handleMappingComplete} onCancel={resetBulk} />
                </div>
              )}

              {/* Step: Processing / Complete */}
              {(bulkStep === "processing" || bulkStep === "complete") && (
                <div className="space-y-8">
                  {/* Progress */}
                  <EnrichmentProgress
                    total={enrichedRows.length}
                    completed={completedCount}
                    failed={failedCount}
                    isProcessing={isProcessing}
                  />

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={resetBulk}
                      className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 inline mr-2" />
                      Start Over
                    </button>

                    {bulkStep === "complete" && (
                      <button
                        onClick={handleExportCsv}
                        className="px-6 py-2 bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export Enriched CSV
                      </button>
                    )}
                  </div>

                  {/* Results Table */}
                  <EnrichmentTable rows={enrichedRows} originalHeaders={csvHeaders} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
