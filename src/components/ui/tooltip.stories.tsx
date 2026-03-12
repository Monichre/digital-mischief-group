import type { LucideIcon } from 'lucide-react'
import {
  BellRing,
  Download,
  Radar,
  ShieldAlert,
} from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/nextjs'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-[320px] w-full items-center justify-center p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>

export default meta

type Story = StoryObj<typeof meta>

type TooltippedActionProps = {
  icon: LucideIcon
  label: string
  hint: string
}

function TooltippedAction({ icon: Icon, label, hint }: TooltippedActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button aria-label={label} size="icon" variant="outline">
          <Icon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>
        <p>{hint}</p>
      </TooltipContent>
    </Tooltip>
  )
}

function TooltipPositionsDemo() {
  return (
    <div className="relative h-56 w-56">
      <div className="absolute left-1/2 top-0 -translate-x-1/2">
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <Button size="sm" variant="secondary">
              Top
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={10}>
            <p>Review monitor health</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <Button size="sm" variant="secondary">
              Right
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            <p>Open scout queue</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <Button size="sm" variant="secondary">
              Bottom
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={10}>
            <p>Inspect recent diffs</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="absolute left-0 top-1/2 -translate-y-1/2">
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <Button size="sm" variant="secondary">
              Left
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={10}>
            <p>Escalate a finding</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <TooltippedAction
        hint="Launch a fresh scout run"
        icon={Radar}
        label="Run scout"
      />
      <TooltippedAction
        hint="Notify the intel channel"
        icon={BellRing}
        label="Send alert"
      />
      <TooltippedAction
        hint="Download the current dossier"
        icon={Download}
        label="Export dossier"
      />
      <TooltippedAction
        hint="Escalate this result for review"
        icon={ShieldAlert}
        label="Escalate finding"
      />
    </div>
  ),
}

export const SidePreview: Story = {
  render: () => <TooltipPositionsDemo />,
}
