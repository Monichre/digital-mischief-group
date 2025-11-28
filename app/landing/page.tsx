"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Activity,
  Brain,
  Monitor,
  Bot,
  SlidersHorizontal,
  Flame,
  Search,
  FileText,
  MousePointer2,
  Hand,
  Square,
  ImageIcon,
  Minus,
  Plus,
} from "lucide-react"

// --- Resize Handle Component ---
const ResizeHandle = ({ position }: { position: "tl" | "tr" | "bl" | "br" }) => {
  const positions = {
    tl: "-top-1.5 -left-1.5 cursor-nwse-resize",
    tr: "-top-1.5 -right-1.5 cursor-nesw-resize",
    bl: "-bottom-1.5 -left-1.5 cursor-nesw-resize",
    br: "-bottom-1.5 -right-1.5 cursor-nwse-resize",
  }

  return <div className={`absolute w-2.5 h-2.5 bg-zinc-950 border-2 border-orange-500 z-50 ${positions[position]}`} />
}

// --- Canvas Card Component ---
interface CanvasCardProps {
  children: React.ReactNode
  x: number
  y: number
  width: number
  height: number
  isSelected: boolean
  title?: string
  onSelect: () => void
}

const CanvasCard = ({ children, x, y, width, height, isSelected, title, onSelect }: CanvasCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`absolute bg-zinc-900/90 backdrop-blur-sm rounded-lg flex flex-col group cursor-pointer ${
        isSelected
          ? "ring-2 ring-orange-500 z-20 shadow-[0_0_30px_rgba(249,115,22,0.15)]"
          : "border border-zinc-800 hover:border-zinc-700 z-10"
      }`}
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
      }}
      onClick={onSelect}
    >
      {/* Selection Handles */}
      {isSelected && (
        <>
          <ResizeHandle position="tl" />
          <ResizeHandle position="tr" />
          <ResizeHandle position="bl" />
          <ResizeHandle position="br" />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-orange-500 text-zinc-950 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
            {width} × {height}
          </div>
        </>
      )}

      {/* Card Header */}
      {title && (
        <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider">{title}</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          </div>
        </div>
      )}

      {/* Card Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </motion.div>
  )
}

export default function LandingCanvasPage() {
  const [selectedId, setSelectedId] = useState<string>("hero")
  const [zoom, setZoom] = useState(100)

  return (
    <div className="relative w-full min-h-screen bg-zinc-950 overflow-hidden font-mono text-zinc-200 select-none">
      {/* 1. Infinite Grid Background */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#3f3f46 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "center",
        }}
      />

      {/* 2. Connecting Lines Layer (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
        <defs>
          <marker id="arrowhead-orange" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#f97316" fillOpacity="0.5" />
          </marker>
        </defs>
        {/* Connector from Hero to Cortex */}
        <path
          d="M 480 380 C 480 450, 200 450, 200 520"
          fill="none"
          stroke="#f97316"
          strokeOpacity="0.3"
          strokeWidth="2"
          strokeDasharray="4 4"
          markerEnd="url(#arrowhead-orange)"
        />
        {/* Connector from Hero to Process */}
        <path
          d="M 700 380 C 700 450, 900 450, 900 520"
          fill="none"
          stroke="#f97316"
          strokeOpacity="0.3"
          strokeWidth="2"
          strokeDasharray="4 4"
          markerEnd="url(#arrowhead-orange)"
        />
        {/* Connector from Cortex to CTA */}
        <path
          d="M 200 720 C 200 800, 550 800, 550 850"
          fill="none"
          stroke="#f97316"
          strokeOpacity="0.3"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      </svg>

      {/* 3. Navigation (Fixed) */}
      <nav className="fixed top-0 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 animate-pulse rounded-full" />
            <span className="font-mono font-bold tracking-tighter">[ DMG ]</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-xs text-zinc-500">
            <Link href="/#cortex" className="hover:text-orange-500 transition-colors">
              Revenue Cortex
            </Link>
            <Link href="/#process" className="hover:text-orange-500 transition-colors">
              How We Work
            </Link>
            <Link href="/lab" className="hover:text-orange-500 transition-colors">
              Lab
            </Link>
          </div>
          <Link
            href="/#audit"
            className="px-3 py-1.5 border border-orange-500/50 text-orange-500 text-xs hover:bg-orange-500 hover:text-zinc-950 transition-all duration-300"
          >
            Start Audit →
          </Link>
        </div>
      </nav>

      {/* 4. Canvas Content Container */}
      <div className="absolute inset-0 pt-14 flex items-center justify-center overflow-auto">
        <div
          className="relative"
          style={{
            width: 1200,
            height: 1000,
            transform: `scale(${zoom / 100})`,
            transformOrigin: "center center",
          }}
        >
          {/* Hero Card (Selected by default) */}
          <CanvasCard
            x={280}
            y={80}
            width={640}
            height={300}
            isSelected={selectedId === "hero"}
            onSelect={() => setSelectedId("hero")}
            title="HERO_SECTION"
          >
            <div className="p-6 flex flex-col items-center justify-center h-full text-center">
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 border border-zinc-700 text-[10px] text-zinc-500">
                <Flame className="w-3 h-3 text-orange-500" />
                <span>AN IDEAS LAB WITH MATCHES</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tighter leading-tight mb-4">
                <span className="block text-zinc-100">Your Data Is Cold.</span>
                <span className="block text-orange-500">We Bring the Matches.</span>
              </h1>
              <p className="text-zinc-500 text-xs max-w-md mb-4">
                Digital Mischief Group builds <span className="text-zinc-300">Revenue Cortexes</span> — governed AI
                infrastructure that turns dormant data into autonomous workflows.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/#audit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-zinc-950 text-xs font-bold hover:bg-orange-400 transition-all"
                >
                  <Flame className="w-3 h-3" />
                  <span>IGNITE AUDIT</span>
                </Link>
                <Link
                  href="/lab"
                  className="flex items-center gap-1.5 px-4 py-2 border border-zinc-700 text-zinc-300 text-xs hover:border-zinc-500 transition-all"
                >
                  <span>ENTER LAB</span>
                </Link>
              </div>
            </div>
          </CanvasCard>

          {/* Status Indicator (Small floating card) */}
          <CanvasCard
            x={950}
            y={100}
            width={160}
            height={80}
            isSelected={selectedId === "status"}
            onSelect={() => setSelectedId("status")}
          >
            <div className="p-3 flex flex-col justify-center h-full">
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 mb-2">
                <Activity className="w-3 h-3 text-orange-500" />
                <span>SYS.STATUS</span>
              </div>
              <div className="text-xs text-zinc-300 font-medium">OPERATIONAL</div>
              <div className="text-[10px] text-zinc-600">v2.4.1 // BUILD:2024</div>
            </div>
          </CanvasCard>

          {/* Revenue Cortex Card */}
          <CanvasCard
            x={60}
            y={520}
            width={380}
            height={200}
            isSelected={selectedId === "cortex"}
            onSelect={() => setSelectedId("cortex")}
            title="REVENUE_CORTEX"
          >
            <div className="p-4">
              <h3 className="text-sm font-bold mb-3 text-zinc-200">The Revenue Cortex</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Brain, label: "Cortex", desc: "Data Intelligence" },
                  { icon: Monitor, label: "Interface", desc: "Adoption Layer" },
                  { icon: Bot, label: "Autopilot", desc: "Workflow Agents" },
                  { icon: SlidersHorizontal, label: "Relay", desc: "Governance" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-2 border border-zinc-800 rounded bg-zinc-900/50 hover:border-orange-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon className="w-3 h-3 text-orange-500" />
                      <span className="text-[10px] font-bold text-zinc-300">{item.label}</span>
                    </div>
                    <span className="text-[9px] text-zinc-600">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </CanvasCard>

          {/* Process Steps Card */}
          <CanvasCard
            x={760}
            y={520}
            width={380}
            height={200}
            isSelected={selectedId === "process"}
            onSelect={() => setSelectedId("process")}
            title="IGNITION_PROTOCOL"
          >
            <div className="p-4">
              <h3 className="text-sm font-bold mb-3 text-zinc-200">DMG Ignition Protocol</h3>
              <div className="flex gap-1">
                {["AUDIT", "DESIGN", "BUILD", "IGNITE", "SUSTAIN"].map((step, i) => (
                  <div
                    key={step}
                    className="flex-1 p-2 border border-zinc-800 rounded bg-zinc-900/50 text-center hover:border-orange-500/30 transition-colors"
                  >
                    <div className="text-orange-500 text-xs font-bold mb-1">0{i + 1}</div>
                    <div className="text-[8px] text-zinc-400">{step}</div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-zinc-600 mt-3">From System Architecture Audit to sustained Cortex Ops.</p>
            </div>
          </CanvasCard>

          {/* Outcomes Card */}
          <CanvasCard
            x={60}
            y={760}
            width={280}
            height={160}
            isSelected={selectedId === "outcomes"}
            onSelect={() => setSelectedId("outcomes")}
            title="OUTCOMES"
          >
            <div className="p-3 space-y-2">
              {["8–12× faster knowledge access", "Agents handle ops 24/7", "Clear metrics & audit trails"].map(
                (outcome) => (
                  <div key={outcome} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 mt-1 shrink-0" />
                    <span className="text-[10px] text-zinc-400">{outcome}</span>
                  </div>
                ),
              )}
            </div>
          </CanvasCard>

          {/* Lab Reports Card */}
          <CanvasCard
            x={860}
            y={760}
            width={280}
            height={160}
            isSelected={selectedId === "cases"}
            onSelect={() => setSelectedId("cases")}
            title="LAB_REPORTS"
          >
            <div className="p-3 space-y-2">
              <div className="p-2 border border-zinc-800 rounded hover:border-orange-500/30 transition-colors">
                <div className="flex items-center gap-1 text-[9px] text-orange-500 mb-1">
                  <FileText className="w-2.5 h-2.5" />
                  <span>CASE STUDY</span>
                </div>
                <p className="text-[10px] text-zinc-400">B2B SaaS Revenue Cortex</p>
              </div>
              <div className="p-2 border border-zinc-800 rounded hover:border-orange-500/30 transition-colors">
                <div className="flex items-center gap-1 text-[9px] text-orange-500 mb-1">
                  <Search className="w-2.5 h-2.5" />
                  <span>LAB REPORT</span>
                </div>
                <p className="text-[10px] text-zinc-400">AI Chasm Diagnostic</p>
              </div>
            </div>
          </CanvasCard>

          {/* CTA Card */}
          <CanvasCard
            x={400}
            y={850}
            width={400}
            height={100}
            isSelected={selectedId === "cta"}
            onSelect={() => setSelectedId("cta")}
            title="CALL_TO_ACTION"
          >
            <div className="p-4 flex items-center justify-between h-full">
              <div>
                <p className="text-xs text-zinc-300 font-medium">Ready to ignite?</p>
                <p className="text-[10px] text-zinc-600">Start with a System Architecture Audit</p>
              </div>
              <a
                href="mailto:liam@digitalmischief.group"
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-zinc-950 text-xs font-bold hover:bg-orange-400 transition-all"
              >
                <span>BOOK AUDIT</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </CanvasCard>
        </div>
      </div>

      {/* 5. User Cursor (Multiplayer simulation) */}
      <div className="absolute top-1/4 left-1/4 pointer-events-none z-40 hidden lg:block">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#f97316" stroke="white" strokeWidth="1.5">
          <path d="M3 3L10.07 19.97L13.58 12.58L21 9.07L3 3Z" />
        </svg>
        <div className="absolute left-4 top-4 px-2 py-0.5 bg-orange-500 text-zinc-950 text-[10px] rounded-full font-bold whitespace-nowrap">
          Liam
        </div>
      </div>

      {/* 6. HUD / Toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 px-3 py-2 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-full">
          {/* Tool: Selection */}
          <button className="p-2 bg-orange-500 rounded-full text-zinc-950 hover:scale-105 transition-transform">
            <MousePointer2 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-zinc-700 mx-1" />

          {/* Tool: Hand */}
          <button className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-full transition-colors">
            <Hand className="w-4 h-4" />
          </button>

          {/* Tool: Shapes */}
          <button className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-full transition-colors">
            <Square className="w-4 h-4" />
          </button>

          {/* Tool: Image */}
          <button className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-full transition-colors">
            <ImageIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-zinc-700 mx-1" />

          {/* Zoom Controls */}
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="px-2 text-xs font-medium text-zinc-400 tabular-nums w-12 text-center">{zoom}%</div>
          <button
            onClick={() => setZoom(Math.min(150, zoom + 10))}
            className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7. Corner Decorations */}
      <div className="absolute top-20 left-6 w-12 h-12 border-l border-t border-zinc-800 pointer-events-none" />
      <div className="absolute bottom-20 right-6 w-12 h-12 border-r border-b border-zinc-800 pointer-events-none" />
    </div>
  )
}
