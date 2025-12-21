"use client"

import Image from "next/image"
import type { BrandingProfile } from "@/lib/brand-recon/types"

interface BrandHeaderProps {
  branding: BrandingProfile
  metadata?: {
    title?: string
    description?: string
    sourceURL?: string
  }
}

export function BrandHeader({ branding, metadata }: BrandHeaderProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-900/30 p-6 relative">
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange-500" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-orange-500" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-orange-500" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange-500" />

      <div className="flex items-start gap-6">
        {/* Logo */}
        {branding.logo && (
          <div className="flex-shrink-0 w-20 h-20 bg-zinc-800 border border-zinc-700 flex items-center justify-center p-2">
            <Image
              src={branding.logo || "/placeholder.svg"}
              alt="Brand Logo"
              width={64}
              height={64}
              className="object-contain max-w-full max-h-full"
              unoptimized
            />
          </div>
        )}

        {/* Brand Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-zinc-100 truncate">{metadata?.title || "Brand Identity"}</h2>
            <span
              className={`px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                branding.colorScheme === "dark" ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200 text-zinc-700"
              }`}
            >
              {branding.colorScheme || "unknown"} mode
            </span>
          </div>

          {metadata?.description && <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{metadata.description}</p>}

          {metadata?.sourceURL && (
            <a
              href={metadata.sourceURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-400 transition-colors"
            >
              {metadata.sourceURL}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>

        {/* Personality Tags */}
        {branding.personality && (
          <div className="flex-shrink-0 text-right">
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Personality</div>
            <div className="flex flex-col gap-1">
              {branding.personality.tone && (
                <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-[10px] uppercase">
                  {branding.personality.tone}
                </span>
              )}
              {branding.personality.energy && (
                <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-[10px] uppercase">
                  {branding.personality.energy}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
