"use client"

import type { BrandComponents, BrandColors } from "@/lib/brand-recon/types"

interface ComponentPreviewProps {
  components?: BrandComponents
  colors?: BrandColors
}

export function ComponentPreview({ components, colors }: ComponentPreviewProps) {
  const buttonPrimary = components?.buttonPrimary
  const buttonSecondary = components?.buttonSecondary
  const input = components?.input

  return (
    <div className="border border-zinc-800 bg-zinc-900/30 p-6 relative">
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-orange-500/50" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-orange-500/50" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-orange-500/50" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-orange-500/50" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-4 bg-orange-500" />
        <span className="text-xs uppercase tracking-widest text-zinc-500">UI Components</span>
      </div>

      {/* Buttons */}
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-4">Button Styles</div>
        <div className="flex flex-wrap gap-4">
          {/* Primary Button */}
          <div className="space-y-2">
            <button
              className="px-6 py-3 text-sm font-medium transition-all"
              style={{
                backgroundColor: buttonPrimary?.background || colors?.primary || "#f97316",
                color: buttonPrimary?.textColor || "#ffffff",
                borderRadius: buttonPrimary?.borderRadius || "0px",
              }}
            >
              Primary Button
            </button>
            <div className="text-[10px] text-zinc-600">{buttonPrimary?.background || colors?.primary || "N/A"}</div>
          </div>

          {/* Secondary Button */}
          <div className="space-y-2">
            <button
              className="px-6 py-3 text-sm font-medium border transition-all"
              style={{
                backgroundColor: buttonSecondary?.background || "transparent",
                color: buttonSecondary?.textColor || colors?.primary || "#f97316",
                borderColor: buttonSecondary?.borderColor || colors?.primary || "#f97316",
                borderRadius: buttonSecondary?.borderRadius || "0px",
              }}
            >
              Secondary Button
            </button>
            <div className="text-[10px] text-zinc-600">{buttonSecondary?.borderColor || colors?.primary || "N/A"}</div>
          </div>
        </div>
      </div>

      {/* Input */}
      {(input || colors) && (
        <div className="mb-8">
          <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-4">Input Field</div>
          <input
            type="text"
            placeholder="Input placeholder..."
            className="w-full max-w-sm px-4 py-3 text-sm border outline-none transition-all"
            style={{
              backgroundColor: input?.background || colors?.background || "#18181b",
              color: input?.textColor || colors?.textPrimary || "#ffffff",
              borderColor: input?.borderColor || colors?.secondary || "#3f3f46",
              borderRadius: input?.borderRadius || "0px",
            }}
          />
        </div>
      )}

      {/* Color Scheme Preview */}
      {colors && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-4">Semantic Colors</div>
          <div className="flex gap-3">
            {colors.success && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.success }} />
                <span className="text-[10px] text-zinc-500">Success</span>
              </div>
            )}
            {colors.warning && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.warning }} />
                <span className="text-[10px] text-zinc-500">Warning</span>
              </div>
            )}
            {colors.error && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.error }} />
                <span className="text-[10px] text-zinc-500">Error</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
