import { ArrowUpRight, Globe, Radar, ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'

const meta = {
  title: 'UI/Item',
  component: Item,
  parameters: {
    layout: 'centered',
  },
}

export default meta

export const Default = {
  render: () => (
    <div className="w-[560px]">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <Globe className="size-4" />
        </ItemMedia>
        <ItemContent>
          <ItemHeader>
            <ItemTitle>Company dossier ready</ItemTitle>
            <Badge variant="secondary">New</Badge>
          </ItemHeader>
          <ItemDescription>
            Firmographics, funding, and tech stack were stitched into a
            single exportable record.
          </ItemDescription>
          <ItemFooter>
            <span className="text-muted-foreground text-xs">
              Updated 4 minutes ago
            </span>
            <ItemActions>
              <Button size="sm" variant="outline">
                Review
              </Button>
              <Button size="sm">Open</Button>
            </ItemActions>
          </ItemFooter>
        </ItemContent>
      </Item>
    </div>
  ),
}

export const Feed = {
  render: () => (
    <div className="w-[560px] rounded-xl border p-1">
      <ItemGroup>
        <Item size="sm">
          <ItemMedia variant="icon">
            <Radar className="size-4" />
          </ItemMedia>
          <ItemContent>
            <ItemHeader>
              <ItemTitle>Observe detected a homepage change</ItemTitle>
              <Badge variant="outline">Monitor</Badge>
            </ItemHeader>
            <ItemDescription>
              Pricing copy changed and the AI summary flagged a new
              enterprise tier.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" variant="ghost">
              <ArrowUpRight className="size-4" />
              View diff
            </Button>
          </ItemActions>
        </Item>
        <ItemSeparator />
        <Item size="sm">
          <ItemMedia variant="icon">
            <ShieldCheck className="size-4" />
          </ItemMedia>
          <ItemContent>
            <ItemHeader>
              <ItemTitle>Scout found three unseen URLs</ItemTitle>
              <Badge>Fresh</Badge>
            </ItemHeader>
            <ItemDescription>
              The search run deduplicated the backlog and surfaced only
              net-new targets.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" variant="ghost">
              Triage
            </Button>
          </ItemActions>
        </Item>
      </ItemGroup>
    </div>
  ),
}
