import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from 'lucide-react'

import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'

const meta = {
  title: 'UI/ToggleGroup',
  component: ToggleGroup,
  parameters: {
    layout: 'centered',
  },
}

export default meta

export const SingleSelection = {
  render: () => (
    <ToggleGroup
      type="single"
      defaultValue="left"
      variant="outline"
      aria-label="Text alignment"
    >
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeft className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenter className="size-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRight className="size-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const MultipleSelection = {
  render: () => (
    <ToggleGroup
      type="multiple"
      defaultValue={['bold', 'italic']}
      variant="outline"
      aria-label="Text formatting"
    >
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <Bold className="size-4" />
        Bold
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <Italic className="size-4" />
        Italic
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <Underline className="size-4" />
        Underline
      </ToggleGroupItem>
    </ToggleGroup>
  ),
}
