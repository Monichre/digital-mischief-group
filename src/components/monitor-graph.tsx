"use client"

import { useEffect, useState } from "react"

interface MonitorGraphProps {
  label: string
  value: number
}

export function MonitorGraph({ label, value: initialValue }: MonitorGraphProps) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    const interval = setInterval(() => {
      // Random fluctuation around the initial value
      const fluctuation = Math.random() * 10 - 5
      setValue(Math.min(100, Math.max(0, initialValue + fluctuation)))
    }, 2000)
    return () => clearInterval(interval)
  }, [initialValue])

  return (
    <div className="flex items-center gap-3 text-[0.55rem]">
      <span className="w-6 text-gray-400">{label}</span>
      <div className="h-[2px] w-full bg-white/10 relative flex-1">
        <div
          className="absolute top-0 left-0 h-full bg-copper shadow-[0_0_5px_#C48A58] transition-all duration-1000 ease-out"
          style={{ width: `${value}%` }}
        ></div>
        {/* Data Blip */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 h-1 bg-white transition-all duration-1000 ease-out"
          style={{ left: `${value}%` }}
        ></div>
      </div>
      <span className="w-6 text-right text-copper">{Math.round(value)}%</span>
    </div>
  )
}
