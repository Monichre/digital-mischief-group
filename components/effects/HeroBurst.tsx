'use client'

import {memo} from 'react'
import {motion} from 'framer-motion'

/**
 * HeroBurst - Dramatic radial burst effect for hero sections
 * Creates a glowing, pulsing energy source aesthetic
 */
export const HeroBurst = memo(function HeroBurst() {
  return (
    <div className='absolute inset-0 overflow-hidden pointer-events-none'>
      {/* Horizontal scanline/band - atmospheric glow across middle */}
      <div
        className='absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[300px]'
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(249,115,22,0.08) 30%, rgba(249,115,22,0.12) 50%, rgba(249,115,22,0.08) 70%, transparent 100%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Top-down gradient wash */}
      <div
        className='absolute inset-0'
        style={{
          background:
            'linear-gradient(180deg, rgba(5,5,7,0.3) 0%, transparent 30%, transparent 70%, rgba(5,5,7,0.8) 100%)',
        }}
      />

      {/* Floating orbs */}
      <motion.div
        className='absolute top-[20%] left-[15%] w-32 h-32 rounded-full'
        style={{
          background:
            'radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className='absolute top-[60%] right-[10%] w-48 h-48 rounded-full'
        style={{
          background:
            'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{
          y: [0, 40, 0],
          x: [0, -30, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      <motion.div
        className='absolute top-[30%] right-[25%] w-24 h-24 rounded-full'
        style={{
          background:
            'radial-gradient(circle, rgba(251,146,60,0.25) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
        animate={{
          y: [0, 20, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </div>
  )
})
