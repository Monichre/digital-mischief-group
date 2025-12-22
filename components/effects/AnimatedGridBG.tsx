'use client'

import {useEffect, useRef, memo, useCallback} from 'react'

interface Point {
  x: number
  y: number
}

/**
 * AnimatedGridBG - Canvas-based animated background grid
 * Cells near the mouse glow brighter, creating an interactive effect
 */
export const AnimatedGridBG = memo(function AnimatedGridBG() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef<Point>({x: -1000, y: -1000})
  const animationRef = useRef<number>(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = canvas.width / dpr
    const height = canvas.height / dpr

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const cellSize = 60
    const cols = Math.ceil(width / cellSize) + 1
    const rows = Math.ceil(height / cellSize) + 1
    const mouse = mouseRef.current

    // Draw grid
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const x = col * cellSize
        const y = row * cellSize

        // Calculate distance from mouse
        const dx = x - mouse.x
        const dy = y - mouse.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Map distance to opacity (closer = brighter)
        const maxDistance = 300
        const minOpacity = 0.02
        const maxOpacity = 0.15
        const opacity = Math.max(
          minOpacity,
          maxOpacity - (distance / maxDistance) * (maxOpacity - minOpacity)
        )

        // Draw dot
        ctx.beginPath()
        ctx.arc(x * dpr, y * dpr, 1 * dpr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(249, 115, 22, ${opacity})`
        ctx.fill()

        // Draw horizontal line (very subtle)
        if (col < cols - 1) {
          ctx.beginPath()
          ctx.moveTo(x * dpr, y * dpr)
          ctx.lineTo((x + cellSize) * dpr, y * dpr)
          ctx.strokeStyle = `rgba(249, 115, 22, ${opacity * 0.3})`
          ctx.lineWidth = 0.5 * dpr
          ctx.stroke()
        }

        // Draw vertical line (very subtle)
        if (row < rows - 1) {
          ctx.beginPath()
          ctx.moveTo(x * dpr, y * dpr)
          ctx.lineTo(x * dpr, (y + cellSize) * dpr)
          ctx.strokeStyle = `rgba(249, 115, 22, ${opacity * 0.3})`
          ctx.lineWidth = 0.5 * dpr
          ctx.stroke()
        }
      }
    }

    animationRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {x: e.clientX, y: e.clientY}
    }

    const handleMouseLeave = () => {
      mouseRef.current = {x: -1000, y: -1000}
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    animationRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationRef.current)
    }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className='pointer-events-none fixed inset-0 z-0'
      aria-hidden='true'
    />
  )
})
