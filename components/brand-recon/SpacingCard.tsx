"use client"

import type { BrandSpacing } from "@/lib/brand-recon/types"

interface SpacingCardProps {
  spacing?: BrandSpacing
}

export function SpacingCard({ spacing }: SpacingCardProps) {
  if (!spacing) return null

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
        <span className="text-xs uppercase tracking-widest text-zinc-500">Spacing System</span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Base Unit */}
        {spacing.baseUnit && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-3">Base Unit</div>
            <div className="flex items-center gap-3">
              <div
                className="bg-orange-500/30 border border-orange-500"
                style={{ width: spacing.baseUnit, height: spacing.baseUnit }}
              />
              <span className="text-lg font-mono text-zinc-300">{spacing.baseUnit}px</span>
            </div>
          </div>
        )}

        {/* Border Radius */}
        {spacing.borderRadius && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-3">Border Radius</div>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 bg-zinc-800 border border-zinc-600"
                style={{ borderRadius: spacing.borderRadius }}
              />
              <span className="text-lg font-mono text-zinc-300">{spacing.borderRadius}</span>
            </div>
          </div>
        )}
      </div>

      {/* Spacing Scale Visual */}
      {spacing.baseUnit && (
        <div className="mt-6">
          <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-3">Spacing Scale</div>
          <div className="flex items-end gap-2">
            {[1, 2, 3, 4, 6, 8].map((multiplier) => (
              <div key={multiplier} className="flex flex-col items-center gap-1">
                <div
                  className="bg-gradient-to-t from-orange-500/50 to-orange-500/20 border-t border-orange-500"
                  style={{
                    width: 24,
                    height: spacing.baseUnit * multiplier,
                  }}
                />
                <span className="text-[9px] text-zinc-600">{spacing.baseUnit * multiplier}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
