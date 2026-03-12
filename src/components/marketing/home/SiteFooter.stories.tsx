import type {Meta, StoryObj} from '@storybook/nextjs'

import {homepageContent} from '@/content/homepage'

import {SiteFooter} from './SiteFooter'

const meta = {
  title: 'Marketing/Home/SiteFooter',
  component: SiteFooter,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    footer: homepageContent.footer,
  },
  decorators: [
    (Story) => (
      <div className='flex min-h-[28rem] items-end bg-zinc-950 text-zinc-50'>
        <div className='w-full'>
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof SiteFooter>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
