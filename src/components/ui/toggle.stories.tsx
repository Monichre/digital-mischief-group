import { Bold, Italic, Underline } from 'lucide-react'

import { Toggle } from '@/components/ui/toggle'

const meta = {
  title: 'UI/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Pinned',
    defaultPressed: true,
    'aria-label': 'Pin intel card',
  },
}

export default meta

export const Default = {}

export const TextFormatting = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Toggle aria-label="Toggle bold" defaultPressed>
        <Bold className="size-4" />
        Bold
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <Italic className="size-4" />
        Italic
      </Toggle>
      <Toggle aria-label="Toggle underline">
        <Underline className="size-4" />
        Underline
      </Toggle>
    </div>
  ),
}

export const OutlineSizes = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle variant="outline" size="sm" aria-label="Small toggle">
        SM
      </Toggle>
      <Toggle variant="outline" aria-label="Default toggle">
        Default
      </Toggle>
      <Toggle
        variant="outline"
        size="lg"
        defaultPressed
        aria-label="Large toggle"
      >
        Large
      </Toggle>
    </div>
  ),
}
