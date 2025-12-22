"use client"

import { motion } from "framer-motion"
import { Link2, ExternalLink, Globe } from "lucide-react"

interface SourceAttributionProps {
  sources: string[]
  compact?: boolean
}

function getDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace("www.", "")
  } catch {
    return url
  }
}

function getSourceIcon(url: string) {
  const domain = getDomainFromUrl(url).toLowerCase()
  if (domain.includes("crunchbase")) return "🦄"
  if (domain.includes("linkedin")) return "💼"
  if (domain.includes("twitter") || domain.includes("x.com")) return "🐦"
  if (domain.includes("techcrunch")) return "📰"
  if (domain.includes("github")) return "🐙"
  return "🔗"
}

export function SourceAttribution({ sources, compact = false }: SourceAttributionProps) {
  if (sources.length === 0) return null

  // Dedupe sources
  const uniqueSources = [...new Set(sources)]

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Link2 className="w-3 h-3 text-zinc-500" />
        <span className="text-xs text-zinc-500">{uniqueSources.length} sources</span>
      </div>
    )
  }

  return (
    <div className="border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded bg-orange-500/10 flex items-center justify-center">
          <Link2 className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-100">Data Sources</h3>
          <p className="text-xs text-zinc-500">{uniqueSources.length} sources referenced</p>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {uniqueSources.map((source, i) => (
          <motion.a
            key={i}
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 p-2 rounded hover:bg-zinc-800 transition-colors group"
          >
            <span className="text-sm">{getSourceIcon(source)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-300 truncate group-hover:text-orange-500 transition-colors">
                {getDomainFromUrl(source)}
              </p>
              <p className="text-xs text-zinc-600 truncate">{source}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-orange-500 transition-colors flex-shrink-0" />
          </motion.a>
        ))}
      </div>
    </div>
  )
}
