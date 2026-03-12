import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  args: {
    'aria-label': 'Acknowledge alert',
    defaultChecked: true,
  },
}

export default meta

export const Default = {}

export const WithSupportingCopy = {
  render: () => (
    <div className="w-[340px]">
      <div className="flex items-start gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
        <Checkbox id="pricing-monitor" defaultChecked />
        <div className="grid gap-1.5">
          <Label htmlFor="pricing-monitor">Watch pricing changes</Label>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Trigger a review when packaging, positioning, or call-to-action
            copy changes on the target page.
          </p>
        </div>
      </div>
    </div>
  ),
}

export const StateMatrix = {
  render: () => (
    <div className="grid gap-4 rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-center gap-3">
        <Checkbox id="checkbox-unchecked" />
        <Label htmlFor="checkbox-unchecked">Unchecked</Label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="checkbox-checked" defaultChecked />
        <Label htmlFor="checkbox-checked">Checked</Label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="checkbox-disabled" disabled />
        <Label htmlFor="checkbox-disabled">Disabled</Label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="checkbox-disabled-checked" defaultChecked disabled />
        <Label htmlFor="checkbox-disabled-checked">Disabled checked</Label>
      </div>
    </div>
  ),
}
