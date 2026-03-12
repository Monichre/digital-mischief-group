import { Label } from '@/components/ui/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
}

export default meta

export const Default = {
  render: () => (
    <RadioGroup
      defaultValue="instant"
      aria-label="Alert cadence"
      className="w-[260px]"
    >
      <div className="flex items-center gap-3">
        <RadioGroupItem value="instant" id="cadence-instant" />
        <Label htmlFor="cadence-instant">Instant alerts</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="daily" id="cadence-daily" />
        <Label htmlFor="cadence-daily">Daily digest</Label>
      </div>
      <div className="flex items-center gap-3">
        <RadioGroupItem value="weekly" id="cadence-weekly" />
        <Label htmlFor="cadence-weekly">Weekly wrap-up</Label>
      </div>
    </RadioGroup>
  ),
}

export const WithSupportingCopy = {
  render: () => (
    <div className="w-[380px] rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <RadioGroup
        defaultValue="team"
        aria-label="Research mode"
        className="gap-4"
      >
        <div className="flex items-start gap-3 rounded-lg border p-3">
          <RadioGroupItem
            value="solo"
            id="research-solo"
            className="mt-0.5"
          />
          <div className="grid gap-1.5">
            <Label htmlFor="research-solo">Solo operator</Label>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Keep tool output private while drafting a single-source brief.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border p-3">
          <RadioGroupItem
            value="team"
            id="research-team"
            className="mt-0.5"
          />
          <div className="grid gap-1.5">
            <Label htmlFor="research-team">Team review</Label>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Share reasoning traces and sources so the wider team can audit
              the conclusion.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border p-3">
          <RadioGroupItem
            value="locked"
            id="research-locked"
            className="mt-0.5"
            disabled
          />
          <div className="grid gap-1.5">
            <Label htmlFor="research-locked">Executive distribution</Label>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Reserved for higher plans with export controls and approval
              workflows.
            </p>
          </div>
        </div>
      </RadioGroup>
    </div>
  ),
}

export const CompactInline = {
  render: () => (
    <div className="rounded-full border bg-card px-4 py-3 text-card-foreground shadow-sm">
      <RadioGroup
        defaultValue="low"
        aria-label="Signal threshold"
        className="flex items-center gap-5"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="low" id="signal-low" />
          <Label htmlFor="signal-low">Low</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="medium" id="signal-medium" />
          <Label htmlFor="signal-medium">Medium</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="high" id="signal-high" />
          <Label htmlFor="signal-high">High</Label>
        </div>
      </RadioGroup>
    </div>
  ),
}
