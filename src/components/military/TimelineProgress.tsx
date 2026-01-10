"use client"

import { motion, AnimatePresence, animate, useMotionValue, useTransform } from "framer-motion"
import { useEffect, useState } from "react"

export interface TimelineProgressProps {
  actions?: string[]
  onComplete?: () => void
}

const timelineVariants = {
  hidden: {},
  visible: {
    transition: {
      when: "afterChildren",
      staggerChildren: 3,
      delayChildren: 0.5,
    },
  },
}

const badgeVariants = {
  hidden: {},
  visible: {
    backgroundColor: "#064e3b",
    color: "#6ee7b7",
    borderColor: "#064e3b",
  },
}

const lineVariants = {
  hidden: { width: 0 },
  visible: { width: "100%" },
}

export default function TimelineProgress({ actions = [], onComplete }: TimelineProgressProps) {
  const [currentItem, setCurrentItem] = useState(0)

  useEffect(() => {
    if (currentItem === actions.length - 1 && onComplete) {
      const timer = setTimeout(onComplete, 3500)
      return () => clearTimeout(timer)
    }
  }, [currentItem, actions.length, onComplete])

  return (
    <motion.div
      variants={timelineVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-2 items-center justify-center"
    >
      {actions.map((action, i) => (
        <TimelineItem
          key={i}
          action={action}
          index={i}
          isLast={i === actions.length - 1}
          isActive={i <= currentItem}
          onAnimationComplete={() => setCurrentItem(Math.min(actions.length - 1, i + 1))}
        />
      ))}
    </motion.div>
  )
}

function TimelineItem({
  action,
  index,
  isLast,
  isActive,
  onAnimationComplete,
}: {
  action: string
  index: number
  isLast: boolean
  isActive: boolean
  onAnimationComplete: () => void
}) {
  return (
    <motion.div
      variants={{ hidden: {}, visible: {} }}
      onAnimationComplete={onAnimationComplete}
      className="flex flex-col gap-2"
    >
      <motion.div
        variants={badgeVariants}
        className="bg-emerald-950/50 border border-emerald-800 text-emerald-400 px-3 py-2 rounded-full text-sm flex items-center gap-2 font-mono"
      >
        {isActive && <CircularProgress />}
        <AnimatePresence>
          {isActive && (
            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {action}
            </motion.span>
          )}
        </AnimatePresence>
        {!isActive && <span className="text-emerald-800">{action}</span>}
      </motion.div>

      {!isLast && (
        <div className="h-14 flex justify-center items-center">
          <div className="w-14 h-0.5 rotate-90 bg-emerald-900/50">
            <motion.div
              variants={lineVariants}
              transition={{ duration: 2.75, ease: "linear" }}
              className="h-full bg-emerald-500"
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}

function CircularProgress() {
  const progress = useMotionValue(0)
  const circleFill = useTransform(progress, [0, 94, 100], ["transparent", "transparent", "rgb(110, 231, 183)"])
  const circleLength = useTransform(progress, [0, 100], [0, 1])
  const checkmarkPathLength = useTransform(progress, [0, 95, 100], [0, 0, 1])
  const circleColor = useTransform(progress, [0, 95, 100], ["#fbbf24", "#fbbf24", "#6ee7b7"])

  useEffect(() => {
    animate(progress, 100, { delay: 0.5, duration: 1 })
  }, [progress])

  return (
    <motion.svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 258 258">
      <motion.path
        d="M 130 6 C 198.483 6 254 61.517 254 130 C 254 198.483 198.483 254 130 254 C 61.517 254 6 198.483 6 130 C 6 61.517 61.517 6 130 6 Z"
        fill={circleFill}
      />
      <motion.path
        transform="translate(60 85)"
        d="M3 50L45 92L134 3"
        fill="transparent"
        stroke="#064e3b"
        strokeWidth={14}
        style={{ pathLength: checkmarkPathLength }}
      />
      <motion.path
        d="M 130 6 C 198.483 6 254 61.517 254 130 C 254 198.483 198.483 254 130 254 C 61.517 254 6 198.483 6 130 C 6 61.517 61.517 6 130 6 Z"
        fill="transparent"
        strokeWidth="8"
        stroke={circleColor}
        style={{ pathLength: circleLength }}
      />
    </motion.svg>
  )
}
