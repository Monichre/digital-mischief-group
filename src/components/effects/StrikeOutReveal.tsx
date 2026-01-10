'use client'

import {memo, useState, useEffect, useRef} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {cn} from '@/lib/utils'

interface StrikeOutRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number // delay before animation starts (in seconds)
  duration?: number // duration of strikethrough (in seconds)
}

/**
 * StrikeOutReveal - Animated strikethrough with skull icon
 * Draws a line through text and reveals a skull icon at the end
 */
export const StrikeOutReveal = memo(function StrikeOutReveal({
  children,
  className,
  delay = 0,
  duration = 0.6,
}: StrikeOutRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      {threshold: 0.5}
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  return (
    <div
      ref={containerRef}
      className={cn('relative flex items-center gap-3 w-full', className)}
    >
      {/* Text content */}
      <span className='relative inline-block'>
        {children}

        {/* Strikethrough line */}
        <AnimatePresence>
          {isVisible && (
            <motion.span
              className='absolute left-0 top-1/2 h-[1.5px] bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 rounded-full'
              style={{
                boxShadow:
                  '0 0 10px rgba(249, 115, 22, 0.6), 0 0 20px rgba(249, 115, 22, 0.3)',
              }}
              initial={{width: 0}}
              animate={{width: '100%'}}
              transition={{
                duration,
                delay,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              onAnimationComplete={() => setIsComplete(true)}
            />
          )}
        </AnimatePresence>
      </span>

      {/* Skull icon - appears after strikethrough completes */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{scale: 0, opacity: 0}}
            animate={{
              scale: [0, 1.2, 1],
              opacity: 1,
            }}
            transition={{
              duration: 0.3,
              ease: 'backOut',
            }}
            className='flex-shrink-0'
          >
            {/* KIA Badge */}
            <span
              className='text-xs font-bold tracking-widest text-orange-500 px-1.5 py-0.5 border border-orange-500/50 bg-orange-500/10'
              style={{
                textShadow: '0 0 8px rgba(249, 115, 22, 0.8)',
                boxShadow: '0 0 10px rgba(249, 115, 22, 0.3)',
              }}
            >
              KIA
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
