'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  Lock,
  Zap,
  ArrowRight,
  Radar,
  Shield,
  Flame,
} from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

type Report = {
  id: string
  title: string
  description: string
  category: 'teardown' | 'playbook' | 'template'
  isPro: boolean
  date: string
}

// =============================================================================
// DATA
// =============================================================================

const REPORTS: Report[] = [
  {
    id: 'agent-orchestration',
    title: 'Multi-Agent Orchestration Patterns',
    description:
      'How to coordinate multiple AI agents without creating a spaghetti mess. Includes supervisor patterns, handoff protocols, and failure recovery.',
    category: 'playbook',
    isPro: true,
    date: '2025-01',
  },
  {
    id: 'rag-production',
    title: 'RAG in Production: What Actually Works',
    description:
      'Teardown of 3 production RAG systems. Chunking strategies, retrieval tuning, and the hybrid search setup that finally worked.',
    category: 'teardown',
    isPro: true,
    date: '2025-01',
  },
  {
    id: 'lead-enrichment-stack',
    title: 'The Lead Enrichment Stack',
    description:
      'Template for building a lead enrichment pipeline. Firecrawl + LLM extraction + validation layers.',
    category: 'template',
    isPro: true,
    date: '2024-12',
  },
  {
    id: 'competitive-intel-system',
    title: 'Automated Competitive Intel System',
    description:
      'How we built a system that monitors competitor websites, extracts changes, and generates weekly briefings.',
    category: 'teardown',
    isPro: true,
    date: '2024-12',
  },
  {
    id: 'governance-rails',
    title: 'Agent Governance Rails',
    description:
      'Playbook for adding guardrails to autonomous agents. Includes approval flows, budget limits, and audit logging.',
    category: 'playbook',
    isPro: true,
    date: '2024-11',
  },
  {
    id: 'intro-to-daedalus',
    title: 'Introduction to Daedalus Architecture',
    description:
      'Free overview of the DMG system architecture. Understand the components before diving into implementation.',
    category: 'playbook',
    isPro: false,
    date: '2024-10',
  },
]

const CATEGORY_CONFIG = {
  teardown: {icon: Radar, label: 'TEARDOWN', color: 'text-red-400'},
  playbook: {icon: Shield, label: 'PLAYBOOK', color: 'text-emerald-400'},
  template: {icon: Flame, label: 'TEMPLATE', color: 'text-orange-400'},
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function IntelPage() {
  const freeReports = REPORTS.filter((r) => !r.isPro)
  const proReports = REPORTS.filter((r) => r.isPro)

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-200 font-mono'>
      {/* Background */}
      <div className='fixed inset-0 bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none' />

      {/* Header */}
      <header className='border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40'>
        <div className='max-w-6xl mx-auto px-6 h-16 flex items-center justify-between'>
          <Link
            href='/'
            className='flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            <span>Back to HQ</span>
          </Link>
          <div className='flex items-center gap-1 text-orange-500'>
            <span className='text-zinc-600'>{'<'}</span>
            <FileText className='w-4 h-4' />
            <span className='font-bold'>[ INTEL ]</span>
            <span className='text-zinc-600'>{'>'}</span>
          </div>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-6 py-12'>
        {/* Page Header */}
        <div className='text-center mb-12'>
          <div className='inline-flex items-center gap-2 px-3 py-1 border border-zinc-800 text-xs text-zinc-500 mb-6'>
            <FileText className='w-3 h-3 text-orange-500' />
            <span>// FIELD REPORTS</span>
          </div>
          <h1 className='text-display-md mb-6'>
            Intel <span className='text-orange-500'>Archive</span>
          </h1>
          <p className='text-body-lg text-zinc-500 max-w-xl mx-auto'>
            Teardown briefs, deployment playbooks, and templates. Built from
            real implementations, not theory.
          </p>
        </div>

        {/* Free Reports */}
        {freeReports.length > 0 && (
          <section className='mb-12'>
            <h2 className='text-sm font-bold text-zinc-400 mb-4 flex items-center gap-2'>
              <span className='w-2 h-2 bg-emerald-500 rounded-full' />
              PUBLIC ACCESS
            </h2>
            <div className='space-y-4'>
              {freeReports.map((report) => {
                const config = CATEGORY_CONFIG[report.category]
                const Icon = config.icon
                return (
                  <div
                    key={report.id}
                    className='border border-zinc-800 bg-zinc-900/30 p-6 hover:border-zinc-700 transition-colors group'
                  >
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-2'>
                          <span
                            className={`flex items-center gap-1 text-[10px] ${config.color}`}
                          >
                            <Icon className='w-3 h-3' />
                            {config.label}
                          </span>
                          <span className='text-[10px] text-zinc-600'>
                            {report.date}
                          </span>
                        </div>
                        <h3 className='text-lg font-bold text-white mb-2 group-hover:text-orange-500 transition-colors'>
                          {report.title}
                        </h3>
                        <p className='text-sm text-zinc-500'>
                          {report.description}
                        </p>
                      </div>
                      <ArrowRight className='w-5 h-5 text-zinc-600 group-hover:text-orange-500 transition-colors' />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Pro Reports */}
        <section className='mb-12'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-sm font-bold text-zinc-400 flex items-center gap-2'>
              <span className='w-2 h-2 bg-orange-500 rounded-full' />
              PRO ACCESS
            </h2>
            <a
              href='https://buy.stripe.com/9B67sM6JF2jWght0gcgMw00'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-2 text-xs text-orange-500 hover:text-orange-400'
            >
              <Zap className='w-3 h-3' />
              Unlock All Reports
            </a>
          </div>

          <div className='space-y-4'>
            {proReports.map((report) => {
              const config = CATEGORY_CONFIG[report.category]
              const Icon = config.icon
              return (
                <div
                  key={report.id}
                  className='border border-zinc-800 bg-zinc-900/30 p-6 relative overflow-hidden group'
                >
                  {/* Lock overlay */}
                  <div className='absolute inset-0 bg-zinc-950/60 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                    <a
                      href='https://buy.stripe.com/9B67sM6JF2jWght0gcgMw00'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-bold hover:bg-orange-400 transition-colors'
                    >
                      <Zap className='w-4 h-4' />
                      UNLOCK WITH PRO
                    </a>
                  </div>

                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <span
                          className={`flex items-center gap-1 text-[10px] ${config.color}`}
                        >
                          <Icon className='w-3 h-3' />
                          {config.label}
                        </span>
                        <span className='text-[10px] text-zinc-600'>
                          {report.date}
                        </span>
                        <span className='flex items-center gap-1 text-[10px] text-orange-500'>
                          <Lock className='w-3 h-3' />
                          PRO
                        </span>
                      </div>
                      <h3 className='text-lg font-bold text-white mb-2'>
                        {report.title}
                      </h3>
                      <p className='text-sm text-zinc-500'>
                        {report.description}
                      </p>
                    </div>
                    <Lock className='w-5 h-5 text-orange-500/50' />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <div className='text-center py-12 border-t border-zinc-800'>
          <h3 className='text-2xl font-bold mb-4'>
            Want access to all Field Reports?
          </h3>
          <p className='text-zinc-500 mb-6 max-w-md mx-auto'>
            Pro is the DMG Arsenal: field-tested templates, teardown reports,
            and deployable system protocols—built for operators.
          </p>
          <a
            href='https://buy.stripe.com/9B67sM6JF2jWght0gcgMw00'
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-3 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all'
          >
            <Zap className='w-5 h-5' />
            <span>START PRO — $30/mo</span>
            <ArrowRight className='w-5 h-5' />
          </a>
        </div>
      </main>
    </div>
  )
}
