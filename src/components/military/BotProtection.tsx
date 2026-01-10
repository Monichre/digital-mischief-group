"use client"

import { AnimatePresence, motion, useAnimationFrame } from "framer-motion"
import { useRef, useState } from "react"

const useAnimationProgress = (duration: number) => {
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef<number | null>(null)

  useAnimationFrame((time) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = time
    }

    const elapsed = (time - startTimeRef.current) % (duration * 1000)
    const newProgress = elapsed / (duration * 1000)
    setProgress(newProgress)
  })

  return progress
}

const isDotVisible = (dotAngle: number, scannerAngle: number, scanWidth = 42) => {
  const normalizedScannerAngle = ((scannerAngle % 360) + 360) % 360
  const scannerStart = normalizedScannerAngle
  const scannerEnd = (normalizedScannerAngle + scanWidth) % 360

  if (scannerStart < scannerEnd) {
    return dotAngle >= scannerStart && dotAngle <= scannerEnd
  } else {
    return dotAngle >= scannerStart || dotAngle <= scannerEnd
  }
}

interface ThreatDotProps {
  top: number
  left: number
  isVisible?: boolean
}

const ThreatDot = ({ top, left, isVisible }: ThreatDotProps) => {
  return (
    <div className="absolute" style={{ top, left }}>
      <AnimatePresence>
        {isVisible && (
          <motion.div exit={{ opacity: 0 }} className="relative flex h-8 w-8 items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  opacity: {
                    delay: 0.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    repeatDelay: 1,
                  },
                  scale: {
                    delay: 0.35,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    repeatDelay: 1,
                  },
                },
              }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.4 } }}
              className="absolute h-8 w-8 rounded-full bg-black/10"
              style={{
                boxShadow: "0 0 10px 2px rgba(255,45,60,0.15), inset 0 0 0 1px rgb(240 66 66/0.1)",
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  scale: {
                    delay: 0.4,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    repeatDelay: 1,
                  },
                },
              }}
              className="absolute left-1/2 top-1/2 h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50"
              style={{
                boxShadow: "0 0 3px 1px rgba(255,45,60,0.15), inset 0 0 0 1px rgb(240 66 66/0.3)",
              }}
            />
            <div
              className="z-10 h-1.5 w-1.5 rounded-sm bg-red-500"
              style={{
                boxShadow: "0 0 8px 1px #f42937, 0 1px rgba(255,255,255,0.2) inset",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const BotProtection = () => {
  const animationProgress = useAnimationProgress(35)
  const currentScannerAngle = -200 + animationProgress * 360

  const dots = [
    { top: 300, left: 65, angle: 188 },
    { top: 180, left: 170, angle: 223 },
    { top: 45, left: 290, angle: 260 },
    { top: 140, left: 420, angle: 292 },
    { top: 280, left: 480, angle: 337 },
  ]

  return (
    <div className="relative h-[340px] w-full overflow-hidden">
      {/* Radar circles */}
      <svg className="absolute left-1/2 top-0 h-[680px] w-[680px] -translate-x-1/2" viewBox="0 0 680 680" fill="none">
        <g
          strokeDasharray="0.25 4"
          stroke="currentColor"
          strokeOpacity="0.195"
          strokeLinecap="round"
          className="text-emerald-500"
        >
          <circle cx="340" cy="340" r="136" />
          <circle cx="340" cy="340" r="184" />
          <circle cx="340" cy="340" r="232" />
          <circle cx="340" cy="340" r="280" />
          <circle cx="340" cy="340" r="328" />
        </g>
      </svg>

      {/* Scanner hub */}
      <div
        className="absolute -bottom-[88px] left-1/2 h-44 w-44 -translate-x-1/2 rounded-full"
        style={{ border: "1px solid rgba(16, 185, 129, 0.15)" }}
      >
        <div className="relative h-full w-full">
          {/* Scanner arc */}
          <motion.div
            initial={{ rotate: -60 }}
            animate={{ rotate: 300 }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              duration: 35,
              ease: "linear",
            }}
            className="absolute -inset-px rounded-full opacity-70"
            style={{
              background: "conic-gradient(from -43deg, rgb(16 185 129) 42deg, transparent 42deg)",
              maskImage: "radial-gradient(closest-side, transparent calc(100% - 1px), white calc(100% - 1px))",
            }}
          />
          {/* Scanner sweep */}
          <motion.div
            initial={{ rotate: -60 }}
            animate={{ rotate: 300 }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              duration: 35,
              ease: "linear",
            }}
            className="absolute left-1/2 h-[680px] w-[680px] -translate-x-1/2 rounded-full"
            style={{
              top: "-252px",
              background:
                "conic-gradient(from -44.85deg, rgba(16, 185, 129, 0), rgba(16, 185, 129, 0.1) 3deg, rgba(16, 185, 129, 0.1) 43deg, rgba(16, 185, 129, 0) 46deg)",
              maskImage: "radial-gradient(closest-side, transparent 5.5rem, black 5.5rem, transparent 21.25rem)",
            }}
          />
        </div>
      </div>

      {/* Threat dots */}
      {dots.map((dot, index) => (
        <ThreatDot key={index} top={dot.top} left={dot.left} isVisible={isDotVisible(dot.angle, currentScannerAngle)} />
      ))}
    </div>
  )
}

export default BotProtection
