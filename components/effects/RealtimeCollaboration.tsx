'use client'

import type React from 'react'
import {motion} from 'framer-motion'
import {useRef, useState} from 'react'

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const GridSvg = () => (
  <svg viewBox='0 0 330 431' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <g clipPath='url(#clip0_collab)'>
      <path
        d='M-16.542 -9.64038L-16.542 447.813M-2.54197 -9.64038L-2.54195 447.813M11.4581 -9.64038L11.4581 447.813M25.4581 -9.64038L25.4581 447.813M39.4581 -9.64038L39.4581 447.813M53.4581 -9.64038L53.4581 447.813M67.4581 -9.64038L67.4582 447.813M81.4582 -9.64038L81.4582 447.813M95.4582 -9.64038L95.4582 447.813M109.458 -9.64038L109.458 447.813M123.458 -9.64038L123.458 447.813M137.458 -9.64038L137.458 447.813M151.458 -9.64038L151.458 447.813M165.458 -9.64038L165.458 447.813M179.458 -9.64038L179.458 447.813M193.458 -9.64038L193.458 447.813M207.458 -9.64038L207.458 447.813M221.458 -9.64038L221.458 447.813M235.458 -9.64038L235.458 447.813M249.458 -9.64038L249.458 447.813M263.458 -9.64038L263.458 447.813M277.458 -9.64038L277.458 447.813M291.458 -9.64038L291.458 447.813M305.458 -9.64038L305.459 447.813M319.459 -9.64038L319.459 447.813M333.459 -9.64038L333.459 447.813M347.459 -9.64038L347.459 447.813M361.459 -9.64038L361.459 447.813M375.459 -9.64038L375.459 447.813M440.615 0.656494H-16.8379M440.615 14.6565H-16.8379M440.615 28.6565H-16.8379M440.615 42.6566H-16.8379M440.615 56.6566H-16.8379M440.615 70.6566H-16.8379M440.615 84.6566H-16.8379M440.615 98.6566H-16.8379M440.615 112.657H-16.8379M440.615 126.657H-16.8379M440.615 140.657H-16.8379M440.615 154.657H-16.8379M440.615 168.657H-16.8379M440.615 182.657H-16.8379M440.615 196.657H-16.8379M440.615 210.657H-16.8379M440.615 224.657H-16.8379M440.615 238.657H-16.8379M440.615 252.657H-16.8379M440.615 266.657H-16.8379M440.615 280.657H-16.8379M440.615 294.657H-16.8379M440.615 308.657H-16.8379M440.615 322.657H-16.8379M440.615 336.657H-16.8379M440.615 350.657H-16.8379M440.615 364.657H-16.8379M440.615 378.657H-16.8379M440.615 392.657H-16.8379M440.615 406.657H-16.8379M440.615 420.657H-16.8379M440.615 434.657H-16.8379'
        stroke='rgb(16 185 129 / 0.15)'
        strokeWidth='0.5'
      />
    </g>
    <defs>
      <clipPath id='clip0_collab'>
        <rect
          width='330'
          height='430'
          fill='white'
          transform='translate(0 0.906494)'
        />
      </clipPath>
    </defs>
  </svg>
)

const ArrowCursorIcon = () => (
  <svg
    height='30'
    viewBox='0 0 30 38'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M3.58385 1.69742C2.57836 0.865603 1.05859 1.58076 1.05859 2.88572V35.6296C1.05859 37.1049 2.93111 37.7381 3.8265 36.5656L12.5863 25.0943C12.6889 24.96 12.8483 24.8812 13.0173 24.8812H27.3245C28.7697 24.8812 29.4211 23.0719 28.3076 22.1507L3.58385 1.69742Z'
      fill='rgb(6 78 59)'
      stroke='rgb(16 185 129)'
      strokeLinejoin='round'
      strokeWidth='1.5'
    />
  </svg>
)

interface PulseDotProps {
  delay?: number
  color?: string
  isAnimating?: boolean
}

const PulseDot = ({
  delay = 0,
  color = 'rgb(16 185 129)',
  isAnimating = true,
}: PulseDotProps) => (
  <motion.div
    animate={
      isAnimating
        ? {
            opacity: [1, 0.5, 1],
          }
        : {}
    }
    transition={{
      duration: 0.6,
      ease: 'easeInOut',
      repeat: Number.POSITIVE_INFINITY,
      delay,
    }}
    className='h-1.5 w-1.5 rounded-full'
    style={{backgroundColor: color}}
  />
)

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface RealtimeCollaborationProps {
  className?: string
}

export const RealtimeCollaboration = ({
  className,
}: RealtimeCollaborationProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cursor1Position, setCursor1Position] = useState({x: 0, y: 0})
  const [cursor2Position, setCursor2Position] = useState({x: 0, y: 0})
  const [mousePosition, setMousePosition] = useState({x: 0, y: 0})
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setMousePosition({x: mouseX, y: mouseY})

    const percentX = (mouseX / rect.width) * 100 - 50
    const percentY = (mouseY / rect.height) * 100 - 50

    const cursor1TransformX =
      mouseX > rect.width / 3 ? percentX * 2 : percentX * 0.8
    const cursor1TransformY =
      mouseY > rect.height / 2 ? percentY * -1.2 : percentY * -1.8

    const cursor2TransformX =
      mouseX > rect.width / 2 ? percentX * -2.5 : percentX * 1.4
    const cursor2TransformY =
      mouseY > rect.height / 2 ? percentY * 1.2 : percentY * 2.2

    setCursor1Position({x: cursor1TransformX, y: cursor1TransformY})
    setCursor2Position({x: cursor2TransformX, y: cursor2TransformY})
  }

  const handleMouseLeave = () => {
    setCursor1Position({x: 0, y: 0})
    setCursor2Position({x: 0, y: 0})
    setIsHovered(false)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-[280px] w-[340px] ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {/* Grid background */}
      <div
        className='absolute inset-0'
        style={{
          maskImage: 'radial-gradient(circle, black 10%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(circle, black 10%, transparent 100%)',
        }}
      >
        <div className='absolute inset-0 w-[480px]'>
          <GridSvg />
        </div>
      </div>

      {/* User cursor indicator */}
      {isHovered && (
        <div
          className='pointer-events-none absolute z-10'
          style={{
            transform: `translate(${mousePosition.x + 30}px, ${
              mousePosition.y - 15
            }px)`,
          }}
        >
          <div className='flex -translate-x-1/2 -translate-y-1/2 gap-1 rounded-full border border-emerald-500 bg-emerald-950 px-2.5 py-1.5'>
            <PulseDot delay={0} isAnimating={isHovered} />
            <PulseDot delay={0.2} isAnimating={isHovered} />
            <PulseDot delay={0.4} isAnimating={isHovered} />
          </div>
        </div>
      )}

      {/* Cursor 1 */}
      <motion.div
        className='absolute'
        style={{top: '60%', left: '30%', willChange: 'transform'}}
        animate={{
          x: `calc(${cursor1Position.x}px - 50%)`,
          y: `calc(${cursor1Position.y}px - 50%)`,
        }}
        transition={{type: 'tween', ease: 'easeOut', duration: 0.75}}
      >
        <ArrowCursorIcon />
        <div className='absolute left-full top-[-24px] flex h-8 w-[65px] items-center justify-center gap-1 rounded-full border border-emerald-500/70 bg-emerald-950'>
          <PulseDot delay={0} isAnimating={isHovered} />
          <PulseDot delay={0.2} isAnimating={isHovered} />
          <PulseDot delay={0.4} isAnimating={isHovered} />
        </div>
      </motion.div>

      {/* Cursor 2 */}
      <motion.div
        className='absolute scale-[0.8]'
        style={{top: '80%', left: '65%', willChange: 'transform'}}
        animate={{
          x: `calc(${cursor2Position.x}px - 50%)`,
          y: `calc(${cursor2Position.y}px - 50%)`,
        }}
        transition={{type: 'tween', ease: 'easeOut', duration: 1}}
      >
        <ArrowCursorIcon />
        <div
          className='absolute left-full top-[-24px] h-8 w-[65px] items-center justify-center gap-1 rounded-full border border-emerald-500/70 bg-emerald-950'
          style={{display: isHovered ? 'flex' : 'none'}}
        >
          <PulseDot delay={0} isAnimating={isHovered} />
          <PulseDot delay={0.2} isAnimating={isHovered} />
          <PulseDot delay={0.4} isAnimating={isHovered} />
        </div>
      </motion.div>
    </div>
  )
}

export default RealtimeCollaboration
