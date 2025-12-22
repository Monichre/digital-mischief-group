'use client'

import {memo, useState, useEffect} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {cn} from '@/lib/utils'

interface SniperScopeProps {
  isActive: boolean
  className?: string
}

/**
 * SniperScope - Animated crosshairs targeting effect
 * Creates a sniper scope lock-on aesthetic for team member cards
 */
export const SniperScope = memo(function SniperScope({
  isActive,
  className,
}: SniperScopeProps) {
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    if (isActive) {
      // Simulate lock-on delay
      const timer = setTimeout(() => setIsLocked(true), 300)
      return () => clearTimeout(timer)
    } else {
      setIsLocked(false)
    }
  }, [isActive])

  return (
    <AnimatePresence>
      {isActive && (
        <div
          className={cn('absolute inset-0 pointer-events-none z-20', className)}
        >
          {/* Outer rotating ring */}
          <motion.div
            className='absolute inset-2'
            initial={{opacity: 0, scale: 1.5, rotate: -180}}
            animate={{opacity: 1, scale: 1, rotate: 0}}
            exit={{opacity: 0, scale: 0.8, rotate: 90}}
            transition={{duration: 0.4, ease: 'easeOut'}}
          >
            {/* Corner brackets - animated in */}
            <motion.div
              className='absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-red-500'
              initial={{x: -10, y: -10, opacity: 0}}
              animate={{x: 0, y: 0, opacity: 1}}
              transition={{delay: 0.1}}
            />
            <motion.div
              className='absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-red-500'
              initial={{x: 10, y: -10, opacity: 0}}
              animate={{x: 0, y: 0, opacity: 1}}
              transition={{delay: 0.15}}
            />
            <motion.div
              className='absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-red-500'
              initial={{x: -10, y: 10, opacity: 0}}
              animate={{x: 0, y: 0, opacity: 1}}
              transition={{delay: 0.2}}
            />
            <motion.div
              className='absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-red-500'
              initial={{x: 10, y: 10, opacity: 0}}
              animate={{x: 0, y: 0, opacity: 1}}
              transition={{delay: 0.25}}
            />
          </motion.div>

          {/* Center crosshairs */}
          <div className='absolute inset-0 flex items-center justify-center'>
            {/* Horizontal line */}
            <motion.div
              className='absolute h-[1px] bg-red-500/80'
              initial={{width: 0}}
              animate={{width: '60%'}}
              exit={{width: 0}}
              transition={{duration: 0.3}}
            />
            {/* Vertical line */}
            <motion.div
              className='absolute w-[1px] bg-red-500/80'
              initial={{height: 0}}
              animate={{height: '60%'}}
              exit={{height: 0}}
              transition={{duration: 0.3}}
            />

            {/* Center circle - pulsing */}
            <motion.div
              className='absolute w-8 h-8 rounded-full border border-red-500/60'
              initial={{scale: 2, opacity: 0}}
              animate={{
                scale: isLocked ? [1, 1.1, 1] : 1,
                opacity: 1,
              }}
              exit={{scale: 0, opacity: 0}}
              transition={{
                duration: 0.3,
                scale: isLocked ? {duration: 0.5, repeat: Infinity} : undefined,
              }}
            />

            {/* Inner targeting dot */}
            <motion.div
              className='absolute w-2 h-2 rounded-full bg-red-500'
              initial={{scale: 0}}
              animate={{scale: isLocked ? 1 : 0.5}}
              exit={{scale: 0}}
              transition={{delay: 0.2}}
              style={{
                boxShadow: isLocked
                  ? '0 0 10px rgba(239,68,68,0.8), 0 0 20px rgba(239,68,68,0.4)'
                  : 'none',
              }}
            />
          </div>

          {/* Range finder marks */}
          <motion.div
            className='absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1'
            initial={{opacity: 0, x: -10}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0}}
            transition={{delay: 0.3}}
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className='h-[1px] bg-red-500/50'
                style={{width: `${8 + (i % 2) * 4}px`}}
              />
            ))}
          </motion.div>

          <motion.div
            className='absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 items-end'
            initial={{opacity: 0, x: 10}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0}}
            transition={{delay: 0.3}}
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className='h-[1px] bg-red-500/50'
                style={{width: `${8 + (i % 2) * 4}px`}}
              />
            ))}
          </motion.div>

          {/* Target lock indicator */}
          <AnimatePresence>
            {isLocked && (
              <motion.div
                className='absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-mono text-red-500 tracking-widest'
                initial={{opacity: 0, y: 5}}
                animate={{opacity: [0.5, 1, 0.5], y: 0}}
                exit={{opacity: 0}}
                transition={{
                  opacity: {duration: 1, repeat: Infinity},
                  y: {duration: 0.2},
                }}
              >
                TARGET LOCKED
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scan line animation */}
          <motion.div
            className='absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent'
            initial={{top: '0%'}}
            animate={{top: ['0%', '100%', '0%']}}
            transition={{duration: 2, repeat: Infinity, ease: 'linear'}}
          />

          {/* Corner data readouts */}
          <motion.div
            className='absolute top-1 right-1 text-[6px] font-mono text-red-500/70 text-right'
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{delay: 0.4}}
          >
            <div>RNG: 0.0M</div>
            <div>ELV: 0°</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
})
