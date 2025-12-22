'use client'

import {useState, useEffect, memo} from 'react'
import {cn} from '@/lib/utils'

interface HoloTextProps {
  children: React.ReactNode
  className?: string
  glitchInterval?: number // ms between glitches, 0 to disable
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div'
}

/**
 * HoloText - Holographic text with chromatic aberration and glitch effect
 * Creates a futuristic, unstable data transmission aesthetic
 */
export const HoloText = memo(function HoloText({
  children,
  className,
  glitchInterval = 5000,
  as: Component = 'span',
}: HoloTextProps) {
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    if (glitchInterval <= 0) return

    const triggerGlitch = () => {
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 150)
    }

    // Initial glitch after a short delay
    const initialTimeout = setTimeout(triggerGlitch, 1000)

    // Recurring glitches
    const interval = setInterval(triggerGlitch, glitchInterval)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [glitchInterval])

  return (
    <Component className={cn('relative inline-block', className)}>
      {/* Cyan offset layer */}
      <span
        aria-hidden='true'
        className='absolute inset-0 select-none'
        style={{
          color: '#00ffff',
          transform: isGlitching
            ? 'translateX(-4px) translateY(-1px)'
            : 'translateX(-2px)',
          transition: isGlitching ? 'none' : 'transform 0.15s ease-out',
          opacity: 0.7,
          filter: 'blur(0.5px)',
        }}
      >
        {children}
      </span>

      {/* Red/magenta offset layer */}
      <span
        aria-hidden='true'
        className='absolute inset-0 select-none'
        style={{
          color: '#ff0040',
          transform: isGlitching
            ? 'translateX(4px) translateY(1px)'
            : 'translateX(2px)',
          transition: isGlitching ? 'none' : 'transform 0.15s ease-out',
          opacity: 0.7,
          filter: 'blur(0.5px)',
        }}
      >
        {children}
      </span>

      {/* Main text layer (visible) */}
      <span className='relative'>{children}</span>
    </Component>
  )
})
