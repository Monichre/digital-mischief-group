import type { Meta, StoryObj } from '@storybook/nextjs'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-muted/30 p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dialog>

export default meta

type Story = StoryObj<typeof meta>

function ObserveRunFields() {
  return (
    <div className="grid gap-4 py-2">
      <div className="grid gap-2">
        <Label htmlFor="dialog-target-url">Target URL</Label>
        <Input
          id="dialog-target-url"
          defaultValue="https://acme.io/pricing"
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="dialog-cadence">Cadence</Label>
          <Input id="dialog-cadence" defaultValue="Every 6 hours" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dialog-channel">Notification channel</Label>
          <Input id="dialog-channel" defaultValue="#intel-watch" />
        </div>
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open mission brief</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Deploy the observe sweep?</DialogTitle>
            <DialogDescription>
              Configure a fresh monitor before Daedalus begins tracking
              meaningful page changes.
            </DialogDescription>
          </DialogHeader>
          <ObserveRunFields />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Abort</Button>
            </DialogClose>
            <Button>Start observe run</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
}

export const OpenPreview: Story = {
  render: () => (
    <Dialog open>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Preflight summary</DialogTitle>
          <DialogDescription>
            Review the mission payload before shipping the monitoring plan to
            your team.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 rounded-lg border bg-muted/40 p-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium">Target</span>
            <span className="text-muted-foreground">
              acme.io/pricing
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium">Signals</span>
            <span className="text-muted-foreground">
              Pricing, packaging, CTA copy
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium">Cadence</span>
            <span className="text-muted-foreground">Every 6 hours</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Save draft</Button>
          <Button>Deploy monitor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
