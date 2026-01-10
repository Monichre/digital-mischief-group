'use client'

import {useState, useEffect, use} from 'react'
import Link from 'next/link'
import {ArrowLeft, Clock, Shield} from 'lucide-react'
import {LiveSentinelRunner} from '@/components/scouts/LiveSentinelRunner'
import type {Scout} from '@/lib/scouts/types'

export default function ScoutDetailPage({
  params,
}: {
  params: Promise<{id: string}>
}) {
  const {id} = use(params)
  const [scout, setScout] = useState<Scout | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const res = await fetch(`/api/scouts/${id}`)
    const data = await res.json()
    setScout(data.scout)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center'>
        <div className='text-zinc-500'>Loading...</div>
      </div>
    )
  }

  if (!scout) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center'>
        <div className='text-red-400'>Sentinel not found</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <header className='border-b border-zinc-900 bg-zinc-950/90 backdrop-blur sticky top-0 z-40'>
        <div className='max-w-6xl mx-auto px-6 h-16 flex items-center justify-between'>
          <Link
            href='/scouts'
            className='flex items-center gap-2 text-zinc-500 hover:text-zinc-200 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            <span>Back to Sentinels</span>
          </Link>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-6 py-12 space-y-8'>
        <div className='border border-zinc-900 bg-zinc-900/50 p-6 rounded relative overflow-hidden'>
          <div className='absolute inset-0 pointer-events-none bg-gradient-to-r from-orange-500/5 via-transparent to-cyan-500/5' />
          <div className='flex items-center gap-3 mb-3'>
            <Shield className='w-4 h-4 text-orange-400' />
            <span className='text-[11px] tracking-[0.25em] text-orange-400'>SENTINEL ACTIVE</span>
          </div>
          <h1 className='text-3xl font-bold text-white mb-2'>{scout.name}</h1>
          <p className='text-zinc-400'>{scout.search_query}</p>
          {scout.last_run_at && (
            <p className='text-sm text-zinc-500 mt-2 flex items-center gap-1'>
              <Clock className='w-4 h-4' />
              Last run: {new Date(scout.last_run_at).toLocaleString()}
            </p>
          )}
          <p className='text-sm text-zinc-500 mt-3'>This view auto-runs the sentinel. Use the control panel to restart if you need fresh telemetry.</p>
        </div>

        <LiveSentinelRunner
          scoutId={id}
          scoutName={scout.name}
          onComplete={fetchData}
          autoRun
        />
      </main>
    </div>
  )
}
