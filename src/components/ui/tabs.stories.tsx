import type { Meta, StoryObj } from '@storybook/nextjs'
import {
  Binoculars,
  BrainCircuit,
  FileSearch,
  Radar,
  ShieldAlert,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

function Panel({
  eyebrow,
  title,
  description,
  metrics,
}: {
  eyebrow: string
  title: string
  description: string
  metrics: Array<{ label: string; value: string }>
}) {
  return (
    <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="space-y-2 border-b pb-4">
        <Badge variant="secondary">{eyebrow}</Badge>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>

      <div className="grid gap-3 pt-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border bg-background p-3">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
              {metric.label}
            </p>
            <p className="pt-2 text-sm font-medium">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export const OperationsWorkspace: Story = {
  render: () => (
    <Tabs defaultValue="extract" className="w-full max-w-4xl">
      <TabsList className="grid h-auto w-full grid-cols-3">
        <TabsTrigger value="extract">Extract</TabsTrigger>
        <TabsTrigger value="observe">Observe</TabsTrigger>
        <TabsTrigger value="enrich">Enrich</TabsTrigger>
      </TabsList>

      <TabsContent value="extract" className="mt-4">
        <Panel
          eyebrow="Immediate"
          title="Brand snapshot"
          description="Clean baseline for reviewing tab contrast, trigger sizing, and content panel spacing in the most common three-tab layout."
          metrics={[
            { label: 'Target', value: 'https://acme.dev' },
            { label: 'Assets found', value: 'Logo, palette, type scale' },
            { label: 'Runtime', value: '18 seconds' },
          ]}
        />
      </TabsContent>

      <TabsContent value="observe" className="mt-4">
        <Panel
          eyebrow="Scheduled"
          title="Monitor configuration"
          description="Reviews how the tab shell holds denser operational copy when operators are tuning alerts and page coverage."
          metrics={[
            { label: 'Cadence', value: 'Every 6 hours' },
            { label: 'Diff mode', value: 'Markdown + screenshot' },
            { label: 'Recipients', value: 'Email + Slack webhook' },
          ]}
        />
      </TabsContent>

      <TabsContent value="enrich" className="mt-4">
        <Panel
          eyebrow="Multi-step"
          title="Company dossier"
          description="Demonstrates the content panel with structured facts that need strong hierarchy but minimal chrome."
          metrics={[
            { label: 'Domain', value: 'northstar.io' },
            { label: 'Headcount', value: '201–500' },
            { label: 'Signals', value: 'Funding, ICP, tech stack' },
          ]}
        />
      </TabsContent>
    </Tabs>
  ),
}

export const IconTriggersAndDisabledState: Story = {
  render: () => (
    <Tabs defaultValue="research" className="w-full max-w-3xl">
      <TabsList className="grid h-auto w-full grid-cols-4">
        <TabsTrigger value="research">
          <Radar className="size-4" />
          Research
        </TabsTrigger>
        <TabsTrigger value="sources">
          <Binoculars className="size-4" />
          Sources
          <Badge variant="outline">12</Badge>
        </TabsTrigger>
        <TabsTrigger value="analysis">
          <BrainCircuit className="size-4" />
          Analysis
        </TabsTrigger>
        <TabsTrigger value="escalate" disabled>
          <ShieldAlert className="size-4" />
          Escalate
        </TabsTrigger>
      </TabsList>

      <TabsContent value="research" className="mt-4">
        <Panel
          eyebrow="Live run"
          title="Active operator lane"
          description="Highlights icon alignment, badge density, and disabled trigger treatment in a more tactical control bar."
          metrics={[
            { label: 'Prompts', value: '4 chained queries' },
            { label: 'Sources', value: '19 linked citations' },
            { label: 'Confidence', value: 'High' },
          ]}
        />
      </TabsContent>

      <TabsContent value="sources" className="mt-4">
        <Panel
          eyebrow="Evidence"
          title="Source handoff"
          description="Useful for reviewing long trigger labels and how supporting badges feel when the content panel stays consistent."
          metrics={[
            { label: 'Firecrawl', value: '8 captures' },
            { label: 'Search', value: '3 fresh domains' },
            { label: 'Exports', value: 'Markdown + JSON' },
          ]}
        />
      </TabsContent>

      <TabsContent value="analysis" className="mt-4">
        <Panel
          eyebrow="Synthesis"
          title="Analyst notes"
          description="Checks text rhythm and panel readability once the tabs transition from evidence gathering to interpretation."
          metrics={[
            { label: 'Themes', value: 'Pricing pressure, hiring, launch timing' },
            { label: 'Risk', value: 'Moderate' },
            { label: 'Next step', value: 'Open competitive brief' },
          ]}
        />
      </TabsContent>
    </Tabs>
  ),
}

export const CompactInspector: Story = {
  render: () => (
    <Tabs defaultValue="summary" className="w-full max-w-md">
      <TabsList className="grid h-auto w-full grid-cols-2">
        <TabsTrigger value="summary">
          <FileSearch className="size-4" />
          Summary
        </TabsTrigger>
        <TabsTrigger value="handoff">
          <Binoculars className="size-4" />
          Handoff
        </TabsTrigger>
      </TabsList>

      <TabsContent value="summary" className="mt-4">
        <Panel
          eyebrow="Compact"
          title="Sidebar-friendly tabs"
          description="A narrow variant for design-system review when the primitive is used in inspectors, drawers, or slim side panels."
          metrics={[
            { label: 'Width', value: 'Max 448px' },
            { label: 'Density', value: 'Two trigger layout' },
            { label: 'Surface', value: 'Border + card panel' },
          ]}
        />
      </TabsContent>

      <TabsContent value="handoff" className="mt-4">
        <Panel
          eyebrow="Share"
          title="Operator handoff"
          description="Ensures the tabs still feel balanced when the list is short but the content needs multiple stacked data points."
          metrics={[
            { label: 'Audience', value: '#intel-desk' },
            { label: 'Format', value: 'Briefing note' },
            { label: 'Deadline', value: '17:30 UTC' },
          ]}
        />
      </TabsContent>
    </Tabs>
  ),
}
