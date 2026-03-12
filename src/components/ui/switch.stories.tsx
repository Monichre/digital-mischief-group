import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const meta = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  args: {
    'aria-label': 'Enable alerts',
    defaultChecked: true,
  },
}

export default meta

export const Default = {}

export const PreferenceStack = {
  render: () => (
    <div className="grid w-[360px] gap-3">
      <div className="flex items-start gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
        <Switch id="critical-alerts" defaultChecked />
        <div className="grid gap-1.5">
          <Label htmlFor="critical-alerts">Critical alerts</Label>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Escalate major pricing, security, or messaging changes without
            waiting for the next digest.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
        <Switch id="daily-digest" />
        <div className="grid gap-1.5">
          <Label htmlFor="daily-digest">Daily digest</Label>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Bundle low-signal scout hits into one review-friendly summary.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
        <Switch id="share-with-team" defaultChecked disabled />
        <div className="grid gap-1.5">
          <Label htmlFor="share-with-team">Team sharing locked</Label>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This workspace is on a solo plan, so shared delivery is disabled.
          </p>
        </div>
      </div>
    </div>
  ),
}

export const States = {
  render: () => (
    <div className="grid gap-4 rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-center gap-3">
        <Switch id="switch-off" />
        <Label htmlFor="switch-off">Off</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="switch-on" defaultChecked />
        <Label htmlFor="switch-on">On</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="switch-disabled" disabled />
        <Label htmlFor="switch-disabled">Disabled</Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="switch-disabled-on" defaultChecked disabled />
        <Label htmlFor="switch-disabled-on">Disabled on</Label>
      </div>
    </div>
  ),
}
