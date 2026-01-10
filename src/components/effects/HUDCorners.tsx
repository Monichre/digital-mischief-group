'use client'

import {useState, useEffect, memo, type ReactNode} from 'react'
import {cn} from '@/lib/utils'

interface HUDCornersProps {
  children: ReactNode
  className?: string
  status?: 'online' | 'scanning' | 'alert' | 'standby'
  showCoords?: boolean
  showTimestamp?: boolean
  label?: string
}

/**
 * HUDCorners - Decorative corner brackets with status indicators
 * Creates a military/tactical interface aesthetic
 */
export const HUDCorners = memo(function HUDCorners({
  children,
  className,
  status = 'online',
  showCoords = false,
  showTimestamp = false,
  label,
}: HUDCornersProps) {
  const [timestamp, setTimestamp] = useState('')

  useEffect(() => {
    if (!showTimestamp) return

    const updateTime = () => {
      const now = new Date()
      setTimestamp(now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC')
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [showTimestamp])

  const statusConfig = {
    online: {color: 'bg-green-500', text: 'ONLINE', animate: 'animate-pulse'},
    scanning: {
      color: 'bg-orange-500',
      text: 'SCANNING',
      animate: 'animate-ping',
    },
    alert: {color: 'bg-red-500', text: 'ALERT', animate: 'animate-pulse'},
    standby: {color: 'bg-zinc-500', text: 'STANDBY', animate: ''},
  }

  const {color, text, animate} = statusConfig[status]

  return (
    <div className={cn('relative', className)}>
      {/* Top-left corner */}
      <div className='absolute -left-3 -top-3 h-6 w-6'>
        <svg className='h-full w-full' viewBox='0 0 24 24' fill='none'>
          <path
            d='M0 20 L0 4 L4 0 L20 0'
            stroke='currentColor'
            strokeWidth='2'
            className='text-orange-500'
          />
        </svg>
        {showCoords && (
          <span className='absolute left-6 top-0 whitespace-nowrap font-mono text-[8px] text-orange-500/40'>
            37.7749° N
          </span>
        )}
      </div>

      {/* Top-right corner */}
      <div className='absolute -right-3 -top-3 h-6 w-6'>
        <svg className='h-full w-full' viewBox='0 0 24 24' fill='none'>
          <path
            d='M24 20 L24 4 L20 0 L4 0'
            stroke='currentColor'
            strokeWidth='2'
            className='text-orange-500'
          />
        </svg>
        {showCoords && (
          <span className='absolute right-6 top-0 whitespace-nowrap font-mono text-[8px] text-orange-500/40'>
            122.4194° W
          </span>
        )}
      </div>

      {/* Bottom-left corner */}
      <div className='absolute -bottom-3 -left-3 h-6 w-6'>
        <svg className='h-full w-full' viewBox='0 0 24 24' fill='none'>
          <path
            d='M0 4 L0 20 L4 24 L20 24'
            stroke='currentColor'
            strokeWidth='2'
            className='text-orange-500'
          />
        </svg>
      </div>

      {/* Bottom-right corner */}
      <div className='absolute -bottom-3 -right-3 h-6 w-6'>
        <svg className='h-full w-full' viewBox='0 0 24 24' fill='none'>
          <path
            d='M24 4 L24 20 L20 24 L4 24'
            stroke='currentColor'
            strokeWidth='2'
            className='text-orange-500'
          />
        </svg>
      </div>

      {/* Top center - Status indicator */}
      <div className='absolute -top-6 left-1/2 flex -translate-x-1/2 flex-col items-center'>
        <span className='font-mono text-[8px] uppercase tracking-widest text-orange-500/60'>
          {label || text}
        </span>
        <div className={cn('mt-1 h-1.5 w-1.5 rounded-full', color, animate)} />
      </div>

      {/* Bottom center - Timestamp */}
      {showTimestamp && (
        <div className='absolute -bottom-6 left-1/2 -translate-x-1/2'>
          <span className='font-mono text-[8px] text-zinc-600'>
            {timestamp}
          </span>
        </div>
      )}

      {/* Content */}
      <div className='relative'>{children}</div>
    </div>
  )
})
