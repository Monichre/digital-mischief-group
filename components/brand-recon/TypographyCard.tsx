"use client"

import type { BrandTypography, BrandFont } from "@/lib/brand-recon/types"

interface TypographyCardProps {
  typography?: BrandTypography
  fonts?: BrandFont[]
}

export function TypographyCard({ typography, fonts }: TypographyCardProps) {
  const fontFamilies = typography?.fontFamilies
  const fontSizes = typography?.fontSizes
  const fontWeights = typography?.fontWeights

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
        <span className="text-xs uppercase tracking-widest text-zinc-500">Typography System</span>
      </div>

      {/* Font Families */}
      {fonts && fonts.length > 0 && (
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-3">Font Families</div>
          <div className="flex flex-wrap gap-2">
            {fonts.map((font, i) => (
              <div
                key={i}
                className="px-3 py-2 bg-zinc-800/50 border border-zinc-700 text-sm"
                style={{ fontFamily: font.family }}
              >
                {font.family}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Font Roles */}
      {fontFamilies && (
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-3">Font Roles</div>
          <div className="grid grid-cols-3 gap-4">
            {fontFamilies.primary && (
              <div className="space-y-1">
                <div className="text-[10px] text-orange-500/70">PRIMARY</div>
                <div className="text-sm text-zinc-300">{fontFamilies.primary}</div>
              </div>
            )}
            {fontFamilies.heading && (
              <div className="space-y-1">
                <div className="text-[10px] text-orange-500/70">HEADING</div>
                <div className="text-sm text-zinc-300">{fontFamilies.heading}</div>
              </div>
            )}
            {fontFamilies.code && (
              <div className="space-y-1">
                <div className="text-[10px] text-orange-500/70">CODE</div>
                <div className="text-sm font-mono text-zinc-300">{fontFamilies.code}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Font Sizes */}
      {fontSizes && (
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-3">Type Scale</div>
          <div className="space-y-3">
            {fontSizes.h1 && (
              <div className="flex items-baseline gap-4 border-b border-zinc-800/50 pb-2">
                <span className="text-[10px] text-zinc-600 w-8">H1</span>
                <span className="text-2xl text-zinc-200">Heading One</span>
                <span className="text-[10px] text-zinc-600 ml-auto">{fontSizes.h1}</span>
              </div>
            )}
            {fontSizes.h2 && (
              <div className="flex items-baseline gap-4 border-b border-zinc-800/50 pb-2">
                <span className="text-[10px] text-zinc-600 w-8">H2</span>
                <span className="text-xl text-zinc-200">Heading Two</span>
                <span className="text-[10px] text-zinc-600 ml-auto">{fontSizes.h2}</span>
              </div>
            )}
            {fontSizes.h3 && (
              <div className="flex items-baseline gap-4 border-b border-zinc-800/50 pb-2">
                <span className="text-[10px] text-zinc-600 w-8">H3</span>
                <span className="text-lg text-zinc-200">Heading Three</span>
                <span className="text-[10px] text-zinc-600 ml-auto">{fontSizes.h3}</span>
              </div>
            )}
            {fontSizes.body && (
              <div className="flex items-baseline gap-4">
                <span className="text-[10px] text-zinc-600 w-8">P</span>
                <span className="text-base text-zinc-300">Body Text</span>
                <span className="text-[10px] text-zinc-600 ml-auto">{fontSizes.body}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Font Weights */}
      {fontWeights && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-3">Weight Scale</div>
          <div className="flex gap-6">
            {fontWeights.light && (
              <div className="text-center">
                <div className="text-xl font-light text-zinc-300 mb-1">Aa</div>
                <div className="text-[10px] text-zinc-600">Light ({fontWeights.light})</div>
              </div>
            )}
            {fontWeights.regular && (
              <div className="text-center">
                <div className="text-xl font-normal text-zinc-300 mb-1">Aa</div>
                <div className="text-[10px] text-zinc-600">Regular ({fontWeights.regular})</div>
              </div>
            )}
            {fontWeights.medium && (
              <div className="text-center">
                <div className="text-xl font-medium text-zinc-300 mb-1">Aa</div>
                <div className="text-[10px] text-zinc-600">Medium ({fontWeights.medium})</div>
              </div>
            )}
            {fontWeights.bold && (
              <div className="text-center">
                <div className="text-xl font-bold text-zinc-300 mb-1">Aa</div>
                <div className="text-[10px] text-zinc-600">Bold ({fontWeights.bold})</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
