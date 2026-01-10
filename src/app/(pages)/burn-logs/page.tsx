'use client'

import {ClassifiedComposition} from '@/components/classified-composition/ClassifiedComposition'
import {NetworkBackground} from '@/components/three/NetworkBackground'
import {Flame} from 'lucide-react'

export default function BurnLogsPage() {
  return (
    <>
      <NetworkBackground className='opacity-30' />

      <main className='relative min-h-screen w-full bg-transparent py-12 text-white'>
        {/* Header */}
        <div className='mx-auto w-full max-w-6xl px-4 pb-12'>
          <div className='flex items-center gap-3 mb-4'>
            <Flame className='w-6 h-6 text-orange-500' />
            <h1 className='text-2xl font-mono tracking-wider uppercase text-zinc-200'>
              Burn Logs
            </h1>
          </div>
          <p className='text-sm tracking-[0.3em] uppercase text-zinc-400 mb-2'>
            // CLASSIFIED MISSION ARCHIVE
          </p>
          <p className='text-xs text-zinc-500 max-w-2xl'>
            Operational intelligence records from field operations. All
            documents undergo mandatory review and redaction protocols before
            archival. Access restricted to cleared personnel only.
          </p>
        </div>

        {/* Mission Log 1: Operation Nightfall */}
        <section className='mx-auto w-full max-w-6xl px-4 mb-16'>
          <div className='mb-4 flex items-baseline justify-between'>
            <div>
              <h2 className='text-xs uppercase tracking-[0.35em] text-orange-500 mb-1'>
                LOG ENTRY #47-ALPHA
              </h2>
              <p className='text-[10px] font-mono text-zinc-500'>
                OPERATION: NIGHTFALL // DATE: 1972-11-03Z // STATUS: REDACTED
              </p>
            </div>
            <div className='text-[10px] font-mono text-zinc-600'>
              CLEARANCE: TS/SCI
            </div>
          </div>
          <ClassifiedComposition
            grainOpacity={0.4}
            scratchOpacity={0.5}
            variant='recon'
          />
        </section>

        {/* Mission Log 2: Contact Report Sigma */}
        <section className='mx-auto w-full max-w-6xl px-4 mb-16'>
          <div className='mb-4 flex items-baseline justify-between'>
            <div>
              <h2 className='text-xs uppercase tracking-[0.35em] text-orange-500 mb-1'>
                LOG ENTRY #89-DELTA
              </h2>
              <p className='text-[10px] font-mono text-zinc-500'>
                OPERATION: CONTACT SIGMA // DATE: 1973-04-22Z // STATUS: ACTIVE
              </p>
            </div>
            <div className='text-[10px] font-mono text-zinc-600'>
              CLEARANCE: SECRET
            </div>
          </div>
          <ClassifiedComposition
            grainOpacity={0.35}
            scratchOpacity={0.45}
            variant='impact'
          />
        </section>

        {/* Mission Log 3: Operation Blackout */}
        <section className='mx-auto w-full max-w-6xl px-4 mb-16'>
          <div className='mb-4 flex items-baseline justify-between'>
            <div>
              <h2 className='text-xs uppercase tracking-[0.35em] text-orange-500 mb-1'>
                LOG ENTRY #12-OMEGA
              </h2>
              <p className='text-[10px] font-mono text-zinc-500'>
                OPERATION: BLACKOUT // DATE: 1974-08-15Z // STATUS: TERMINATED
              </p>
            </div>
            <div className='text-[10px] font-mono text-zinc-600'>
              CLEARANCE: TOP SECRET
            </div>
          </div>
          <ClassifiedComposition
            grainOpacity={0.3}
            scratchOpacity={0.4}
            variant='blackout'
          />
        </section>

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
