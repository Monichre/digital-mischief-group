import type { Meta, StoryObj } from '@storybook/nextjs'
import {
  BellRing,
  CalendarClock,
  ShieldCheck,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'

const meta = {
  title: 'UI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-[420px] w-full items-center justify-center p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Popover>

export default meta

type Story = StoryObj<typeof meta>

function MonitorPopoverDemo({ open = false }: { open?: boolean }) {
  return (
    <Popover {...(open ? { open: true } : {})}>
      <PopoverTrigger asChild>
        <Button variant="outline">Tune monitor</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Observe deployment</h3>
          <p className="text-muted-foreground text-sm">
            Quick mission controls for a high-signal pricing monitor.
          </p>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="popover-target-url">Target URL</Label>
            <Input
              id="popover-target-url"
              defaultValue="https://acme.io/pricing"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="popover-notes">Operator note</Label>
            <Input
              id="popover-notes"
              defaultValue="Track packaging, CTA copy, and trial messaging."
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CalendarClock className="size-4" />
                  6-hour sweep cadence
                </div>
                <p className="text-muted-foreground text-xs">
                  Recheck the page six times a day for meaningful changes.
                </p>
              </div>
              <Switch defaultChecked aria-label="Enable 6-hour sweep cadence" />
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <BellRing className="size-4" />
                  Slack escalation
                </div>
                <p className="text-muted-foreground text-xs">
                  Notify the war room when pricing or offer copy shifts.
                </p>
              </div>
              <Switch defaultChecked aria-label="Enable Slack escalation" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost">
            Cancel
          </Button>
          <Button size="sm">Save changes</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function AnchoredSignalDemo() {
  return (
    <div className="relative w-[420px] rounded-xl border bg-card/50 p-6 shadow-sm">
      <div className="space-y-2 pr-16">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck className="size-4 text-emerald-400" />
          Signal captured
        </div>
        <h3 className="text-lg font-semibold">Pricing page changed 14 minutes ago</h3>
        <p className="text-muted-foreground text-sm">
          Daedalus detected a new enterprise CTA and a revised annual discount
          callout on the target page.
        </p>
      </div>

      <Popover open>
        <PopoverAnchor className="absolute top-7 right-7 size-3 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(74,222,128,0.18)]" />
        <PopoverContent align="start" className="w-64 space-y-2" side="right">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Latest diff summary</h4>
            <p className="text-muted-foreground text-sm">
              New annual savings banner plus stronger enterprise procurement
              language above the fold.
            </p>
          </div>
          <Button className="w-full" size="sm">
            View full diff
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export const Default: Story = {
  render: () => <MonitorPopoverDemo />,
}

export const OpenPreview: Story = {
  render: () => <MonitorPopoverDemo open />,
}

export const AnchoredSignal: Story = {
  render: () => <AnchoredSignalDemo />,
}
