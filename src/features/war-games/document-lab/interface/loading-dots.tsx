"use client"

import { cn } from "@/lib/utils"
import { motion } from "motion/react"

interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <span className={cn("inline-flex items-center space-x-1", className)}>
      <motion.span
        animate={{ opacity: [0.75, 0.25, 0.75] }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="rounded-full h-1.5 w-1.5 bg-current"
      />
      <motion.span
        animate={{ opacity: [0.75, 0.25, 0.75] }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.2,
        }}
        className="rounded-full h-1.5 w-1.5 bg-current"
      />
      <motion.span
        animate={{ opacity: [0.75, 0.25, 0.75] }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 0.4,
        }}
        className="rounded-full h-1.5 w-1.5 bg-current"
      />
    </span>
  )
}
