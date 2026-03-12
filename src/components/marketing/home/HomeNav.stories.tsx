import type {Meta, StoryObj} from '@storybook/nextjs'

import {homepageContent} from '@/content/homepage'

import {HomeNav} from './HomeNav'

const meta = {
  title: 'Marketing/Home/HomeNav',
  component: HomeNav,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    nav: homepageContent.nav,
  },
  render: (args) => (
    <div data-home-nav-story className='min-h-[24rem] bg-zinc-950 text-zinc-50'>
      <style>{`
        [data-home-nav-story] nav [aria-hidden='true'] {
          display: none !important;
        }
      `}</style>

      <HomeNav {...args} />

      <div className='mx-auto max-w-7xl px-6 pb-16 pt-28'>
        <div className='rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-6 py-10 text-sm text-zinc-400'>
          Fixed navigation preview on the DMG homepage shell.
        </div>
      </div>
    </div>
  ),
} satisfies Meta<typeof HomeNav>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async () => {
    await new Promise((resolve) => setTimeout(resolve, 250))
  },
}
