'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Archive,
  ArrowRight,
  Plus,
  Search,
  Shield,
} from 'lucide-react'
import {
  CORTEX_DIRECTIVE_LABELS,
  type CortexDirective,
} from '@/lib/cortex-directives'
import {AuthLinks} from '@/components/AuthLinks'

type CortexDossierRow = {
  id: string
  target_name: string | null
  target_identifier: string | null
  directive: CortexDirective
  summary: string | null
  logo_url: string | null
  created_at: string
}

export default function CortexPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [dossiers, setDossiers] = useState<CortexDossierRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true
    const timer = setTimeout(() => {
      const run = async () => {
        setLoading(true)
        setError(null)
        try {
          const url = query.trim()
            ? `/api/cortex?q=${encodeURIComponent(query.trim())}`
            : '/api/cortex'
          const res = await fetch(url)
          if (res.status === 401) {
            window.location.href = '/sign-in'
            return
          }
          if (!res.ok) {
            throw new Error('Failed to load Cortex dossiers')
          }
          const data = await res.json()
          if (isActive) setDossiers(data.dossiers || [])
        } catch (err) {
          if (isActive) {
            setError(err instanceof Error ? err.message : 'Failed to load dossiers')
          }
        } finally {
          if (isActive) setLoading(false)
        }
      }
      run()
    }, 250)

    return () => {
      isActive = false
      clearTimeout(timer)
    }
  }, [query])

  const hasResults = dossiers.length > 0
  const emptyMessage = query.trim()
    ? 'No dossiers match this query.'
    : 'No dossiers archived yet.'

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-200 font-mono'>
      {/* Background grid */}
      <div className='fixed inset-0 pointer-events-none z-0'>
        <div className='absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem]' />
      </div>

      <nav className='fixed top-0 w-full border-b border-white/10 bg-zinc-950/90 backdrop-blur-md z-50'>
        <div className='max-w-6xl mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Shield className='w-4 h-4 text-orange-500' />
            <span className='text-sm tracking-widest text-zinc-400'>
              CORTEX // INTELLIGENCE VAULT
            </span>
          </div>
          <div className='flex items-center gap-4'>
            <AuthLinks
              linkClassName='text-[10px] text-zinc-500 hover:text-white transition-colors'
              ctaClassName='px-2.5 py-1 border border-zinc-700 text-[10px] text-zinc-400 hover:border-orange-500/60 hover:text-orange-500 transition-colors'
            />
            <Link
              href='/enrich'
              className='flex items-center gap-2 px-4 py-2 border border-orange-500/50 text-orange-500 text-xs hover:bg-orange-500 hover:text-white transition-colors'
            >
              <Plus className='w-3 h-3' />
              <span>[ + NEW INTEL ]</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className='relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20'>
        <div className='mb-10'>
          <div className='flex items-center gap-2 text-xs text-zinc-500 mb-4'>
            <Archive className='w-4 h-4 text-orange-500' />
            <span>CLASSIFIED ARCHIVE</span>
          </div>
          <h1 className='text-3xl md:text-4xl font-black text-zinc-100'>
            The Vault
          </h1>
          <p className='text-zinc-500 mt-2 max-w-2xl'>
            Search and retrieve every target dossier you have ever archived in
            Daedalus.
          </p>
        </div>

        <div className='mb-8'>
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500' />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search targets, keywords, or signals...'
              className='w-full bg-zinc-900/80 border border-zinc-800 pl-12 pr-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-orange-500/50 outline-none'
            />
          </div>
        </div>

        {loading && (
          <div className='text-sm text-zinc-500'>Loading dossiers...</div>
        )}

        {error && (
          <div className='border border-red-500/30 bg-red-500/10 text-red-400 p-4 text-sm'>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className='space-y-4'>
            {!hasResults && (
              <div className='border border-dashed border-zinc-800 p-10 text-center text-zinc-500'>
                {emptyMessage}
              </div>
            )}

            {dossiers.map((dossier) => (
              <div
                key={dossier.id}
                className='border border-zinc-800 bg-zinc-900/40 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4'
              >
                <div className='flex items-start gap-4'>
                  <div className='w-12 h-12 bg-zinc-800 border border-zinc-700 flex items-center justify-center'>
                    {dossier.logo_url ? (
                      <img
                        src={dossier.logo_url}
                        alt={dossier.target_name || 'Target'}
                        className='w-10 h-10 object-contain'
                      />
                    ) : (
                      <Archive className='w-5 h-5 text-zinc-500' />
                    )}
                  </div>
                  <div>
                    <div className='flex items-center gap-3 flex-wrap'>
                      <h2 className='text-lg font-bold text-zinc-100'>
                        {dossier.target_name || dossier.target_identifier || 'Unknown target'}
                      </h2>
                      <span className='px-2 py-1 text-[10px] tracking-widest border border-orange-500/40 text-orange-400 bg-orange-500/10'>
                        {CORTEX_DIRECTIVE_LABELS[dossier.directive]}
                      </span>
                    </div>
                    {dossier.target_identifier && (
                      <p className='text-xs text-zinc-500 mt-1'>
                        {dossier.target_identifier}
                      </p>
                    )}
                    {dossier.summary && (
                      <p className='text-sm text-zinc-400 mt-2 line-clamp-2'>
                        {dossier.summary}
                      </p>
                    )}
                  </div>
                </div>
                <Link
                  href={`/cortex/${dossier.id}`}
                  className='inline-flex items-center gap-2 px-4 py-2 border border-zinc-700 text-xs text-zinc-300 hover:border-orange-500/50 hover:text-orange-500 transition-colors'
                >
                  OPEN DOSSIER
                  <ArrowRight className='w-3 h-3' />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
