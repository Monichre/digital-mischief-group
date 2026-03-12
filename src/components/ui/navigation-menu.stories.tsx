import type { Meta, StoryObj } from '@storybook/nextjs'
import { Bot, Eye, Radar, SearchCheck } from 'lucide-react'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

const meta = {
  title: 'UI/Navigation Menu',
  component: NavigationMenu,
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
} satisfies Meta<typeof NavigationMenu>

export default meta

type Story = StoryObj<typeof meta>

type ReconLinkCardProps = {
  title: string
  body: string
}

function ReconLinkCard({ title, body }: ReconLinkCardProps) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          href="#"
          className="block space-y-1 rounded-xl border p-3 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {body}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
}

function MissionControlNavigation() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-2xl border bg-background p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
            Header system
          </p>
          <h3 className="text-xl font-semibold">Mission control navigation</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          Hover or click triggers to inspect panel sizing, indicator motion, and
          direct-link states.
        </p>
      </div>

      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Recon</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-3 md:w-[620px] md:grid-cols-[1.1fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      href="#"
                      className="flex h-full flex-col justify-end rounded-xl border bg-muted/50 p-5"
                    >
                      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
                        <SearchCheck className="size-5" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold">Field-ready recon</p>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Route operators into extract, observe, and scout
                          without losing the logic of the underlying primitives.
                        </p>
                      </div>
                    </a>
                  </NavigationMenuLink>
                </li>
                <ReconLinkCard
                  title="Extract"
                  body="Snapshot a URL for brand assets, copy, and layout signals."
                />
                <ReconLinkCard
                  title="Observe"
                  body="Monitor a target page and summarize meaningful diffs over time."
                />
                <ReconLinkCard
                  title="Scout"
                  body="Schedule search sweeps with deduplicated, net-new findings."
                />
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Workflows</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-3 md:w-[560px] md:grid-cols-2">
                <ReconLinkCard
                  title="Enrich"
                  body="Build company and profile dossiers with explicit multi-step orchestration."
                />
                <ReconLinkCard
                  title="Agent"
                  body="Run interactive research with thinking, answer, and source panels."
                />
                <ReconLinkCard
                  title="Billing"
                  body="Review read-only limits, usage totals, and upgrade paths."
                />
                <ReconLinkCard
                  title="War Games"
                  body="Stress-test prompts, agents, and operator flows before launch."
                />
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              href="#pricing"
            >
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              href="#research"
            >
              Research
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>

        <NavigationMenuIndicator />
      </NavigationMenu>
    </div>
  )
}

function InlineDropdownNavigation() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border bg-background p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">Inline dropdown mode</h3>
        <p className="text-muted-foreground text-sm">
          This variant disables the shared viewport so dropdown content renders
          directly beneath the trigger group.
        </p>
      </div>

      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Protocols</NavigationMenuTrigger>
            <NavigationMenuContent className="w-[360px]">
              <ul className="grid gap-2 p-2">
                <ReconLinkCard
                  title="Brand recon"
                  body="Operator-facing label backed by the extract primitive."
                />
                <ReconLinkCard
                  title="Live research"
                  body="Interactive agent sessions with citations and tool logs."
                />
                <ReconLinkCard
                  title="Ghost protocol"
                  body="Reserved path for sensitive investigations and escalation."
                />
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#home">
              Home
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#loadout">
              Loadout
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>

        <NavigationMenuIndicator />
      </NavigationMenu>

      <div className="grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-xl border bg-muted/40 p-3">
          <div className="mb-2 flex items-center gap-2 font-medium">
            <Radar className="size-4" />
            Extract
          </div>
          <p className="text-muted-foreground">
            Snapshot a target with no persistent state.
          </p>
        </div>
        <div className="rounded-xl border bg-muted/40 p-3">
          <div className="mb-2 flex items-center gap-2 font-medium">
            <Eye className="size-4" />
            Observe
          </div>
          <p className="text-muted-foreground">
            Track page changes and emit summaries over time.
          </p>
        </div>
        <div className="rounded-xl border bg-muted/40 p-3">
          <div className="mb-2 flex items-center gap-2 font-medium">
            <Bot className="size-4" />
            Agent
          </div>
          <p className="text-muted-foreground">
            Orchestrate tool calls with transparent citations.
          </p>
        </div>
      </div>
    </div>
  )
}

export const MissionControlHeader: Story = {
  render: () => <MissionControlNavigation />,
}

export const InlineDropdown: Story = {
  render: () => <InlineDropdownNavigation />,
}
