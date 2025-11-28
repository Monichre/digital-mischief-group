"use client"

import { useEffect, useRef } from "react"
import katex from "katex"

interface MathDisplayProps {
  equation: string
  block?: boolean
}

export function MathDisplay({ equation, block = false }: MathDisplayProps) {
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(equation, containerRef.current, {
          throwOnError: false,
          displayMode: block,
        })
      } catch (error) {
        console.error("KaTeX rendering error:", error)
        containerRef.current.innerText = equation
      }
    }
  }, [equation, block])

  return <span ref={containerRef} className="text-copper/80 text-[0.6rem]" />
}
