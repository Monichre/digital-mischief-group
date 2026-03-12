import type { Meta, StoryObj } from '@storybook/nextjs'

import { Progress } from '@/components/ui/progress'

const meta = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Progress>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 42,
  },
  render: (args) => (
    <div className='w-[420px] space-y-3'>
      <div className='flex items-center justify-between text-sm'>
        <span className='font-medium'>Scout run progress</span>
        <span className='text-muted-foreground'>{args.value}%</span>
      </div>
      <Progress {...args} />
    </div>
  ),
}

export const StateMatrix: Story = {
  render: () => (
    <div className='w-[420px] space-y-4'>
      {[12, 48, 76, 100].map((value) => (
        <div key={value} className='space-y-2'>
          <div className='flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground'>
            <span>Progress</span>
            <span>{value}%</span>
          </div>
          <Progress value={value} />
        </div>
      ))}
    </div>
  ),
}
