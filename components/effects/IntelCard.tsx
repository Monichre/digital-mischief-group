'use client'

import {useState, useRef, memo, type MouseEvent} from 'react'
import {motion} from 'framer-motion'
import {cn} from '@/lib/utils'
import type {LucideIcon} from 'lucide-react'

interface IntelCardProps {
  icon: LucideIcon
  title: string
  subtitle: string
  description: string
  classification?: 'classified' | 'secret' | 'top-secret' | 'restricted'
  className?: string
}

/**
 * IntelCard - Glassmorphism card with animated border and status LED
 * Creates a tactical/intelligence briefing aesthetic
 */
export const IntelCard = memo(function IntelCard({
  icon: Icon,
  title,
  subtitle,
  description,
  classification,
  className,
}: IntelCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({x: 0, y: 0})
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const classificationConfig = {
    classified: {color: 'text-red-400', bg: 'bg-red-500'},
    secret: {color: 'text-orange-400', bg: 'bg-orange-500'},
    'top-secret': {color: 'text-red-500', bg: 'bg-red-600'},
    restricted: {color: 'text-yellow-400', bg: 'bg-yellow-500'},
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn('group relative', className)}
      whileHover={{y: -4}}
      transition={{duration: 0.3, ease: 'easeOut'}}
    >
      {/* Radial gradient following mouse */}
      <div
        className='pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100'
        style={{
          background: `radial-gradient(
            400px circle at ${mousePos.x}px ${mousePos.y}px,
            rgba(249, 115, 22, 0.12),
            transparent 60%
          )`,
        }}
      />

      {/* Animated border gradient */}
      <div className='absolute -inset-px overflow-hidden rounded-lg'>
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.5), transparent)',
            backgroundSize: '200% 100%',
            animation: isHovered ? 'border-flow 2s linear infinite' : 'none',
          }}
        />
      </div>

      {/* Main card content */}
      <div className='relative overflow-hidden rounded-lg border border-white/5 bg-zinc-900/70 p-8 backdrop-blur-xl'>
        {/* Corner cut decoration */}
        <div
          className='absolute right-0 top-0 h-8 w-8 bg-zinc-950'
          style={{clipPath: 'polygon(100% 0, 0 0, 100% 100%)'}}
        />
        <div
          className='absolute right-0 top-0 h-8 w-8 border-l border-b border-orange-500/20'
          style={{clipPath: 'polygon(100% 0, 0 0, 100% 100%)'}}
        />

        {/* Classification badge */}
        {classification && (
          <div className='absolute left-3 top-3 flex items-center gap-1.5'>
            <div
              className={cn(
                'h-1.5 w-1.5 animate-pulse rounded-full',
                classificationConfig[classification].bg
              )}
            />
            <span
              className={cn(
                'font-mono text-[8px] uppercase tracking-widest',
                classificationConfig[classification].color
              )}
            >
              {classification}
            </span>
          </div>
        )}

        {/* Icon with glow */}
        <div className='relative mb-5 h-14 w-14'>
          <div className='absolute inset-0 rounded-lg bg-orange-500/20 blur-xl transition-all duration-300 group-hover:bg-orange-500/30' />
          <div className='relative flex h-full w-full items-center justify-center rounded-lg border border-orange-500/30 bg-zinc-950'>
            <Icon className='h-7 w-7 text-orange-500 transition-transform duration-300 group-hover:scale-110' />
          </div>
        </div>

        {/* Subtitle label */}
        <div className='mb-1 font-mono text-[10px] uppercase tracking-widest text-orange-500/70'>
          {subtitle}
        </div>

        {/* Title */}
        <h3 className='mb-3 text-xl font-bold text-zinc-100'>{title}</h3>

        {/* Divider line */}
        <div className='mb-3 h-px w-12 bg-gradient-to-r from-orange-500/50 to-transparent' />

        {/* Description */}
        <p className='text-sm leading-relaxed text-zinc-400'>{description}</p>

        {/* Bottom fade overlay */}
        <div className='pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-zinc-900/50 to-transparent' />

        {/* Corner accent lines */}
        <div className='absolute bottom-3 left-3 h-4 w-4 border-b border-l border-orange-500/20' />
        <div className='absolute bottom-3 right-3 h-4 w-4 border-b border-r border-orange-500/20' />
      </div>
    </motion.div>
  )
})
