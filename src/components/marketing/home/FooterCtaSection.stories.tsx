import type {Meta, StoryObj} from '@storybook/nextjs'

import {homepageContent} from '@/content/homepage'

import {FooterCtaSection} from './FooterCtaSection'

const meta = {
  title: 'Marketing/Home/FooterCtaSection',
  component: FooterCtaSection,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    footerCta: homepageContent.footerCta,
  },
  decorators: [
    (Story) => (
      <div className='flex min-h-[70vh] items-center bg-zinc-950 text-zinc-50'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FooterCtaSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
