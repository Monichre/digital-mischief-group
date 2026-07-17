'use client'

import type React from 'react'
import {useState, useCallback} from 'react'
import {useSearchParams} from 'next/navigation'
import Link from 'next/link'
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
  DollarSign,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Download,
  Archive,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  History,
  X,
  Crosshair,
} from 'lucide-react'
import {UnifiedInput} from '@/components/enrich/UnifiedInput'
import {FieldMapper} from '@/components/enrich/FieldMapper'
import {
  AgentPhaseTracker,
  type PhaseProgress,
  type AgentPhase,
} from '@/components/enrich/AgentPhaseTracker'
import {ICPScoreCard} from '@/components/enrich/ICPScoreCard'
import {BuyingSignals} from '@/components/enrich/BuyingSignals'
import {TechSignals} from '@/components/enrich/TechSignals'
import {SourceAttribution} from '@/components/enrich/SourceAttribution'
import {EnrichThinkingPanel} from '@/components/enrich/EnrichThinkingPanel'
import {BulkEnrichTable} from '@/components/enrich/BulkEnrichTable'
import {EnrichHistory} from '@/components/enrich/EnrichHistory'
import {BatchHistory} from '@/components/enrich/BatchHistory'
import {useEnrichStream} from '@/hooks/useEnrichStream'
import {CrossPrimitiveCTAs} from '@/components/cross-primitive-ctas'
import {IntelPageChrome} from '@/components/military/IntelPageChrome'
import {
  CORTEX_DIRECTIVES,
  CORTEX_DIRECTIVE_LABELS,
  type CortexDirective,
} from '@/lib/cortex-directives'
import {getApiErrorMessage, toCompetitorEntry} from '@/lib/core-flow-ux'

type EnrichStatus = 'idle' | 'loading' | 'success' | 'error'
type BulkStep = 'input' | 'mapping' | 'processing' | 'complete'

interface AgentResults {
  discovery?: {
    company_name: string
    domain: string
    website: string
    confidence: number
    sources: string[]
  }
  profile?: {
    industry: string | null
    segment: string
    headquarters: string | null
    employee_count: number | null
    employee_range: string | null
    year_founded: number | null
    business_type: string | null
    description: string | null
    sources: Record<string, string[]>
  }
  funding?: {
    funding_stage: string | null
    total_funding: string | null
    last_round_date: string | null
    last_round_amount: string | null
    investors: string[]
    valuation: string | null
    sources: Record<string, string[]>
  }
  techStack?: {
    languages: string[]
    frameworks: string[]
    infrastructure: string[]
    tools: string[]
    signals: {
      ai_adoption: boolean
      modern_stack: boolean
      cloud_native: boolean
    }
    sources: string[]
  }
  customFields?: {
    ceo_name: string | null
    key_executives: Array<{
      name: string
      title: string
      linkedin: string | null
    }>
    icp_fit_score: number
    icp_fit_reasons: string[]
    is_personal_site?: boolean
    pain_points: string[]
    buying_signals: Array<{signal: string; confidence: number}>
    competitive_landscape: string[]
    sources: Record<string, string[]>
  }
}

interface EnrichmentResult {
  id?: string
  company_name?: string
  company_description?: string
  company_logo?: string
  company_industry?: string
  company_size?: string
  company_founded?: string
  company_headquarters?: string
  company_website?: string
  domain?: string
  linkedin_url?: string
  twitter_url?: string
  funding_total?: string
  funding_stage?: string
  investors?: string[]
  tech_stack?: string[]
  tech_signals?: {
    ai_adoption: boolean
    modern_stack: boolean
    cloud_native: boolean
  }
  icp_fit_score?: number
  icp_fit_reasons?: string[]
  is_personal_site?: boolean
  buying_signals?: Array<{signal: string; confidence: number}>
  ceo_name?: string
  key_people?: Array<{name: string; title: string; linkedin?: string}>
  sources?: string[]
  screenshot?: string
  duration_ms?: number
  errors?: Array<{phase: string; error: string; recoverable: boolean}>
  agents?: AgentResults
}

interface EnrichedRow {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  original: Record<string, string>
  enriched?: {
    company_name?: string
    company_description?: string
    industry?: string
    segment?: string
    employee_count?: number | string
    headquarters?: string
    website?: string
    funding_stage?: string
    funding_total?: string
    investors?: string[]
    technologies?: string[]
    tech_signals?: {
      ai_adoption: boolean
      modern_stack: boolean
      cloud_native: boolean
    }
    leadership?: Array<{name: string; title: string; linkedin?: string | null}>
    ceo_name?: string
    icp_fit_score?: number
    icp_fit_reasons?: string[]
    buying_signals?: Array<{signal: string; confidence: number}>
    contact?: {
      first_name?: string | null
      last_name?: string | null
      full_name?: string | null
      title?: string | null
      email?: string | null
    }
    sources?: string[]
  }
  error?: string
}

type CompetitorEntry = {
  name: string
  domain: string
}

export default function EnrichPage() {
  const searchParams = useSearchParams()
  // Streaming enrichment state
  const stream = useEnrichStream()

  // UI state
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showRawData, setShowRawData] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyTab, setHistoryTab] = useState<'single' | 'batch'>('single')
  const [loadingHistoryItem, setLoadingHistoryItem] = useState(false)
  const [historyFeedback, setHistoryFeedback] = useState<
    {type: 'error' | 'success'; message: string} | null
  >(null)
  const [historicalResult, setHistoricalResult] =
    useState<EnrichmentResult | null>(null)
  const [directive, setDirective] = useState<CortexDirective>('kill_chain')
  const [archiveStatus, setArchiveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')
  const [archiveError, setArchiveError] = useState<string | null>(null)
  const [cortexId, setCortexId] = useState<string | null>(null)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [competitorsLoading, setCompetitorsLoading] = useState(false)
  const [competitors, setCompetitors] = useState<CompetitorEntry[]>([])
  const [competitorDraft, setCompetitorDraft] = useState<CompetitorEntry>({
    name: '',
    domain: '',
  })

  // Bulk enrichment state
  const [bulkStep, setBulkStep] = useState<BulkStep>('input')
  const [csvData, setCsvData] = useState<Record<string, string>[]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [bulkRows, setBulkRows] = useState<
    Array<{
      id: string
      input: string
      domain?: string
      email?: string
      company_name?: string
      original: Record<string, string>
    }>
  >([])
  const [fieldMapping, setFieldMapping] = useState<
    Record<string, string | null>
  >({})
  const [enrichedRows, setEnrichedRows] = useState<EnrichedRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [batchId, setBatchId] = useState<string | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  // Derive status from stream state or historical result
  const status: EnrichStatus = stream.isLoading
    ? 'loading'
    : stream.result || historicalResult
    ? 'success'
    : stream.error
    ? 'error'
    : 'idle'
  const error = stream.error
  const result = (stream.result as EnrichmentResult | null) || historicalResult

  // Convert stream phases to AgentPhaseTracker format
  const phases: PhaseProgress[] = Object.entries(stream.phases)
    .filter(([phase]) => phase !== 'branding')
    .map(([phase, state]) => ({
      phase: phase as AgentPhase,
      status:
        state.status === 'running'
          ? 'running'
          : state.status === 'completed'
          ? 'completed'
          : state.status === 'failed'
          ? 'failed'
          : 'pending',
    }))

  const fetchCompetitors = useCallback(async () => {
    if (!result?.id) return
    setCompetitorsLoading(true)
    try {
      const res = await fetch('/api/cortex/competitors', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({enrichmentJobId: result.id}),
      })
      if (!res.ok) {
        throw new Error('Failed to discover competitors')
      }
      const data = await res.json()
      const list = Array.isArray(data.competitors) ? data.competitors : []
      setCompetitors(
        list.map((item: any) => ({
          name: item.name || '',
          domain: item.domain || item.website || '',
        }))
      )
    } catch (err) {
      setArchiveError(
        err instanceof Error ? err.message : 'Failed to discover competitors'
      )
    } finally {
      setCompetitorsLoading(false)
    }
  }, [result?.id])

  const archiveToCortex = useCallback(
    async (override?: CompetitorEntry[]) => {
      if (!result?.id) return
      setArchiveStatus('saving')
      setArchiveError(null)

      try {
        const res = await fetch('/api/cortex', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            enrichmentJobId: result.id,
            directive,
            logoUrl: result.company_logo || null,
            competitorsOverride:
              override && override.length > 0
                ? override.filter((item) => item.domain.trim())
                : undefined,
          }),
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Failed to archive dossier')
        }

        setCortexId(data.id)
        setArchiveStatus('saved')
        setShowArchiveModal(false)
      } catch (err) {
        setArchiveStatus('error')
        setArchiveError(
          err instanceof Error ? err.message : 'Failed to archive dossier'
        )
      }
    },
    [directive, result?.id, result?.company_logo]
  )

  const handleArchiveClick = useCallback(() => {
    if (!result?.id) return
    if (directive === 'market_teardown') {
      setShowArchiveModal(true)
      if (competitors.length === 0) {
        fetchCompetitors()
      }
      return
    }
    archiveToCortex()
  }, [archiveToCortex, competitors.length, directive, fetchCompetitors, result?.id])

  const handleTextSubmit = async (input: string) => {
    setBulkStep('input')
    setShowHistory(false)
    setHistoryFeedback(null)
    setHistoricalResult(null)
    setArchiveStatus('idle')
    setArchiveError(null)
    setCortexId(null)
    setCompetitors([])
    stream.enrich(input)
  }

  const handleHistorySelect = async (id: string) => {
    setLoadingHistoryItem(true)
    setHistoryFeedback(null)
    setArchiveStatus('idle')
    setArchiveError(null)
    setCortexId(null)
    try {
      const res = await fetch(`/api/enrich/${id}`)
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, 'Failed to load enrichment'))
      }

      // Transform to match EnrichmentResult format
      const loadedResult: EnrichmentResult = {
        id: data.id,
        company_name: data.company_name,
        company_description: data.company_description,
        company_industry: data.company_industry,
        company_size: data.company_size,
        company_founded: data.company_founded,
        company_headquarters: data.company_headquarters,
        company_website: data.company_website,
        tech_stack: data.tech_stack,
        funding_total: data.funding_total,
        key_people: data.key_people,
        icp_fit_score: data.icp_fit_score,
        icp_fit_reasons: data.icp_fit_reasons,
        buying_signals: data.buying_signals,
        sources: data.sources,
        agents: data.agents,
      }

      stream.reset()
      setHistoricalResult(loadedResult)
      setShowHistory(false)
    } catch (err) {
      console.error('Failed to load history item:', err)
      setHistoryFeedback({
        type: 'error',
        message:
          err instanceof Error ? err.message : 'Failed to load enrichment',
      })
    } finally {
      setLoadingHistoryItem(false)
    }
  }

  // T-008: Batch history handlers for session continuity
  const handleBatchSelect = useCallback(async (batchIdToLoad: string) => {
    setLoadingHistoryItem(true)
    setHistoryFeedback(null)
    setBatchId(batchIdToLoad)
    try {
      const res = await fetch(`/api/enrich/batch/${batchIdToLoad}`)
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, 'Failed to load batch'))
      }
      
      // Transform jobs to bulkRows format for display
      const loadedRows = data.jobs.map((job: any) => ({
        id: job.id,
        input: job.inputValue,
        domain: job.domain,
        email: job.inputType === 'email' ? job.inputValue : undefined,
        company_name: job.companyName,
        first_name: job.enriched?.contact?.first_name,
        last_name: job.enriched?.contact?.last_name,
        title: job.enriched?.contact?.title,
        original: { [job.inputType]: job.inputValue },
      }))
      
      setBulkRows(loadedRows)
      setHistoricalResult(null)
      setBulkStep('processing')
      setShowHistory(false)
    } catch (err) {
      console.error('Failed to load batch:', err)
      setHistoryFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to load batch',
      })
    } finally {
      setLoadingHistoryItem(false)
    }
  }, [])

  const handleBatchExport = useCallback(async (batchIdToExport: string) => {
    setLoadingHistoryItem(true)
    setHistoryFeedback(null)

    try {
      const response = await fetch(`/api/enrich/batch?batchId=${batchIdToExport}&format=csv`)

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(getApiErrorMessage(data, 'Failed to export CSV'))
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `enrichment_export_${batchIdToExport}_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      setHistoryFeedback({
        type: 'success',
        message: 'CSV export started.',
      })
    } catch (error) {
      console.error('Export failed:', error)
      setHistoryFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to export CSV',
      })
    } finally {
      setLoadingHistoryItem(false)
    }
  }, [])

  const handleCsvUpload = useCallback(
    (data: Record<string, string>[], headers: string[]) => {
      stream.reset()
      setHistoricalResult(null)
      setHistoryFeedback(null)
      setCsvData(data)
      setCsvHeaders(headers)
      setBulkStep('mapping')
    },
    [stream]
  )

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleMappingComplete = useCallback(
    (mapping: Record<string, string | null>) => {
      setFieldMapping(mapping)

      // Prepare rows for BulkEnrichTable
      const rows = csvData.map((row, idx) => {
        const domain = mapping.domain ? row[mapping.domain] : undefined
        const email = mapping.email ? row[mapping.email] : undefined
        const company_name = mapping.company_name
          ? row[mapping.company_name]
          : undefined
        const first_name = mapping.first_name
          ? row[mapping.first_name]
          : undefined
        const last_name = mapping.last_name ? row[mapping.last_name] : undefined
        const title = mapping.title ? row[mapping.title] : undefined
        const input =
          email ||
          domain ||
          company_name ||
          Object.values(row)[0] ||
          `Row ${idx + 1}`

        return {
          id: `row-${idx}`,
          input,
          domain,
          email,
          company_name,
          first_name,
          last_name,
          title,
          original: row,
        }
      })

      setBulkRows(rows)
      setBulkStep('processing')
    },
    [csvData]
  )

  const handleExportCsv = useCallback(() => {
    if (enrichedRows.length === 0) return

    const originalHeaders = csvHeaders
    const enrichedHeaders = [
      'enriched_company_name',
      'enriched_industry',
      'enriched_segment',
      'enriched_employees',
      'enriched_headquarters',
      'enriched_website',
      'enriched_funding_stage',
      'enriched_funding_total',
      'enriched_technologies',
      'enriched_icp_score',
      'enriched_icp_reasons',
      'enriched_buying_signals',
      'enrichment_status',
    ]
    const allHeaders = [...originalHeaders, ...enrichedHeaders]

    const csvRows = enrichedRows.map((row) => {
      const originalValues = originalHeaders.map((h) => row.original[h] || '')
      const enrichedValues = [
        row.enriched?.company_name || '',
        row.enriched?.industry || '',
        row.enriched?.segment || '',
        row.enriched?.employee_count?.toString() || '',
        row.enriched?.headquarters || '',
        row.enriched?.website || '',
        row.enriched?.funding_stage || '',
        row.enriched?.funding_total || '',
        (row.enriched?.technologies || []).join('; '),
        row.enriched?.icp_fit_score?.toString() || '',
        (row.enriched?.icp_fit_reasons || []).join('; '),
        (row.enriched?.buying_signals || [])
          .map((s) => `${s.signal} (${Math.round(s.confidence * 100)}%)`)
          .join('; '),
        row.status,
      ]
      return [...originalValues, ...enrichedValues]
    })

    const csvContent = [
      allHeaders.join(','),
      ...csvRows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'})
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `enriched-leads-${
      new Date().toISOString().split('T')[0]
    }.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [enrichedRows, csvHeaders])

  const resetAll = () => {
    setBulkStep('input')
    setCsvData([])
    setCsvHeaders([])
    setBulkRows([])
    setFieldMapping({})
    setEnrichedRows([])
    setBatchId(null)
    setHistoryFeedback(null)
    setHistoricalResult(null)
    setArchiveStatus('idle')
    setArchiveError(null)
    setCortexId(null)
    setShowArchiveModal(false)
    setCompetitors([])
    setCompetitorDraft({name: '', domain: ''})
    stream.reset()
  }

  const InfoCard = ({
    icon: Icon,
    label,
    value,
    href,
    copyable = false,
  }: {
    icon: React.ComponentType<{className?: string}>
    label: string
    value?: string | null
    href?: string
    copyable?: boolean
  }) => {
    if (!value) return null
    return (
      <div className='flex items-start gap-3 p-3 bg-zinc-900/50 border border-zinc-800 group'>
        <Icon className='w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0' />
        <div className='flex-1 min-w-0'>
          <p className='text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5'>
            {label}
          </p>
          {href ? (
            <a
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              className='text-sm text-zinc-200 hover:text-orange-500 transition-colors flex items-center gap-1 truncate'
            >
              {value}
              <ExternalLink className='w-3 h-3 flex-shrink-0' />
            </a>
          ) : (
            <p className='text-sm text-zinc-200 truncate'>{value}</p>
          )}
        </div>
        {copyable && (
          <button
            onClick={() => copyToClipboard(value, label)}
            className='opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-800 rounded'
          >
            {copiedField === label ? (
              <Check className='w-3 h-3 text-green-500' />
            ) : (
              <Copy className='w-3 h-3 text-zinc-500' />
            )}
          </button>
        )}
      </div>
    )
  }

  return (
    <IntelPageChrome
      badge={
        <>
          <Sparkles className='w-4 h-4 text-orange-500 animate-pulse' />
          <span className='font-bold tracking-tighter text-lg text-zinc-100'>
            [ TARGET ENRICH ]
          </span>
        </>
      }
      navActions={
        <button
          onClick={() => {
            setHistoryFeedback(null)
            setShowHistory(!showHistory)
          }}
          className={`inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] transition-colors ${
            showHistory
              ? 'border-orange-500/40 bg-orange-500/15 text-orange-300'
              : 'border-transparent text-zinc-500 hover:border-zinc-800 hover:text-orange-400'
          }`}
        >
          <History className='w-4 h-4' />
          <span className='hidden sm:inline'>History</span>
        </button>
      }
      eyebrow={
        <>
          <Building2 className='w-3 h-3 text-orange-500' />
          <span>// MULTI-AGENT INTELLIGENCE</span>
        </>
      }
      title={
        <>
          <span className='text-zinc-100'>Target</span>
          <span className='text-orange-500'>-Enrich</span>
        </>
      }
      description='5-phase AI pipeline extracts company intelligence, calculates ICP fit, and detects buying signals.'
      containerClassName='max-w-5xl'
    >

      {/* Input Section */}
      {bulkStep === 'input' &&
        status !== 'loading' &&
        status !== 'success' && (
          <div className='mb-12'>
            <div className='mb-6 dmg-surface p-4'>
                  <div className='text-xs text-zinc-500 tracking-widest mb-3'>
                    DIRECTIVE // MISSION PROFILE
                  </div>
                  <div className='grid md:grid-cols-3 gap-3'>
                    {CORTEX_DIRECTIVES.map((item) => (
                      <button
                        key={item.id}
                        type='button'
                        onClick={() => setDirective(item.id)}
                        className={`p-4 border text-left transition-colors ${
                          directive === item.id
                            ? 'border-orange-500/60 bg-orange-500/10 text-orange-300'
                            : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        <div className='text-xs tracking-widest text-zinc-500 mb-1'>
                          {item.purpose}
                        </div>
                        <div className='font-bold text-sm mb-2'>
                          {item.label}
                        </div>
                        <p className='text-xs text-zinc-500'>
                          {item.focus}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
            <UnifiedInput
              onTextSubmit={handleTextSubmit}
              onCsvUpload={handleCsvUpload}
              isLoading={false}
              initialText={searchParams.get('input') || ''}
            />
          </div>
        )}

          {/* Error State */}
          {status === 'error' && error && (
            <div className='max-w-2xl mx-auto mb-8'>
              <div className='flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 text-red-400'>
                <AlertCircle className='w-5 h-5 flex-shrink-0' />
                <span className='text-sm'>{error}</span>
                <button
                  onClick={resetAll}
                  className='ml-auto text-sm hover:text-red-300'
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Loading State with Agent Progress */}
          {status === 'loading' && (
            <div className='max-w-4xl mx-auto h-[500px]'>
              <EnrichThinkingPanel
                phases={stream.phases}
                events={stream.events}
                thoughts={stream.thoughts}
                decisions={stream.decisions}
                isComplete={false}
              />
            </div>
          )}

          {/* Single Enrichment Results */}
          {status === 'success' && result && (
            <div className='space-y-8 animate-in fade-in duration-500'>
              {/* Action Bar with Brand Recon */}
              <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                  <div className='flex flex-wrap items-center gap-4'>
                    <button
                      onClick={resetAll}
                      className='flex items-center gap-2 text-sm text-zinc-500 hover:text-orange-500 transition-colors'
                    >
                      <ArrowLeft className='w-4 h-4' />
                      Enrich another
                    </button>
                    {result.id && (
                      <Link
                        href={`/brand-recon/competitive?enrichmentJobId=${result.id}`}
                        className='flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-mono'
                      >
                        <Crosshair className='w-4 h-4 animate-pulse' />
                        <span>RUN COMPETITIVE INTEL</span>
                      </Link>
                    )}
                  </div>
                  <div className='flex flex-wrap items-center gap-3'>
                    <span className='px-2 py-1 text-[10px] tracking-widest border border-orange-500/30 text-orange-400 bg-orange-500/10'>
                      {CORTEX_DIRECTIVE_LABELS[directive]}
                    </span>
                    {result.id && (
                      <>
                        {archiveStatus === 'saved' && cortexId ? (
                          <Link
                            href={`/cortex/${cortexId}`}
                            className='flex items-center gap-2 px-4 py-2 border border-orange-500/60 text-orange-400 hover:text-white hover:bg-orange-500 transition-colors text-xs btn-glow'
                          >
                            <Archive className='w-4 h-4' />
                            OPEN DOSSIER
                          </Link>
                        ) : (
                          <button
                            onClick={handleArchiveClick}
                            disabled={archiveStatus === 'saving'}
                            className='flex items-center gap-2 px-4 py-2 border border-orange-500/60 text-orange-400 hover:text-white hover:bg-orange-500 transition-colors text-xs btn-glow disabled:opacity-50 disabled:cursor-not-allowed'
                          >
                            <Archive className='w-4 h-4' />
                            {archiveStatus === 'saving'
                              ? 'ARCHIVING...'
                              : 'ARCHIVE TO CORTEX'}
                          </button>
                        )}
                      </>
                    )}
                    {result.duration_ms && (
                      <span className='text-xs text-zinc-500'>
                        Completed in {(result.duration_ms / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                </div>

                {archiveError && (
                  <div className='flex items-center gap-3 p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-sm'>
                    <AlertCircle className='w-4 h-4' />
                    <span>{archiveError}</span>
                  </div>
                )}

                {/* Cross-Primitive CTAs - T-009 */}
                <CrossPrimitiveCTAs
                  context={{
                    companyName: result.company_name,
                    domain: result.domain,
                    website: result.company_website,
                    industry: result.company_industry,
                    description: result.company_description,
                  }}
                />
              </div>

              {/* Company Header */}
              <div className='relative border border-zinc-800 bg-zinc-900/30 p-6'>
                <div className='absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-orange-500' />
                <div className='absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-orange-500' />
                <div className='absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-orange-500' />
                <div className='absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-orange-500' />

                <div className='flex items-start gap-6'>
                  {result.company_logo ? (
                    <img
                      src={result.company_logo}
                      alt={result.company_name || 'Company'}
                      className='w-16 h-16 object-contain bg-white rounded p-2'
                    />
                  ) : (
                    <div className='w-16 h-16 bg-zinc-800 flex items-center justify-center'>
                      <Building2 className='w-8 h-8 text-zinc-600' />
                    </div>
                  )}
                  <div className='flex-1'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <h2 className='text-2xl font-bold text-zinc-100 mb-2'>
                          {result.company_name || result.domain || 'Unknown'}
                        </h2>
                        {result.company_description && (
                          <p className='text-sm text-zinc-400 mb-4 line-clamp-2'>
                            {result.company_description}
                          </p>
                        )}
                      </div>
                      {result.icp_fit_score !== undefined && (
                        <ICPScoreCard
                          score={result.icp_fit_score}
                          reasons={result.icp_fit_reasons || []}
                          isPersonalSite={
                            result.is_personal_site ||
                            result.agents?.customFields?.is_personal_site
                          }
                          compact
                        />
                      )}
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {result.company_industry && (
                        <span className='px-2 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs'>
                          {result.company_industry}
                        </span>
                      )}
                      {result.agents?.profile?.segment &&
                        result.agents.profile.segment !== 'Unknown' && (
                          <span className='px-2 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs'>
                            {result.agents.profile.segment}
                          </span>
                        )}
                      {result.company_size && (
                        <span className='px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs'>
                          {result.company_size}
                        </span>
                      )}
                      {result.funding_stage && (
                        <span className='px-2 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs'>
                          {result.funding_stage}
                        </span>
                      )}
                      {result.ceo_name && (
                        <span className='px-2 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs'>
                          CEO: {result.ceo_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Grid */}
              <div className='grid lg:grid-cols-2 gap-6'>
                {/* Left Column - Company Details */}
                <div className='space-y-6'>
                  {/* Basic Info */}
                  <div>
                    <div className='flex items-center gap-2 mb-4'>
                      <div className='w-1 h-4 bg-orange-500' />
                      <span className='text-xs uppercase tracking-widest text-zinc-500'>
                        Company Details
                      </span>
                    </div>
                    <div className='space-y-2'>
                      <InfoCard
                        icon={Globe}
                        label='Website'
                        value={result.company_website}
                        href={result.company_website}
                      />
                      <InfoCard
                        icon={MapPin}
                        label='Headquarters'
                        value={result.company_headquarters}
                      />
                      <InfoCard
                        icon={Calendar}
                        label='Founded'
                        value={result.company_founded}
                      />
                      <InfoCard
                        icon={Users}
                        label='Employees'
                        value={result.company_size}
                      />
                      <InfoCard
                        icon={Linkedin}
                        label='LinkedIn'
                        value={result.linkedin_url}
                        href={result.linkedin_url}
                      />
                      <InfoCard
                        icon={Twitter}
                        label='Twitter'
                        value={result.twitter_url}
                        href={result.twitter_url}
                      />
                    </div>
                  </div>

                  {/* Funding */}
                  <div>
                    <div className='flex items-center gap-2 mb-4'>
                      <div className='w-1 h-4 bg-orange-500' />
                      <span className='text-xs uppercase tracking-widest text-zinc-500'>
                        Funding
                      </span>
                    </div>
                    <div className='space-y-2'>
                      <InfoCard
                        icon={DollarSign}
                        label='Total Raised'
                        value={result.funding_total}
                      />
                      <InfoCard
                        icon={DollarSign}
                        label='Stage'
                        value={result.funding_stage}
                      />
                      {result.investors && result.investors.length > 0 && (
                        <div className='p-3 bg-zinc-900/50 border border-zinc-800'>
                          <p className='text-[10px] uppercase tracking-wider text-zinc-500 mb-2'>
                            Investors
                          </p>
                          <div className='flex flex-wrap gap-1'>
                            {result.investors.slice(0, 5).map((inv, i) => (
                              <span
                                key={i}
                                className='px-2 py-0.5 bg-zinc-800 text-zinc-300 text-xs rounded'
                              >
                                {inv}
                              </span>
                            ))}
                            {result.investors.length > 5 && (
                              <span className='px-2 py-0.5 text-zinc-500 text-xs'>
                                +{result.investors.length - 5}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tech Stack & Signals */}
                  {result.tech_signals && (
                    <TechSignals
                      signals={result.tech_signals}
                      technologies={result.tech_stack}
                    />
                  )}
                </div>

                {/* Right Column - Intelligence */}
                <div className='space-y-6'>
                  {/* ICP Score */}
                  {result.icp_fit_score !== undefined && (
                    <ICPScoreCard
                      score={result.icp_fit_score}
                      reasons={result.icp_fit_reasons || []}
                      isPersonalSite={
                        result.is_personal_site ||
                        result.agents?.customFields?.is_personal_site
                      }
                    />
                  )}

                  {/* Buying Signals */}
                  {result.buying_signals &&
                    result.buying_signals.length > 0 && (
                      <BuyingSignals signals={result.buying_signals} />
                    )}

                  {/* Key People */}
                  {result.key_people && result.key_people.length > 0 && (
                    <div className='border border-zinc-800 bg-zinc-900/50 p-6'>
                      <div className='flex items-center gap-3 mb-4'>
                        <div className='w-10 h-10 rounded bg-orange-500/10 flex items-center justify-center'>
                          <Users className='w-5 h-5 text-orange-500' />
                        </div>
                        <div>
                          <h3 className='text-sm font-bold text-zinc-100'>
                            Leadership
                          </h3>
                          <p className='text-xs text-zinc-500'>
                            {result.key_people.length} executives found
                          </p>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        {result.key_people.slice(0, 5).map((person, i) => (
                          <div
                            key={i}
                            className='flex items-center justify-between p-2 bg-zinc-900 rounded'
                          >
                            <div>
                              <p className='text-sm text-zinc-200'>
                                {person.name}
                              </p>
                              <p className='text-xs text-zinc-500'>
                                {person.title}
                              </p>
                            </div>
                            {person.linkedin && (
                              <a
                                href={person.linkedin}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-blue-400 hover:text-blue-300'
                              >
                                <Linkedin className='w-4 h-4' />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sources */}
                  {result.sources && result.sources.length > 0 && (
                    <SourceAttribution sources={result.sources} />
                  )}
                </div>
              </div>

              {/* Raw Data Toggle */}
              <div className='border border-zinc-800 rounded'>
                <button
                  onClick={() => setShowRawData(!showRawData)}
                  className='w-full flex items-center justify-between p-4 text-left hover:bg-zinc-900/50 transition-colors'
                >
                  <span className='text-sm text-zinc-400'>Raw Agent Data</span>
                  {showRawData ? (
                    <ChevronUp className='w-4 h-4 text-zinc-500' />
                  ) : (
                    <ChevronDown className='w-4 h-4 text-zinc-500' />
                  )}
                </button>
                {showRawData && (
                  <div className='p-4 border-t border-zinc-800 bg-zinc-900/30'>
                    <pre className='text-xs text-zinc-500 overflow-auto max-h-96'>
                      {JSON.stringify(result.agents, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bulk Enrichment: Field Mapping Step */}
          {bulkStep === 'mapping' && (
            <div className='space-y-6'>
              <button
                onClick={resetAll}
                className='flex items-center gap-2 text-sm text-zinc-500 hover:text-orange-500 transition-colors'
              >
                <ArrowLeft className='w-4 h-4' />
                Start over
              </button>
              <FieldMapper
                csvHeaders={csvHeaders}
                onMappingComplete={handleMappingComplete}
                onCancel={resetAll}
              />
            </div>
          )}

          {/* Bulk Enrichment: Processing & Results - Using new streaming BulkEnrichTable */}
          {bulkStep === 'processing' && bulkRows.length > 0 && (
            <div className='space-y-6'>
              <button
                onClick={resetAll}
                className='flex items-center gap-2 text-sm text-zinc-500 hover:text-orange-500 transition-colors'
              >
                <ArrowLeft className='w-4 h-4' />
                Start Over
              </button>

              <BulkEnrichTable
                rows={bulkRows}
                csvHeaders={csvHeaders}
                generateSynthesis={true}
                onComplete={(results) => {
                  const mapped: EnrichedRow[] = results.map(({row, state}) => ({
                    id: row.id,
                    status: state.status,
                    original: row.original,
                    enriched: state.enriched
                      ? {
                          company_name: state.enriched.company_name || row.company_name,
                          industry: state.enriched.industry || undefined,
                          segment: state.enriched.segment || undefined,
                          employee_count: state.enriched.employee_count || undefined,
                          headquarters: state.enriched.headquarters || undefined,
                          website: state.enriched.website || undefined,
                          funding_stage: state.enriched.funding_stage || undefined,
                          funding_total: state.enriched.funding_total || undefined,
                          technologies: state.enriched.technologies || undefined,
                          tech_signals: state.enriched.tech_signals || undefined,
                          leadership: state.enriched.leadership || undefined,
                          ceo_name: state.enriched.ceo_name || undefined,
                          icp_fit_score: state.enriched.icp_fit_score || undefined,
                          icp_fit_reasons: state.enriched.icp_fit_reasons || undefined,
                          buying_signals: state.enriched.buying_signals || undefined,
                          contact: state.enriched.contact || {
                            first_name: row.first_name ?? null,
                            last_name: row.last_name ?? null,
                            full_name:
                              row.first_name || row.last_name
                                ? `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim()
                                : null,
                            title: row.title ?? null,
                            email: row.email ?? null,
                          },
                          sources: state.enriched.sources || undefined,
                        }
                      : undefined,
                    error: state.error,
                  }))

                  setEnrichedRows(mapped)
                }}
              />
            </div>
          )}

      {showArchiveModal && (
        <>
          <div
            className='fixed inset-0 bg-black/60 z-50'
            onClick={() => setShowArchiveModal(false)}
          />
          <div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl px-4'>
            <div className='border border-orange-500/40 bg-zinc-950 p-6'>
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <div className='text-xs text-orange-500 tracking-widest mb-1'>
                    CORTEX ARCHIVE
                  </div>
                  <h3 className='text-lg font-bold text-zinc-100'>
                    Market Teardown: Confirm Competitors
                  </h3>
                  <p className='text-xs text-zinc-500 mt-1'>
                    Auto-discovered competitors. Edit before archiving.
                  </p>
                </div>
                <button
                  onClick={() => setShowArchiveModal(false)}
                  className='text-zinc-500 hover:text-zinc-200 transition-colors'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              {competitorsLoading ? (
                <div className='text-sm text-zinc-500'>Discovering competitors...</div>
              ) : (
                <div className='space-y-3'>
                  {competitors.length === 0 && (
                    <div className='text-sm text-zinc-500'>
                      No competitors found. Add manually to proceed.
                    </div>
                  )}
                  {competitors.map((comp, idx) => (
                    <div key={`${comp.domain}-${idx}`} className='flex gap-2'>
                      <input
                        aria-label={`Competitor ${idx + 1} name`}
                        value={comp.name}
                        onChange={(e) => {
                          const value = e.target.value
                          setArchiveError(null)
                          setCompetitors((prev) =>
                            prev.map((item, index) =>
                              index === idx ? {...item, name: value} : item
                            )
                          )
                        }}
                        placeholder='Competitor name'
                        className='flex-1 bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600'
                      />
                      <input
                        aria-label={`Competitor ${idx + 1} domain`}
                        value={comp.domain}
                        onChange={(e) => {
                          const value = e.target.value
                          setArchiveError(null)
                          setCompetitors((prev) =>
                            prev.map((item, index) =>
                              index === idx ? {...item, domain: value} : item
                            )
                          )
                        }}
                        placeholder='domain.com'
                        className='flex-1 bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600'
                      />
                      <button
                        type='button'
                        onClick={() =>
                          setCompetitors((prev) =>
                            prev.filter((_, index) => index !== idx)
                          )
                        }
                        className='px-3 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/40'
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <div className='flex gap-2'>
                    <input
                      aria-label='New competitor name'
                      value={competitorDraft.name}
                      onChange={(e) =>
                        setCompetitorDraft((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder='Competitor name'
                      className='flex-1 bg-zinc-900 border border-dashed border-zinc-700 px-3 py-2 text-xs text-zinc-400 placeholder:text-zinc-600'
                    />
                    <input
                      aria-label='New competitor domain'
                      value={competitorDraft.domain}
                      onChange={(e) =>
                        setCompetitorDraft((prev) => ({
                          ...prev,
                          domain: e.target.value,
                        }))
                      }
                      placeholder='domain.com'
                      className='flex-1 bg-zinc-900 border border-dashed border-zinc-700 px-3 py-2 text-xs text-zinc-400 placeholder:text-zinc-600'
                    />
                    <button
                      type='button'
                      onClick={() => {
                        const entry = toCompetitorEntry(competitorDraft)

                        if (!entry) {
                          setArchiveError('Competitor domain is required')
                          return
                        }

                        setCompetitors((prev) => [
                          ...prev,
                          entry,
                        ])
                        setArchiveError(null)
                        setCompetitorDraft({name: '', domain: ''})
                      }}
                      disabled={!competitorDraft.domain.trim()}
                      className='px-4 border border-orange-500/40 text-orange-400 text-xs hover:bg-orange-500 hover:text-white transition-colors'
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              <div className='mt-6 flex items-center justify-between'>
                <button
                  onClick={() => setShowArchiveModal(false)}
                  className='text-xs text-zinc-500 hover:text-zinc-200'
                >
                  Cancel
                </button>
                <button
                  onClick={() => archiveToCortex(competitors)}
                  disabled={archiveStatus === 'saving'}
                  className='flex items-center gap-2 px-4 py-2 border border-orange-500/60 text-orange-400 hover:bg-orange-500 hover:text-white transition-colors text-xs btn-glow disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Archive className='w-4 h-4' />
                  {archiveStatus === 'saving'
                    ? 'ARCHIVING...'
                    : 'ARCHIVE TO CORTEX'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* History Panel - T-008: Session continuity with batch history */}
      {showHistory && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 bg-black/50 z-40'
            onClick={() => {
              setHistoryFeedback(null)
              setShowHistory(false)
            }}
          />
          {/* Panel */}
          <div className='fixed top-0 right-0 h-full w-full max-w-md z-50 animate-in slide-in-from-right duration-300 bg-zinc-900'>
            <div className='h-full flex flex-col'>
              {/* Header */}
              <div className='flex items-center justify-between px-4 py-3 border-b border-zinc-800'>
                <span className='font-semibold'>Enrichment History</span>
                <button
                  onClick={() => {
                    setHistoryFeedback(null)
                    setShowHistory(false)
                  }}
                  className='p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              {/* Tab Switcher */}
              <div className='flex border-b border-zinc-800'>
                <button
                  onClick={() => {
                    setHistoryFeedback(null)
                    setHistoryTab('single')
                  }}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                    historyTab === 'single'
                      ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-500/5'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  Single Enrichments
                </button>
                <button
                  onClick={() => {
                    setHistoryFeedback(null)
                    setHistoryTab('batch')
                  }}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                    historyTab === 'batch'
                      ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-500/5'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  CSV Batches
                </button>
              </div>

              {loadingHistoryItem && (
                <div className='border-b border-zinc-800 px-4 py-3 text-xs text-zinc-500'>
                  Loading history...
                </div>
              )}

              {historyFeedback && (
                <div
                  role={historyFeedback.type === 'error' ? 'alert' : 'status'}
                  aria-live='polite'
                  className={`border-b px-4 py-3 text-sm ${
                    historyFeedback.type === 'error'
                      ? 'border-red-500/30 bg-red-500/10 text-red-300'
                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  }`}
                >
                  {historyFeedback.message}
                </div>
              )}

              {/* Tab Content */}
              <div className='flex-1 overflow-y-auto p-4'>
                {historyTab === 'single' ? (
                  <EnrichHistory
                    onSelect={handleHistorySelect}
                    onClose={() => {
                      setHistoryFeedback(null)
                      setShowHistory(false)
                    }}
                  />
                ) : (
                  <BatchHistory
                    onSelect={handleBatchSelect}
                    onExport={handleBatchExport}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </IntelPageChrome>
  )
}
