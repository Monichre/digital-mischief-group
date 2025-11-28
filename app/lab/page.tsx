"use client"

import { cn } from "@/lib/utils"

import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { Radar } from "@/components/radar"
import { Playlist } from "@/components/playlist"
import { PlayerControls } from "@/components/player-controls"
import { MathDisplay } from "@/components/math-display"
import { FUIDecorations } from "@/components/fui-decorations"
import { ParticleFace } from "@/components/particle-face"

const TRACKS = [
  { title: "Morphic v2 (Sick AF)", url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Morphic%20v2%20%28Sick%20AF%29-bHnNmGu7HW2rXF75D0HFC1tAg8vEQg.mp3" },
  { title: "Lately", url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Lately-6G7oXMqjVtaaTAyIZrAMvUc07EM67T.mp3" },
  { title: "Morphic", url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Morphic-lLX11IUKDeeta1k29SOekFNVOP6Afr.mp3" },
  { title: "Learn How To Fall", url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Learn%20How%20To%20Fall-6662RcbW9OWAKZ2ZOEY950T6vW1Bql.mp3" },
  { title: "Fighting My Future (1)", url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Fighting%20My%20Future%20%281%29-w8f5SJcgsAAcQa21n6YPS0bSkF0KEY.mp3" },
  { title: "Bro Dynasty - Abandon Doors", url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Bro%20Dynasty%20-%20Abandon%20Doors-FwAXIzZyEftTDPNCVo3dehwB7pZ84d.mp3" },
  { title: "Witchhunt", url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/witchhunt-Vc2OV7ZhX3RsQIQdpUM6QCx1I1fwBd.mp3" },
]

export default function LabPage() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play()

      if (!analyser && audioRef.current) {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext
          const audioCtx = new AudioContext()
          const newAnalyser = audioCtx.createAnalyser()
          newAnalyser.fftSize = 256

          const source = audioCtx.createMediaElementSource(audioRef.current)
          source.connect(newAnalyser)
          newAnalyser.connect(audioCtx.destination)

          setAnalyser(newAnalyser)
        } catch (e) {
          console.error("AudioContext setup failed:", e)
        }
      }
    } else {
      audioRef.current?.pause()
    }
  }, [isPlaying, currentTrackIndex, analyser])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      setDuration(audioRef.current.duration || 0)
    }
  }

  const handleTrackEnd = () => {
    handleNext()
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length)
  }

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length)
  }

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  return (
    <div className="relative w-full h-screen bg-void text-gray-300 font-mono overflow-hidden selection:bg-copper selection:text-black">
      <audio
        ref={audioRef}
        src={TRACKS[currentTrackIndex].url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
        onLoadedMetadata={handleTimeUpdate}
        crossOrigin="anonymous"
      />

      <div className="pointer-events-none absolute inset-0 z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
      <div className="pointer-events-none absolute inset-0 z-50 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent bg-[length:100%_4px]"></div>

      <div className="pointer-events-none absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]"></div>

      <div className="grid grid-cols-1 md:grid-cols-12 h-full w-full relative z-[70]">
        <div className="col-span-1 md:col-span-3 border-r border-white/10 flex flex-col p-6 gap-8 relative bg-black/20 backdrop-blur-sm h-full overflow-y-auto md:overflow-hidden z-20">
          <div className="space-y-4">
            <PlayerControls
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onPrev={handlePrev}
              volume={volume}
              onVolumeChange={setVolume}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
            />
          </div>

          <div className="w-full opacity-80">
            <Radar />
          </div>

          <div className="flex gap-4 items-start mt-2">
            <div className="w-16 h-20 border border-white/20 bg-gray-900 relative shrink-0 grayscale contrast-125 overflow-hidden group">
              <Image
                src="/placeholder.svg?key=jyiin"
                alt="Subject"
                width={80}
                height={100}
                className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute bottom-0 right-0 bg-copper text-black text-[0.5rem] px-1 font-bold">ID:99</div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent h-[20%] animate-[scan_2s_linear_infinite]"></div>
            </div>
            <div className="text-[0.55rem] leading-relaxed text-gray-400 text-justify flex-1">
              <span className="text-copper block mb-1 tracking-wider">:: ARTIST ANALYSIS</span>
              Audio signature matches "Morphic" profile. Harmonic resonance detected in sector 7.
              <div className="mt-3 pl-2 border-l border-copper/30">
                <MathDisplay equation="\Delta x = \sum_{i=0}^n \alpha_i" />
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <Playlist
              tracks={TRACKS}
              currentTrackIndex={currentTrackIndex}
              isPlaying={isPlaying}
              onTrackSelect={(index) => {
                setCurrentTrackIndex(index)
                setIsPlaying(true)
              }}
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-9 relative flex items-center justify-center bg-radial-gradient overflow-hidden">
          <div
            className={cn(
              "absolute inset-0 z-0 transition-opacity duration-1000",
              isPlaying ? "opacity-40" : "opacity-0",
            )}
          >
            <ParticleFace analyser={analyser} />
          </div>

          <FUIDecorations />

          <div className="absolute top-20 right-20 w-16 h-16 rounded-full border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] flex items-center justify-center animate-pulse">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-black to-gray-800 opacity-80"></div>
            <div className="absolute text-[0.5rem] -bottom-6 text-gray-500 tracking-widest">ORBIT_01</div>
          </div>

          <div className="absolute bottom-32 left-20 w-24 h-24 rounded-full border border-white/5 flex items-center justify-center">
            <div className="w-full h-[1px] bg-white/5 absolute rotate-45"></div>
            <div className="w-full h-[1px] bg-white/5 absolute -rotate-45"></div>
          </div>

          <div className="relative w-full h-[50vh] md:h-[70vh] flex items-center justify-center z-10">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-copper to-transparent opacity-50 z-0"></div>
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-copper blur-[2px] opacity-30 z-0"></div>

            <div
              className={cn(
                "relative w-[90%] h-full z-10 flex items-center justify-center transition-all duration-1000",
                isPlaying ? "opacity-100 scale-100" : "opacity-0 scale-95",
              )}
            >
              <div className="absolute top-[30%] left-[25%] flex items-center gap-2 animate-pulse z-20">
                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]"></div>
                <div className="h-[1px] w-8 md:w-12 bg-white/50"></div>
                <span className="text-[0.6rem] bg-black/50 px-1 border border-white/20 backdrop-blur-sm">
                  {isPlaying ? "AUDIO_OUT" : "STANDBY"}
                </span>
              </div>

              <div className="absolute bottom-[35%] right-[25%] flex items-center gap-2 flex-row-reverse z-20">
                <div
                  className={cn("w-1.5 h-1.5 bg-copper rounded-full", isPlaying ? "animate-ping" : "opacity-50")}
                ></div>
                <div className="h-[1px] w-8 md:w-12 bg-copper"></div>
                <span className="text-[0.6rem] text-copper border border-copper px-1 bg-black/50 backdrop-blur-sm">
                  {isPlaying ? "LIVE_FEED" : "OFFLINE"}
                </span>
              </div>

              <div className="absolute top-[20%] right-[35%] flex flex-col items-center gap-1 opacity-60 z-20">
                <div className="text-[0.5rem] tracking-widest">FREQ.MOD</div>
                <div className="w-20 h-[2px] bg-white/20 overflow-hidden">
                  <div
                    className={cn(
                      "h-full bg-white w-1/2",
                      isPlaying ? "animate-[shimmer_0.5s_infinite]" : "animate-[shimmer_2s_infinite]",
                    )}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 right-10 text-right z-20">
            <div className="text-4xl md:text-6xl font-light tracking-tighter text-white/90">
              {isPlaying && <span className="animate-pulse">PLAYING</span>}
            </div>
            <div className="text-[0.6rem] tracking-[0.3em] text-gray-500 mt-1 flex justify-end items-center gap-2">
              <div className={cn("w-2 h-2 bg-copper/50 rounded-full", isPlaying && "animate-ping")}></div>
              TRACK: {currentTrackIndex + 1}
            </div>
          </div>

          <div className="absolute top-10 left-10 z-20">
            <div className="flex items-center gap-2 text-[0.6rem] text-gray-500 tracking-widest">
              <div className="w-3 h-3 border border-white/20 flex items-center justify-center">
                <div className={cn("w-1 h-1 bg-white/50", isPlaying && "bg-copper animate-pulse")}></div>
              </div>
              SECTOR 7G // {isPlaying ? "ACTIVE" : "IDLE"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
