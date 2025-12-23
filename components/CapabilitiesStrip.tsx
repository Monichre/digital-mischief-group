'use client'

import Link from 'next/link'
import {ScanEye, Users, Palette, Telescope, Cog} from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

type Capability = {
  tag: string
  label: string
  description: string
  href: string
  icon: React.ComponentType<{className?: string}>
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CAPABILITIES: Capability[] = [
  {
    tag: 'INTEL',
    label: 'URL change monitors',
    description: 'what changed + why it matters',
    href: '/observe',
    icon: ScanEye,
  },
  {
    tag: 'ENRICH',
    label: 'Lead enrichment',
    description: 'firmographics + tech intel',
    href: '/enrich',
    icon: Users,
  },
  {
    tag: 'BRAND',
    label: 'Competitor extraction',
    description: 'positioning diffs + ad angles',
    href: '/brand-recon',
    icon: Palette,
  },
  {
    tag: 'RESEARCH',
    label: 'Live web missions',
    description: 'cited briefs in minutes',
    href: '/research',
    icon: Telescope,
  },
  {
    tag: 'OPS',
    label: 'Repeatable workflows',
    description: 'logs, guardrails, handoffs',
    href: '/arsenal',
    icon: Cog,
  },
]

// =============================================================================
// COMPONENT
// =============================================================================

export function CapabilitiesStrip() {
  return (
    <div className='w-full max-w-5xl mx-auto mt-12 mb-8'>
      {/* Container with subtle border */}
      <div className='relative border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-sm rounded-sm overflow-hidden'>
        {/* Gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 pointer-events-none' />

        {/* Horizontal scroll container */}
        <div className='flex items-center gap-1 px-2 py-3 overflow-x-auto scrollbar-hide'>
          {CAPABILITIES.map((cap, index) => {
            const Icon = cap.icon
            return (
              <Link
                key={cap.tag}
                href={cap.href}
                className='group flex items-center gap-3 px-4 py-2 hover:bg-orange-500/10 transition-colors rounded-sm whitespace-nowrap flex-shrink-0'
              >
                {/* Tag badge */}
                <span className='inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-800/80 border border-zinc-700/50 rounded-sm'>
                  <Icon className='w-3 h-3 text-orange-500' />
                  <span className='text-[10px] font-bold text-orange-500 tracking-wider'>
                    {cap.tag}
                  </span>
                </span>

                {/* Label + description */}
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-zinc-300 group-hover:text-white transition-colors'>
                    {cap.label}
                  </span>
                  <span className='text-[10px] text-zinc-600 hidden sm:inline'>
                    → {cap.description}
                  </span>
                </div>

                {/* Separator (except last) */}
                {index < CAPABILITIES.length - 1 && (
                  <span className='w-px h-4 bg-zinc-800 ml-2' />
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Helper text */}
      <p className='text-center text-[10px] text-zinc-600 mt-3 font-mono'>
        Run a live recon mission. Get a usable output in under 2 minutes.
      </p>
    </div>
  )
}
