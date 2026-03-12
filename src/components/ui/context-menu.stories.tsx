import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import {
  ArchiveX,
  BellDot,
  FileSearch,
  MonitorDot,
  Pin,
  RadioTower,
  Sparkles,
} from 'lucide-react'

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'

const meta = {
  title: 'UI/Context Menu',
  component: ContextMenu,
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
} satisfies Meta<typeof ContextMenu>

export default meta

type Story = StoryObj<typeof meta>

function DossierCardMenu() {
  const [pinTarget, setPinTarget] = React.useState(true)
  const [watchCopy, setWatchCopy] = React.useState(false)
  const [priority, setPriority] = React.useState('priority')

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Right-click the target card to review nested actions, toggles, and the
        destructive lane.
      </p>

      <ContextMenu>
        <ContextMenuTrigger className="outline-none">
          <div className="rounded-2xl border border-dashed bg-background p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
                  Priority target
                </p>
                <div>
                  <h3 className="text-xl font-semibold">Acme Cloud Systems</h3>
                  <p className="text-muted-foreground text-sm">
                    Pricing page updated 14 minutes ago · observe monitor armed
                  </p>
                </div>
              </div>

              <div className="rounded-full border px-3 py-1 text-xs font-medium">
                Black Ops
              </div>
            </div>

            <div className="mt-6 grid gap-3 text-sm md:grid-cols-3">
              <div className="rounded-xl border bg-muted/40 p-3">
                <p className="font-medium">Fresh signal</p>
                <p className="text-muted-foreground">
                  Annual pricing CTA swapped to enterprise-first language.
                </p>
              </div>
              <div className="rounded-xl border bg-muted/40 p-3">
                <p className="font-medium">Recommended next move</p>
                <p className="text-muted-foreground">
                  Launch extract to refresh voice, proof, and CTA capture.
                </p>
              </div>
              <div className="rounded-xl border bg-muted/40 p-3">
                <p className="font-medium">Interaction target</p>
                <p className="text-muted-foreground">
                  Use right click or long press to open the operator menu.
                </p>
              </div>
            </div>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-72">
          <ContextMenuLabel>Target controls</ContextMenuLabel>
          <ContextMenuItem>
            <FileSearch className="size-4" />
            Open dossier
            <ContextMenuShortcut>↵</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <Sparkles className="size-4" />
            Queue extract run
            <ContextMenuShortcut>⌘E</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <MonitorDot className="size-4" />
            Launch observe monitor
            <ContextMenuShortcut>⌘O</ContextMenuShortcut>
          </ContextMenuItem>

          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <RadioTower className="size-4" />
              Escalate to
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-56">
              <ContextMenuItem>Research Ops</ContextMenuItem>
              <ContextMenuItem>Revenue command</ContextMenuItem>
              <ContextMenuItem>Founder briefing room</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>

          <ContextMenuSeparator />

          <ContextMenuGroup>
            <ContextMenuCheckboxItem
              checked={pinTarget}
              onCheckedChange={(checked) => setPinTarget(checked === true)}
            >
              <Pin className="size-4" />
              Pin to briefing
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem
              checked={watchCopy}
              onCheckedChange={(checked) => setWatchCopy(checked === true)}
            >
              <BellDot className="size-4" />
              Track copy changes
            </ContextMenuCheckboxItem>
          </ContextMenuGroup>

          <ContextMenuSeparator />

          <ContextMenuLabel inset>Priority lane</ContextMenuLabel>
          <ContextMenuRadioGroup value={priority} onValueChange={setPriority}>
            <ContextMenuRadioItem value="routine">Routine</ContextMenuRadioItem>
            <ContextMenuRadioItem value="priority">Priority</ContextMenuRadioItem>
            <ContextMenuRadioItem value="black-ops">Black Ops</ContextMenuRadioItem>
          </ContextMenuRadioGroup>

          <ContextMenuSeparator />

          <ContextMenuItem variant="destructive">
            <ArchiveX className="size-4" />
            Archive target
            <ContextMenuShortcut>⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}

function FeedRowMenu() {
  const [sendDigest, setSendDigest] = React.useState(true)
  const [syncCrm, setSyncCrm] = React.useState(false)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Right-click the scout finding row to inspect a denser operational menu.
      </p>

      <ContextMenu>
        <ContextMenuTrigger className="outline-none">
          <div className="grid gap-4 rounded-2xl border bg-background p-4 shadow-sm md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] md:items-center">
            <div>
              <p className="font-medium">
                New competitor landing page spotted on acmecloud.ai
              </p>
              <p className="text-muted-foreground text-sm">
                Found by Scout query: &ldquo;AI infra startup pricing&rdquo;
              </p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                Primitive
              </p>
              <p className="text-sm">Scout</p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                Status
              </p>
              <p className="text-sm">Queued for review</p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                Source age
              </p>
              <p className="text-sm">6 minutes</p>
            </div>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-64">
          <ContextMenuLabel>Finding actions</ContextMenuLabel>
          <ContextMenuItem>
            Open source URL
            <ContextMenuShortcut>⌘↵</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>Copy finding summary</ContextMenuItem>
          <ContextMenuItem disabled>Launch enrich run</ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuCheckboxItem
            checked={sendDigest}
            onCheckedChange={(checked) => setSendDigest(checked === true)}
          >
            Include in nightly digest
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem
            checked={syncCrm}
            onCheckedChange={(checked) => setSyncCrm(checked === true)}
          >
            Sync to pipeline watchlist
          </ContextMenuCheckboxItem>

          <ContextMenuSeparator />

          <ContextMenuItem variant="destructive">Ignore source</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  )
}

export const DossierCard: Story = {
  render: () => <DossierCardMenu />,
}

export const FeedRow: Story = {
  render: () => <FeedRowMenu />,
}
