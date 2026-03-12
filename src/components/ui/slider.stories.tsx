import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

const meta = {
  title: 'UI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
}

export default meta

export const Default = {
  render: () => (
    <div className="w-[340px] space-y-3 rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <Label>Confidence threshold</Label>
        <span className="text-muted-foreground text-sm">72%</span>
      </div>
      <Slider
        defaultValue={[72]}
        max={100}
        step={1}
        aria-label="Confidence threshold"
      />
    </div>
  ),
}

export const DualThumbRange = {
  render: () => (
    <div className="w-[360px] space-y-4 rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <Label>Signal band</Label>
        <span className="text-muted-foreground text-sm">20 – 80</span>
      </div>
      <Slider
        defaultValue={[20, 80]}
        max={100}
        step={5}
        aria-label="Signal band"
      />
      <div className="text-muted-foreground flex items-center justify-between text-xs uppercase tracking-[0.2em]">
        <span>Noise floor</span>
        <span>High-signal only</span>
      </div>
    </div>
  ),
}

export const VerticalStack = {
  render: () => (
    <div className="flex h-[320px] items-end gap-6 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex h-full flex-col items-center gap-4">
        <Slider
          orientation="vertical"
          defaultValue={[28]}
          max={100}
          step={1}
          className="h-full"
          aria-label="Observe priority"
        />
        <div className="text-center">
          <p className="text-sm font-medium">Observe</p>
          <p className="text-muted-foreground text-xs">28%</p>
        </div>
      </div>

      <div className="flex h-full flex-col items-center gap-4">
        <Slider
          orientation="vertical"
          defaultValue={[54]}
          max={100}
          step={1}
          className="h-full"
          aria-label="Scout priority"
        />
        <div className="text-center">
          <p className="text-sm font-medium">Scout</p>
          <p className="text-muted-foreground text-xs">54%</p>
        </div>
      </div>

      <div className="flex h-full flex-col items-center gap-4">
        <Slider
          orientation="vertical"
          defaultValue={[82]}
          max={100}
          step={1}
          className="h-full"
          aria-label="Enrich priority"
        />
        <div className="text-center">
          <p className="text-sm font-medium">Enrich</p>
          <p className="text-muted-foreground text-xs">82%</p>
        </div>
      </div>
    </div>
  ),
}
