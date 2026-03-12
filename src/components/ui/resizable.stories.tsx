import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

type PanelFrameProps = {
  eyebrow: string
  title: string
  children: React.ReactNode
}

function PanelFrame({ eyebrow, title, children }: PanelFrameProps) {
  return (
    <section className="flex h-full flex-col bg-card text-card-foreground">
      <header className="border-b px-5 py-4">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.28em]">
          {eyebrow}
        </p>
        <h3 className="mt-1 text-base font-semibold">{title}</h3>
      </header>
      <div className="flex-1 p-5">{children}</div>
    </section>
  )
}

const meta = {
  title: 'UI/Resizable',
  component: ResizablePanelGroup,
  parameters: {
    layout: 'padded',
  },
  subcomponents: {
    ResizablePanel,
    ResizableHandle,
  },
}

export default meta

export const IntelligenceWorkspace = {
  render: () => (
    <div className="mx-auto max-w-5xl">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-[360px] overflow-hidden rounded-2xl border"
      >
        <ResizablePanel defaultSize={24} minSize={18}>
          <PanelFrame eyebrow="Queue" title="Incoming signals">
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border p-3">
                Observe flagged a pricing update with three meaningful diffs.
              </div>
              <div className="rounded-xl border p-3">
                Scout surfaced two new competitors from a funding-news search.
              </div>
              <div className="rounded-xl border p-3">
                Enrich refreshed the target account dossier after role changes.
              </div>
            </div>
          </PanelFrame>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={44} minSize={30}>
          <PanelFrame eyebrow="Analysis" title="Operator summary">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
                  Highest risk
                </p>
                <p className="mt-3 text-sm leading-6">
                  Messaging is consolidating around enterprise readiness, which likely signals a move up-market.
                </p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
                  Next action
                </p>
                <p className="mt-3 text-sm leading-6">
                  Review the updated launch page and compare proof points against last week&apos;s extract snapshot.
                </p>
              </div>
            </div>
          </PanelFrame>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={32} minSize={22}>
          <PanelFrame eyebrow="Sources" title="Evidence trail">
            <ol className="space-y-3 text-sm leading-6">
              <li className="rounded-xl border p-3">1. Pricing page diff · 6 minutes ago</li>
              <li className="rounded-xl border p-3">2. New blog launch post · 22 minutes ago</li>
              <li className="rounded-xl border p-3">3. Jobs page update · 39 minutes ago</li>
            </ol>
          </PanelFrame>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}

export const StackedReview = {
  render: () => (
    <div className="mx-auto max-w-3xl">
      <ResizablePanelGroup
        direction="vertical"
        className="h-[420px] overflow-hidden rounded-2xl border"
      >
        <ResizablePanel defaultSize={35} minSize={25}>
          <PanelFrame eyebrow="Brief" title="Morning synthesis">
            <p className="text-sm leading-7">
              The top panel favors compressed context: enough copy to scan, enough air to preserve hierarchy.
            </p>
          </PanelFrame>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={65} minSize={35}>
          <PanelFrame eyebrow="Transcript" title="Live session notes">
            <div className="space-y-4 text-sm leading-7">
              <p>
                09:42 — Agent connected pricing changes to a new enterprise CTA.
              </p>
              <p>
                09:49 — Scout results showed the same positioning language in three comparison pages.
              </p>
              <p>
                09:55 — Recommendation: sync extract and observe outputs before next outbound sequence.
              </p>
            </div>
          </PanelFrame>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  ),
}
