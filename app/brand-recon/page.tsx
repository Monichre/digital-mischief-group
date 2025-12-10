"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Loader2, AlertCircle, Crosshair, Radar } from "lucide-react"
import type { BrandingProfile, ReconStatus } from "@/lib/brand-recon/types"
import { ColorSwatch } from "@/components/brand-recon/ColorSwatch"
import { TypographyCard } from "@/components/brand-recon/TypographyCard"
import { ComponentPreview } from "@/components/brand-recon/ComponentPreview"
import { BrandHeader } from "@/components/brand-recon/BrandHeader"
import { SpacingCard } from "@/components/brand-recon/SpacingCard"

export default function BrandReconPage() {
  const [input, setInput] = useState("")
  const [status, setStatus] = useState<ReconStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [branding, setBranding] = useState<BrandingProfile | null>(null)
  const [metadata, setMetadata] = useState<{ title?: string; description?: string; sourceURL?: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setStatus("loading")
    setError(null)
    setBranding(null)
    setMetadata(null)

    try {
      const response = await fetch("/api/brand-recon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to extract brand identity")
      }

      setBranding(data.data.branding)
      setMetadata(data.data.metadata)
      setStatus("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      setStatus("error")
    }
  }

  const colors = branding?.colors
  const colorEntries = colors ? Object.entries(colors).filter(([, value]) => value) : []

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] border border-white/5 rounded-full opacity-20" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b border-white/10 bg-zinc-950/90 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-zinc-400 hover:text-orange-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to HQ</span>
          </Link>
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-orange-500 animate-pulse" />
            <span className="font-mono font-bold tracking-tighter text-lg">[ BRAND RECON ]</span>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-zinc-800 text-xs text-zinc-500 mb-6">
              <Crosshair className="w-3 h-3 text-orange-500" />
              <span>// INTELLIGENCE GATHERING</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="text-zinc-100">Brand</span> <span className="text-orange-500">Reconnaissance</span>
            </h1>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Extract complete brand identity from any URL or company email. Colors, typography, components—decoded in
              seconds.
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-orange-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-orange-500" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-orange-500" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-orange-500" />

              <div className="flex bg-zinc-900 border border-zinc-800">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter URL or company email (e.g., stripe.com or hello@stripe.com)"
                  className="flex-1 px-6 py-4 bg-transparent text-zinc-100 placeholder-zinc-600 outline-none text-sm"
                  disabled={status === "loading"}
                />
                <button
                  type="submit"
                  disabled={status === "loading" || !input.trim()}
                  className="px-8 py-4 bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>SCANNING</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>INITIATE RECON</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Error State */}
          {status === "error" && error && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-2 border-orange-500/30 rounded-full animate-ping" />
                <div className="absolute inset-2 border border-orange-500/50 rounded-full animate-pulse" />
                <div
                  className="absolute inset-4 border border-dashed border-orange-500 rounded-full animate-spin"
                  style={{ animationDuration: "3s" }}
                />
                <Radar className="absolute inset-0 m-auto w-8 h-8 text-orange-500" />
              </div>
              <p className="text-zinc-500 text-sm animate-pulse">Extracting brand identity...</p>
            </div>
          )}

          {/* Results */}
          {status === "success" && branding && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Brand Header */}
              <BrandHeader branding={branding} metadata={metadata || undefined} />

              {/* Color Palette */}
              {colorEntries.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-orange-500" />
                    <span className="text-xs uppercase tracking-widest text-zinc-500">Color Palette</span>
                    <span className="text-[10px] text-zinc-600">({colorEntries.length} colors)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {colorEntries.map(([name, color]) => (
                      <ColorSwatch key={name} name={name} color={color as string} />
                    ))}
                  </div>
                </div>
              )}

              {/* Typography & Spacing Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <TypographyCard typography={branding.typography} fonts={branding.fonts} />
                <SpacingCard spacing={branding.spacing} />
              </div>

              {/* Component Preview */}
              <ComponentPreview components={branding.components} colors={branding.colors} />

              {/* Raw Data */}
              <details className="border border-zinc-800 bg-zinc-900/30">
                <summary className="px-6 py-4 cursor-pointer text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                  View Raw JSON
                </summary>
                <pre className="px-6 pb-6 text-xs text-zinc-500 overflow-x-auto">
                  {JSON.stringify(branding, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
