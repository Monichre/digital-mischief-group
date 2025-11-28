"use client"

import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PlayerControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrev: () => void
  volume: number
  onVolumeChange: (val: number) => void
  currentTime: number
  duration: number
  onSeek: (val: number) => void
}

export function PlayerControls({
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  volume,
  onVolumeChange,
  currentTime,
  duration,
  onSeek,
}: PlayerControlsProps) {
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between text-[0.6rem] tracking-[0.2em] text-copper mb-2">
        <span className="glitch-header text-xl" data-text="DiGITAL MISCHIEF GROUP">
          DiGITAL MISCHIEF GROUP
        </span>
        <span>V.2.0</span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1 group">
        <div className="flex justify-between text-[0.5rem] text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div
          className="h-2 w-full bg-white/10 relative cursor-pointer overflow-hidden"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            onSeek(percent * duration)
          }}
        >
          <div
            className="absolute top-0 left-0 h-full bg-copper shadow-[0_0_10px_#C48A58] transition-all duration-100 ease-linear"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
          {/* Hover effect line */}
          <div className="absolute top-0 left-0 h-full w-full opacity-0 group-hover:opacity-100 bg-white/5 transition-opacity pointer-events-none" />
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-copper hover:bg-white/5 rounded-none border border-transparent hover:border-white/10"
          onClick={onPrev}
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 text-copper border-copper/50 bg-copper/10 hover:bg-copper/20 hover:text-white hover:border-copper rounded-none shadow-[0_0_10px_rgba(196,138,88,0.2)]"
          onClick={onPlayPause}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-copper hover:bg-white/5 rounded-none border border-transparent hover:border-white/10"
          onClick={onNext}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-500 hover:text-gray-300 p-0"
          onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
        >
          {volume === 0 ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
        </Button>
        <div
          className="h-1 flex-1 bg-white/10 relative cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
            onVolumeChange(percent)
          }}
        >
          <div className="absolute top-0 left-0 h-full bg-gray-400" style={{ width: `${volume * 100}%` }} />
        </div>
      </div>
    </div>
  )
}
