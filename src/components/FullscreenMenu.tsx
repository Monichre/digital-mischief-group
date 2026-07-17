'use client'

import {useEffect, useRef, useState} from 'react'
import Link from 'next/link'
import {
  X,
  Flame,
  ArrowRight,
  Archive,
  Sparkles,
  Shield,
  Crosshair,
  Brain,
  Palette,
  Cpu,
} from 'lucide-react'
import {cn} from '@/lib/utils'

interface FullscreenMenuProps {
  isOpen: boolean
  onClose: () => void
}

const PARTICLES = Array.from({length: 20}, (_, index) => ({
  left: `${(index * 47 + 13) % 101}%`,
  top: `${(index * 71 + 29) % 103}%`,
  delay: `${index * 0.2}s`,
  duration: `${3 + ((index * 17) % 37) / 10}s`,
}))

const MENU_ITEMS = [
  {
    label: 'Cortex Vault',
    href: '/cortex',
    number: '00',
    icon: Archive,
    description: 'Classified dossier library',
  },
  {
    label: 'Enrich',
    href: '/enrich',
    number: '01',
    icon: Sparkles,
    description: 'Multi-agent company intelligence',
  },
  {
    label: 'Research',
    href: '/research/live',
    number: '02',
    icon: Brain,
    description: 'Real-time intelligence synthesis',
  },
  {
    label: 'Brand Recon',
    href: '/brand-recon',
    number: '03',
    icon: Palette,
    description: 'Extract brand identity from any URL',
  },
  {
    label: 'Sentinels',
    href: '/scouts',
    number: '04',
    icon: Shield,
    description: 'Automated competitive monitoring',
  },
  {
    label: 'Observe',
    href: '/observe',
    number: '05',
    icon: Crosshair,
    description: 'Page change detection',
  },
  {
    label: 'Weaponize Browser',
    href: '/weaponize-browser',
    number: '06',
    icon: Flame,
    description: 'Browser sandbox + agent + Hyper strategies',
  },
  {
    label: 'Workspace',
    href: '/workspace',
    number: '07',
    icon: Cpu,
    description: 'Daedalus mission control',
  },
]

export function FullscreenMenu({isOpen, onClose}: FullscreenMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({x: 0, y: 0})

  // Track mouse for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({x: e.clientX, y: e.clientY})
    }
    if (isOpen) {
      window.addEventListener('mousemove', handleMouseMove)
    }
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isOpen])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Parallax calculation
  const parallaxX =
    (mousePosition.x / (typeof window !== 'undefined' ? window.innerWidth : 1) -
      0.5) *
    20
  const parallaxY =
    (mousePosition.y /
      (typeof window !== 'undefined' ? window.innerHeight : 1) -
      0.5) *
    20

  return (
    <div
      id='fullscreen-navigation'
      ref={containerRef}
      aria-hidden={!isOpen}
      className={cn(
        'fixed inset-0 z-[100] transition-all duration-700 ease-out',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-zinc-950 transition-opacity duration-700',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Animated radial gradient that follows mouse */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-1000',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{
          background: `radial-gradient(circle 600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(234, 88, 12, 0.08), transparent)`,
        }}
      />

      {/* Animated grid lines with parallax */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-1000 delay-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{
          transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)`,
        }}
      >
        {/* Vertical lines */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`v-${i}`}
            className={cn(
              'absolute top-0 w-px transition-all duration-1000 ease-out',
              isOpen ? 'h-full' : 'h-0'
            )}
            style={{
              left: `${(i + 1) * 12.5}%`,
              transitionDelay: `${i * 50}ms`,
              background: `linear-gradient(to bottom, transparent, rgba(234, 88, 12, ${
                0.05 + (i % 3) * 0.05
              }), transparent)`,
            }}
          />
        ))}
        {/* Horizontal lines */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`h-${i}`}
            className={cn(
              'absolute left-0 h-px transition-all duration-1000 ease-out',
              isOpen ? 'w-full' : 'w-0'
            )}
            style={{
              top: `${(i + 1) * 16.66}%`,
              transitionDelay: `${i * 50 + 100}ms`,
              background: `linear-gradient(to right, transparent, rgba(234, 88, 12, ${
                0.05 + (i % 3) * 0.05
              }), transparent)`,
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div
        className={cn(
          'absolute inset-0 overflow-hidden transition-opacity duration-1000',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        {PARTICLES.map((particle, i) => (
          <div
            key={`particle-${i}`}
            className='absolute w-1 h-1 bg-orange-500/30 rounded-full animate-float'
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      {/* Corner decorations with glow */}
      {[
        {pos: 'top-8 left-8', border: 'border-l-2 border-t-2', delay: '400ms'},
        {pos: 'top-8 right-8', border: 'border-r-2 border-t-2', delay: '450ms'},
        {
          pos: 'bottom-8 left-8',
          border: 'border-l-2 border-b-2',
          delay: '500ms',
        },
        {
          pos: 'bottom-8 right-8',
          border: 'border-r-2 border-b-2',
          delay: '550ms',
        },
      ].map((corner, i) => (
        <div
          key={i}
          className={cn(
            `absolute ${corner.pos} w-20 h-20 ${corner.border} border-orange-500/50 transition-all duration-500`,
            isOpen
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-75 pointer-events-none'
          )}
          style={{
            transitionDelay: corner.delay,
            boxShadow: isOpen ? '0 0 20px rgba(234, 88, 12, 0.2)' : 'none',
          }}
        />
      ))}

      {/* Close button */}
      <button
        onClick={onClose}
        aria-label='Close navigation menu'
        className={cn(
          'absolute top-8 right-8 z-10 p-4 border border-orange-500/30 hover:border-orange-500 hover:bg-orange-500/10 transition-all duration-300 group',
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        )}
        style={{transitionDelay: isOpen ? '600ms' : '0ms'}}
      >
        <X className='w-6 h-6 text-orange-500 group-hover:rotate-90 transition-transform duration-500' />
      </button>

      {/* Logo */}
      <Link
        href='/'
        onClick={onClose}
        className={cn(
          'absolute top-8 left-12 transition-all duration-500 hover:opacity-80',
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        )}
        style={{transitionDelay: isOpen ? '600ms' : '0ms'}}
      >
        <div className='flex items-center gap-3'>
          <Flame className='w-6 h-6 text-orange-500 animate-pulse' />
          <span className='text-xs tracking-[0.3em] text-zinc-400 font-mono'>
            DIGITAL MISCHIEF GROUP
          </span>
        </div>
      </Link>

      {/* Main menu content */}
      <div
        className={cn(
          'relative h-full flex items-center justify-center px-4',
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        <nav
          aria-label='Main navigation'
          className='flex flex-col items-center space-y-3 md:space-y-4 w-full max-w-5xl'
        >
          {MENU_ITEMS.map((item, index) => {
            const Icon = item.icon
            const isHovered = hoveredIndex === index

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  'group relative flex items-center gap-4 sm:gap-6 md:gap-8 py-4 sm:py-5 md:py-6 px-4 sm:px-6 md:px-10 transition-all duration-700 ease-out w-full',
                  isOpen
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-12 pointer-events-none'
                )}
                style={{
                  transitionDelay: isOpen ? `${index * 100 + 300}ms` : '0ms',
                  transform: isOpen
                    ? `translateY(0) translateX(${isHovered ? 20 : 0}px)`
                    : 'translateY(48px)',
                }}
              >
                {/* Number */}
                <span
                  className={cn(
                    'text-[0.55rem] sm:text-[0.6rem] md:text-[0.65rem] tracking-[0.2em] font-mono w-6 sm:w-8 transition-all duration-300',
                    isHovered ? 'text-orange-500' : 'text-orange-500/30'
                  )}
                >
                  {item.number}
                </span>

                {/* Icon */}
                <div
                  className={cn(
                    'relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border transition-all duration-500',
                    isHovered
                      ? 'border-orange-500 bg-orange-500/10 scale-110'
                      : 'border-zinc-700 bg-zinc-900/50'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 md:w-5 md:h-5 transition-all duration-300',
                      isHovered ? 'text-orange-500' : 'text-zinc-500'
                    )}
                  />
                  {isHovered && (
                    <div className='absolute inset-0 border border-orange-500 animate-ping opacity-50' />
                  )}
                </div>

                {/* Label */}
                <div className='flex flex-col'>
                  <span
                    className={cn(
                      'text-[clamp(2.25rem,6vw,4.75rem)] font-extralight tracking-tight transition-all duration-300 leading-[1.05]',
                      isHovered ? 'text-orange-500' : 'text-zinc-200'
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      'text-[0.6rem] sm:text-[0.65rem] md:text-[0.7rem] tracking-[0.15em] uppercase mt-1 transition-all duration-300',
                      isHovered
                        ? 'text-orange-500/70 translate-x-0 opacity-100'
                        : 'text-zinc-600 -translate-x-2 opacity-0'
                    )}
                  >
                    {item.description}
                  </span>
                </div>

                {/* Arrow */}
                <ArrowRight
                  className={cn(
                    'w-6 h-6 md:w-8 md:h-8 transition-all duration-500',
                    isHovered
                      ? 'text-orange-500 opacity-100 translate-x-0'
                      : 'text-orange-500/30 opacity-0 -translate-x-8'
                  )}
                />

                {/* Hover line */}
                <div
                  className={cn(
                    'absolute bottom-0 left-16 sm:left-20 right-0 h-px bg-gradient-to-r from-orange-500/50 to-transparent transition-all duration-500',
                    isHovered
                      ? 'opacity-100 scale-x-100'
                      : 'opacity-0 scale-x-0'
                  )}
                  style={{transformOrigin: 'left'}}
                />
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom status bar */}
      <div
        className={cn(
          'absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 text-[0.6rem] tracking-[0.2em] text-zinc-600 transition-all duration-500 font-mono',
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        )}
        style={{transitionDelay: isOpen ? '800ms' : '0ms'}}
      >
        <span>V.2.4.1</span>
        <span className='w-px h-3 bg-zinc-700' />
        <span>DMG_INTERFACE</span>
        <span className='w-px h-3 bg-zinc-700' />
        <span className='flex items-center gap-2'>
          <div className='w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse' />
          OPERATIONAL
        </span>
      </div>
    </div>
  )
}
