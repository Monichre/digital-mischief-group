import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'

const meta = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Mission status',
  },
}

export default meta

export const Default = {}

export const FormPairings = {
  render: () => (
    <div className="grid w-[360px] gap-6 rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="grid gap-3">
        <div className="flex items-center gap-3">
          <Checkbox id="label-checkbox" defaultChecked />
          <Label htmlFor="label-checkbox">Include AI change summary</Label>
        </div>

        <div className="flex items-center gap-3">
          <Switch id="label-switch" defaultChecked />
          <Label htmlFor="label-switch">Escalate critical alerts</Label>
        </div>
      </div>

      <div className="grid gap-3">
        <Label className="text-muted-foreground text-xs uppercase tracking-[0.3em]">
          Report format
        </Label>
        <RadioGroup defaultValue="brief" aria-label="Report format">
          <div className="flex items-center gap-3">
            <RadioGroupItem value="brief" id="format-brief" />
            <Label htmlFor="format-brief">Briefing memo</Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="deck" id="format-deck" />
            <Label htmlFor="format-deck">Slide deck</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
}

export const DisabledStates = {
  render: () => (
    <div className="grid gap-4 rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-center gap-3">
        <Checkbox id="disabled-checkbox-label" disabled />
        <Label htmlFor="disabled-checkbox-label">
          Disabled checkbox label
        </Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="disabled-switch-label" defaultChecked disabled />
        <Label htmlFor="disabled-switch-label">Disabled switch label</Label>
      </div>
    </div>
  ),
}
