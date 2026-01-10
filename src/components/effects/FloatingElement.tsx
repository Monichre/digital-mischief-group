'use client'

import {memo, type ReactNode} from 'react'
import {motion} from 'framer-motion'
import {cn} from '@/lib/utils'

interface FloatingElementProps {
  children: ReactNode
  className?: string
  amplitude?: number
  duration?: number
  delay?: number
}

/**
 * FloatingElement - Gentle floating animation wrapper
 * Creates organic movement for decorative elements
 */
export const FloatingElement = memo(function FloatingElement({
  children,
  className,
  amplitude = 20,
  duration = 6,
  delay = 0,
}: FloatingElementProps) {
  return (
    <motion.div
      className={cn('pointer-events-none', className)}
      animate={{
        y: [-amplitude, amplitude, -amplitude],
        rotate: [-2, 2, -2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  )
})
