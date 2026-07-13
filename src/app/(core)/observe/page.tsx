'use client'

import {useCallback, useEffect, useState} from 'react'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {
  Plus,
  Crosshair,
  RefreshCw,
  Trash2,
  ExternalLink,
  Clock,
  AlertCircle,
  Mail,
} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import type {Monitor} from '@/daedalus/observe/types'
import {BotProtection} from '@/components/effects'
import {IntelPageChrome} from '@/components/military/IntelPageChrome'
import {getApiErrorMessage, normalizeOptionalEmail} from '@/lib/core-flow-ux'

export default function ObservePage() {
  const searchParams = useSearchParams()
  const initialUrl = searchParams.get('url') || ''
  const [monitors, setMonitors] = useState<
    (Monitor & {change_count: number})[]
  >([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(Boolean(initialUrl))
  const [creating, setCreating] = useState(false)
  const [checkingId, setCheckingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: initialUrl ? 'Workspace target' : '',
    url: initialUrl,
    notification_email: '',
  })

  const fetchMonitors = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setLoading(true)
    }

    try {
      setError(null)

      const res = await fetch('/api/monitors')
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, 'Failed to load recon targets'))
      }

      setMonitors(data?.monitors || [])
    } catch (err) {
      setMonitors([])
      setError(
        err instanceof Error ? err.message : 'Failed to load recon targets'
      )
    } finally {
      if (showSpinner) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void fetchMonitors(true)
  }, [fetchMonitors])

  const createMonitor = async () => {
    const trimmedName = form.name.trim()
    const trimmedUrl = form.url.trim()

    if (!trimmedName) {
      setError('Target name is required')
      return
    }

    if (!trimmedUrl) {
      setError('URL to monitor is required')
      return
    }

    setCreating(true)
    setError(null)
    setStatusMessage(null)

    try {
      const res = await fetch('/api/monitors', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: trimmedName,
          url: trimmedUrl,
          notification_email: normalizeOptionalEmail(form.notification_email),
        }),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, 'Failed to create target'))
      }

      setForm({name: '', url: '', notification_email: ''})
      setShowCreate(false)
      await fetchMonitors()
      setStatusMessage(`Recon target "${trimmedName}" deployed.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create target')
    } finally {
      setCreating(false)
    }
  }

  const checkMonitor = async (id: string) => {
    setCheckingId(id)
    setError(null)
    setStatusMessage(null)

    try {
      const res = await fetch(`/api/monitors/${id}/check`, {method: 'POST'})
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, 'Failed to check target'))
      }

      await fetchMonitors()
      setStatusMessage('Recon target checked successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check target')
    } finally {
      setCheckingId(null)
    }
  }

  const deleteMonitor = async (id: string) => {
    if (!confirm('Delete this recon target?')) return

    const targetName = monitors.find((monitor) => monitor.id === id)?.name ?? 'target'

    setDeletingId(id)
    setError(null)
    setStatusMessage(null)

    try {
      const res = await fetch(`/api/monitors/${id}`, {method: 'DELETE'})
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, 'Failed to delete target'))
      }

      await fetchMonitors()
      setStatusMessage(`Recon target "${targetName}" removed.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete target')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <IntelPageChrome
      badge={
        <div className='flex items-center gap-1 text-orange-500'>
          <span className='text-zinc-600'>{'<'}</span>
          <Crosshair className='w-4 h-4' />
          <span className='font-bold text-zinc-100'>[ RECON ]</span>
          <span className='text-zinc-600'>{'>'}</span>
        </div>
      }
      eyebrow={
        <>
          <Crosshair className='w-3 h-3 text-orange-500' />
          <span>{'// CHANGE DETECTION'}</span>
        </>
      }
      title={
        <>
          Perimeter <span className='text-orange-500'>Watch</span>
        </>
      }
      description='Deploy recon targets to monitor websites for changes. Get AI-powered summaries when content updates.'
    >
      <div
        className='absolute left-0 right-0 top-0 pointer-events-none opacity-45'
        style={{
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, transparent 100%)',
        }}
      >
        <BotProtection />
      </div>

      <div className='flex justify-end mb-8'>
        <Button
          onClick={() => {
            setShowCreate((prev) => !prev)
            setStatusMessage(null)
          }}
          className='bg-orange-500 hover:bg-orange-600 text-black font-bold'
        >
          <Plus className='w-4 h-4 mr-2' />
          New Target
        </Button>
      </div>

      {(error || statusMessage) && (
        <div
          role={error ? 'alert' : 'status'}
          aria-live='polite'
          className={`mb-6 border px-4 py-3 text-sm font-mono ${
            error
              ? 'border-red-500/40 bg-red-500/10 text-red-300'
              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
          }`}
        >
          {error ?? statusMessage}
        </div>
      )}

      {showCreate && (
        <div className='border border-zinc-800 bg-zinc-900/50 p-6 mb-8 relative'>
          <div className='absolute top-0 left-0 w-3 h-3 border-t border-l border-orange-500' />
          <div className='absolute top-0 right-0 w-3 h-3 border-t border-r border-orange-500' />
          <div className='absolute bottom-0 left-0 w-3 h-3 border-b border-l border-orange-500' />
          <div className='absolute bottom-0 right-0 w-3 h-3 border-b border-r border-orange-500' />

          <h3 className='text-lg font-bold mb-4 text-orange-500'>
            {'// DEPLOY RECON TARGET'}
          </h3>
          <div className='grid md:grid-cols-2 gap-4 mb-4'>
            <div>
              <label
                htmlFor='observe-target-name'
                className='text-xs text-zinc-500 mb-1 block'
              >
                Target Name
              </label>
              <Input
                id='observe-target-name'
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                placeholder='e.g., Competitor Pricing Page'
                disabled={creating}
                className='bg-zinc-900 border-zinc-700'
              />
            </div>
            <div>
              <label
                htmlFor='observe-target-url'
                className='text-xs text-zinc-500 mb-1 block'
              >
                URL to Monitor
              </label>
              <Input
                id='observe-target-url'
                value={form.url}
                onChange={(e) => setForm({...form, url: e.target.value})}
                placeholder='https://example.com/pricing'
                disabled={creating}
                className='bg-zinc-900 border-zinc-700'
              />
            </div>
          </div>

          <div className='mb-4'>
            <label
              htmlFor='observe-target-email'
              className='text-xs text-zinc-500 mb-1 block'
            >
              Alert Email (optional)
            </label>
            <Input
              id='observe-target-email'
              type='email'
              value={form.notification_email}
              onChange={(e) =>
                setForm({...form, notification_email: e.target.value})
              }
              placeholder='ops@dmg.io'
              disabled={creating}
              className='bg-zinc-900 border-zinc-700'
            />
          </div>

          <div className='flex gap-4'>
            <Button
              onClick={createMonitor}
              disabled={
                creating || !form.name.trim() || !form.url.trim()
              }
              className='bg-orange-500 hover:bg-orange-600 text-black font-bold'
            >
              {creating ? 'Deploying...' : 'Deploy Target'}
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                setShowCreate(false)
                setError(null)
              }}
              disabled={creating}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className='text-center py-12 text-zinc-500'>Loading targets...</div>
      ) : monitors.length === 0 ? (
        <Empty className='dmg-surface min-h-[260px] border-zinc-800/80 bg-zinc-900/35'>
          <EmptyHeader>
            <EmptyMedia variant='icon' className='bg-zinc-900 text-orange-500'>
              <Crosshair className='w-6 h-6' />
            </EmptyMedia>
            <EmptyTitle className='font-mono text-zinc-100'>
              No recon targets deployed yet
            </EmptyTitle>
            <EmptyDescription className='font-sans text-zinc-500'>
              Deploy your first target to start tracking changes and receive AI summaries.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className='space-y-4'>
          {monitors.map((monitor) => (
            <div
              key={monitor.id}
              className='border border-zinc-800 bg-zinc-900/30 p-4 relative group hover:border-zinc-700 transition-colors'
            >
              <div className='absolute top-0 left-0 w-2 h-2 border-t border-l border-orange-500/50' />
              <div className='absolute bottom-0 right-0 w-2 h-2 border-b border-r border-orange-500/50' />

              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <h3 className='font-bold text-lg'>{monitor.name}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs ${
                        monitor.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-zinc-700 text-zinc-400'
                      }`}
                    >
                      {monitor.is_active ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </div>
                  <a
                    href={monitor.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-sm text-zinc-500 hover:text-orange-500 flex items-center gap-1'
                  >
                    {monitor.url}
                    <ExternalLink className='w-3 h-3' />
                  </a>
                  <div className='flex flex-wrap items-center gap-4 text-xs text-zinc-600 mt-2'>
                    <span className='flex items-center gap-1'>
                      <AlertCircle className='w-3 h-3' />
                      {monitor.change_count} changes detected
                    </span>
                    {monitor.last_checked_at && (
                      <span className='flex items-center gap-1'>
                        <Clock className='w-3 h-3' />
                        Checked: {new Date(monitor.last_checked_at).toLocaleDateString()}
                      </span>
                    )}
                    {monitor.notification_email && (
                      <span className='flex items-center gap-1'>
                        <Mail className='w-3 h-3' />
                        Alerts: {monitor.notification_email}
                      </span>
                    )}
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => checkMonitor(monitor.id)}
                    disabled={checkingId === monitor.id}
                    className='border-orange-500/50 text-orange-500 hover:bg-orange-500/10'
                  >
                    {checkingId === monitor.id ? (
                      <span className='animate-pulse'>Checking...</span>
                    ) : (
                      <>
                        <RefreshCw className='w-3 h-3 mr-1' />
                        Check
                      </>
                    )}
                  </Button>
                  <Link href={`/observe/${monitor.id}`}>
                    <Button size='sm' variant='outline'>
                      <ExternalLink className='w-3 h-3 mr-1' />
                      View
                    </Button>
                  </Link>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => deleteMonitor(monitor.id)}
                    disabled={deletingId === monitor.id}
                    className='text-red-500 hover:text-red-400 hover:bg-red-500/10'
                  >
                    <Trash2 className='w-3 h-3' />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </IntelPageChrome>
  )
}
