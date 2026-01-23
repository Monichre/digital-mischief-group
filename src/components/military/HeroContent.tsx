"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ShieldAlert, ChevronRight } from "lucide-react"

type HeroContentProps = {
  mousePos: { x: number; y: number }
}

export function HeroContent({ mousePos }: HeroContentProps) {
  return (
    <main className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 text-center">
      {/* Badge */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6 flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/30 border border-emerald-800/30 text-emerald-500 text-xs tracking-widest"
      >
        <ShieldAlert size={14} />
        CREATIVE CHAOS ENGINEERING
      </motion.div>

      {/* Hero Title */}
      <div className="relative" style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
        <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-stone-200 to-stone-500 uppercase drop-shadow-2xl">
          Digital<span className="text-emerald-600">Mischief</span>
        </h1>
        <h2 className="text-4xl md:text-7xl font-bold text-stone-700 uppercase tracking-tight -mt-2 md:-mt-6 opacity-60">
          Studios
        </h2>

        {/* Decorative 'Scan' Line over text */}
        <motion.div
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.5)] pointer-events-none"
        />
      </div>

      {/* Subtext */}
      <p className="mt-8 max-w-2xl text-stone-400 md:text-lg leading-relaxed border-l-2 border-emerald-700/50 pl-6 text-left mx-auto bg-black/40 p-4 backdrop-blur-sm">
        <span className="text-emerald-500 font-bold block mb-1 text-xs tracking-widest">MISSION BRIEF:</span>
        Crafting digital experiences that break conventions. We build tools that spark creativity, ignite innovation,
        and embrace the beautiful chaos of great ideas.
      </p>

      <div className="mt-10 flex flex-col md:flex-row gap-4 items-center">
        <Link
          href="/sign-in"
          className="group relative px-8 py-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold tracking-widest uppercase transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative flex items-center gap-2">
            Initialize System <ChevronRight />
          </span>
        </Link>
        <Link
          href="/loadout"
          className="px-8 py-4 border border-emerald-800 text-emerald-600 hover:text-emerald-400 hover:border-emerald-500 hover:bg-emerald-950/30 font-bold tracking-widest uppercase transition-all"
        >
          View Loadout
        </Link>
      </div>
    </main>
  )
}
