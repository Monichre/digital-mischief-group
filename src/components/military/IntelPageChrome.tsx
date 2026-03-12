'use client'

import type {ReactNode} from 'react'
import Link from 'next/link'
import {ArrowLeft} from 'lucide-react'
import {AuthLinks} from '@/components/AuthLinks'
import {cn} from '@/lib/utils'

interface IntelPageChromeProps {
  badge?: ReactNode
  navActions?: ReactNode
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  backHref?: string
  backLabel?: string
  containerClassName?: string
  mainClassName?: string
  heroClassName?: string
}

export function IntelPageChrome({
  badge,
  navActions,
  eyebrow,
  title,
  description,
  children,
  backHref = '/',
  backLabel = 'Back to HQ',
  containerClassName,
  mainClassName,
  heroClassName,
}: IntelPageChromeProps) {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-200 font-mono'>
      <div className='fixed inset-0 pointer-events-none z-0'>
        <div className='absolute inset-0 dmg-grid-bg opacity-80' />
        <div className='absolute inset-0 dmg-page-glow' />
      </div>

      <nav className='fixed top-0 w-full border-b border-white/10 bg-zinc-950/88 backdrop-blur-xl z-50'>
        <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-6'>
          <Link
            href={backHref}
            className='flex items-center gap-2 text-zinc-400 hover:text-orange-500 transition-colors'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='text-sm'>{backLabel}</span>
          </Link>

          <div className='flex items-center gap-3 sm:gap-4'>
            {navActions}
            {badge ? <div className='flex items-center gap-2'>{badge}</div> : null}
            <AuthLinks />
          </div>
        </div>
      </nav>

      <main className={cn('relative z-10 px-6 pt-32 pb-20', mainClassName)}>
        <div className={cn('mx-auto max-w-6xl', containerClassName)}>
          {eyebrow || title || description ? (
            <div className={cn('mb-12 text-center md:mb-14', heroClassName)}>
              {eyebrow ? <div className='dmg-chip mb-6'>{eyebrow}</div> : null}
              {title ? <h1 className='text-display-md md:text-display-lg mb-4'>{title}</h1> : null}
              {description ? (
                <p className='mx-auto max-w-2xl font-sans text-body-lg text-zinc-400'>
                  {description}
                </p>
              ) : null}
            </div>
          ) : null}

          {children}
        </div>
      </main>
    </div>
  )
}
