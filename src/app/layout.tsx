import type React from 'react'
import { Suspense } from 'react'
import type {Metadata} from 'next'
import {Share_Tech_Mono, Inter} from 'next/font/google'
import './globals.css'
import {TargetCursor} from '@/components/TargetCursor'
import {MenuProvider} from '@/components/MenuProvider'
import {MenuToggle} from '@/components/MenuToggle'
import {CommandMenuProvider} from '@/components/CommandMenu'
import {GoogleAnalytics} from '@/components/analytics/GoogleAnalytics'
import {AnalyticsProvider} from '@/components/analytics/AnalyticsProvider'
import { Agentation } from "agentation";
import { Analytics } from '@vercel/analytics/react'

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-share-tech-mono',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})


export const metadata: Metadata = {
  title: 'Digital Mischief Group',
  description:
    'Creative Technology Studio - Experimental interfaces, audio-reactive systems, and digital experiences',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <head>
        <link
          rel='stylesheet'
          href='https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css'
          integrity='sha384-Xi8rHCmBmhbuyyhbI88391ZKP2dmfnOl4rT9ZfSmPb86w6OPFLyfxpH0ObTYuy7f'
          crossOrigin='anonymous'
        />
      </head>
      <body
        className={`${shareTechMono.variable} ${inter.variable} font-mono antialiased bg-[#050507] text-gray-300 overflow-x-hidden`}
      >
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <AnalyticsProvider>
          <MenuProvider>
            <CommandMenuProvider>
              <TargetCursor targetSelector="button, a, [role='button'], [role='link'], [role='tab'], [role='menuitem'], [role='option'], input, textarea, select, label[for], [tabindex]:not([tabindex='-1']), .cursor-target, [onclick], summary, [data-clickable], .card, [class*='Card'], [class*='btn'], [class*='Btn'], [class*='link'], [class*='Link']" />
              <MenuToggle className='dmg-menu-toggle' />
              {children}
            </CommandMenuProvider>
          </MenuProvider>
        </AnalyticsProvider>
        <Analytics />
        {process.env.NODE_ENV === "development" && <Agentation clientId="dmg-client" />}
      </body>
    </html>
  )
}
