"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, X } from "lucide-react"

const SYSTEM_RESPONSES: Record<string, string> = {
  help: "AVAILABLE COMMANDS: /status, /deploy, /clear, /about, /surrender, /defcon, /nodes, /missions",
  status: "ALL SYSTEMS OPERATIONAL. PING: 4ms. SHIELD: ACTIVE.",
  about: "DIGITAL MISCHIEF OS v9.0.4 [CREATIVE CHAOS]",
  surrender: "NEVER.",
  deploy: "INITIATING DEPLOYMENT SEQUENCE... [ACCESS DENIED - AUTH REQUIRED]",
  defcon: "CURRENT MISCHIEF LEVEL: 3 [ELEVATED]. USE /defcon [1-5] TO CHANGE.",
  nodes: "NODES ONLINE: US-EAST (12ms), EU-WEST (45ms), ASIA-PAC (89ms), SA-PRIME (156ms - DEGRADED)",
  missions: "ACTIVE: IDEA_HARVEST (78%), PERIMETER_SCAN (100%), CHAOS_ANALYSIS (45%)",
}

export function QuakeTerminal() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<string[]>([
    "MISCHIEF_OS [Version 10.0.19045.3636]",
    "(c) Digital Mischief Studios. All rights reserved.",
    "",
    "Type '/help' for a list of commands.",
  ])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Toggle on Tilde (~) key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        if (isOpen && e.key === "Escape") {
          setIsOpen(false)
        }
        return
      }

      if (e.key === "`" || e.key === "~") {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const cmd = input.trim().toLowerCase().replace("/", "")
    const newHistory = [...history, `> ${input}`]

    // Save to command history for up/down navigation
    setCommandHistory((prev) => [...prev, input])
    setHistoryIndex(-1)

    if (cmd === "clear") {
      setHistory([])
    } else {
      const response = SYSTEM_RESPONSES[cmd] || `ERR: UNKNOWN COMMAND '${cmd}'. TYPE /help FOR AVAILABLE COMMANDS.`
      newHistory.push(response)
      setHistory(newHistory)
    }

    setInput("")
  }

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setInput("")
        } else {
          setHistoryIndex(newIndex)
          setInput(commandHistory[newIndex])
        }
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
          />

          {/* Terminal Window */}
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 right-0 h-[50vh] bg-[#0c0c0c] border-b-2 border-emerald-600 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[100] flex flex-col font-mono text-sm"
          >
            {/* Scanline overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-5"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 2px, transparent 3px)",
                backgroundSize: "100% 3px",
              }}
            />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-emerald-900/20 border-b border-emerald-900/50 text-emerald-500 text-xs font-bold tracking-widest select-none relative z-10">
              <div className="flex items-center gap-2">
                <Terminal size={14} />
                <span>ROOT_ACCESS // TERMINAL</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="animate-pulse">CONNECTED</span>
                <button onClick={() => setIsOpen(false)} className="hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Log Output */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-1 text-emerald-500/80 relative z-10"
              onClick={() => inputRef.current?.focus()}
            >
              {history.map((line, i) => (
                <div key={i} className="break-words">
                  {line.startsWith(">") ? (
                    <span className="text-cyan-400">{line}</span>
                  ) : line.startsWith("ERR:") ? (
                    <span className="text-red-500">{line}</span>
                  ) : (
                    line
                  )}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleCommand}
              className="p-4 bg-emerald-950/10 border-t border-emerald-900/50 flex items-center gap-2 relative z-10"
            >
              <span className="text-emerald-500 font-bold">{">"}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyUp}
                className="flex-1 bg-transparent border-none outline-none text-emerald-400 placeholder-emerald-800 caret-emerald-500"
                placeholder="Enter command..."
                autoComplete="off"
                spellCheck={false}
              />
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
