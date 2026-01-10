"use client"
import { Suspense } from "react"
import MonitorDetailClient from "./MonitorDetailClient"

export default async function MonitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading...</div>
      }
    >
      <MonitorDetailClient id={id} />
    </Suspense>
  )
}

// Client component logic moved to MonitorDetailClient
