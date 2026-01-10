'use client'

import {memo} from 'react'
import {cn} from '@/lib/utils'

interface SectionGlowProps {
  position?: 'top' | 'bottom' | 'center' | 'left' | 'right'
  intensity?: 'subtle' | 'medium' | 'strong'
  className?: string
}

const POSITION_STYLES = {
  top: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
  bottom: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  left: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',
  right: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',
}

const INTENSITY_STYLES = {
  subtle: 'w-[400px] h-[400px] opacity-20',
  medium: 'w-[600px] h-[600px] opacity-40',
  strong: 'w-[800px] h-[800px] opacity-60',
}

/**
 * SectionGlow - Adds atmospheric glow to sections
 * Creates visual depth and draws attention
 */
export const SectionGlow = memo(function SectionGlow({
  position = 'center',
  intensity = 'medium',
  className,
}: SectionGlowProps) {
  return (
    <div
      className={cn(
        'absolute rounded-full pointer-events-none',
        POSITION_STYLES[position],
        INTENSITY_STYLES[intensity],
        className
      )}
      style={{
        background:
          'radial-gradient(circle, rgba(249,115,22,0.4) 0%, rgba(249,115,22,0.1) 40%, transparent 70%)',
        filter: 'blur(80px)',
      }}
    />
  )
})
