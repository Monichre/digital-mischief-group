import type React from 'react'
import localFont from 'next/font/local'
import {Roboto_Mono} from 'next/font/google'
import Link from 'next/link'
import {OpenScoutsBodyClass} from '@/components/open-scouts/OpenScoutsBodyClass'
import {AuthLinks} from '@/components/AuthLinks'
import './open-scouts.css'

const suisse = localFont({
  src: [
    {path: '../../../../public/fonts/SuisseIntl/400.woff2', weight: '400'},
    {path: '../../../../public/fonts/SuisseIntl/450.woff2', weight: '450'},
    {path: '../../../../public/fonts/SuisseIntl/500.woff2', weight: '500'},
    {path: '../../../../public/fonts/SuisseIntl/600.woff2', weight: '600'},
    {path: '../../../../public/fonts/SuisseIntl/700.woff2', weight: '700'},
  ],
  variable: '--font-suisse',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-roboto-mono',
})

export default function ScoutsLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <div className={`${suisse.variable} ${robotoMono.variable} open-scouts`}>
      <OpenScoutsBodyClass />
      <nav className='sticky top-0 z-40 border-b border-border-faint bg-background-lighter/90 backdrop-blur-md'>
        <div className='mx-auto max-w-[1112px] px-6 h-14 flex items-center justify-between'>
          <Link
            href='/'
            className='text-sm text-black-alpha-56 hover:text-accent-black transition-colors'
          >
            DMG HQ
          </Link>
          <div className='flex items-center gap-4'>
            <span className='text-[10px] uppercase tracking-widest text-black-alpha-32'>
              SCOUTS
            </span>
            <AuthLinks
              linkClassName='text-[10px] text-black-alpha-56 hover:text-accent-black transition-colors'
              ctaClassName='px-2.5 py-1 border border-border-faint text-[10px] text-black-alpha-56 hover:border-accent-black hover:text-accent-black transition-colors'
            />
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}
