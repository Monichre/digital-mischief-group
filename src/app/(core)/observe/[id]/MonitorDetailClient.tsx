'use client'

import {useCallback, useEffect, useState} from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Crosshair,
  Mail,
  RefreshCw,
} from 'lucide-react'
import {Button} from '@/components/ui/button'
import type {Monitor, MonitorChange} from '@/daedalus/scout/types'
import {AuthLinks} from '@/components/AuthLinks'
import {
  getApiErrorMessage,
  normalizeMonitorDetailResponse,
} from '@/lib/core-flow-ux'

export default function MonitorDetailClient({id}: {id: string}) {
  const [monitor, setMonitor] = useState<Monitor | null>(null)
  const [changes, setChanges] = useState<MonitorChange[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const fetchData = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true)
    }

    try {
      setError(null)

      const res = await fetch(`/api/monitors/${id}`)
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, 'Failed to load recon target'))
      }

      const normalized = normalizeMonitorDetailResponse<Monitor, MonitorChange>(
        data
      )

      setMonitor(normalized.monitor)
      setChanges(normalized.changes)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load recon target'
      )
    } finally {
      if (showSpinner) {
        setLoading(false)
      }
    }
  }, [id])

  useEffect(() => {
    void fetchData(true)
  }, [fetchData])

  const checkNow = async () => {
    setChecking(true)
    setError(null)
    setStatusMessage(null)

    try {
      const res = await fetch(`/api/monitors/${id}/check`, {method: 'POST'})
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, 'Failed to check recon target'))
      }

      await fetchData()
      setStatusMessage('Recon target checked successfully.')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to check recon target'
      )
    } finally {
      setChecking(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500'>
        Loading...
      </div>
    )
  }

  if (!monitor) {
    return (
      <div className='min-h-screen bg-zinc-950 px-6 text-zinc-200'>
        <div className='mx-auto flex min-h-screen max-w-xl items-center justify-center'>
          <div className='w-full border border-zinc-800 bg-zinc-900/40 p-6'>
            <div className='mb-4 flex items-center gap-2 text-orange-500'>
              <Crosshair className='h-4 w-4' />
              <span className='text-xs tracking-[0.2em]'>{'// RECON TARGET'}</span>
            </div>
            <h1 className='mb-2 text-xl font-bold text-zinc-100'>
              {error?.toLowerCase().includes('not found')
                ? 'Target not found'
                : 'Unable to load recon target'}
            </h1>
            <p
              role='alert'
              aria-live='polite'
              className='mb-6 text-sm text-zinc-400'
            >
              {error || 'This recon target is unavailable.'}
            </p>
            <div className='flex flex-wrap gap-3'>
              <Link href='/observe'>
                <Button variant='outline'>Back to Recon</Button>
              </Link>
              {!error?.toLowerCase().includes('not found') && (
                <Button
                  onClick={() => void fetchData(true)}
                  aria-label='Retry loading recon target'
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-200 font-mono'>
      <header className='border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40'>
        <div className='max-w-6xl mx-auto px-6 h-16 flex items-center justify-between'>
          <Link
            href='/observe'
            className='flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            <span>Back to Recon</span>
          </Link>
          <div className='flex items-center gap-3'>
            <Button
              onClick={checkNow}
              disabled={checking}
              className='bg-orange-500 hover:bg-orange-600 text-black font-bold'
            >
              {checking ? (
                'Checking...'
              ) : (
                <>
                  <RefreshCw className='w-4 h-4 mr-2' />
                  Check Now
                </>
              )}
            </Button>
            <AuthLinks
              linkClassName='text-[10px] text-zinc-500 hover:text-white transition-colors'
              ctaClassName='px-2.5 py-1 border border-zinc-700 text-[10px] text-zinc-400 hover:border-orange-500/60 hover:text-orange-500 transition-colors'
            />
          </div>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-6 py-12'>
        <div className='mb-8'>
          <div className='flex items-center gap-2 text-orange-500 text-sm mb-2'>
            <Crosshair className='w-4 h-4' />
            <span>{'// RECON TARGET'}</span>
          </div>
          <h1 className='text-3xl font-black mb-2'>{monitor.name}</h1>
          <a
            href={monitor.url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-zinc-500 hover:text-orange-500'
          >
            {monitor.url}
          </a>
          {monitor.last_checked_at && (
            <p className='text-xs text-zinc-600 mt-2 flex items-center gap-1'>
              <Clock className='w-3 h-3' />
              Last checked: {new Date(monitor.last_checked_at).toLocaleString()}
            </p>
          )}
          {monitor.notification_email && (
            <p className='text-xs text-zinc-600 mt-2 flex items-center gap-1'>
              <Mail className='w-3 h-3' />
              Alerts: {monitor.notification_email}
            </p>
          )}
        </div>

        {(error || statusMessage) && (
          <div
            role={error ? 'alert' : 'status'}
            aria-live='polite'
            className={`mb-6 border px-4 py-3 text-sm ${
              error
                ? 'border-red-500/40 bg-red-500/10 text-red-300'
                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
            }`}
          >
            {error ?? statusMessage}
          </div>
        )}

        <h2 className='text-lg font-bold mb-4 text-orange-500'>
          {'// CHANGE HISTORY'} ({changes.length})
        </h2>

        {changes.length === 0 ? (
          <div className='text-center py-12 border border-dashed border-zinc-800'>
            <p className='text-zinc-500'>No changes detected yet.</p>
            <p className='text-zinc-600 text-sm'>
              Check the target to establish a baseline.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {changes.map((change) => (
              <div
                key={change.id}
                className='border border-zinc-800 bg-zinc-900/30 p-4'
              >
                <div className='flex items-center gap-2 text-xs text-zinc-600 mb-3'>
                  <Clock className='w-3 h-3' />
                  {new Date(change.created_at).toLocaleString()}
                </div>

                {change.ai_summary && (
                  <div className='bg-orange-500/10 border border-orange-500/30 p-3 mb-4'>
                    <p className='text-sm text-orange-200'>
                      {change.ai_summary}
                    </p>
                  </div>
                )}

                <div className='grid md:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-xs text-zinc-500 mb-1'>BEFORE</p>
                    <div className='bg-zinc-900 p-3 text-sm text-zinc-400 max-h-32 overflow-auto'>
                      {change.old_excerpt || 'N/A'}
                    </div>
                  </div>
                  <div className='flex items-center gap-4'>
                    <ArrowRight className='w-4 h-4 text-orange-500 hidden md:block' />
                    <div className='flex-1'>
                      <p className='text-xs text-zinc-500 mb-1'>AFTER</p>
                      <div className='bg-zinc-900 p-3 text-sm text-zinc-400 max-h-32 overflow-auto'>
                        {change.new_excerpt || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
