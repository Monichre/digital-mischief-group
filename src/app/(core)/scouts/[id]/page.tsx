'use client'

import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useParams, useRouter} from 'next/navigation'
import {
  CheckCircle2,
  Eye,
  Loader2,
  Menu,
  Play,
  Settings,
  Trash2,
  XCircle,
} from 'lucide-react'

import type {Scout, ScoutResult} from '@/daedalus/scout/types'
import Button from '@/components/open-scouts/ui/button'
import {Skeleton} from '@/components/open-scouts/ui/skeleton'
import {Switch} from '@/components/open-scouts/ui/switch'
import Tooltip from '@/components/open-scouts/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/open-scouts/ui/dialog'
import {Connector} from '@/components/open-scouts/shared/layout/Connector'
import SymbolColored from '@/components/open-scouts/shared/icons/SymbolColored'
import {CrossPrimitiveCTAs} from '@/components/cross-primitive-ctas/CrossPrimitiveCTAs'

type ScoutRun = {
  id: string
  scout_id: string
  status: 'running' | 'completed' | 'failed'
  created_at: string
  completed_at: string | null
  search_results_count: number
  new_results_count: number
  analysis_duration_ms: number | null
  error_message?: string | null
}

export default function ScoutDetailPage() {
  const params = useParams()
  const router = useRouter()
  const scoutId = params.id as string

  const [scout, setScout] = useState<Scout | null>(null)
  const [results, setResults] = useState<ScoutResult[]>([])
  const [runs, setRuns] = useState<ScoutRun[]>([])
  const [loading, setLoading] = useState(true)
  const [showNotFound, setShowNotFound] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [togglingActive, setTogglingActive] = useState(false)
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    search_query: '',
  })

  const eventSourceRef = useRef<EventSource | null>(null)

  const loadScout = useCallback(async () => {
    if (!scoutId) return
    const res = await fetch(`/api/scouts/${scoutId}`)
    if (!res.ok) {
      setScout(null)
      setResults([])
      return
    }
    const data = await res.json()
    setScout(data.scout || null)
    setResults(data.results || [])
  }, [scoutId])

  const loadRuns = useCallback(async () => {
    if (!scoutId) return
    const res = await fetch(`/api/scouts/${scoutId}/runs`)
    if (!res.ok) {
      setRuns([])
      return
    }
    const data = await res.json()
    setRuns(data.runs || [])
  }, [scoutId])

  useEffect(() => {
    if (!scoutId) return
    const load = async () => {
      setLoading(true)
      await Promise.all([loadScout(), loadRuns()])
      setLoading(false)
    }
    load()
  }, [loadRuns, loadScout, scoutId])

  useEffect(() => {
    if (!scout) return
    setSettingsForm({
      name: scout.name || '',
      search_query: scout.search_query || '',
    })
  }, [scout])

  const triggerExecution = useCallback(() => {
    if (!scoutId || triggering) return
    setTriggering(true)

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    const eventSource = new EventSource(`/api/scouts/${scoutId}/run/stream`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data)
      if (payload.type === 'complete') {
        eventSource.close()
        eventSourceRef.current = null
        setTriggering(false)
        loadRuns()
        loadScout()
      }
      if (payload.type === 'error') {
        eventSource.close()
        eventSourceRef.current = null
        setTriggering(false)
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
      eventSourceRef.current = null
      setTriggering(false)
    }
  }, [loadRuns, loadScout, scoutId, triggering])

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [])

  const toggleScoutActive = async () => {
    if (!scout || togglingActive) return
    setTogglingActive(true)
    const res = await fetch(`/api/scouts/${scoutId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({is_active: !scout.is_active}),
    })

    if (res.ok) {
      await loadScout()
    }
    setTogglingActive(false)
  }

  const saveSettings = async () => {
    if (!scoutId) return
    const res = await fetch(`/api/scouts/${scoutId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(settingsForm),
    })

    if (res.ok) {
      await loadScout()
      setSettingsDialogOpen(false)
    }
  }

  const clearExecutions = async () => {
    if (!scoutId) return
    const res = await fetch(`/api/scouts/${scoutId}/runs`, {
      method: 'DELETE',
    })

    if (res.ok) {
      setClearDialogOpen(false)
      await Promise.all([loadRuns(), loadScout()])
    }
  }

  const filteredRuns = useMemo(() => {
    return showNotFound ? runs : runs.filter((run) => run.new_results_count > 0)
  }, [runs, showNotFound])

  const primaryResultUrl = useMemo(() => results[0]?.url, [results])
  const inferredDomain = useMemo(() => {
    if (!primaryResultUrl) return undefined
    try {
      return new URL(primaryResultUrl).hostname
    } catch {
      return undefined
    }
  }, [primaryResultUrl])

  const hasRunningExecution = runs.some((run) => run.status === 'running')
  const isInRunningState = triggering || hasRunningExecution
  const isButtonDisabled = triggering || hasRunningExecution

  if (loading) {
    return (
      <div className='min-h-screen bg-background-base'>
        <div className='h-px w-full bg-border-faint' />

        <div className='relative mx-auto max-w-[1112px] px-[16px]'>
          <Connector className='absolute -top-[10px] -left-[10.5px]' />
          <Connector className='absolute -top-[10px] -right-[10.5px]' />

          <div className='py-[48px] lg:py-[64px] relative'>
            <div className='h-px bottom-0 absolute w-screen left-[calc(50%-50vw)] bg-border-faint' />
            <Connector className='absolute -bottom-[10px] -left-[10.5px]' />
            <Connector className='absolute -bottom-[10px] -right-[10.5px]' />

            <div className='flex flex-col items-center gap-[24px]'>
              <Skeleton className='h-[36px] w-[320px] rounded-[8px]' />
              <Skeleton className='h-[20px] w-[480px] rounded-[6px]' />
              <div className='flex items-center gap-[16px] mt-[16px]'>
                <Skeleton className='h-[32px] w-[100px] rounded-[8px]' />
                <Skeleton className='h-[32px] w-[140px] rounded-[8px]' />
                <Skeleton className='h-[32px] w-[32px] rounded-[8px]' />
              </div>
            </div>
          </div>

          <div className='py-[48px]'>
            <div className='max-w-[800px] mx-auto space-y-[32px]'>
              {[...Array(2)].map((_, i) => (
                <div key={i} className='space-y-[16px]'>
                  <div className='flex items-center gap-[16px]'>
                    <Skeleton className='h-[16px] w-[200px] rounded-[4px]' />
                    <div className='flex-1 h-px bg-border-faint' />
                    <Skeleton className='h-[32px] w-[80px] rounded-[6px]' />
                  </div>
                  <Skeleton className='h-[24px] w-3/4 rounded-[4px]' />
                  <Skeleton className='h-[16px] w-full rounded-[4px]' />
                  <Skeleton className='h-[16px] w-5/6 rounded-[4px]' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!scout) {
    return (
      <div className='min-h-screen bg-background-base'>
        <div className='h-px w-full bg-border-faint' />
        <div className='relative mx-auto max-w-[1112px] px-[16px] py-[160px]'>
          <Connector className='absolute -top-[10px] -left-[10.5px]' />
          <Connector className='absolute -top-[10px] -right-[10.5px]' />

          <div className='flex flex-col items-center justify-center text-center'>
            <SymbolColored className='w-[64px] h-auto mb-[32px] opacity-30' />
            <h2 className='text-title-h4 font-semibold text-accent-black mb-[12px]'>
              Scout not found
            </h2>
            <p className='text-body-large text-black-alpha-56 mb-[32px] max-w-[400px]'>
              The scout you are looking for does not exist or has been deleted.
            </p>
            <Button onClick={() => router.push('/scouts')}>Go to Scouts</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background-base'>
      <div className='h-px w-full bg-border-faint' />

      <div className='relative mx-auto max-w-[1112px] px-[16px]'>
        <Connector className='absolute -top-[10px] -left-[10.5px]' />
        <Connector className='absolute -top-[10px] -right-[10.5px]' />

        <div className='py-[48px] lg:py-[64px] relative'>
          <div className='h-px bottom-0 absolute w-screen left-[calc(50%-50vw)] bg-border-faint' />
          <Connector className='absolute -bottom-[10px] -left-[10.5px]' />
          <Connector className='absolute -bottom-[10px] -right-[10.5px]' />

          <div className='flex flex-col items-center'>
            <div className='relative mb-[12px]'>
              <button
                onClick={toggleScoutActive}
                disabled={togglingActive}
                className={`relative w-[36px] h-[20px] rounded-full transition-colors duration-200 cursor-pointer ${
                  scout.is_active ? 'bg-[color:var(--heat-100)]' : 'bg-gray-300'
                } ${togglingActive ? 'opacity-70 cursor-wait' : ''}`}
              >
                <div
                  className={`absolute top-[2px] w-[16px] h-[16px] bg-white rounded-full shadow transition-transform duration-200 flex items-center justify-center ${
                    scout.is_active ? 'translate-x-[18px]' : 'translate-x-[2px]'
                  }`}
                >
                  {togglingActive && (
                    <div className='w-[10px] h-[10px] border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin' />
                  )}
                </div>
              </button>
              <Tooltip
                description={
                  scout.is_active
                    ? 'Scout is active - click to disable'
                    : 'Scout is inactive - click to enable'
                }
              />
            </div>

            <h1 className='text-title-h3 lg:text-title-h2 font-semibold text-accent-black text-center mb-[12px]'>
              {scout.name || 'Scout Executions'}
            </h1>

            {scout.search_query && (
              <p className='text-body-large text-black-alpha-56 text-center max-w-[600px] mb-[24px]'>
                {scout.search_query}
              </p>
            )}

            <div className='w-full max-w-[780px] mb-[24px] border border-border-faint rounded-[8px] p-[12px] bg-white'>
              <div className='text-mono-x-small uppercase tracking-wider text-black-alpha-48 mb-[10px]'>
                Quick Actions
              </div>
              <CrossPrimitiveCTAs
                context={{
                  companyName: scout.name,
                  domain: inferredDomain,
                  website: primaryResultUrl,
                  description: scout.search_query,
                }}
              />
            </div>

            <div className='flex items-center justify-center gap-[16px] lg:gap-[24px] flex-wrap'>
              <div className='hidden sm:flex items-center gap-[12px]'>
                <div className='flex items-center gap-[8px]'>
                  <Switch
                    id='show-not-found'
                    checked={showNotFound}
                    onCheckedChange={setShowNotFound}
                    size='sm'
                  />
                  <label
                    htmlFor='show-not-found'
                    className='text-mono-x-small font-mono text-black-alpha-48 cursor-pointer'
                  >
                    Show Not Found
                  </label>
                </div>
              </div>

              <div className='w-px h-[16px] bg-border-faint hidden sm:block' />

              <div className='hidden sm:flex items-center gap-[8px]'>
                <Button
                  onClick={triggerExecution}
                  disabled={isButtonDisabled}
                  isLoading={isInRunningState}
                  loadingLabel='Running Scout'
                >
                  {!isInRunningState && <Play className='w-[16px] h-[16px]' />}
                  Run Now
                </Button>

                <Button
                  onClick={() => setClearDialogOpen(true)}
                  variant='secondary'
                  disabled={runs.length === 0}
                >
                  <Trash2 className='w-[16px] h-[16px]' />
                </Button>

                <Button
                  onClick={() => setSettingsDialogOpen(true)}
                  variant='secondary'
                >
                  <Settings className='w-[16px] h-[16px]' />
                </Button>
              </div>

              <div className='flex sm:hidden items-center gap-[8px]'>
                <Button
                  onClick={triggerExecution}
                  disabled={isButtonDisabled}
                  isLoading={isInRunningState}
                  loadingLabel='Running'
                >
                  {!isInRunningState && <Play className='w-[16px] h-[16px]' />}
                  Run Now
                </Button>

                <Button
                  onClick={() => setMobileMenuOpen(true)}
                  variant='secondary'
                >
                  <Menu className='w-[16px] h-[16px]' />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className='py-[24px] lg:py-[32px] relative'>
          <div className='h-px bottom-0 absolute w-screen left-[calc(50%-50vw)] bg-border-faint' />

          <div className='flex items-center gap-[16px]'>
            <div className='w-[2px] h-[16px] bg-[color:var(--heat-100)]' />
            <div className='flex gap-[12px] items-center text-mono-x-small text-black-alpha-32 font-mono'>
              <Eye className='w-[14px] h-[14px]' />
              <span className='uppercase tracking-wider'>Execution History</span>
              {filteredRuns.length > 0 && (
                <>
                  <span>·</span>
                  <span className='text-heat-100'>
                    {filteredRuns.length} runs
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className='pb-[64px] pt-[20px]'>
          {filteredRuns.length === 0 ? (
            <div className='flex items-center justify-center py-[80px]'>
              <div className='text-center'>
                <div className='w-[48px] h-[48px] rounded-full bg-black-alpha-4 flex items-center justify-center mx-auto mb-[24px]'>
                  <Eye className='w-[24px] h-[24px] text-black-alpha-32' />
                </div>
                <p className='text-body-large font-medium text-accent-black mb-[8px]'>
                  No executions yet
                </p>
                <p className='text-body-medium text-black-alpha-56 max-w-[320px]'>
                  Click "Run Now" to execute this scout manually, or wait for it
                  to run automatically based on its schedule.
                </p>
              </div>
            </div>
          ) : (
            <div className='max-w-[800px] mx-auto'>
              {filteredRuns.map((run, index) => {
                const isNotFound = run.new_results_count === 0
                return (
                  <div key={run.id} className='py-[24px] first:pt-0 px-[10px]'>
                    <div className='flex items-center gap-[12px] sm:gap-[16px] mb-[20px]'>
                      <div className='flex items-center gap-[8px] text-mono-x-small font-mono text-black-alpha-48 whitespace-nowrap'>
                        {run.status === 'running' && (
                          <Loader2 className='animate-spin text-heat-100 w-[14px] h-[14px]' />
                        )}
                        {run.status === 'completed' && (
                          <CheckCircle2
                            className={`w-[14px] h-[14px] ${
                              isNotFound ? 'text-red-500' : 'text-green-500'
                            }`}
                          />
                        )}
                        {run.status === 'failed' && (
                          <XCircle className='text-red-500 w-[14px] h-[14px]' />
                        )}
                        <span className='uppercase tracking-wider'>
                          {new Date(run.created_at).toLocaleDateString()} ·{' '}
                          {new Date(run.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className='flex-1 h-px min-w-[16px] bg-[color:var(--heat-100)]' />
                      <Button
                        variant='primary'
                        onClick={() => setSelectedRunId(run.id)}
                        className={
                          index === 0 &&
                          filteredRuns.length === 1 &&
                          run.status === 'running'
                            ? 'animate-bounce'
                            : ''
                        }
                      >
                        <Eye className='w-[14px] h-[14px]' />
                        <span className='hidden sm:inline'>Inspect</span>
                      </Button>
                    </div>

                    {run.status === 'completed' && (
                      <div className='mb-[20px] p-[16px] bg-[color:rgba(250,93,25,0.05)] border-l-2 border-[color:var(--heat-100)] rounded-r-[6px]'>
                        <p className='text-body-medium font-medium text-accent-black leading-relaxed'>
                          {run.new_results_count > 0
                            ? `Found ${run.new_results_count} new results from ${run.search_results_count} scanned sources.`
                            : 'No new results found for this run.'}
                        </p>
                      </div>
                    )}

                    <div className='mb-[24px]'>
                      {run.status === 'running' ? (
                        <div className='text-black-alpha-48 italic'>
                          Execution in progress...
                        </div>
                      ) : results.length > 0 ? (
                        <div className='space-y-[12px]'>
                          {results.slice(0, 3).map((result) => (
                            <div
                              key={result.id}
                              className='border border-border-faint rounded-[8px] p-[12px] bg-white'
                            >
                              <div className='flex items-start justify-between gap-[12px]'>
                                <div>
                                  <p className='text-body-medium font-medium text-accent-black'>
                                    {result.title || result.url}
                                  </p>
                                  {result.snippet && (
                                    <p className='text-body-small text-black-alpha-56 mt-[6px] line-clamp-2'>
                                      {result.snippet}
                                    </p>
                                  )}
                                  <a
                                    href={result.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-body-small text-heat-100 hover:underline mt-[8px] inline-block'
                                  >
                                    View source
                                  </a>
                                </div>
                                <span className='text-mono-x-small font-mono text-black-alpha-32 uppercase'>
                                  {result.source || 'source'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='text-black-alpha-48 italic'>
                          No results available
                        </div>
                      )}

                      {run.error_message && (
                        <div className='bg-red-50 border border-red-200 rounded-[6px] p-[16px] mt-[20px]'>
                          <p className='font-medium text-red-900 mb-[4px]'>Error</p>
                          <p className='text-red-700 text-body-small'>
                            {run.error_message}
                          </p>
                        </div>
                      )}

                      <div className='mt-[20px] text-mono-x-small font-mono text-black-alpha-32 flex items-center gap-[12px]'>
                        {run.completed_at && (
                          <span>
                            Completed in{' '}
                            {(
                              (new Date(run.completed_at).getTime() -
                                new Date(run.created_at).getTime()) /
                              1000
                            ).toFixed(0)}
                            s
                          </span>
                        )}
                        {!run.completed_at && run.status !== 'running' && (
                          <span>Stopped</span>
                        )}
                      </div>
                    </div>

                    {index < filteredRuns.length - 1 && (
                      <div className='border-t border-border-faint' />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent className='sm:hidden p-[24px]'>
          <DialogHeader>
            <DialogTitle>Scout Controls</DialogTitle>
          </DialogHeader>
          <div className='space-y-[16px] py-[16px]'>
            <div className='flex items-center justify-between'>
              <label className='text-body-medium font-medium text-accent-black'>
                Show Not Found
              </label>
              <Switch
                id='show-not-found-mobile'
                checked={showNotFound}
                onCheckedChange={setShowNotFound}
              />
            </div>

            <Button
              onClick={() => {
                setMobileMenuOpen(false)
                setClearDialogOpen(true)
              }}
              variant='secondary'
              className='w-full'
              disabled={runs.length === 0}
            >
              <Trash2 className='w-[16px] h-[16px]' />
              Clear Executions
            </Button>

            <Button
              onClick={() => {
                setMobileMenuOpen(false)
                setSettingsDialogOpen(true)
              }}
              variant='secondary'
              className='w-full'
            >
              <Settings className='w-[16px] h-[16px]' />
              Scout Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className='p-[24px]'>
          <DialogHeader>
            <DialogTitle>Clear All Executions</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all executions for &quot;
              {scout.name}&quot;? This will permanently delete all execution
              history and results.
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-row gap-[12px] justify-end mt-[16px]'>
            <Button variant='secondary' onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={clearExecutions} variant='destructive'>
              Yes, Clear All
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className='p-[24px]'>
          <DialogHeader>
            <DialogTitle>Scout Settings</DialogTitle>
            <DialogDescription className='mt-[8px]'>
              Update your scout configuration.
            </DialogDescription>
          </DialogHeader>
          <div className='mt-[16px] space-y-[12px]'>
            <div>
              <label className='text-body-medium text-accent-black'>
                Scout Name
              </label>
              <input
                value={settingsForm.name}
                onChange={(e) =>
                  setSettingsForm((prev) => ({...prev, name: e.target.value}))
                }
                className='mt-[6px] w-full px-[12px] py-[10px] rounded-[8px] border border-border-muted bg-white text-body-input text-accent-black placeholder:text-black-alpha-48 focus:outline-none focus:ring-2 focus:ring-[color:rgba(250,93,25,0.2)] focus:border-[color:var(--heat-100)]'
              />
            </div>
            <div>
              <label className='text-body-medium text-accent-black'>
                Search Query
              </label>
              <input
                value={settingsForm.search_query}
                onChange={(e) =>
                  setSettingsForm((prev) => ({
                    ...prev,
                    search_query: e.target.value,
                  }))
                }
                className='mt-[6px] w-full px-[12px] py-[10px] rounded-[8px] border border-border-muted bg-white text-body-input text-accent-black placeholder:text-black-alpha-48 focus:outline-none focus:ring-2 focus:ring-[color:rgba(250,93,25,0.2)] focus:border-[color:var(--heat-100)]'
              />
            </div>
          </div>
          <div className='flex flex-row gap-[12px] justify-end mt-[24px]'>
            <Button
              variant='secondary'
              onClick={() => setSettingsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveSettings}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={selectedRunId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedRunId(null)
        }}
      >
        <DialogContent className='!max-w-[95vw] !w-[95vw] !h-[90vh] overflow-hidden flex flex-col bg-background-base p-[16px] sm:p-[24px]'>
          <DialogHeader className='mb-[16px] sm:mb-[20px]'>
            <DialogTitle className='text-body-large sm:text-title-h5 text-accent-black'>
              Live Execution
            </DialogTitle>
            <DialogDescription className='text-mono-x-small sm:text-body-small text-black-alpha-48'>
              Review execution metadata and recent findings
            </DialogDescription>
          </DialogHeader>
          <div className='flex-1 overflow-hidden flex flex-col md:flex-row gap-[16px] md:gap-[24px] relative'>
            <div className='hidden md:flex md:w-[30%] flex-col overflow-hidden bg-white rounded-[8px] border border-border-faint relative'>
              <Connector className='absolute -top-[10px] -left-[10.5px] z-10' />
              <Connector className='absolute -top-[10px] -right-[10.5px] z-10' />

              <div className='px-[16px] py-[12px] border-b border-border-faint bg-background-base shrink-0'>
                <div className='flex items-center gap-[12px]'>
                  <div className='w-[2px] h-[16px] bg-[color:var(--heat-100)] shrink-0' />
                  <div className='flex items-center gap-[8px] text-mono-x-small font-mono text-black-alpha-32'>
                    <Eye className='w-[14px] h-[14px]' />
                    <span className='uppercase tracking-wider'>Execution Metadata</span>
                  </div>
                </div>
              </div>

              <div className='flex-1 overflow-y-auto p-[16px] space-y-[12px]'>
                {selectedRunId ? (
                  <pre className='text-mono-x-small bg-accent-black p-[12px] rounded-[6px] overflow-x-hidden whitespace-pre-wrap break-words font-mono text-white/80'>
                    {JSON.stringify(
                      runs.find((run) => run.id === selectedRunId),
                      null,
                      2
                    )}
                  </pre>
                ) : (
                  <div className='flex flex-col items-center justify-center py-[32px] text-center'>
                    <SymbolColored className='w-[24px] h-auto mb-[12px] opacity-30' />
                    <p className='text-body-small text-black-alpha-48'>
                      Waiting for metadata...
                    </p>
                  </div>
                )}
              </div>

              <Connector className='absolute -bottom-[10px] -left-[10.5px] z-10' />
              <Connector className='absolute -bottom-[10px] -right-[10.5px] z-10' />
            </div>

            <div className='w-full md:w-[70%] overflow-hidden flex-1'>
              <div className='bg-white rounded-[12px] border border-border-faint p-[20px] h-full overflow-y-auto'>
                <div className='flex items-center justify-between mb-[16px]'>
                  <div>
                    <h3 className='text-label-large font-semibold text-accent-black'>
                      Recent Results
                    </h3>
                    <p className='text-body-small text-black-alpha-56'>
                      Latest findings for this scout
                    </p>
                  </div>
                  <span className='text-mono-x-small font-mono text-black-alpha-32'>
                    {results.length} total
                  </span>
                </div>

                {results.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-[64px] text-center'>
                    <SymbolColored className='w-[32px] h-auto mb-[12px] opacity-30' />
                    <p className='text-body-small text-black-alpha-48'>
                      No results available yet.
                    </p>
                  </div>
                ) : (
                  <div className='space-y-[12px]'>
                    {results.map((result) => (
                      <div
                        key={result.id}
                        className='border border-border-faint rounded-[8px] p-[12px]'
                      >
                        <div className='flex items-start justify-between gap-[12px]'>
                          <div>
                            <p className='text-body-medium font-medium text-accent-black'>
                              {result.title || result.url}
                            </p>
                            {result.snippet && (
                              <p className='text-body-small text-black-alpha-56 mt-[6px] line-clamp-2'>
                                {result.snippet}
                              </p>
                            )}
                            <a
                              href={result.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-body-small text-heat-100 hover:underline mt-[8px] inline-block'
                            >
                              View source
                            </a>
                          </div>
                          <span className='text-mono-x-small font-mono text-black-alpha-32 uppercase'>
                            {result.source || 'source'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
