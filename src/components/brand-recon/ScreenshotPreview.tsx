"use client"

import { useState } from "react"
import { Monitor, Maximize2, X, ExternalLink } from "lucide-react"

interface ScreenshotPreviewProps {
  screenshot: string
  sourceUrl?: string
}

export function ScreenshotPreview({ screenshot, sourceUrl }: ScreenshotPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      {/* Thumbnail Card */}
      <div className="relative border border-zinc-800 bg-zinc-900/50 overflow-hidden group">
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-orange-500/50" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-orange-500/50" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-orange-500/50" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-orange-500/50" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-orange-500" />
            <span className="text-xs uppercase tracking-widest text-zinc-400">Site Screenshot</span>
          </div>
          <div className="flex items-center gap-2">
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-orange-500"
                title="Open site"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={() => setIsExpanded(true)}
              className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-orange-500"
              title="Expand"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Screenshot Image */}
        <div className="relative cursor-pointer overflow-hidden" onClick={() => setIsExpanded(true)}>
          <img
            src={screenshot || "/placeholder.svg"}
            alt="Website screenshot"
            className="w-full h-auto max-h-[400px] object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/80 px-4 py-2 border border-orange-500/50">
              <span className="text-xs text-orange-500 uppercase tracking-widest">Click to expand</span>
            </div>
          </div>
          {/* Scan Line Effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200"
          onClick={() => setIsExpanded(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-6 right-6 p-2 bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-colors text-zinc-400 hover:text-orange-500"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Corner Frame */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-orange-500/50" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-orange-500/50" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-orange-500/50" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-orange-500/50" />

          {/* Image Container */}
          <div
            className="relative max-w-[90vw] max-h-[90vh] border border-zinc-800 bg-zinc-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={screenshot || "/placeholder.svg"}
              alt="Website screenshot"
              className="max-w-full max-h-[85vh] object-contain"
            />
            {/* Scan Line Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] opacity-30" />
          </div>

          {/* Info Bar */}
          {sourceUrl && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-zinc-900/90 border border-zinc-800">
              <span className="text-xs text-zinc-500 font-mono">{sourceUrl}</span>
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-400 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}
    </>
  )
}
