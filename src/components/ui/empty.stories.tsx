import type { Meta, StoryObj } from '@storybook/nextjs'
import { FileSearch, Radar } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

const meta = {
  title: 'UI/Empty',
  component: Empty,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Empty>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Empty className='w-[520px] border'>
      <EmptyHeader>
        <EmptyMedia variant='icon'>
          <Radar className='size-5' />
        </EmptyMedia>
        <EmptyTitle>No active scouts yet</EmptyTitle>
        <EmptyDescription>
          Launch a recurring search to begin collecting net-new market signals.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Start scout</Button>
      </EmptyContent>
    </Empty>
  ),
}

export const DocumentationState: Story = {
  render: () => (
    <Empty className='w-[520px] border'>
      <EmptyHeader>
        <EmptyMedia>
          <FileSearch className='text-muted-foreground size-10' />
        </EmptyMedia>
        <EmptyTitle>No saved briefing packets</EmptyTitle>
        <EmptyDescription>
          Print a dossier or export a report to create a new briefing artifact.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className='text-muted-foreground text-sm'>
          Reports generated here can be reviewed by sales, strategy, or creative teams.
        </div>
      </EmptyContent>
    </Empty>
  ),
}
