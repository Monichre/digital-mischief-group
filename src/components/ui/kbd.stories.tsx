import { Kbd, KbdGroup } from '@/components/ui/kbd'

const meta = {
  title: 'UI/Kbd',
  component: Kbd,
  parameters: {
    layout: 'centered',
  },
  subcomponents: {
    KbdGroup,
  },
  args: {
    children: 'K',
  },
}

export default meta

export const SingleKey = {}

export const Shortcut = {
  render: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>P</Kbd>
    </KbdGroup>
  ),
}

export const InlineHint = {
  render: () => (
    <div className="flex items-center gap-2 text-sm text-foreground">
      Open command palette
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </div>
  ),
}
