"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"
import { LiveSentinelRunner } from "@/components/scouts/LiveSentinelRunner"
import type { Scout } from "@/lib/scouts/types"

export default function ScoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [scout, setScout] = useState<Scout | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const res = await fetch(`/api/scouts/${id}`)
    const data = await res.json()
    setScout(data.scout)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    )
  }

  if (!scout) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-red-600">Sentinel not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/scouts" className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sentinels</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">{scout.name}</h1>
          <p className="text-zinc-600">{scout.search_query}</p>
          {scout.last_run_at && (
            <p className="text-sm text-zinc-500 mt-2 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Last run: {new Date(scout.last_run_at).toLocaleString()}
            </p>
          )}
        </div>

        <LiveSentinelRunner scoutId={id} scoutName={scout.name} onComplete={fetchData} />
      </main>
    </div>
  )
}
