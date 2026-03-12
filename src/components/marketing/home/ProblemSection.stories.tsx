import type {Meta, StoryObj} from '@storybook/nextjs'

import {homepageContent} from '@/content/homepage'

import {ProblemSection} from './ProblemSection'

const meta = {
  title: 'Marketing/Home/ProblemSection',
  component: ProblemSection,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    problem: homepageContent.problem,
  },
  decorators: [
    (Story) => (
      <div className='min-h-screen bg-zinc-950 text-zinc-50'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProblemSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200))
  },
}
