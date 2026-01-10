"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const BOOT_MESSAGES = [
  { text: "INITIALIZING DIGITAL MISCHIEF CORE...", delay: 0 },
  { text: "LOADING CREATIVE ENGINE [████████████] 100%", delay: 400 },
  { text: "ESTABLISHING SECURE UPLINK...", delay: 800 },
  { text: "VERIFYING CHAOS PROTOCOLS...", delay: 1200 },
  { text: "DEPLOYING INNOVATION MATRIX...", delay: 1600 },
  { text: "CALIBRATING MISCHIEF SYSTEMS...", delay: 2000 },
  { text: "ALL SYSTEMS NOMINAL", delay: 2400 },
  { text: ">>> ACCESS GRANTED <<<", delay: 2800 },
]

interface BootSequenceProps {
  onComplete: () => void
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleMessages, setVisibleMessages] = useState<number>(0)
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 50)

    // Message reveal timing
    BOOT_MESSAGES.forEach((msg, index) => {
      setTimeout(() => {
        setVisibleMessages(index + 1)
      }, msg.delay)
    })

    // Complete sequence
    const completeTimeout = setTimeout(() => {
      setFadeOut(true)
      setTimeout(onComplete, 500)
    }, 3500)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(completeTimeout)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8"
        >
          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(16, 185, 129, 0.1) 2px, rgba(16, 185, 129, 0.1) 4px)",
            }}
          />

          {/* Corner brackets */}
          <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-emerald-700/50" />
          <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-emerald-700/50" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-emerald-700/50" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-emerald-700/50" />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="w-20 h-20 border-2 border-emerald-500 rotate-45 flex items-center justify-center">
              <div className="w-10 h-10 bg-emerald-500 -rotate-45" />
            </div>
          </motion.div>

          {/* System title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-emerald-500 text-xl tracking-[0.3em] font-bold mb-8"
          >
            MISCHIEF OS v2.4.7
          </motion.h1>

          {/* Boot messages console */}
          <div className="w-full max-w-lg bg-black/50 border border-emerald-900/50 p-4 mb-8 h-64 overflow-hidden">
            <div className="text-[10px] text-emerald-700 mb-2 tracking-widest">SYSTEM_LOG://boot_sequence</div>
            <div className="space-y-1">
              {BOOT_MESSAGES.slice(0, visibleMessages).map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-xs tracking-wider ${
                    index === BOOT_MESSAGES.length - 1 ? "text-emerald-400 font-bold" : "text-emerald-600"
                  }`}
                >
                  <span className="text-emerald-800 mr-2">[{String(index).padStart(2, "0")}]</span>
                  {msg.text}
                </motion.div>
              ))}
              {visibleMessages < BOOT_MESSAGES.length && <span className="text-emerald-500 animate-pulse">█</span>}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-lg">
            <div className="flex justify-between text-[10px] text-emerald-700 tracking-widest mb-2">
              <span>BOOT_PROGRESS</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 bg-emerald-900/30 overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          {/* Status */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] text-emerald-700 tracking-widest">
            <div className="w-2 h-2 bg-emerald-500 animate-pulse" />
            ESTABLISHING SECURE CONNECTION
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
