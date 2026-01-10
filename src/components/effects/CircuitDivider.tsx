'use client'

import {useState, useEffect, useRef, memo} from 'react'
import {motion} from 'framer-motion'
import {cn} from '@/lib/utils'

interface CircuitDividerProps {
  className?: string
}

/**
 * CircuitDivider - Animated circuit-like section divider
 * Creates visual separation with data-flow animation
 */
export const CircuitDivider = memo(function CircuitDivider({
  className,
}: CircuitDividerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {threshold: 0.5}
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn('relative h-16 w-full overflow-hidden', className)}
    >
      {/* Center diamond node */}
      <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
        <div className='relative h-3 w-3 rotate-45 border border-orange-500/50 bg-zinc-950'>
          <div
            className={cn(
              'absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 bg-orange-500 transition-opacity duration-500',
              isVisible ? 'opacity-100' : 'opacity-0'
            )}
          />
        </div>
      </div>

      {/* Left line */}
      <div
        className={cn(
          'absolute right-1/2 top-1/2 h-px origin-right bg-gradient-to-l from-orange-500/50 to-transparent transition-transform duration-1000',
          isVisible ? 'scale-x-100' : 'scale-x-0'
        )}
        style={{width: 'calc(50% - 24px)', marginRight: '12px'}}
      />

      {/* Right line */}
      <div
        className={cn(
          'absolute left-1/2 top-1/2 h-px origin-left bg-gradient-to-r from-orange-500/50 to-transparent transition-transform delay-200 duration-1000',
          isVisible ? 'scale-x-100' : 'scale-x-0'
        )}
        style={{width: 'calc(50% - 24px)', marginLeft: '12px'}}
      />

      {/* Data pulse - left */}
      {isVisible && (
        <>
          <motion.div
            className='absolute top-1/2 h-px w-8 bg-orange-500'
            style={{right: '50%', marginRight: '12px'}}
            initial={{x: 0, opacity: 0}}
            animate={{x: '-100%', opacity: [0, 1, 0]}}
            transition={{
              duration: 1.5,
              delay: 1,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
          <motion.div
            className='absolute top-1/2 h-px w-8 bg-orange-500'
            style={{left: '50%', marginLeft: '12px'}}
            initial={{x: 0, opacity: 0}}
            animate={{x: '100%', opacity: [0, 1, 0]}}
            transition={{
              duration: 1.5,
              delay: 1.2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        </>
      )}

      {/* Secondary nodes */}
      <div
        className={cn(
          'absolute left-1/4 top-1/2 h-1 w-1 -translate-y-1/2 rotate-45 border border-orange-500/30 transition-opacity delay-500 duration-500',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        className={cn(
          'absolute right-1/4 top-1/2 h-1 w-1 -translate-y-1/2 rotate-45 border border-orange-500/30 transition-opacity delay-700 duration-500',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  )
})
