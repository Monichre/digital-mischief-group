'use client'

import {motion} from 'framer-motion'
import {useEffect, useState} from 'react'

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface CircleAnimationProps {
  isAnimating?: boolean
  width: number
  height: number
  index: number
  opacity: number
}

const CircleAnimation = ({
  isAnimating,
  width,
  height,
  index,
  opacity,
}: CircleAnimationProps) => {
  return (
    <motion.div
      animate={isAnimating ? {scale: [1, 0.95, 1.1, 1.05, 1]} : {scale: 1}}
      transition={{
        duration: 1.2,
        ease: 'linear',
        delay: 0.5 + index * 0.1,
        times: [0, 0.25, 0.5, 0.75, 1],
      }}
      className='absolute rounded-full'
      style={{
        width,
        height,
        top: `calc(50% - ${height / 2}px)`,
        left: `calc(50% - ${width / 2}px)`,
        padding: '1.5px',
        backgroundImage:
          'linear-gradient(180deg, rgba(16, 185, 129, 0.42), #222 44.79%)',
        boxShadow: 'inset 0 -16px 32px rgba(16, 185, 129, 0.04)',
        WebkitMask:
          'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
        opacity,
      }}
    />
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface RoleBasedAccessControlProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const RoleBasedAccessControl = ({
  className,
  size = 'md',
}: RoleBasedAccessControlProps) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const tid = setTimeout(() => {
      setIsAnimating(true)
    }, 250)

    const resetInt = setInterval(() => {
      setIsAnimating(false)
      setTimeout(() => {
        setIsAnimating(true)
      }, 1500)
    }, 6000)

    return () => {
      clearTimeout(tid)
      clearInterval(resetInt)
    }
  }, [])

  // Size multipliers
  const sizeMultiplier = size === 'sm' ? 0.5 : size === 'lg' ? 1 : 0.7
  const containerSize = 400 * sizeMultiplier

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{
        height: containerSize,
        width: containerSize,
        mask: 'radial-gradient(90% 88% at 50% 50%, #fff 10%, transparent 65%)',
      }}
    >
      <CircleAnimation
        width={360 * sizeMultiplier}
        height={360 * sizeMultiplier}
        index={2}
        opacity={0.5}
        isAnimating={isAnimating}
      />
      <CircleAnimation
        width={270 * sizeMultiplier}
        height={270 * sizeMultiplier}
        index={1}
        opacity={0.5}
        isAnimating={isAnimating}
      />
      <CircleAnimation
        width={180 * sizeMultiplier}
        height={180 * sizeMultiplier}
        index={0}
        opacity={0.5}
        isAnimating={isAnimating}
      />

      {/* Toggle switch */}
      <motion.div
        animate={
          isAnimating ? {scale: [1, 1.05, 0.9, 0.95, 1.05, 1]} : {scale: 1}
        }
        transition={{
          duration: 1.15,
          ease: 'easeInOut',
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        }}
        className='relative flex items-center rounded-full bg-black/30 px-2'
        style={{
          height: 74 * sizeMultiplier,
          width: 140 * sizeMultiplier,
          boxShadow:
            'inset 0 0 50px 0 rgba(16, 185, 129, 0.08), inset 0 -8px 10px 0 rgba(16, 185, 129, 0.02)',
        }}
      >
        {/* Border gradient */}
        <div
          className='pointer-events-none absolute inset-0 rounded-full p-px'
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0))',
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
          }}
        />

        {/* Toggle knob */}
        <div
          className='flex items-center justify-center rounded-full transition-all duration-400'
          style={{
            height: 60 * sizeMultiplier,
            width: 60 * sizeMultiplier,
            border: isAnimating
              ? '1px solid rgb(16, 185, 129)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            transform: isAnimating ? 'translateX(100%)' : 'translateX(0)',
            transitionDelay: isAnimating ? '0.4s' : '0s',
            filter: isAnimating
              ? 'drop-shadow(0 0 4px rgb(16, 185, 129))'
              : 'none',
            transitionTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          }}
        >
          <svg
            width={60 * sizeMultiplier}
            height={60 * sizeMultiplier}
            viewBox='0 0 72 72'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M36 36a4.875 4.875 0 1 0 0-9.75A4.875 4.875 0 0 0 36 36Zm7.694 9.75c1.004 0 1.776-.912 1.417-1.85a9.753 9.753 0 0 0-18.224 0c-.358.938.412 1.85 1.417 1.85h15.39Z'
              fill='currentColor'
              className={isAnimating ? 'text-emerald-500' : 'text-white'}
            />
          </svg>
        </div>
      </motion.div>
    </div>
  )
}

export default RoleBasedAccessControl
