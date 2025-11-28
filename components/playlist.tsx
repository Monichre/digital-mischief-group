"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface Track {
  title: string
  url: string
}

interface PlaylistProps {
  tracks: Track[]
  currentTrackIndex: number
  isPlaying: boolean
  onTrackSelect: (index: number) => void
}

export function Playlist({ tracks, currentTrackIndex, isPlaying, onTrackSelect }: PlaylistProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to current track
  useEffect(() => {
    if (containerRef.current) {
      const activeElement = containerRef.current.children[currentTrackIndex] as HTMLElement
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }
  }, [currentTrackIndex])

  return (
    <div className="flex flex-col h-full">
      <div className="text-[0.6rem] tracking-[0.2em] text-copper mb-2 flex justify-between items-center">
        <span className="glitch-header" data-text="SEQ.QUEUE">
          SEQ.QUEUE
        </span>
        <span className="animate-pulse">{isPlaying ? "PLAYING" : "IDLE"}</span>
      </div>

      <div
        ref={containerRef}
        className="text-[0.55rem] text-gray-500 font-mono leading-tight overflow-y-auto h-48 mask-gradient-bottom scrollbar-hide"
      >
        {tracks.map((track, i) => {
          const isActive = i === currentTrackIndex
          return (
            <div
              key={i}
              onClick={() => onTrackSelect(i)}
              className={cn(
                "py-1.5 px-2 border-l-2 cursor-pointer transition-all duration-300 hover:bg-white/5 flex justify-between items-center group",
                isActive ? "border-copper bg-white/5 text-white" : "border-transparent hover:border-white/20",
              )}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className={cn("opacity-50 w-4", isActive && "text-copper")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate max-w-[140px]">{track.title}</span>
              </div>

              {isActive && isPlaying && (
                <div className="flex gap-0.5 items-end h-3">
                  <div className="w-0.5 bg-copper animate-[music-bar_0.5s_ease-in-out_infinite] h-full"></div>
                  <div className="w-0.5 bg-copper animate-[music-bar_0.7s_ease-in-out_infinite_0.1s] h-2"></div>
                  <div className="w-0.5 bg-copper animate-[music-bar_0.4s_ease-in-out_infinite_0.2s] h-3"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
