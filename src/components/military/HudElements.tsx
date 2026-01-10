"use client"

import { Terminal, Target } from "lucide-react"

export function HudCorners() {
  return (
    <>
      <div className="absolute top-8 left-8 w-64 h-64 border-l-2 border-t-2 border-emerald-900/50 rounded-tl-3xl pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-64 h-64 border-r-2 border-b-2 border-emerald-900/50 rounded-br-3xl pointer-events-none" />
    </>
  )
}

export function SideDataStreams() {
  return (
    <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4 text-[10px] text-emerald-800/60 pointer-events-none select-none">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-900/40 animate-pulse" />
          <span>SYS_DIAG_00{i + 1} :: ACTIVE</span>
        </div>
      ))}
    </div>
  )
}

export function SideLabels() {
  return (
    <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2 text-right pointer-events-none">
      <div className="text-4xl font-black text-emerald-900/20 tracking-tighter">TARGET_LOCKED</div>
      <div className="text-4xl font-black text-emerald-900/20 tracking-tighter">SECURE_UPLINK</div>
    </div>
  )
}

export function FooterHud() {
  return (
    <div className="absolute bottom-10 flex items-center gap-8 text-xs text-stone-600 font-bold tracking-widest">
      <div className="flex items-center gap-2">
        <Terminal size={14} />
        STATUS: ONLINE
      </div>
      <div className="flex items-center gap-2">
        <Target size={14} />
        PING: 4ms
      </div>
    </div>
  )
}
