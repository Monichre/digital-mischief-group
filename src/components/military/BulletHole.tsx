"use client"

import { motion } from "framer-motion"

type BulletHoleProps = {
  x: number
  y: number
  rotation: number
}

export function BulletHole({ x, y, rotation }: BulletHoleProps) {
  return (
    <div className="absolute pointer-events-none z-10" style={{ left: x, top: y }}>
      {/* The Impact Crater */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 800, damping: 15 }}
        className="relative w-12 h-12 -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className="w-full h-full bg-black rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,1)] border-2 border-stone-600/50"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Cracks */}
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-stone-700/50 -translate-x-1/2 rotate-45" />
          <div className="absolute top-0 left-1/2 w-0.5 h-full bg-stone-700/50 -translate-x-1/2 -rotate-45" />
        </div>

        {/* Glowing Ember in center */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="absolute top-1/2 left-1/2 w-3 h-3 bg-orange-500 rounded-full blur-[2px] -translate-x-1/2 -translate-y-1/2"
        />
      </motion.div>

      {/* Smoke Particle System */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.6, y: 0, x: 0, scale: 0.5 }}
            animate={{
              opacity: 0,
              y: -100 - Math.random() * 50,
              x: (Math.random() - 0.5) * 40,
              scale: 2 + Math.random(),
            }}
            transition={{ duration: 2 + Math.random(), delay: i * 0.2, ease: "easeOut" }}
            className="absolute top-0 left-0 w-8 h-8 bg-gray-400 rounded-full blur-xl"
          />
        ))}
      </div>
    </div>
  )
}
