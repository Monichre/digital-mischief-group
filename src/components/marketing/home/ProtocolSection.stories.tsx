import type {Meta, StoryObj} from '@storybook/nextjs'

import {homepageContent} from '@/content/homepage'

import {ProtocolSection} from './ProtocolSection'

const meta = {
  title: 'Marketing/Home/ProtocolSection',
  component: ProtocolSection,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    protocol: homepageContent.protocol,
  },
  decorators: [
    (Story) => (
      <div className='min-h-screen bg-zinc-950 text-zinc-50'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProtocolSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
