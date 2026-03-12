import { AspectRatio } from '@/components/ui/aspect-ratio'

const formats = [
  {
    label: 'Square capture',
    ratio: 1,
    frame: '1:1',
    className: 'from-violet-500/35 via-slate-950 to-cyan-400/30',
  },
  {
    label: 'Deck cover',
    ratio: 4 / 5,
    frame: '4:5',
    className: 'from-cyan-500/35 via-slate-950 to-sky-400/30',
  },
  {
    label: 'Video briefing',
    ratio: 16 / 9,
    frame: '16:9',
    className: 'from-amber-500/30 via-slate-950 to-rose-500/30',
  },
]

const meta = {
  title: 'UI/Aspect Ratio',
  component: AspectRatio,
  parameters: {
    layout: 'padded',
  },
}

export default meta

export const HeroFrame = {
  render: () => (
    <div className="w-[520px]">
      <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-2xl border">
        <div className="flex h-full w-full flex-col justify-between bg-linear-to-br from-cyan-500/35 via-slate-950 to-violet-500/35 p-6 text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-white/70">
              Extract
            </p>
            <h3 className="mt-3 text-2xl font-semibold">
              Brand snapshot ready for review
            </h3>
          </div>

          <div className="space-y-2">
            <p className="max-w-sm text-sm leading-6 text-white/80">
              Use aspect-ratio containers to keep previews stable across cards, dashboards, and media-heavy empty states.
            </p>
            <div className="h-1.5 w-24 rounded-full bg-white/30" />
          </div>
        </div>
      </AspectRatio>
    </div>
  ),
}

export const RatioComparison = {
  render: () => (
    <div className="grid w-full max-w-5xl gap-6 md:grid-cols-3">
      {formats.map((format) => (
        <div key={format.label} className="space-y-3">
          <AspectRatio
            ratio={format.ratio}
            className="overflow-hidden rounded-2xl border bg-card"
          >
            <div
              className={`flex h-full w-full items-end bg-linear-to-br ${format.className} p-5 text-white`}
            >
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/70">
                  {format.frame}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{format.label}</h3>
              </div>
            </div>
          </AspectRatio>
          <p className="text-muted-foreground text-sm leading-6">
            Stable framing keeps mock previews visually comparable during design-system review.
          </p>
        </div>
      ))}
    </div>
  ),
}
