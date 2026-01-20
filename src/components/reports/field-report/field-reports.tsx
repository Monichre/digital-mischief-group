'use client'

import FieldReport from './field-report'
import type { Campaign } from '@/components/reports/dossier'

// =============================================================================
// TYPES
// =============================================================================

type FieldReportsProps = {
  campaigns: Campaign[]
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function FieldReports({ campaigns }: FieldReportsProps) {
  return (
    <main className="min-h-screen w-full bg-black">
      {/* Header */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-mono tracking-wider uppercase text-white mb-2">
            CLASSIFIED DOSSIER
          </h1>
          <p className="text-sm tracking-[0.3em] uppercase text-gray-400 mb-2">
            — {campaigns.length}{' '}
            {campaigns.length === 1 ? 'DOCUMENT' : 'DOCUMENTS'}
          </p>
          <p className="text-xs text-gray-500 max-w-2xl mx-auto">
            Operational intelligence records from field operations. All
            documents undergo mandatory review and redaction protocols before
            archival. Access restricted to cleared personnel only.
          </p>
        </div>

        {/* Campaign Reports */}
        <div className="space-y-16">
          {campaigns.map((campaign) => (
            <section
              key={campaign.id}
              className="w-full border border-gray-800/50 bg-black"
            >
              <div className="mb-4 px-4 pt-4 flex items-baseline justify-between bg-black">
                <div>
                  <h2 className="text-xs uppercase tracking-[0.35em] text-orange-500 mb-1">
                    LOG ENTRY {campaign.logEntry}
                  </h2>
                  <p className="text-[10px] font-mono text-gray-500">
                    OPERATION: {campaign.operation} // DATE: {campaign.date} //
                    STATUS: {campaign.status}
                  </p>
                </div>
                <div className="text-[10px] font-mono text-gray-600">
                  CLEARANCE: {campaign.clearance}
                </div>
              </div>
              <FieldReport campaign={campaign} />
            </section>
          ))}
        </div>

        {/* Footer Archive Note */}
        <div className="mx-auto w-full max-w-6xl px-4 pt-12 pb-8 border-t border-gray-800">
          <div className="text-[10px] font-mono text-gray-600 space-y-1">
            <p>// END OF ACCESSIBLE RECORDS</p>
            <p>// ADDITIONAL LOGS REQUIRE SPECIAL ACCESS AUTHORIZATION</p>
            <p>// REF: CLASSIFICATION GUIDE 12-9X / HANDLING CODE: NOFORN</p>
          </div>
        </div>
      </div>
    </main>
  )
}
