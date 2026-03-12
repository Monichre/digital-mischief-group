import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import {
  BellDot,
  Bot,
  Eye,
  FileStack,
  Plus,
  Radar,
  SearchCheck,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'

const meta = {
  title: 'UI/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Sidebar>

export default meta

type Story = StoryObj<typeof meta>

type SidebarPreviewProps = {
  defaultOpen?: boolean
  variant?: ComponentProps<typeof Sidebar>['variant']
  side?: ComponentProps<typeof Sidebar>['side']
  collapsible?: ComponentProps<typeof Sidebar>['collapsible']
}

function OperationsSidebarPreview({
  defaultOpen = true,
  variant = 'inset',
  side = 'left',
  collapsible = 'icon',
}: SidebarPreviewProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar side={side} variant={variant} collapsible={collapsible}>
        <SidebarHeader>
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/70 p-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Radar className="size-4" />
            </div>
            <div className="grid min-w-0 flex-1 text-sm leading-tight">
              <span className="truncate font-medium">Daedalus Ops</span>
              <span className="text-sidebar-foreground/70 truncate text-xs">
                12 live monitors · 4 active scouts
              </span>
            </div>
          </div>

          <SidebarInput placeholder="Filter signals" />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Primitives</SidebarGroupLabel>
            <SidebarGroupAction aria-label="Add workflow">
              <Plus className="size-4" />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive tooltip="Extract">
                    <Sparkles className="size-4" />
                    <span>Extract</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>1</SidebarMenuBadge>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Observe">
                    <Eye className="size-4" />
                    <span>Observe</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction showOnHover aria-label="Pin observe alerts">
                    <BellDot className="size-4" />
                  </SidebarMenuAction>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#" isActive>
                        Pricing desk
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#">
                        Homepage watch
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#">
                        Docs watch
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Scout">
                    <Radar className="size-4" />
                    <span>Scout</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>4</SidebarMenuBadge>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Enrich">
                    <SearchCheck className="size-4" />
                    <span>Enrich</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Agent">
                    <Bot className="size-4" />
                    <span>Agent</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Briefing queue</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton variant="outline" tooltip="Nightly brief">
                    <FileStack className="size-4" />
                    <span>Nightly brief</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>3</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Ghost protocol">
                    <ShieldAlert className="size-4" />
                    <span>Ghost protocol</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarSeparator />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="bg-sidebar-accent/60">
                <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <ShieldAlert className="size-4" />
                </div>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Ghost protocol armed</span>
                  <span className="text-sidebar-foreground/70 truncate text-xs">
                    2 founder alerts queued
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <div className="grid min-w-0 flex-1">
            <span className="text-sm font-medium">Mission control workspace</span>
            <span className="text-muted-foreground truncate text-xs">
              Review collapse behavior, rail interactions, and tooltip states.
            </span>
          </div>
          <Button size="sm" variant="outline">
            Export brief
          </Button>
          <Button size="sm">Deploy scout</Button>
        </header>

        <div className="grid gap-4 p-4 xl:grid-cols-[1.6fr_1fr]">
          <div className="grid gap-4">
            <div className="rounded-2xl border bg-background p-5 shadow-sm">
              <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
                Active route
              </p>
              <h3 className="mt-2 text-xl font-semibold">
                Observe pricing page for Acme Cloud Systems
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Change summary will post to #intel-watch whenever packaging,
                CTA copy, or trust markers move.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border bg-background p-4 shadow-sm">
                <p className="font-medium">Fresh findings</p>
                <p className="mt-2 text-3xl font-semibold">17</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Net-new scout URLs in the last 24 hours.
                </p>
              </div>
              <div className="rounded-2xl border bg-background p-4 shadow-sm">
                <p className="font-medium">Open dossiers</p>
                <p className="mt-2 text-3xl font-semibold">6</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Company and profile briefs waiting for review.
                </p>
              </div>
              <div className="rounded-2xl border bg-background p-4 shadow-sm">
                <p className="font-medium">Escalations</p>
                <p className="mt-2 text-3xl font-semibold">2</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Founder-level alerts flagged by Ghost protocol.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-background p-5 shadow-sm">
            <h3 className="font-semibold">Operator notes</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="rounded-xl border bg-muted/40 p-3">
                Re-run extract after the homepage hero swap lands.
              </li>
              <li className="rounded-xl border bg-muted/40 p-3">
                New funding rumor surfaced in scout lane three.
              </li>
              <li className="rounded-xl border bg-muted/40 p-3">
                Agent session has two unresolved citation gaps.
              </li>
            </ul>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export const InsetOperationsLayout: Story = {
  render: () => <OperationsSidebarPreview />,
}

export const FloatingRightRail: Story = {
  render: () => (
    <OperationsSidebarPreview
      defaultOpen={false}
      variant="floating"
      side="right"
      collapsible="offcanvas"
    />
  ),
}
