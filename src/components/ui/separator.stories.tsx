import type { Meta, StoryObj } from '@storybook/nextjs'

import { Separator } from '@/components/ui/separator'

const meta = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Separator>

export default meta

type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className='w-[420px] rounded-lg border bg-card p-6 text-card-foreground'>
      <div className='space-y-2'>
        <p className='text-sm font-medium'>Before separator</p>
        <p className='text-muted-foreground text-sm'>Signal summary and operator context.</p>
      </div>
      <Separator className='my-4' />
      <div className='space-y-2'>
        <p className='text-sm font-medium'>After separator</p>
        <p className='text-muted-foreground text-sm'>Escalations, sources, and next actions.</p>
      </div>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className='flex h-20 items-center gap-4 rounded-lg border bg-card px-6 text-card-foreground'>
      <span className='text-sm font-medium'>Recon</span>
      <Separator orientation='vertical' />
      <span className='text-sm font-medium'>Observe</span>
      <Separator orientation='vertical' />
      <span className='text-sm font-medium'>Scout</span>
    </div>
  ),
}
