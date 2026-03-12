import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

const signalQueue = [
  {
    time: '08:14',
    channel: 'Observe',
    title: 'Pricing page diff captured',
    detail: 'Headline shifted from self-serve messaging to concierge-led onboarding.',
  },
  {
    time: '09:02',
    channel: 'Scout',
    title: 'New hiring signal detected',
    detail: 'Target account opened two senior AI engineer roles in Austin and remote.',
  },
  {
    time: '10:27',
    channel: 'Extract',
    title: 'Brand palette refreshed',
    detail: 'Primary action color moved from slate to neon cyan across key landing pages.',
  },
  {
    time: '11:49',
    channel: 'Enrich',
    title: 'Decision-maker profile updated',
    detail: 'VP of Growth now lists B2B partnerships and field enablement as active priorities.',
  },
  {
    time: '13:16',
    channel: 'Agent',
    title: 'Research session cited three new sources',
    detail: 'Transcript includes customer proof points, pricing notes, and launch timing clues.',
  },
  {
    time: '14:31',
    channel: 'Observe',
    title: 'Documentation rollout detected',
    detail: 'API reference added usage tiers, webhook retries, and enterprise auth sections.',
  },
]

const analystBrief = [
  'Signal density increases when scouting, observation, and extraction outputs share a single review lane.',
  'The scroll area should preserve context while allowing long-form review of notes, diffs, and operator commentary.',
  'Spacing between entries matters: dense enough for operational scanning, loose enough for design review and hierarchy checks.',
  'Scrollbar treatment needs to remain discoverable without overwhelming the card chrome around it.',
  'This pattern is often used in Daedalus for intelligence feeds, source summaries, and research transcripts.',
]

const meta = {
  title: 'UI/Scroll Area',
  component: ScrollArea,
  parameters: {
    layout: 'padded',
  },
  subcomponents: {
    ScrollBar,
  },
}

export default meta

export const Feed = {
  render: () => (
    <div className="w-[420px] rounded-2xl border bg-card p-4 text-card-foreground shadow-sm">
      <div className="mb-4 space-y-1">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.3em]">
          Live queue
        </p>
        <h3 className="text-lg font-semibold">Recent intelligence signals</h3>
      </div>

      <ScrollArea className="h-80 rounded-xl border">
        <div className="divide-y">
          {signalQueue.map((signal) => (
            <article key={`${signal.time}-${signal.title}`} className="space-y-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
                  {signal.channel}
                </span>
                <span className="text-muted-foreground text-xs">{signal.time}</span>
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-medium">{signal.title}</h4>
                <p className="text-muted-foreground text-sm leading-6">
                  {signal.detail}
                </p>
              </div>
            </article>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
}

export const AnalystBrief = {
  render: () => (
    <div className="w-[560px] rounded-2xl border bg-card p-4 text-card-foreground shadow-sm">
      <div className="mb-4 space-y-1">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.3em]">
          Long-form review
        </p>
        <h3 className="text-lg font-semibold">Operator notes</h3>
      </div>

      <ScrollArea className="h-64 rounded-xl border bg-background">
        <div className="space-y-4 p-5">
          {analystBrief.map((paragraph, index) => (
            <p key={paragraph} className="text-sm leading-7 text-foreground/90">
              <span className="text-muted-foreground mr-2 font-mono text-xs">
                0{index + 1}
              </span>
              {paragraph}
            </p>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
}
