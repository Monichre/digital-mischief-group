import type { Meta, StoryObj } from '@storybook/nextjs'
import { Globe, Search, Sparkles } from 'lucide-react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'

const meta = {
  title: 'UI/Input Group',
  component: InputGroup,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof InputGroup>

export default meta

type Story = StoryObj<typeof meta>

export const SearchBar: Story = {
  render: () => (
    <div className='w-[560px]'>
      <InputGroup>
        <InputGroupAddon>
          <Search className='size-4' />
        </InputGroupAddon>
        <InputGroupInput placeholder='Search competitor pricing pages' />
        <InputGroupAddon align='inline-end'>
          <InputGroupButton size='icon-sm' aria-label='Run search'>
            <Sparkles className='size-4' />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
}

export const DomainInput: Story = {
  render: () => (
    <div className='w-[560px]'>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>
            <Globe className='size-4' />
            https://
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput defaultValue='linear.app/pricing' />
        <InputGroupAddon align='inline-end'>
          <InputGroupText>/watch</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
}

export const NotesComposer: Story = {
  render: () => (
    <div className='w-[560px]'>
      <InputGroup>
        <InputGroupAddon align='block-start'>
          <InputGroupText>Operator notes</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea
          rows={5}
          placeholder='Summarize the highest-signal changes, likely intent, and immediate next action.'
        />
      </InputGroup>
    </div>
  ),
}
