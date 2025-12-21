"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

interface ColorSwatchProps {
  name: string
  color: string
}

export function ColorSwatch({ name, color }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(color)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Calculate relative luminance for contrast
  const getLuminance = (hex: string): number => {
    const rgb = hex.replace("#", "").match(/.{2}/g)
    if (!rgb) return 0
    const [r, g, b] = rgb.map((c) => {
      const val = Number.parseInt(c, 16) / 255
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const isLight = getLuminance(color) > 0.5
  const textColor = isLight ? "text-zinc-900" : "text-white"

  return (
    <button
      onClick={copyToClipboard}
      className="group relative flex flex-col overflow-hidden border border-zinc-800 hover:border-orange-500/50 transition-all duration-300"
    >
      {/* Color Preview */}
      <div className="h-20 w-full relative" style={{ backgroundColor: color }}>
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30" />

        {/* Copy Icon */}
        <div
          className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${textColor}`}
        >
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </div>
      </div>

      {/* Color Info */}
      <div className="p-3 bg-zinc-900/50">
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{name}</div>
        <div className="text-xs font-mono text-zinc-300">{color.toUpperCase()}</div>
      </div>

      {/* Scan Line Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
  )
}
