import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import {
  Bot,
  Eye,
  Globe,
  Radar,
  SearchCheck,
  Sparkles,
} from 'lucide-react'

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'

const meta = {
  title: 'UI/Command',
  component: Command,
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
} satisfies Meta<typeof Command>

export default meta

type Story = StoryObj<typeof meta>

function MissionCommandDialog() {
  const [query, setQuery] = React.useState('')

  return (
    <CommandDialog
      open
      className="max-w-2xl"
      title="Mission command palette"
      description="Search workflows, pages, and operator actions."
      showCloseButton={false}
    >
      <CommandInput
        placeholder="Search workflows, pages, or operator actions..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No matching operator commands.</CommandEmpty>

        <CommandGroup heading="Primitives">
          <CommandItem>
            <Sparkles className="size-4" />
            Queue extract run
            <CommandShortcut>⌘E</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Eye className="size-4" />
            Arm observe monitor
            <CommandShortcut>⌘O</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Radar className="size-4" />
            Launch scout sweep
            <CommandShortcut>⌘R</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Research tools">
          <CommandItem>
            <Bot className="size-4" />
            Open live agent workspace
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <SearchCheck className="size-4" />
            Review source citations
          </CommandItem>
          <CommandItem disabled>
            <Globe className="size-4" />
            Open production switchboard
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

function InlineWorkbenchCommand() {
  const [query, setQuery] = React.useState('watch')

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 rounded-2xl border bg-background p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">Inline workbench palette</h3>
        <p className="text-muted-foreground text-sm">
          The list below stays embedded in the page for route planning and fast
          filtering.
        </p>
      </div>

      <Command className="rounded-xl border">
        <CommandInput
          placeholder="Filter routes or dossiers..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No routes match this filter.</CommandEmpty>

          <CommandGroup heading="Watch lanes">
            <CommandItem>
              <Eye className="size-4" />
              Watch competitor pricing
              <CommandShortcut>LIVE</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Radar className="size-4" />
              Watch hiring pages
              <CommandShortcut>DAILY</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Recent dossiers">
            <CommandItem>
              <Bot className="size-4" />
              Acme Cloud · GTM leadership map
            </CommandItem>
            <CommandItem>
              <Sparkles className="size-4" />
              Vector Forge · homepage voice refresh
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}

export const OpenDialog: Story = {
  render: () => <MissionCommandDialog />,
}

export const InlineWorkbench: Story = {
  render: () => <InlineWorkbenchCommand />,
}
