'use client'

import {useCallback, useEffect, useState} from 'react'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {Clock, Eye, MapPin, Plus, Trash2, ArrowLeft, ExternalLink} from 'lucide-react'

import type {Scout} from '@/daedalus/scout/types'
import {ProGate} from '@/components/pro-gate'
import {Button} from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {Skeleton} from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {AuthLinks} from '@/components/AuthLinks'
import {authClient} from '@/platform/auth/client'
import {useProStatus} from '@/hooks/use-pro-status'
import {getApiErrorMessage, normalizeOptionalEmail} from '@/lib/core-flow-ux'

type ScoutWithCount = Scout & {result_count?: number}

export default function ScoutsPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('query') || ''
  const [scouts, setScouts] = useState<ScoutWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scoutToDelete, setScoutToDelete] = useState<
    {id: string; name: string} | null
  >(null)
  const [form, setForm] = useState({
    name: initialQuery ? 'Workspace sentinel' : '',
    search_query: initialQuery,
    schedule: 'daily' as string,
    notification_email: '',
  })
  const {data: session, isPending: sessionPending} = authClient.useSession()
  const {isPro, isLoading: proLoading} = useProStatus()

  const gateReady = !sessionPending && !proLoading
  const canCreateScout = Boolean(session?.user && isPro)

  useEffect(() => {
    if (initialQuery && gateReady && canCreateScout) {
      setCreateDialogOpen(true)
    }
  }, [canCreateScout, gateReady, initialQuery])

  const loadScouts = useCallback(async () => {
    setLoading(true)

    try {
      setError(null)

      const res = await fetch('/api/scouts')
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, 'Failed to load scouts'))
      }

      setScouts(data?.scouts || [])
    } catch (err) {
      setScouts([])
      setError(err instanceof Error ? err.message : 'Failed to load scouts')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadScouts()
  }, [loadScouts])

  const createScout = async () => {
    const trimmedName = form.name.trim()
    const trimmedSearchQuery = form.search_query.trim()

    if (!trimmedName) {
      setError('Scout name is required')
      return
    }

    if (!trimmedSearchQuery) {
      setError('Search query is required')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const res = await fetch('/api/scouts', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: trimmedName,
          search_query: trimmedSearchQuery,
          schedule: form.schedule,
          notification_email: normalizeOptionalEmail(form.notification_email),
        }),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, 'Failed to create scout'))
      }

      setForm({
        name: '',
        search_query: '',
        schedule: 'daily',
        notification_email: '',
      })
      setCreateDialogOpen(false)
      await loadScouts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create scout')
    } finally {
      setCreating(false)
    }
  }

  const openDeleteDialog = (scout: ScoutWithCount, e: React.MouseEvent) => {
    e.stopPropagation()
    setError(null)
    setScoutToDelete({id: scout.id, name: scout.name})
    setDeleteDialogOpen(true)
  }

  const confirmDeleteScout = async () => {
    if (!scoutToDelete) return

    setDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/scouts/${scoutToDelete.id}`, {
        method: 'DELETE',
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, 'Failed to delete scout'))
      }

      setDeleteDialogOpen(false)
      setScoutToDelete(null)
      await loadScouts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete scout')
    } finally {
      setDeleting(false)
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setScoutToDelete(null)
  }

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-200 font-mono relative overflow-hidden'>
      <style jsx global>{`
        .open-scouts > nav,
        .dmg-menu-toggle {
          display: none !important;
        }
      `}</style>

      <header className='border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40'>
        <div className='max-w-6xl mx-auto px-6 h-16 flex items-center justify-between'>
          <Link
            href='/'
            className='flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            <span>Back to HQ</span>
          </Link>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1 text-orange-500'>
              <span className='text-zinc-600'>{'<'}</span>
              <Eye className='w-4 h-4' />
              <span className='font-bold'>[ SCOUT ]</span>
              <span className='text-zinc-600'>{'>'}</span>
            </div>
            <AuthLinks
              linkClassName='text-[10px] text-zinc-500 hover:text-white transition-colors'
              ctaClassName='px-2.5 py-1 border border-zinc-700 text-[10px] text-zinc-400 hover:border-orange-500/60 hover:text-orange-500 transition-colors'
            />
          </div>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-6 py-12'>
        <div className='text-center mb-12'>
          <div className='inline-flex items-center gap-2 px-3 py-1 border border-zinc-800 text-xs text-zinc-500 mb-6'>
            <Eye className='w-3 h-3 text-orange-500' />
            <span>// ACTIVE RECONNAISSANCE</span>
          </div>
          <h1 className='text-4xl md:text-5xl font-black mb-4'>
            Web <span className='text-orange-500'>Scouts</span>
          </h1>
          <p className='text-zinc-500 max-w-xl mx-auto'>
            Deploy AI scouts to continuously search the web for new findings.
            Get notified when relevant content appears.
          </p>
        </div>

        <div className='mb-8 flex min-h-10 justify-end'>
          {gateReady && canCreateScout ? (
            <Button
              onClick={() => {
                setError(null)
                setCreateDialogOpen(true)
              }}
              className='bg-orange-500 hover:bg-orange-600 text-black font-bold'
            >
              <Plus className='w-4 h-4 mr-2' />
              New Scout
            </Button>
          ) : null}
        </div>

        {error && (
          <div
            id='scouts-error'
            role='alert'
            aria-live='polite'
            className='mb-6 border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300'
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className='border border-zinc-800 bg-zinc-900/30 p-4'
              >
                <div className='flex items-center gap-3 mb-3'>
                  <Skeleton className='w-2.5 h-2.5 rounded-full' />
                  <Skeleton className='h-5 w-2/3' />
                </div>
                <Skeleton className='h-4 w-full mb-2' />
                <Skeleton className='h-4 w-3/4 mb-4' />
                <Skeleton className='h-3 w-1/2' />
              </div>
            ))}
          </div>
        ) : scouts.length === 0 ? (
          <Empty className='dmg-surface min-h-[360px] border-zinc-800/80 bg-zinc-900/35'>
            <EmptyHeader>
              <EmptyMedia variant='icon' className='bg-zinc-900 text-orange-500'>
                <Eye className='w-6 h-6' />
              </EmptyMedia>
              <EmptyTitle className='font-mono text-zinc-100'>
                No scouts deployed yet
              </EmptyTitle>
              <EmptyDescription className='font-sans text-zinc-500'>
                Create your first scout to continuously search the web for fresh findings.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {gateReady ? (
                canCreateScout ? (
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className='bg-orange-500 hover:bg-orange-600 text-black font-bold'
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Create Scout
                  </Button>
                ) : (
                  <ProGate>
                    <span className='hidden' />
                  </ProGate>
                )
              ) : (
                <Skeleton className='h-10 w-48 bg-zinc-800' />
              )}
            </EmptyContent>
          </Empty>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {scouts.map((scout) => (
              <div
                key={scout.id}
                className='border border-zinc-800 bg-zinc-900/30 p-4 relative group hover:border-zinc-700 transition-colors'
              >
                <div className='absolute top-0 left-0 w-2 h-2 border-t border-l border-orange-500/50' />
                <div className='absolute bottom-0 right-0 w-2 h-2 border-b border-r border-orange-500/50' />

                <div className='flex items-center gap-2 absolute top-3 right-3'>
                  <Link
                    href={`/scouts/${scout.id}`}
                    className='opacity-0 group-hover:opacity-100 p-1.5 hover:bg-zinc-800 rounded transition cursor-pointer text-zinc-400 hover:text-orange-500'
                    aria-label='View scout'
                  >
                    <ExternalLink size={14} />
                  </Link>
                  <button
                    onClick={(e) => openDeleteDialog(scout, e)}
                    className='opacity-0 group-hover:opacity-100 p-1.5 hover:bg-zinc-800 rounded transition cursor-pointer'
                    aria-label='Delete scout'
                  >
                    <Trash2 size={14} className='text-zinc-500 hover:text-red-400' />
                  </button>
                </div>

                <div
                  className={`w-2 h-2 rounded-full mb-3 ${
                    scout.is_active ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  title={scout.is_active ? 'Active' : 'Inactive'}
                />

                <h3 className='font-bold text-lg mb-2 pr-16 truncate'>
                  {scout.name || 'New Scout'}
                </h3>

                {scout.search_query && (
                  <p className='text-sm text-zinc-500 mb-4 line-clamp-2'>
                    {scout.search_query}
                  </p>
                )}

                <div className='space-y-2 text-xs text-zinc-600'>
                  {scout.last_run_at && (
                    <div className='flex items-center gap-2'>
                      <Clock className='w-3 h-3' />
                      <span>
                        Last run:{' '}
                        {new Date(scout.last_run_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {scout.notification_email && (
                    <div className='flex items-center gap-2'>
                      <MapPin className='w-3 h-3' />
                      <span>{scout.notification_email}</span>
                    </div>
                  )}
                </div>

                <div className='border-t border-zinc-800 mt-4 pt-3 flex items-center justify-between'>
                  <span className='text-xs text-zinc-600'>
                    {new Date(scout.created_at).toLocaleDateString()}
                  </span>
                  <div className='flex items-center gap-2'>
                    {scout.schedule && (
                      <span className='text-xs font-mono text-orange-500 bg-orange-500/10 px-2 py-1 rounded capitalize'>
                        {scout.schedule.replace('_', ' ')}
                      </span>
                    )}
                    <Link href={`/scouts/${scout.id}`}>
                      <Button size='sm' variant='outline' className='h-7 text-xs'>
                        <ExternalLink className='w-3 h-3 mr-1' />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className='bg-zinc-900 border-zinc-800 text-zinc-200 p-6'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold'>Create Scout</DialogTitle>
            <DialogDescription className='text-zinc-400 mt-1'>
              Give your scout a name and define what it should search for.
            </DialogDescription>
          </DialogHeader>
          <div className='mt-4 space-y-4'>
            <div>
              <label
                htmlFor='scout-name'
                className='text-sm text-zinc-400 mb-1 block'
              >
                Scout Name
              </label>
              <input
                id='scout-name'
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({...prev, name: e.target.value}))
                }
                placeholder='Competitor Pricing Monitor'
                aria-describedby={error ? 'scouts-error' : undefined}
                disabled={creating}
                className='w-full px-3 py-2 rounded-md border border-zinc-700 bg-zinc-950 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500'
              />
            </div>
            <div>
              <label
                htmlFor='scout-query'
                className='text-sm text-zinc-400 mb-1 block'
              >
                Search Query
              </label>
              <input
                id='scout-query'
                value={form.search_query}
                onChange={(e) =>
                  setForm((prev) => ({...prev, search_query: e.target.value}))
                }
                placeholder="'acme corp' pricing OR plans"
                aria-describedby={error ? 'scouts-error' : undefined}
                disabled={creating}
                className='w-full px-3 py-2 rounded-md border border-zinc-700 bg-zinc-950 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500'
              />
            </div>
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <label
                htmlFor='scout-schedule'
                className='text-sm text-zinc-400 mb-1 block'
              >
                Schedule
              </label>
              <select
                id='scout-schedule'
                value={form.schedule}
                onChange={(e) =>
                  setForm((prev) => ({...prev, schedule: e.target.value}))
                }
                disabled={creating}
                className='w-full px-3 py-2 rounded-md border border-zinc-700 bg-zinc-950 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500'
              >
                <option value='manual'>Manual</option>
                <option value='hourly'>Hourly</option>
                <option value='daily'>Daily</option>
                <option value='weekly'>Weekly</option>
              </select>
            </div>
            <div>
              <label
                htmlFor='scout-email'
                className='text-sm text-zinc-400 mb-1 block'
              >
                Alert Email (optional)
              </label>
              <input
                id='scout-email'
                type='email'
                value={form.notification_email}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    notification_email: e.target.value,
                  }))
                }
                placeholder='ops@dmg.io'
                aria-describedby={error ? 'scouts-error' : undefined}
                disabled={creating}
                className='w-full px-3 py-2 rounded-md border border-zinc-700 bg-zinc-950 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500'
              />
            </div>
          </div>
          <div className='flex gap-3 justify-end mt-6'>
            <Button
              variant='outline'
              onClick={() => {
                setCreateDialogOpen(false)
                setError(null)
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={createScout}
              disabled={
                creating || !form.name.trim() || !form.search_query.trim()
              }
              className='bg-orange-500 hover:bg-orange-600 text-black font-bold'
            >
              {creating ? 'Creating...' : 'Create Scout'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className='bg-zinc-900 border-zinc-800 text-zinc-200 p-6'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold'>Delete Scout</DialogTitle>
            <DialogDescription className='text-zinc-400 mt-1'>
              Are you sure you want to delete "{scoutToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className='flex gap-3 justify-end mt-6'>
            <Button variant='outline' onClick={cancelDelete} disabled={deleting}>
              Cancel
            </Button>
            <Button onClick={confirmDeleteScout} variant='destructive' disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
