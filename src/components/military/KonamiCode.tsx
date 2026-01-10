"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Skull, X } from "lucide-react"
import { useTacticalToast } from "./TacticalToast"

// Classic Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
]

export function KonamiCode({ children }: { children: React.ReactNode }) {
  const { addToast } = useTacticalToast()
  const [activated, setActivated] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const inputRef = useRef<string[]>([])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Add key to sequence
      inputRef.current = [...inputRef.current, e.code].slice(-KONAMI_SEQUENCE.length)

      // Check if matches
      if (inputRef.current.join(",") === KONAMI_SEQUENCE.join(",")) {
        setActivated(true)
        setShowModal(true)
        addToast({
          type: "warning",
          title: "CLASSIFIED ACCESS UNLOCKED",
          message: "Shadow Protocol activated",
          duration: 5000,
        })
        inputRef.current = []
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [addToast])

  return (
    <>
      {/* Apply special styling when activated */}
      <div className={activated ? "konami-activated" : ""}>{children}</div>

      {/* Secret Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[400]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateX: -15 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateX: 15 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[401]"
            >
              <div className="relative bg-black border-2 border-red-500 p-8 shadow-[0_0_100px_rgba(239,68,68,0.3)]">
                {/* Animated border glow */}
                <div className="absolute inset-0 border border-red-500 animate-pulse" />

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-red-500" />
                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-red-500" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-red-500" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-red-500" />

                {/* Close button */}
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-red-700 hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>

                {/* Content */}
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    className="inline-flex items-center justify-center w-20 h-20 mb-6"
                  >
                    <Skull size={64} className="text-red-500" />
                  </motion.div>

                  <div className="text-[10px] text-red-700 tracking-[0.5em] mb-2">CLASSIFIED // EYES ONLY</div>

                  <h2 className="text-3xl font-black text-red-500 tracking-wider mb-4">SHADOW PROTOCOL</h2>

                  <div className="text-xs text-red-600/80 leading-relaxed mb-6 font-mono">
                    You have accessed a restricted subsystem.
                    <br />
                    The Konami sequence has been logged.
                    <br />
                    <br />
                    <span className="text-red-400">OPERATIVE STATUS: ELEVATED</span>
                  </div>

                  {/* Secret message */}
                  <div className="bg-red-950/30 border border-red-900 p-4 mb-6">
                    <div className="text-[10px] text-red-700 tracking-widest mb-2">INTERCEPTED_TRANSMISSION</div>
                    <code className="text-sm text-red-400 block">
                      {`> "The owl flies at midnight."`}
                      <br />
                      {`> "Coordinates: 51.5074° N, 0.1278° W"`}
                      <br />
                      {`> "Await further instructions."`}
                    </code>
                  </div>

                  {/* Stats unlocked */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-red-950/20 border border-red-900/50 p-2">
                      <div className="text-[8px] text-red-700">SECRETS</div>
                      <div className="text-lg font-bold text-red-400">1/7</div>
                    </div>
                    <div className="bg-red-950/20 border border-red-900/50 p-2">
                      <div className="text-[8px] text-red-700">CLEARANCE</div>
                      <div className="text-lg font-bold text-red-400">LVL 5</div>
                    </div>
                    <div className="bg-red-950/20 border border-red-900/50 p-2">
                      <div className="text-[8px] text-red-700">ACCESS</div>
                      <div className="text-lg font-bold text-red-400">ALL</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-3 bg-red-900/30 hover:bg-red-900/50 border border-red-700 text-red-500 text-xs tracking-widest transition-colors"
                  >
                    ACKNOWLEDGE & DISMISS
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global styles when activated */}
      {activated && (
        <style jsx global>{`
          .konami-activated {
            /* Subtle red tint overlay effect */
          }
          .konami-activated .animate-pulse {
            animation-duration: 0.5s !important;
          }
        `}</style>
      )}
    </>
  )
}
