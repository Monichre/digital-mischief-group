"use client"

import { useEffect, useState, useRef } from "react"

const LOG_LINES = [
  "0x1F4A ... STREAM_INIT",
  "LOADING KERNEL MODULES...",
  "EF 23 9A 11 00 42",
  "CC 12 88 91 22 1A",
  "... CONNECTION ESTABLISHED",
  "DECRYPTING PACKET HEADER...",
  "WARN: LATENCY SPIKE DETECTED",
  "OPTIMIZING ROUTE...",
  "BUFFER OVERFLOW AT 0x8821",
  "RETRYING HANDSHAKE...",
  "SUCCESS: NODE_B CONNECTED",
  "SYNCING DATA STREAMS...",
  "VERIFYING CHECKSUMS...",
  "00 11 01 01 10 11",
  "ANALYSIS COMPLETE",
]

export function LogStream() {
  const [logs, setLogs] = useState<string[]>(LOG_LINES.slice(0, 5))
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => {
        const nextLine = LOG_LINES[Math.floor(Math.random() * LOG_LINES.length)]
        const newLogs = [...prev, nextLine]
        if (newLogs.length > 12) newLogs.shift()
        return newLogs
      })
    }, 800)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      ref={containerRef}
      className="text-[0.5rem] text-gray-600 font-mono leading-tight overflow-hidden h-32 mask-gradient-bottom flex flex-col justify-end"
    >
      {logs.map((log, i) => (
        <p key={i} className="my-0.5 animate-in fade-in slide-in-from-bottom-1 duration-300">
          <span className="opacity-30 mr-2">
            {new Date().toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
          {log.includes("WARN") || log.includes("FAIL") ? (
            <span className="text-copper">{log}</span>
          ) : log.includes("SUCCESS") ? (
            <span className="text-white">{log}</span>
          ) : (
            log
          )}
        </p>
      ))}
    </div>
  )
}
