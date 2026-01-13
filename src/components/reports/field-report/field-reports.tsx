'use client'

import {Dossier} from '@/components/reports/dossier'
import {NetworkBackground} from '@/components/three/NetworkBackground'
import type {Campaign} from '@/components/reports/dossier'

// =============================================================================
// TYPES
// =============================================================================

type FieldReportsProps = {
  campaigns: Campaign[]
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function FieldReports({campaigns}: FieldReportsProps) {
  return (
    <>
      <NetworkBackground className='opacity-30' />

      <main className='relative min-h-screen w-full bg-transparent py-12 text-white'>
        {/* Header */}
        <div className='mx-auto w-full max-w-6xl px-4 pb-12'>
          <h1 className='text-2xl font-mono tracking-wider uppercase text-zinc-200 mb-2'>
            CLASSIFIED DOSSIER
          </h1>
          <p className='text-sm tracking-[0.3em] uppercase text-zinc-400 mb-2'>
            — {campaigns.length}{' '}
            {campaigns.length === 1 ? 'DOCUMENT' : 'DOCUMENTS'}
          </p>
          <p className='text-xs text-zinc-500 max-w-2xl'>
            Operational intelligence records from field operations. All
            documents undergo mandatory review and redaction protocols before
            archival. Access restricted to cleared personnel only.
          </p>
        </div>

        {/* Campaign Reports */}
        {campaigns.map((campaign) => (
          <section
            key={campaign.id}
            className='mx-auto w-full max-w-6xl px-4 mb-16'
          >
            <div className='mb-4 flex items-baseline justify-between'>
              <div>
                <h2 className='text-xs uppercase tracking-[0.35em] text-orange-500 mb-1'>
                  LOG ENTRY {campaign.logEntry}
                </h2>
                <p className='text-[10px] font-mono text-zinc-500'>
                  OPERATION: {campaign.operation} // DATE: {campaign.date} //
                  STATUS: {campaign.status}
                </p>
              </div>
              <div className='text-[10px] font-mono text-zinc-600'>
                CLEARANCE: {campaign.clearance}
              </div>
            </div>
            <Dossier
              campaign={campaign}
              grainOpacity={0.4}
              scratchOpacity={0.5}
            />
          </section>
        ))}

        {/* Footer Archive Note */}
        <div className='mx-auto w-full max-w-6xl px-4 pt-8 border-t border-zinc-800'>
          <div className='text-[10px] font-mono text-zinc-600 space-y-1'>
            <p>// END OF ACCESSIBLE RECORDS</p>
            <p>// ADDITIONAL LOGS REQUIRE SPECIAL ACCESS AUTHORIZATION</p>
            <p>// REF: CLASSIFICATION GUIDE 12-9X / HANDLING CODE: NOFORN</p>
          </div>
        </div>
      </main>
    </>
  )
}
