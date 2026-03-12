import type {Meta, StoryObj} from '@storybook/nextjs'

import {homepageContent} from '@/content/homepage'

import {SolutionSection} from './SolutionSection'

const meta = {
  title: 'Marketing/Home/SolutionSection',
  component: SolutionSection,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    solution: homepageContent.solution,
  },
  decorators: [
    (Story) => (
      <div className='min-h-screen bg-zinc-950 text-zinc-50'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SolutionSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
