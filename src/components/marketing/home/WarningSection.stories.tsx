import type {Meta, StoryObj} from '@storybook/nextjs'

import {homepageContent} from '@/content/homepage'

import {WarningSection} from './WarningSection'

const meta = {
  title: 'Marketing/Home/WarningSection',
  component: WarningSection,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    warning: homepageContent.warning,
  },
  decorators: [
    (Story) => (
      <div className='min-h-screen bg-black text-zinc-50'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WarningSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1600))
  },
}
