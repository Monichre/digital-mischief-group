'use client'

import {memo} from 'react'
import {motion} from 'framer-motion'
import {cn} from '@/lib/utils'

interface GlowingOrbProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'orange' | 'cyan' | 'red'
  className?: string
  pulseSpeed?: number
}

const SIZE_MAP = {
  sm: 'w-16 h-16',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
  xl: 'w-64 h-64',
}

const COLOR_MAP = {
  orange: {
    core: 'rgba(249,115,22,0.6)',
    mid: 'rgba(249,115,22,0.3)',
    outer: 'rgba(249,115,22,0.1)',
  },
  cyan: {
    core: 'rgba(34,211,238,0.6)',
    mid: 'rgba(34,211,238,0.3)',
    outer: 'rgba(34,211,238,0.1)',
  },
  red: {
    core: 'rgba(239,68,68,0.6)',
    mid: 'rgba(239,68,68,0.3)',
    outer: 'rgba(239,68,68,0.1)',
  },
}

/**
 * GlowingOrb - Animated glowing sphere effect
 * Creates visual anchors and atmospheric depth
 */
export const GlowingOrb = memo(function GlowingOrb({
  size = 'md',
  color = 'orange',
  className,
  pulseSpeed = 4,
}: GlowingOrbProps) {
  const colors = COLOR_MAP[color]

  return (
    <motion.div
      className={cn(
        'absolute rounded-full pointer-events-none',
        SIZE_MAP[size],
        className
      )}
      style={{
        background: `radial-gradient(circle, ${colors.core} 0%, ${colors.mid} 40%, ${colors.outer} 70%, transparent 100%)`,
        filter: 'blur(20px)',
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: pulseSpeed,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
})
