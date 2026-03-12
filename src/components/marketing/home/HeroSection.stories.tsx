import type {Meta, StoryObj} from '@storybook/nextjs'
import {MotionConfig} from 'framer-motion'
import {type ReactNode, useEffect, useRef} from 'react'

import {homepageContent} from '@/content/homepage'

import {HeroSection} from './HeroSection'

function StableHeroCanvas({children}: {children: ReactNode}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current

    if (!container) {
      return
    }

    const hide = (element: HTMLElement | null | undefined) => {
      if (element) {
        element.style.display = 'none'
      }
    }

    const hideDynamicPanels = () => {
      const elements = Array.from(container.querySelectorAll<HTMLElement>('div, span'))

      for (const element of elements) {
        const text = element.textContent?.trim() ?? ''

        if (
          text.startsWith('SYS.TIME:') ||
          text.startsWith('UPTIME:') ||
          text.startsWith('THREATS.DETECTED:')
        ) {
          hide(element.parentElement)
        }

        if (
          text.startsWith('LAT:') ||
          text.startsWith('LNG:') ||
          text.startsWith('LATENCY:')
        ) {
          hide(element.parentElement)
        }

        if (text.includes('SIGNALS:')) {
          hide(element.parentElement?.parentElement)
        }

        if (/^\d{4}-\d{2}-\d{2} /.test(text) && text.endsWith('UTC')) {
          hide(element.parentElement)
        }
      }
    }

    const timeoutIds = [100, 1200].map((delay) => window.setTimeout(hideDynamicPanels, delay))

    return () => {
      for (const timeoutId of timeoutIds) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  return (
    <MotionConfig reducedMotion='always'>
      <div ref={ref} data-hero-section-story className='min-h-screen bg-zinc-950 text-zinc-50'>
        <style>{`
          [data-hero-section-story] .animate-pulse {
            animation: none !important;
          }
        `}</style>

        {children}
      </div>
    </MotionConfig>
  )
}

const meta = {
  title: 'Marketing/Home/HeroSection',
  component: HeroSection,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    hero: homepageContent.hero,
  },
  render: (args) => (
    <StableHeroCanvas>
      <HeroSection {...args} />
    </StableHeroCanvas>
  ),
} satisfies Meta<typeof HeroSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async () => {
    await new Promise((resolve) => setTimeout(resolve, 2200))
  },
}
