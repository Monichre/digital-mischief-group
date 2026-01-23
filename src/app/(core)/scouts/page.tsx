'use client'

import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import {Clock, Eye, MapPin, Plus, Trash2} from 'lucide-react'

import type {Scout} from '@/daedalus/scout/types'
import {ProGate} from '@/components/pro-gate'
import Button from '@/components/open-scouts/ui/button'
import {Skeleton} from '@/components/open-scouts/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/open-scouts/ui/dialog'
import {Connector} from '@/components/open-scouts/shared/layout/Connector'
import SymbolColored from '@/components/open-scouts/shared/icons/SymbolColored'

type ScoutWithCount = Scout & {result_count?: number}

export default function ScoutsPage() {
  const router = useRouter()
  const [scouts, setScouts] = useState<ScoutWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [scoutToDelete, setScoutToDelete] = useState<
    {id: string; name: string} | null
  >(null)
  const [form, setForm] = useState({name: '', search_query: ''})

  const loadScouts = async () => {
    setLoading(true)
    const res = await fetch('/api/scouts')
    const data = await res.json()
    setScouts(data.scouts || [])
    setLoading(false)
  }

  useEffect(() => {
    loadScouts()
  }, [])

  const createScout = async () => {
    if (!form.name || !form.search_query) return
    setCreating(true)
    const res = await fetch('/api/scouts', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(form),
    })
    setCreating(false)

    if (res.ok) {
      setForm({name: '', search_query: ''})
      setCreateDialogOpen(false)
      await loadScouts()
    }
  }

  const openDeleteDialog = (scout: ScoutWithCount, e: React.MouseEvent) => {
    e.stopPropagation()
    setScoutToDelete({id: scout.id, name: scout.name})
    setDeleteDialogOpen(true)
  }

  const confirmDeleteScout = async () => {
    if (!scoutToDelete) return
    await fetch(`/api/scouts/${scoutToDelete.id}`, {method: 'DELETE'})
    setDeleteDialogOpen(false)
    setScoutToDelete(null)
    await loadScouts()
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setScoutToDelete(null)
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

          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[24px] px-[24px]'>
            <div>
              <h1 className='text-title-h3 lg:text-title-h2 font-semibold text-accent-black'>
                Your Scouts
              </h1>
              <p className='text-body-large text-black-alpha-56 mt-[4px]'>
                Manage your AI scouts that continuously search and notify you
              </p>
            </div>
            <ProGate>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                size='large'
                className='flex items-center gap-[8px] shrink-0'
              >
                <Plus size={20} />
                New Scout
              </Button>
            </ProGate>
          </div>
        </div>

        <div className='py-[24px] lg:py-[32px] relative'>
          <div className='h-px bottom-0 absolute w-screen left-[calc(50%-50vw)] bg-border-faint' />

          <div className='flex items-center gap-[16px]'>
            <div className='w-[2px] h-[16px] bg-[color:var(--heat-100)]' />
            <div className='flex gap-[12px] items-center text-mono-x-small text-black-alpha-32 font-mono'>
              <Eye className='w-[14px] h-[14px]' />
              <span className='uppercase tracking-wider'>All Scouts</span>
              {scouts.length > 0 && (
                <>
                  <span>·</span>
                  <span className='text-heat-100'>{scouts.length} total</span>
                </>
              )}
            </div>
          </div>
        </div>

        <ProGate>
          <div className='pb-[64px]'>
            {loading ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]'>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className='bg-white rounded-[12px] border border-border-faint overflow-hidden'
                  >
                    <div className='p-[20px]'>
                      <div className='flex items-center gap-[12px] mb-[12px]'>
                        <Skeleton className='w-[10px] h-[10px] rounded-full' />
                        <Skeleton className='h-[20px] w-2/3' />
                      </div>
                      <Skeleton className='h-[14px] w-full mb-[8px]' />
                      <Skeleton className='h-[14px] w-3/4 mb-[16px]' />
                      <div className='flex items-center gap-[8px] mb-[8px]'>
                        <Skeleton className='w-[12px] h-[12px]' />
                        <Skeleton className='h-[12px] w-[80px]' />
                      </div>
                      <div className='flex items-center gap-[8px]'>
                        <Skeleton className='w-[12px] h-[12px]' />
                        <Skeleton className='h-[12px] w-[100px]' />
                      </div>
                    </div>
                    <div className='border-t border-border-faint px-[20px] py-[12px] bg-background-base'>
                      <div className='flex items-center justify-between'>
                        <Skeleton className='h-[12px] w-[80px]' />
                        <Skeleton className='h-[20px] w-[64px] rounded-[4px]' />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : scouts.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-[80px] text-center'>
                <SymbolColored className='w-[48px] h-auto mb-[24px] opacity-30' />
                <h2 className='text-title-h4 font-semibold text-accent-black mb-[8px]'>
                  No scouts yet
                </h2>
                <p className='text-body-large text-black-alpha-56 mb-[24px] max-w-[400px]'>
                  Create your first scout to start monitoring for updates
                </p>
                <Button onClick={() => setCreateDialogOpen(true)} size='large'>
                  <Plus size={20} className='mr-[8px]' />
                  Create Scout
                </Button>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]'>
                {scouts.map((scout) => (
                  <div
                    key={scout.id}
                    className='bg-white rounded-[12px] border border-border-faint hover:border-[color:var(--black-alpha-16)] hover:shadow-md transition-all cursor-pointer group flex flex-col overflow-hidden'
                    onClick={() => router.push(`/scouts/${scout.id}`)}
                  >
                    <div className='p-[20px] relative flex-1'>
                      <button
                        onClick={(e) => openDeleteDialog(scout, e)}
                        className='opacity-0 group-hover:opacity-100 p-[8px] hover:bg-[color:var(--black-alpha-4)] rounded-[6px] transition absolute top-[12px] right-[12px] cursor-pointer'
                        aria-label='Delete scout'
                      >
                        <Trash2 size={16} className='text-black-alpha-48' />
                      </button>

                      <div className='flex items-center gap-[10px] mb-[12px] pr-[32px]'>
                        <div
                          className={`w-[8px] h-[8px] rounded-full flex-shrink-0 ${
                            scout.is_active ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          title={scout.is_active ? 'Active' : 'Inactive'}
                        />
                        <h3 className='text-label-large font-semibold text-accent-black truncate'>
                          {scout.name || 'New Scout'}
                        </h3>
                      </div>

                      {scout.search_query && (
                        <p className='text-body-small text-black-alpha-56 mb-[16px] line-clamp-2'>
                          {scout.search_query}
                        </p>
                      )}

                      <div className='space-y-[6px]'>
                        {scout.last_run_at && (
                          <div className='flex items-center gap-[8px] text-mono-x-small font-mono text-black-alpha-40'>
                            <Clock className='w-[12px] h-[12px]' />
                            <span>
                              Last run:{' '}
                              {new Date(scout.last_run_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {scout.notification_email && (
                          <div className='flex items-center gap-[8px] text-mono-x-small font-mono text-black-alpha-40'>
                            <MapPin className='w-[12px] h-[12px]' />
                            <span>{scout.notification_email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='border-t border-border-faint px-[20px] py-[12px] bg-background-base'>
                      <div className='flex items-center justify-between'>
                        <span className='text-mono-x-small font-mono text-black-alpha-32'>
                          {new Date(scout.created_at).toLocaleDateString()}
                        </span>
                        {scout.schedule && (
                          <span className='text-mono-x-small font-mono text-heat-100 bg-[color:rgba(250,93,25,0.1)] px-[8px] py-[4px] rounded-[4px] capitalize'>
                            {scout.schedule.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ProGate>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className='p-[24px]'>
          <DialogHeader>
            <DialogTitle>Create Scout</DialogTitle>
            <DialogDescription className='mt-[8px]'>
              Give your scout a name and define what it should monitor.
            </DialogDescription>
          </DialogHeader>
          <div className='mt-[16px] space-y-[12px]'>
            <div>
              <label className='text-body-medium text-accent-black'>
                Scout Name
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({...prev, name: e.target.value}))
                }
                placeholder='Competitor Pricing Monitor'
                className='mt-[6px] w-full px-[12px] py-[10px] rounded-[8px] border border-border-muted bg-white text-body-input text-accent-black placeholder:text-black-alpha-48 focus:outline-none focus:ring-2 focus:ring-[color:rgba(250,93,25,0.2)] focus:border-[color:var(--heat-100)]'
              />
            </div>
            <div>
              <label className='text-body-medium text-accent-black'>
                Search Query
              </label>
              <input
                value={form.search_query}
                onChange={(e) =>
                  setForm((prev) => ({...prev, search_query: e.target.value}))
                }
                placeholder="'acme corp' pricing OR plans"
                className='mt-[6px] w-full px-[12px] py-[10px] rounded-[8px] border border-border-muted bg-white text-body-input text-accent-black placeholder:text-black-alpha-48 focus:outline-none focus:ring-2 focus:ring-[color:rgba(250,93,25,0.2)] focus:border-[color:var(--heat-100)]'
              />
            </div>
          </div>
          <div className='flex flex-row gap-[12px] justify-end mt-[24px]'>
            <Button variant='secondary' onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={createScout}
              disabled={creating || !form.name || !form.search_query}
            >
              {creating ? 'Creating...' : 'Create Scout'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className='p-[24px]'>
          <DialogHeader>
            <DialogTitle>Delete Scout</DialogTitle>
            <DialogDescription className='mt-[8px]'>
              Are you sure you want to delete &quot;{scoutToDelete?.name}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-row gap-[12px] justify-end mt-[24px]'>
            <Button variant='secondary' onClick={cancelDelete}>
              Cancel
            </Button>
            <Button onClick={confirmDeleteScout} variant='destructive'>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
