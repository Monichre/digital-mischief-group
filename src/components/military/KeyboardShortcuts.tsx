"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Home, LogIn, LayoutDashboard, CreditCard, FileCode, Command, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTacticalToast } from "./TacticalToast"

const SHORTCUTS = [
  { key: "g", label: "HQ (Home)", href: "/", icon: Home },
  { key: "u", label: "UPLINK (Login)", href: "/login", icon: LogIn },
  { key: "c", label: "CMD (Dashboard)", href: "/dashboard", icon: LayoutDashboard },
  { key: "l", label: "LOADOUT (Pricing)", href: "/pricing", icon: CreditCard },
  { key: "s", label: "SCHEMATICS", href: "/schematics", icon: FileCode },
]

export function KeyboardShortcuts({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { addToast } = useTacticalToast()
  const [showPalette, setShowPalette] = useState(false)
  const [search, setSearch] = useState("")

  const filteredShortcuts = SHORTCUTS.filter(
    (s) => s.label.toLowerCase().includes(search.toLowerCase()) || s.key.toLowerCase() === search.toLowerCase(),
  )

  const handleNavigation = useCallback(
    (href: string, label: string) => {
      router.push(href)
      setShowPalette(false)
      setSearch("")
      addToast({
        type: "info",
        title: "NAVIGATION",
        message: `Routing to ${label}`,
        duration: 2000,
      })
    },
    [router, addToast],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Command palette toggle (Cmd/Ctrl + K)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setShowPalette((prev) => !prev)
        return
      }

      // Close palette on Escape
      if (e.key === "Escape") {
        setShowPalette(false)
        setSearch("")
        return
      }

      // If palette is open, don't process single-key shortcuts
      if (showPalette) return

      // Single key navigation shortcuts
      const shortcut = SHORTCUTS.find((s) => s.key === e.key.toLowerCase())
      if (shortcut) {
        handleNavigation(shortcut.href, shortcut.label)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showPalette, handleNavigation])

  return (
    <>
      {children}

      {/* Shortcut hint in corner */}
      <div className="fixed bottom-4 left-4 z-50 hidden md:flex items-center gap-2 text-[10px] text-stone-600 tracking-widest">
        <kbd className="px-1.5 py-0.5 bg-stone-900 border border-stone-700 text-stone-400">⌘K</kbd>
        <span>COMMAND</span>
      </div>

      {/* Command Palette */}
      <AnimatePresence>
        {showPalette && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPalette(false)
                setSearch("")
              }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300]"
            />

            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-md z-[301]"
            >
              <div className="bg-black border border-emerald-900/50 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-stone-800">
                  <Command size={16} className="text-emerald-600" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search commands..."
                    autoFocus
                    className="flex-1 bg-transparent text-sm text-stone-200 placeholder:text-stone-600 outline-none"
                  />
                  <button
                    onClick={() => {
                      setShowPalette(false)
                      setSearch("")
                    }}
                    className="text-stone-600 hover:text-stone-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Commands */}
                <div className="p-2 max-h-64 overflow-y-auto">
                  <div className="text-[10px] text-stone-600 tracking-widest px-2 py-1 mb-1">NAVIGATION</div>
                  {filteredShortcuts.map((shortcut) => {
                    const Icon = shortcut.icon
                    return (
                      <button
                        key={shortcut.key}
                        onClick={() => handleNavigation(shortcut.href, shortcut.label)}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-emerald-900/20 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={16} className="text-stone-500 group-hover:text-emerald-500 transition-colors" />
                          <span className="text-sm text-stone-300 group-hover:text-white transition-colors">
                            {shortcut.label}
                          </span>
                        </div>
                        <kbd
                          className={cn(
                            "px-2 py-0.5 text-[10px] tracking-widest border",
                            "bg-stone-900 border-stone-700 text-stone-400",
                            "group-hover:bg-emerald-900/30 group-hover:border-emerald-700 group-hover:text-emerald-400",
                            "transition-colors",
                          )}
                        >
                          {shortcut.key.toUpperCase()}
                        </kbd>
                      </button>
                    )
                  })}
                  {filteredShortcuts.length === 0 && (
                    <div className="px-3 py-4 text-center text-sm text-stone-600">No commands found</div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-stone-800 text-[10px] text-stone-600 tracking-widest">
                  <span>MISCHIEF_CMD</span>
                  <div className="flex items-center gap-2">
                    <span>ESC</span>
                    <span className="text-stone-700">TO CLOSE</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
