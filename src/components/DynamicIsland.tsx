"use client"

import {
  Flame,
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Activity,
  Radar,
  Database,
  Zap,
  ChevronUp,
  ExternalLink,
  TrendingUp,
  AlertTriangle,
  Crosshair,
  Target,
  Eye,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useMemo, useState } from "react"
import Link from "next/link"

const BOUNCE_VARIANTS = {
  idle: 0.5,
  "ring-idle": 0.5,
  "timer-ring": 0.35,
  "ring-timer": 0.35,
  "timer-idle": 0.3,
  "idle-timer": 0.3,
  "idle-ring": 0.5,
  "narrative-idle": 0.5,
  "idle-narrative": 0.5,
  "fracture-idle": 0.5,
  "idle-fracture": 0.5,
  "aperture-idle": 0.5,
  "idle-aperture": 0.5,
} as const

const DEFAULT_BOUNCE = 0.5
const TIMER_INTERVAL_MS = 1000

// Idle Component - DMG branded
const DefaultIdle = () => {
  const [showStatus, setShowStatus] = useState(false)

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-2"
      layout
      onHoverEnd={() => setShowStatus(false)}
      onHoverStart={() => setShowStatus(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="text-foreground"
          exit={{ opacity: 0, scale: 0.8 }}
          initial={{ opacity: 0, scale: 0.8 }}
          key="flame"
        >
          <Flame className="h-5 w-5 text-orange-500" />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showStatus && (
          <motion.div
            animate={{ opacity: 1, width: "auto" }}
            className="flex items-center gap-1 overflow-hidden text-white"
            exit={{ opacity: 0, width: 0 }}
            initial={{ opacity: 0, width: 0 }}
          >
            <Activity className="h-3 w-3 text-orange-500" />
            <span className="pointer-events-none whitespace-nowrap text-white text-xs font-mono">SYSTEMS ONLINE</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Narrative Component - DMG branded
const Narrative = () => (
  <div className="flex w-64 items-center gap-3 overflow-hidden px-4 py-2 text-foreground">
    <TrendingUp className="h-5 w-5 text-orange-500" />
    <div className="flex-1">
      <p className="pointer-events-none font-medium text-sm text-white font-mono">Narrative Heat</p>
      <p className="pointer-events-none text-zinc-400 text-xs font-mono">Rising/declining narrative tracking</p>
    </div>
    <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs text-orange-500 font-mono">Industries</span>
  </div>
)

// Fracture Component - DMG branded
const Fracture = () => (
  <div className="flex w-64 items-center gap-3 overflow-hidden px-4 py-2 text-foreground">
    <AlertTriangle className="h-5 w-5 text-orange-400" />
    <div className="flex-1">
      <p className="pointer-events-none font-medium text-sm text-white font-mono">Brand Fracture</p>
      <p className="pointer-events-none text-zinc-400 text-xs font-mono">Competitor messaging coherence</p>
    </div>
    <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs text-orange-500 font-mono">
      Ambush opportunities detected
    </span>
  </div>
)

// Aperture Component - DMG branded
const Aperture = () => (
  <div className="flex w-64 items-center gap-3 overflow-hidden px-4 py-2 text-foreground">
    <Crosshair className="h-5 w-5 text-orange-500" />
    <div className="flex-1">
      <p className="pointer-events-none font-medium text-sm text-white font-mono">Opportunity Aperture</p>
      <p className="pointer-events-none text-zinc-400 text-xs font-mono">Lock-On Targeting System</p>
    </div>
    <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs text-orange-500 font-mono">Weak spots</span>
  </div>
)

// Music Player Component - DMG branded
const MusicPlayer = () => {
  const [playing, setPlaying] = useState(true)
  return (
    <div className="flex w-72 items-center gap-3 overflow-hidden px-4 py-2 text-foreground">
      <Music2 className="h-5 w-5 text-orange-500" />
      <div className="min-w-0 flex-1">
        <p className="pointer-events-none truncate font-medium text-sm text-white font-mono">Dark Ambient</p>
        <p className="pointer-events-none truncate text-zinc-400 text-xs font-mono">System Audio</p>
      </div>
      <button className="rounded-full p-1 hover:bg-zinc-700" onClick={() => setPlaying(false)} type="button">
        <SkipBack className="h-4 w-4 text-white" />
      </button>
      <button className="rounded-full p-1 hover:bg-zinc-700" onClick={() => setPlaying((p) => !p)} type="button">
        {playing ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white" />}
      </button>
      <button className="rounded-full p-1 hover:bg-zinc-700" onClick={() => setPlaying(true)} type="button">
        <SkipForward className="h-4 w-4 text-white" />
      </button>
    </div>
  )
}

type View = "idle" | "narrative" | "fracture" | "aperture"

const INTELLIGENCE_SYSTEMS = [
  {
    key: "narrative",
    label: "Narrative Heat",
    icon: TrendingUp,
    color: "text-orange-500",
    description: "Rising/declining narrative tracking",
    targets: ["Industries", "Sectors", "Fanbases", "News Cycles"],
  },
  {
    key: "fracture",
    label: "Brand Fracture",
    icon: AlertTriangle,
    color: "text-orange-400",
    description: "Competitor messaging coherence",
    targets: ["Ambush opportunities detected"],
  },
  {
    key: "aperture",
    label: "Opportunity Aperture",
    icon: Crosshair,
    color: "text-orange-500",
    description: "Lock-On Targeting System",
    targets: ["Weak spots", "Open lanes", "Content gaps"],
  },
] as const

const RECON_MODULES = [
  { key: "enrich", label: "Enrich", href: "/enrich", icon: Database, color: "text-orange-500" },
  { key: "brand", label: "Brand", href: "/brand-recon", icon: Zap, color: "text-orange-400" },
  { key: "sentinels", label: "Sentinels", href: "/scouts", icon: Target, color: "text-orange-500" },
  { key: "recon", label: "Recon", href: "/observe", icon: Eye, color: "text-orange-400" },
] as const

export type DynamicIslandProps = {
  className?: string
  showControls?: boolean
}

export default function DynamicIsland({ className = "", showControls = true }: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [activeSystem, setActiveSystem] = useState<View>("idle")

  const currentSystem = INTELLIGENCE_SYSTEMS.find((s) => s.key === activeSystem)

  const content = useMemo(() => {
    switch (activeSystem) {
      case "narrative":
        return <Narrative />
      case "fracture":
        return <Fracture />
      case "aperture":
        return <Aperture />
      default:
        return <DefaultIdle />
    }
  }, [activeSystem])

  return (
    <div className={`relative ${className}`}>
      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80"
          >
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Radar className="h-4 w-4 text-orange-500 animate-pulse" />
                  <span className="text-xs font-mono text-orange-500 uppercase tracking-wider">
                    Daedalus Intelligence
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-zinc-500">ACTIVE</span>
                </div>
              </div>

              {/* Intelligence Systems */}
              <div className="p-3 border-b border-zinc-800/50">
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-2 block">
                  Targeting Systems
                </span>
                <div className="space-y-2">
                  {INTELLIGENCE_SYSTEMS.map((system) => (
                    <button
                      key={system.key}
                      onClick={() => setActiveSystem(system.key as View)}
                      className={`w-full flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-all text-left ${
                        activeSystem === system.key
                          ? "border-orange-500/50 bg-orange-500/10"
                          : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                      }`}
                    >
                      <system.icon className={`h-4 w-4 mt-0.5 ${system.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-zinc-200">{system.label}</span>
                          {activeSystem === system.key && (
                            <span className="text-[9px] font-mono text-orange-500 uppercase">Active</span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 truncate">{system.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active System Details */}
              {currentSystem && (
                <div className="p-3 border-b border-zinc-800/50 bg-zinc-900/30">
                  <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-2 block">
                    {currentSystem.label} Targets
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {currentSystem.targets.map((target, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-zinc-800 bg-zinc-950 text-[10px] font-mono text-zinc-400"
                      >
                        <div className="w-1 h-1 rounded-full bg-orange-500" />
                        {target}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recon Modules Quick Access */}
              <div className="p-3">
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider mb-2 block">
                  Recon Modules
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {RECON_MODULES.map((module) => (
                    <Link
                      key={module.key}
                      href={module.href}
                      className="group flex flex-col items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/50 p-2 transition-all hover:border-orange-500/50 hover:bg-orange-500/10"
                    >
                      <module.icon className={`h-4 w-4 ${module.color} transition-transform group-hover:scale-110`} />
                      <span className="text-[9px] font-mono text-zinc-400 group-hover:text-white">{module.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-zinc-800/50 bg-zinc-900/50">
                <Link
                  href="/#daedalus"
                  className="flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-500 hover:text-orange-500 transition-colors"
                >
                  <span>Full Daedalus Overview</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Pill */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl px-4 py-2.5 cursor-pointer transition-colors hover:border-zinc-700"
        layout
        transition={{ type: "spring", bounce: 0.4 }}
        type="button"
      >
        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-full bg-orange-500/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />

        {/* Content */}
        <div className="relative flex items-center gap-2">
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ type: "spring", bounce: 0.4 }}>
            <ChevronUp className="h-4 w-4 text-zinc-500" />
          </motion.div>

          <div className="h-4 w-px bg-zinc-800" />

          <Radar className="h-4 w-4 text-orange-500" />

          <AnimatePresence mode="wait">
            {(isHovered || isExpanded) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-1.5 overflow-hidden"
              >
                <Activity className="h-3 w-3 text-orange-500" />
                <span className="text-xs font-mono text-zinc-400 whitespace-nowrap">DAEDALUS</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* System Status Indicator */}
      {showControls && (
        <div className="absolute -top-1 -right-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      )}
    </div>
  )
}

export { DynamicIsland }
