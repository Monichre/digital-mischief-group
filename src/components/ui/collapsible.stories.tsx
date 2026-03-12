import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { ChevronDown, ChevronsUpDown, FileSearch, ListChecks } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

const meta = {
  title: 'UI/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Collapsible>

export default meta

type Story = StoryObj<typeof meta>

function CollapsibleCard({
  open,
  title,
  description,
}: {
  open: boolean
  title: string
  description: string
}) {
  return (
    <Collapsible
      open={open}
      className="w-full rounded-xl border bg-card text-card-foreground shadow-sm"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileSearch className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">{title}</span>
            <Badge variant="outline">{open ? 'Open' : 'Closed'}</Badge>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>

        <Button variant="ghost" size="sm" disabled className="gap-2">
          State preview
          <ChevronDown
            className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </Button>
      </div>

      <CollapsibleContent
        className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden border-t"
        forceMount
      >
        <div className="grid gap-3 px-4 py-4 text-sm">
          <div className="rounded-lg border bg-background p-3">
            Fresh pricing comparison and CTA screenshot attached.
          </div>
          <div className="rounded-lg border bg-background p-3">
            Analyst note: competitor is moving from self-serve to sales-led.
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export const InlineDisclosure: Story = {
  render: function Render() {
    const [open, setOpen] = React.useState(false)

    return (
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        className="w-full max-w-xl rounded-xl border bg-card text-card-foreground shadow-sm"
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ListChecks className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Operator handoff notes</span>
              <Badge variant="secondary">Interactive</Badge>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Review the most common disclosure pattern: a compact header with a
              button-driven expansion for extra detail.
            </p>
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              {open ? 'Hide details' : 'Show details'}
              <ChevronsUpDown className="size-4" />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden border-t">
          <div className="grid gap-3 px-4 py-4 text-sm">
            <div className="rounded-lg border bg-background p-3">
              Pricing page now leads with outcome language instead of feature
              bullets.
            </div>
            <div className="rounded-lg border bg-background p-3">
              CTA routes into a demo form, not a self-serve signup.
            </div>
            <div className="rounded-lg border bg-background p-3">
              Recommended follow-up: add observe coverage to the new plans page.
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
}

export const StateMatrix: Story = {
  render: () => (
    <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-2">
      <CollapsibleCard
        open
        title="Expanded intel card"
        description="Open state for reviewing border placement, content reveal animation, and spacing inside the disclosure region."
      />
      <CollapsibleCard
        open={false}
        title="Collapsed intel card"
        description="Closed state for checking header density and the visual weight of the trigger without the expanded content."
      />
    </div>
  ),
}

export const StackedDisclosures: Story = {
  render: () => (
    <div className="w-full max-w-xl space-y-3">
      <Collapsible defaultOpen className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Today&apos;s top signal</p>
            <p className="text-muted-foreground text-sm">
              Competitor launched a new security comparison page.
            </p>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              Toggle
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden border-t px-4 py-4 text-sm">
          Screenshot pair, diff summary, and export link are ready for review.
        </CollapsibleContent>
      </Collapsible>

      <Collapsible className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Secondary notes</p>
            <p className="text-muted-foreground text-sm">
              Lower-priority commentary can stay tucked away until needed.
            </p>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              Toggle
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden border-t px-4 py-4 text-sm">
          This stacked example helps review vertical rhythm when multiple
          disclosures appear in a feed or sidebar list.
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
}
