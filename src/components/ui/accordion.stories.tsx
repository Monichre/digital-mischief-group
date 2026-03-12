import type { Meta, StoryObj } from '@storybook/nextjs'

import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Accordion>

export default meta

type Story = StoryObj<typeof meta>

function TriggerLabel({
  title,
  description,
  badge,
}: {
  title: string
  description: string
  badge?: string
}) {
  return (
    <div className="space-y-1 pr-4">
      <div className="flex flex-wrap items-center gap-2">
        <span>{title}</span>
        {badge ? <Badge variant="outline">{badge}</Badge> : null}
      </div>
      <p className="text-muted-foreground text-xs font-normal leading-relaxed">
        {description}
      </p>
    </div>
  )
}

export const MissionBrief: Story = {
  args: {
    type: 'single',
  },
  render: () => (
    <Accordion
      type="single"
      collapsible
      defaultValue="pricing"
      className="w-full max-w-3xl rounded-xl border bg-card px-6 text-card-foreground shadow-sm"
    >
      <AccordionItem value="pricing">
        <AccordionTrigger>
          <TriggerLabel
            title="Pricing page changed overnight"
            description="Use this story to review the baseline trigger, icon rotation, and content spacing for a typical single-open accordion."
            badge="Live"
          />
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">
              Package names shifted from feature-led copy to outcome-led copy,
              and the CTA now routes users into a demo funnel instead of a free
              trial flow.
            </p>
            <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
              <li>Starter → Team renamed on hero and comparison table</li>
              <li>Security language moved above integrations proof strip</li>
              <li>Primary CTA now says “Talk to an operator”</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="hiring">
        <AccordionTrigger>
          <TriggerLabel
            title="Hiring signals need review"
            description="Collapsed state for denser labels with secondary copy beneath the title."
            badge="Queued"
          />
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-sm leading-relaxed">
            New openings suggest expansion into solutions engineering and
            partner enablement.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="sources">
        <AccordionTrigger>
          <TriggerLabel
            title="Source packet attached"
            description="Checks the visual rhythm when the accordion groups shorter, utility-style labels."
          />
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-sm leading-relaxed">
            Includes site diff, screenshot pair, and raw markdown excerpt for
            the analyst handoff.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const MultipleSectionsOpen: Story = {
  args: {
    type: 'multiple',
  },
  render: () => (
    <Accordion
      type="multiple"
      defaultValue={["routing", "alerts"]}
      className="w-full max-w-3xl rounded-xl border bg-card px-6 text-card-foreground shadow-sm"
    >
      <AccordionItem value="routing">
        <AccordionTrigger>
          <TriggerLabel
            title="Routing rules"
            description="Multi-open view to inspect stacked content blocks and spacing between adjacent expanded items."
            badge="Primary"
          />
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-background p-3">
              <p className="text-sm font-medium">Email digest</p>
              <p className="text-muted-foreground pt-1 text-sm">
                Send daily summary to revenue-ops@ at 08:00 UTC.
              </p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="text-sm font-medium">Slack escalation</p>
              <p className="text-muted-foreground pt-1 text-sm">
                Post urgent changes into #signal-room when pricing shifts.
              </p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="alerts">
        <AccordionTrigger>
          <TriggerLabel
            title="Alert thresholds"
            description="Second open item for reviewing how typography and borders hold up in longer disclosure content."
            badge="Expanded"
          />
        </AccordionTrigger>
        <AccordionContent>
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
            <li>Escalate plan or pricing changes immediately</li>
            <li>Batch headline copy updates into the daily digest</li>
            <li>Ignore footer-only or legal-page revisions</li>
          </ul>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="qa">
        <AccordionTrigger>
          <TriggerLabel
            title="QA checklist"
            description="Closed state preserved below open sections to judge list density and border cadence."
          />
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-sm leading-relaxed">
            Confirm citations, screenshot timestamps, and operator-facing change
            summaries before delivery.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const WithDisabledItem: Story = {
  args: {
    type: 'single',
  },
  render: () => (
    <Accordion
      type="single"
      collapsible
      defaultValue="active"
      className="w-full max-w-2xl rounded-xl border bg-card px-6 text-card-foreground shadow-sm"
    >
      <AccordionItem value="active">
        <AccordionTrigger>
          <TriggerLabel
            title="Accessible primary item"
            description="Reference state for the enabled trigger and expanded copy block."
            badge="Ready"
          />
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-sm leading-relaxed">
            Review focus rings, disclosure animation, and spacing around active
            copy.
          </p>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="restricted" disabled>
        <AccordionTrigger>
          <TriggerLabel
            title="Restricted disclosure"
            description="Disabled item for reviewing muted contrast and pointer handling without changing the primitive API."
            badge="Locked"
          />
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-sm leading-relaxed">
            This content stays unavailable until the operator upgrades access.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
