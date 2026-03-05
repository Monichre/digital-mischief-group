'use client'

import {Menu, X} from 'lucide-react'
import {useMenu} from './MenuProvider'
import {cn} from '@/lib/utils'

interface MenuToggleProps {
  className?: string
}

export function MenuToggle({className}: MenuToggleProps) {
  const {toggleMenu, isOpen, isToggleDisabled} = useMenu()
  const menuLabel = isToggleDisabled
    ? 'Navigation menu unavailable while request audit modal is open'
    : isOpen
      ? 'Close navigation menu'
      : 'Open navigation menu'

  return (
    <button
      onClick={toggleMenu}
      disabled={isToggleDisabled}
      className={cn(
        'fixed top-4 right-6 z-[110] p-2.5 border backdrop-blur-md',
        'hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-300',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-800 disabled:hover:bg-zinc-950/90',
        'group',
        isOpen
          ? 'border-orange-500/60 bg-orange-500/15'
          : 'border-zinc-800 bg-zinc-950/90',
        className
      )}
      aria-label={menuLabel}
      aria-disabled={isToggleDisabled}
      aria-expanded={isOpen}
      aria-controls='fullscreen-navigation'
      aria-pressed={isOpen}
      tabIndex={isToggleDisabled ? -1 : 0}
      data-state={isOpen ? 'open' : 'closed'}
    >
      <span className='sr-only'>{menuLabel}</span>
      {isOpen ? (
        <X className='w-5 h-5 text-orange-500 transition-colors' />
      ) : (
        <Menu className='w-5 h-5 text-zinc-400 group-hover:text-orange-500 transition-colors' />
      )}
    </button>
  )
}
