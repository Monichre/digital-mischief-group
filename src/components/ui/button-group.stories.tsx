import type { Meta, StoryObj } from '@storybook/nextjs'
import { Filter, Globe, Plus, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from '@/components/ui/button-group'

const meta = {
  title: 'UI/Button Group',
  component: ButtonGroup,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ButtonGroup>

export default meta

type Story = StoryObj<typeof meta>

export const HorizontalActions: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant='outline'>Run extract</Button>
      <Button variant='outline'>Open dossier</Button>
      <Button>Deploy monitor</Button>
    </ButtonGroup>
  ),
}

export const MixedControls: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText>
        <Globe className='size-4' />
        digitalmischief.group
      </ButtonGroupText>
      <ButtonGroupSeparator />
      <Button variant='ghost'>
        <Filter className='size-4' />
        Filter
      </Button>
      <Button variant='ghost'>
        <Sparkles className='size-4' />
        Summarize
      </Button>
      <Button>
        <Plus className='size-4' />
        New run
      </Button>
    </ButtonGroup>
  ),
}

export const VerticalStack: Story = {
  render: () => (
    <ButtonGroup orientation='vertical' className='min-w-56'>
      <Button variant='outline'>Scout</Button>
      <Button variant='outline'>Observe</Button>
      <Button>Enrich</Button>
    </ButtonGroup>
  ),
}
