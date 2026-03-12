import { ArrowUpRight, Radar, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  subcomponents: {
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
  },
}

export default meta

const reviewCards = [
  {
    title: 'Observe',
    description: 'Change monitoring for high-signal pricing pages.',
    value: '12 live monitors',
    badge: 'Stable',
    badgeVariant: 'secondary' as const,
  },
  {
    title: 'Scout',
    description: 'Scheduled search jobs deduplicating URLs before alerting.',
    value: '38 net-new hits',
    badge: 'Active',
    badgeVariant: 'default' as const,
  },
  {
    title: 'Enrich',
    description: 'Structured dossiers generated from people and company inputs.',
    value: '4 queued dossiers',
    badge: 'Needs review',
    badgeVariant: 'outline' as const,
  },
]

export const DossierSummary = {
  render: () => (
    <Card className="w-[380px]">
      <CardHeader className="border-b">
        <CardTitle>ACME Robotics</CardTitle>
        <CardDescription>
          Company enrichment dossier compiled from acmerobotics.example.
        </CardDescription>
        <CardAction>
          <Badge variant="secondary">Fresh</Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Headquarters
            </p>
            <p className="font-medium">Austin, TX</p>
          </div>

          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Funding
            </p>
            <p className="font-medium">Series B · $42M</p>
          </div>

          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Stack
            </p>
            <p className="font-medium">Next.js, Postgres, Vercel</p>
          </div>

          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              Confidence
            </p>
            <p className="font-medium">91%</p>
          </div>
        </div>

        <p className="text-muted-foreground text-sm leading-6">
          Signals point to an active hiring push across embedded AI,
          robotics operations, and edge inference roles.
        </p>
      </CardContent>

      <CardFooter className="border-t justify-between gap-4">
        <span className="text-muted-foreground text-sm">Updated 12 min ago</span>
        <Button size="sm">Open dossier</Button>
      </CardFooter>
    </Card>
  ),
}

export const WithAction = {
  render: () => (
    <Card className="w-[420px]">
      <CardHeader>
        <CardTitle>Monitor control panel</CardTitle>
        <CardDescription>
          Balanced header layout with an action pinned into the top-right slot.
        </CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Review queue
            <ArrowUpRight className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">Pricing diff detected</p>
            <p className="text-muted-foreground text-sm">
              Competitor price sheet changed 7 minutes ago.
            </p>
          </div>
          <Radar className="text-muted-foreground size-5" />
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">Summary delivered</p>
            <p className="text-muted-foreground text-sm">
              AI digest posted to the shared research channel.
            </p>
          </div>
          <ShieldCheck className="text-muted-foreground size-5" />
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-4">
        <Badge>2 active alerts</Badge>
        <Button size="sm" variant="ghost">
          Pause monitor
        </Button>
      </CardFooter>
    </Card>
  ),
}

export const ReviewGrid = {
  render: () => (
    <div className="grid w-full max-w-5xl gap-4 md:grid-cols-3">
      {reviewCards.map((card) => (
        <Card key={card.title}>
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
            <CardDescription>{card.description}</CardDescription>
            <CardAction>
              <Badge variant={card.badgeVariant}>{card.badge}</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
}
