'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'
import {
  CORTEX_DIRECTIVE_LABELS,
  type CortexDossier,
} from '@/lib/cortex-directives'
import {AuthLinks} from '@/components/AuthLinks'

type CortexDossierRecord = {
  id: string
  target_type: string
  target_name: string | null
  target_identifier: string | null
  directive: keyof typeof CORTEX_DIRECTIVE_LABELS
  summary: string | null
  dossier_json: CortexDossier | string
  logo_url: string | null
  sources: string[] | string | null
  created_at: string
}

function parseJsonValue<T>(value: unknown): T | null {
  if (!value) return null
  if (typeof value === 'object') return value as T
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }
  return null
}

export default function CortexDossierPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<CortexDossierRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true
    const run = async () => {
      try {
        const res = await fetch(`/api/cortex/${params.id}`)
        if (res.status === 401) {
          window.location.href = '/sign-in'
          return
        }
        if (!res.ok) {
          throw new Error('Failed to load dossier')
        }
        const json = await res.json()
        if (isActive) setData(json.dossier)
      } catch (err) {
        if (isActive) setError(err instanceof Error ? err.message : 'Failed to load dossier')
      } finally {
        if (isActive) setLoading(false)
      }
    }
    run()
    return () => {
      isActive = false
    }
  }, [params.id])

  const dossier = useMemo((): CortexDossier | null => {
    if (!data) return null
    const parsed = parseJsonValue<CortexDossier>(data.dossier_json)
    if (parsed) return parsed
    // If parsing failed and dossier_json is already an object, cast it
    if (typeof data.dossier_json === 'object') return data.dossier_json
    return null
  }, [data])

  const sources = useMemo(() => {
    if (!data) return []
    const parsed = parseJsonValue<string[]>(data.sources)
    if (parsed) return parsed
    if (Array.isArray(data.sources)) return data.sources
    return []
  }, [data])

  if (loading) {
    return (
      <div className='min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center'>
        Loading dossier...
      </div>
    )
  }

  if (error || !data || !dossier) {
    return (
      <div className='min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center'>
        {error || 'Dossier not found'}
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-200 font-mono print:bg-white print:text-black'>
      <style jsx global>{`
        @page {
          size: A4;
          margin: 14mm;
        }
      `}</style>

      <nav className='fixed top-0 w-full border-b border-white/10 bg-zinc-950/90 backdrop-blur-md z-50 print:hidden'>
        <div className='max-w-5xl mx-auto px-6 h-16 flex items-center justify-between'>
          <Link
            href='/cortex'
            className='flex items-center gap-2 text-zinc-400 hover:text-orange-500 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to Cortex
          </Link>
          <div className='flex items-center gap-3'>
            <AuthLinks
              linkClassName='text-[10px] text-zinc-500 hover:text-white transition-colors'
              ctaClassName='px-2.5 py-1 border border-zinc-700 text-[10px] text-zinc-400 hover:border-orange-500/60 hover:text-orange-500 transition-colors'
            />
            <button
              onClick={() => window.print()}
              className='flex items-center gap-2 px-4 py-2 border border-orange-500/40 text-orange-400 hover:bg-orange-500 hover:text-white transition-colors text-xs'
            >
              <Printer className='w-4 h-4' />
              PRINT BRIEFING
            </button>
          </div>
        </div>
      </nav>

      <main className='relative z-10 px-6 pt-28 pb-16 print:pt-0 print:px-0'>
        <div
          className='mx-auto w-full max-w-5xl bg-[#f5f1e8] text-zinc-900 border border-zinc-300 shadow-2xl relative print:shadow-none'
          style={{ fontFamily: 'Courier New, Courier, monospace' }}
        >
          <div className='absolute right-8 top-8 border-2 border-red-600 text-red-600 px-4 py-1 text-xs tracking-[0.2em] rotate-[-12deg]'>
            CONFIDENTIAL
          </div>

          <div className='p-10'>
            <div className='flex items-start justify-between gap-6'>
              <div>
                <div className='text-xs text-zinc-500 tracking-widest mb-2'>
                  CORTEX BRIEFING PACKET
                </div>
                <h1 className='text-3xl font-bold mb-2'>
                  {data.target_name || data.target_identifier || 'Unknown Target'}
                </h1>
                <p className='text-sm text-zinc-600'>
                  {data.target_identifier || 'Identifier unavailable'}
                </p>
              </div>
              <div className='text-right text-xs text-zinc-500'>
                <div className='uppercase tracking-widest mb-1'>
                  {CORTEX_DIRECTIVE_LABELS[data.directive]}
                </div>
                <div>
                  {new Date(data.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className='mt-8 border-t border-zinc-300 pt-6'>
              <h2 className='text-sm uppercase tracking-widest text-zinc-600'>
                Executive Summary
              </h2>
              <p className='mt-3 text-sm leading-relaxed'>
                {dossier.executive_summary}
              </p>
            </div>

            <div className='mt-6 grid md:grid-cols-2 gap-6'>
              <div>
                <h3 className='text-xs uppercase tracking-widest text-zinc-600'>
                  Key Insights
                </h3>
                <ul className='mt-3 space-y-2 text-sm list-disc list-inside'>
                  {dossier.key_insights.map((item: string, idx: number) => (
                    <li key={`${item}-${idx}`}>{item}</li>
                  ))}
                </ul>
              </div>
              {dossier.signals && dossier.signals.length > 0 && (
                <div>
                  <h3 className='text-xs uppercase tracking-widest text-zinc-600'>
                    Signals
                  </h3>
                  <ul className='mt-3 space-y-2 text-sm list-disc list-inside'>
                    {dossier.signals.map((item: string, idx: number) => (
                      <li key={`${item}-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {dossier.kill_chain && (
              <div className='mt-8 border-t border-zinc-300 pt-6 space-y-4'>
                <h2 className='text-sm uppercase tracking-widest text-zinc-600'>
                  Kill Chain Intel
                </h2>
                <div className='grid md:grid-cols-2 gap-4 text-sm'>
                  <div>
                    <h4 className='font-bold'>Pain Points</h4>
                    <ul className='mt-2 list-disc list-inside space-y-1'>
                      {dossier.kill_chain.pain_points.map((item: string, idx: number) => (
                        <li key={`${item}-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className='font-bold'>Decision Makers</h4>
                    <ul className='mt-2 list-disc list-inside space-y-1'>
                      {dossier.kill_chain.decision_makers.map((item: string, idx: number) => (
                        <li key={`${item}-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className='font-bold'>Budget Signals</h4>
                    <ul className='mt-2 list-disc list-inside space-y-1'>
                      {dossier.kill_chain.budget_signals.map((item: string, idx: number) => (
                        <li key={`${item}-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className='font-bold'>Outreach Angles</h4>
                    <ul className='mt-2 list-disc list-inside space-y-1'>
                      {dossier.kill_chain.outreach_angles.map((item: string, idx: number) => (
                        <li key={`${item}-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {dossier.market_teardown && (
              <div className='mt-8 border-t border-zinc-300 pt-6 space-y-4'>
                <h2 className='text-sm uppercase tracking-widest text-zinc-600'>
                  Market Teardown
                </h2>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm border border-zinc-300'>
                    <thead className='bg-zinc-100'>
                      <tr>
                        <th className='text-left p-2 border-b border-zinc-300'>Competitor</th>
                        <th className='text-left p-2 border-b border-zinc-300'>Positioning</th>
                        <th className='text-left p-2 border-b border-zinc-300'>Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dossier.market_teardown.competitors.map((comp: { name: string; domain: string; positioning: string; price_tier: string }, idx: number) => (
                        <tr key={`${comp.domain}-${idx}`}>
                          <td className='p-2 border-b border-zinc-200'>
                            <div className='font-bold'>{comp.name}</div>
                            <div className='text-xs text-zinc-500'>{comp.domain}</div>
                          </td>
                          <td className='p-2 border-b border-zinc-200'>{comp.positioning}</td>
                          <td className='p-2 border-b border-zinc-200'>{comp.price_tier}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className='grid md:grid-cols-3 gap-4 text-sm'>
                  <div>
                    <h4 className='font-bold'>Pricing Models</h4>
                    <ul className='mt-2 list-disc list-inside space-y-1'>
                      {dossier.market_teardown.pricing_models.map((item: string, idx: number) => (
                        <li key={`${item}-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className='font-bold'>Feature Gaps</h4>
                    <ul className='mt-2 list-disc list-inside space-y-1'>
                      {dossier.market_teardown.feature_gaps.map((item: string, idx: number) => (
                        <li key={`${item}-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className='font-bold'>Moat Risks</h4>
                    <ul className='mt-2 list-disc list-inside space-y-1'>
                      {dossier.market_teardown.moat_risks.map((item: string, idx: number) => (
                        <li key={`${item}-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {dossier.asset_strip && (
              <div className='mt-8 border-t border-zinc-300 pt-6 space-y-4'>
                <h2 className='text-sm uppercase tracking-widest text-zinc-600'>
                  Asset Strip
                </h2>
                <div className='grid md:grid-cols-2 gap-4 text-sm'>
                  <div>
                    <h4 className='font-bold'>Brand Voice</h4>
                    <ul className='mt-2 list-disc list-inside space-y-1'>
                      {dossier.asset_strip.brand_voice.map((item: string, idx: number) => (
                        <li key={`${item}-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className='font-bold'>Messaging</h4>
                    <ul className='mt-2 list-disc list-inside space-y-1'>
                      {dossier.asset_strip.messaging.map((item: string, idx: number) => (
                        <li key={`${item}-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {dossier.asset_strip.design_tokens && (
                  <div className='grid md:grid-cols-3 gap-4 text-sm'>
                    {dossier.asset_strip.design_tokens.colors && (
                      <div>
                        <h4 className='font-bold'>Colors</h4>
                        <div className='mt-2 flex flex-wrap gap-2'>
                          {dossier.asset_strip.design_tokens.colors.map((color: string, idx: number) => (
                            <span
                              key={`${color}-${idx}`}
                              className='border border-zinc-300 px-2 py-1 text-xs'
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {dossier.asset_strip.design_tokens.fonts && (
                      <div>
                        <h4 className='font-bold'>Fonts</h4>
                        <ul className='mt-2 list-disc list-inside space-y-1'>
                          {dossier.asset_strip.design_tokens.fonts.map((font: string, idx: number) => (
                            <li key={`${font}-${idx}`}>{font}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {dossier.asset_strip.design_tokens.typography && (
                      <div>
                        <h4 className='font-bold'>Typography</h4>
                        <ul className='mt-2 list-disc list-inside space-y-1'>
                          {dossier.asset_strip.design_tokens.typography.map((type: string, idx: number) => (
                            <li key={`${type}-${idx}`}>{type}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <h4 className='font-bold'>Ad Copy Signals</h4>
                  <ul className='mt-2 list-disc list-inside space-y-1 text-sm'>
                    {dossier.asset_strip.ad_copy.map((item: string, idx: number) => (
                      <li key={`${item}-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className='mt-8 border-t border-zinc-300 pt-6'>
              <h2 className='text-sm uppercase tracking-widest text-zinc-600'>
                Recommended Actions
              </h2>
              <ul className='mt-3 space-y-2 text-sm list-disc list-inside'>
                {dossier.recommended_actions.map((item: string, idx: number) => (
                  <li key={`${item}-${idx}`}>{item}</li>
                ))}
              </ul>
            </div>

            {sources.length > 0 && (
              <div className='mt-8 border-t border-zinc-300 pt-6'>
                <h2 className='text-sm uppercase tracking-widest text-zinc-600'>
                  Sources
                </h2>
                <ul className='mt-3 space-y-1 text-xs text-zinc-600 break-all'>
                  {sources.map((source, idx) => (
                    <li key={`${source}-${idx}`}>{source}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
