import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import {
  BellRing,
  Bot,
  CheckCircle2,
  MoreHorizontal,
  Radar,
  ShieldAlert,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const meta = {
  title: 'UI/Dropdown Menu',
  component: DropdownMenu,
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
} satisfies Meta<typeof DropdownMenu>

export default meta

type Story = StoryObj<typeof meta>

function ScoutRunMenu({ open = false }: { open?: boolean }) {
  const [includeDiffs, setIncludeDiffs] = useState(true)
  const [emailAlert, setEmailAlert] = useState(true)
  const [cadence, setCadence] = useState('6h')

  return (
    <DropdownMenu {...(open ? { open: true } : {})}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <MoreHorizontal className="size-4" />
          Run controls
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72">
        <DropdownMenuLabel>Scout deployment</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Radar className="size-4" />
            Run search now
            <DropdownMenuShortcut>⌘↵</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CheckCircle2 className="size-4" />
            Mark digest delivered
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Include in alerts</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={includeDiffs}
          onCheckedChange={(checked) => setIncludeDiffs(checked === true)}
        >
          Include source diffs
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={emailAlert}
          onCheckedChange={(checked) => setEmailAlert(checked === true)}
        >
          Email on first new URL
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Cadence</DropdownMenuLabel>
        <DropdownMenuRadioGroup onValueChange={setCadence} value={cadence}>
          <DropdownMenuRadioItem value="1h">Hourly sweep</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="6h">Every 6 hours</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="24h">Daily digest</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <BellRing className="size-4" />
            Delivery routing
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            <DropdownMenuItem>
              <Bot className="size-4" />
              Queue for agent review
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ShieldAlert className="size-4" />
              Escalate to war room
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive">
          <Trash2 className="size-4" />
          Delete scout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TableRowMenuDemo() {
  return (
    <div className="flex w-[540px] items-center justify-between rounded-xl border bg-card/50 px-4 py-3 shadow-sm">
      <div className="space-y-1">
        <div className="text-sm font-medium">competitor pricing sweep</div>
        <p className="text-muted-foreground text-sm">
          Searches for new pricing pages, annual offers, and enterprise launch
          copy.
        </p>
      </div>
      <ScoutRunMenu />
    </div>
  )
}

export const Default: Story = {
  render: () => <ScoutRunMenu />,
}

export const OpenPreview: Story = {
  render: () => <ScoutRunMenu open />,
}

export const InTableRow: Story = {
  render: () => <TableRowMenuDemo />,
}
