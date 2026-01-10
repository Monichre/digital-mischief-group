"use client"

import { useEffect, useState, useRef, useId } from "react"
import { motion } from "framer-motion"
import type React from "react"

interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  x?: number
  y?: number
  cx?: number
  cy?: number
  cr?: number
  className?: string
  glow?: boolean
  [key: string]: unknown
}

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  ...props
}: DotPatternProps) {
  const id = useId()
  const containerRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [entranceComplete, setEntranceComplete] = useState(false)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const centerX = dimensions.width / 2
  const centerY = dimensions.height / 2

  const dots = Array.from(
    {
      length: Math.ceil(dimensions.width / width) * Math.ceil(dimensions.height / height),
    },
    (_, i) => {
      const col = i % Math.ceil(dimensions.width / width)
      const row = Math.floor(i / Math.ceil(dimensions.width / width))
      const dotX = col * width + cx
      const dotY = row * height + cy

      const distanceFromCenter = Math.sqrt(Math.pow(dotX - centerX, 2) + Math.pow(dotY - centerY, 2))
      const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2))
      const normalizedDistance = distanceFromCenter / maxDistance

      const entranceDelay = normalizedDistance * 2 + Math.random() * 0.3

      return {
        x: dotX,
        y: dotY,
        entranceDelay,
        glowDelay: Math.random() * 5,
        glowDuration: Math.random() * 3 + 2,
      }
    },
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setEntranceComplete(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={"pointer-events-none absolute inset-0 h-full w-full text-neutral-400/80"}
      {...props}
    >
      <defs>
        <radialGradient id={`${id}-gradient`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-glint`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.map((dot, index) => (
        <motion.circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r={cr}
          fill={glow ? `url(#${id}-gradient)` : "currentColor"}
          initial={{ opacity: 0, scale: 0 }}
          animate={
            entranceComplete && glow
              ? {
                  opacity: [0.4, 1, 0.4],
                  scale: [1, 1.5, 1],
                }
              : entranceComplete
                ? { opacity: 0.4, scale: 1 }
                : {
                    opacity: [0, 1, 0.8, glow ? 0.4 : 0.4],
                    scale: [0, 1.4, 1.1, 1],
                    filter: ["brightness(0)", "brightness(2.5)", "brightness(1.5)", "brightness(1)"],
                  }
          }
          transition={
            entranceComplete && glow
              ? {
                  duration: dot.glowDuration,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  delay: dot.glowDelay,
                  ease: "easeInOut",
                }
              : entranceComplete
                ? { duration: 0 }
                : {
                    duration: 0.8,
                    delay: dot.entranceDelay,
                    ease: [0.16, 1, 0.3, 1],
                    times: [0, 0.4, 0.7, 1],
                  }
          }
        />
      ))}
    </svg>
  )
}
