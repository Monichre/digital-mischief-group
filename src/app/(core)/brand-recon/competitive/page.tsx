'use client'

import {useState} from 'react'
import Link from 'next/link'
import {ArrowLeft, Crosshair} from 'lucide-react'
import {BrandReconDashboard} from '@/components/brand-recon/BrandReconDashboard'

export default function CompetitiveIntelPage() {
  const [enrichmentJobId, setEnrichmentJobId] = useState('')
  const [showDashboard, setShowDashboard] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (enrichmentJobId.trim()) {
      setShowDashboard(true)
    }
  }

  return (
    <div className='min-h-screen bg-black p-8'>
      <div className='max-w-7xl mx-auto space-y-8'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <Link
            href='/enrich'
            className='flex items-center gap-2 text-zinc-500 hover:text-orange-500 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            <span className='text-sm'>Back to Enrich</span>
          </Link>

          <div className='flex items-center gap-3'>
            <Crosshair className='w-6 h-6 text-red-500 animate-pulse' />
            <h1 className='text-2xl font-bold text-zinc-100 font-mono tracking-wider'>
              COMPETITIVE INTELLIGENCE SYSTEM
            </h1>
          </div>
        </div>

        {!showDashboard ? (
          // Input Form
          <div className='border border-zinc-800 bg-zinc-900/50 p-12'>
            <div className='max-w-2xl mx-auto space-y-6'>
              <div className='text-center space-y-3'>
                <Crosshair className='w-16 h-16 text-orange-500 mx-auto' />
                <h2 className='text-xl font-bold text-zinc-100 font-mono'>
                  INITIATE COMPETITIVE ANALYSIS
                </h2>
                <p className='text-sm text-zinc-500 font-mono'>
                  Enter enrichment job ID to begin tactical intelligence
                  gathering
                </p>
              </div>

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label className='block text-xs font-mono text-zinc-500 mb-2'>
                    ENRICHMENT JOB ID
                  </label>
                  <input
                    type='text'
                    value={enrichmentJobId}
                    onChange={(e) => setEnrichmentJobId(e.target.value)}
                    placeholder='Enter enrichment job UUID...'
                    className='w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono text-sm focus:outline-none focus:border-orange-500 transition-colors'
                    required
                  />
                </div>

                <button
                  type='submit'
                  className='w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-black font-mono font-bold text-sm transition-colors'
                >
                  COMMENCE RECONNAISSANCE
                </button>
              </form>

              <div className='pt-6 border-t border-zinc-800'>
                <p className='text-xs text-zinc-600 font-mono text-center'>
                  CLASSIFICATION: SECRET • AUTHORIZED PERSONNEL ONLY
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Dashboard
          <div className='space-y-6'>
            <button
              onClick={() => {
                setShowDashboard(false)
                setEnrichmentJobId('')
              }}
              className='text-sm text-zinc-500 hover:text-orange-500 font-mono transition-colors'
            >
              ← NEW ANALYSIS
            </button>

            <BrandReconDashboard enrichmentJobId={enrichmentJobId} />
          </div>
        )}
      </div>
    </div>
  )
}
