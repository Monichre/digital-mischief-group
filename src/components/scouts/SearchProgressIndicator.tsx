"use client"

import { Loader2, CheckCircle, Search } from "lucide-react"

type SearchEngine = "serper" | "exa" | "firecrawl"
type SearchStatus = "idle" | "searching" | "completed"

interface SearchProgress {
  serper: { status: SearchStatus; found: number }
  exa: { status: SearchStatus; found: number }
  firecrawl: { status: SearchStatus; found: number }
}

interface SearchProgressIndicatorProps {
  searchProgress: SearchProgress
}

const engineLabels: Record<SearchEngine, string> = {
  serper: "Google Search",
  exa: "Exa AI",
  firecrawl: "Deep Crawl",
}

export function SearchProgressIndicator({ searchProgress }: SearchProgressIndicatorProps) {
  const engines: SearchEngine[] = ["serper", "exa", "firecrawl"]

  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      {engines.map((engine) => {
        const progress = searchProgress[engine]
        const isSearching = progress.status === "searching"
        const isCompleted = progress.status === "completed"

        return (
          <div
            key={engine}
            className="border border-zinc-200 bg-white p-3 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {isSearching && <Loader2 className="w-4 h-4 text-[#fa5d19] animate-spin" />}
              {isCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
              {!isSearching && !isCompleted && <Search className="w-4 h-4 text-zinc-400" />}
              <span className="text-sm font-medium text-zinc-700">{engineLabels[engine]}</span>
            </div>

            {isCompleted && (
              <span className="text-xs font-medium text-zinc-600">{progress.found} results</span>
            )}

            {isSearching && <span className="text-xs text-zinc-500">searching...</span>}
          </div>
        )
      })}
    </div>
  )
}
