"use client"

import { motion } from "framer-motion"
import { Crosshair } from "lucide-react"
import { useEffect, useState } from "react"

type CrosshairCursorProps = {
  mousePos: { x: number; y: number }
}

export function CrosshairCursor({ mousePos }: CrosshairCursorProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-50 text-emerald-500/80 mix-blend-screen"
      animate={{
        x: mousePos.x * 25 + windowSize.width / 2,
        y: mousePos.y * 25 + windowSize.height / 2,
      }}
      transition={{ type: "tween", ease: "linear", duration: 0 }}
    >
      <Crosshair size={32} className="-translate-x-1/2 -translate-y-1/2" />
    </motion.div>
  )
}
