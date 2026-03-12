import type { Meta, StoryObj } from '@storybook/nextjs'
import {
  ArrowUpRight,
  Clock3,
  MapPin,
  Radar,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

const meta = {
  title: 'UI/Hover Card',
  component: HoverCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-[360px] w-full items-center justify-center p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HoverCard>

export default meta

type Story = StoryObj<typeof meta>

function AnalystHoverCard({ open = false }: { open?: boolean }) {
  return (
    <HoverCard {...(open ? { open: true } : {})}>
      <HoverCardTrigger asChild>
        <a
          className="inline-flex items-center gap-2 text-sm font-medium underline decoration-muted-foreground/40 underline-offset-4 transition-colors hover:text-primary"
          href="#agent-dossier"
        >
          field-operator@daedalus
          <ArrowUpRight className="size-4" />
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="size-11 border">
            <AvatarFallback>FO</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Field Operator 07</h3>
              <Badge variant="outline">Observe lead</Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Monitoring pricing, messaging, and launch pages across priority
              accounts.
            </p>
          </div>
        </div>

        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" />
            Remote · US Central
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock3 className="size-4" />
            Last active 12 minutes ago
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Radar className="size-4" />
            18 active monitors · 4 pending summaries
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

function InlineReferenceDemo() {
  return (
    <p className="max-w-xl text-sm leading-7 text-muted-foreground">
      The watchlist is currently owned by{' '}
      <AnalystHoverCard />
      , who is responsible for diff review before alerts reach the shared
      Slack channel.
    </p>
  )
}

export const Default: Story = {
  render: () => <AnalystHoverCard />,
}

export const OpenPreview: Story = {
  render: () => <AnalystHoverCard open />,
}

export const InlineReference: Story = {
  render: () => <InlineReferenceDemo />,
}
