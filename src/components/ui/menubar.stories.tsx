import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import {
  Bot,
  FileStack,
  Globe,
  Radar,
  Send,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar'

const meta = {
  title: 'UI/Menubar',
  component: Menubar,
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
} satisfies Meta<typeof Menubar>

export default meta

type Story = StoryObj<typeof meta>

function OperationsDeskMenubar() {
  const [attachSources, setAttachSources] = React.useState(true)
  const [streamThinking, setStreamThinking] = React.useState(true)
  const [model, setModel] = React.useState('anthropic')

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border bg-background p-6 shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
          Operator header
        </p>
        <h3 className="text-xl font-semibold">Mission control menubar</h3>
        <p className="text-muted-foreground text-sm">
          Click through each trigger to review nested menus, checkboxes, radio
          lanes, and destructive actions.
        </p>
      </div>

      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Mission</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Mission file</MenubarLabel>
            <MenubarItem>
              <FileStack className="size-4" />
              New watchlist
              <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              <Sparkles className="size-4" />
              Duplicate current brief
              <MenubarShortcut>⇧⌘D</MenubarShortcut>
            </MenubarItem>

            <MenubarSub>
              <MenubarSubTrigger>Load recent target</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarItem>Acme Cloud Systems</MenubarItem>
                <MenubarItem>Vector Forge</MenubarItem>
                <MenubarItem>Sigma Core Labs</MenubarItem>
              </MenubarSubContent>
            </MenubarSub>

            <MenubarSeparator />

            <MenubarItem variant="destructive">
              <ShieldAlert className="size-4" />
              Purge draft mission
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Outputs</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              <Sparkles className="size-4" />
              Queue extract
              <MenubarShortcut>⌘E</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              <Radar className="size-4" />
              Run scout now
              <MenubarShortcut>⌘R</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              <Globe className="size-4" />
              Arm observe monitor
              <MenubarShortcut>⌘O</MenubarShortcut>
            </MenubarItem>

            <MenubarSeparator />

            <MenubarCheckboxItem
              checked={attachSources}
              onCheckedChange={(checked) => setAttachSources(checked === true)}
            >
              Auto-attach sources
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={streamThinking}
              onCheckedChange={(checked) => setStreamThinking(checked === true)}
            >
              Stream operator notes
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Model lane</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>Command model</MenubarLabel>
            <MenubarRadioGroup value={model} onValueChange={setModel}>
              <MenubarRadioItem value="anthropic">Claude Sonnet</MenubarRadioItem>
              <MenubarRadioItem value="openai">GPT-5</MenubarRadioItem>
              <MenubarRadioItem value="groq">Groq speed lane</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Deploy</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              <Send className="size-4" />
              Ship digest
              <MenubarShortcut>⇧⌘S</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              <Bot className="size-4" />
              Hand off to agent
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem disabled>Open production switchboard</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-xl border bg-muted/40 p-3">
          <p className="font-medium">Current model lane</p>
          <p className="text-muted-foreground">{model}</p>
        </div>
        <div className="rounded-xl border bg-muted/40 p-3">
          <p className="font-medium">Source attribution</p>
          <p className="text-muted-foreground">
            {attachSources ? 'Enabled' : 'Disabled'}
          </p>
        </div>
        <div className="rounded-xl border bg-muted/40 p-3">
          <p className="font-medium">Live reasoning</p>
          <p className="text-muted-foreground">
            {streamThinking ? 'Streaming' : 'Muted'}
          </p>
        </div>
      </div>
    </div>
  )
}

function CompactExecutionBar() {
  const [showDiffs, setShowDiffs] = React.useState(true)

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Execution strip</h3>
          <p className="text-muted-foreground text-sm">
            A tighter menubar for route reviews and fast operational changes.
          </p>
        </div>
        <div className="rounded-full border px-3 py-1 text-xs font-medium">
          Read-only preview
        </div>
      </div>

      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem
              checked={showDiffs}
              onCheckedChange={(checked) => setShowDiffs(checked === true)}
            >
              Show pricing diffs
            </MenubarCheckboxItem>
            <MenubarCheckboxItem checked>
              Show source screenshots
            </MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu>
          <MenubarTrigger>Escalate</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Notify revenue command</MenubarItem>
            <MenubarItem>Send founder briefing</MenubarItem>
            <MenubarSeparator />
            <MenubarItem variant="destructive">Hold outbound alerts</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <div className="rounded-xl border bg-muted/40 p-4 text-sm">
        <p className="font-medium">Rendered state</p>
        <p className="text-muted-foreground">
          Pricing diffs are {showDiffs ? 'visible' : 'hidden'} for this route.
        </p>
      </div>
    </div>
  )
}

export const OperationsDesk: Story = {
  render: () => <OperationsDeskMenubar />,
}

export const CompactExecution: Story = {
  render: () => <CompactExecutionBar />,
}
