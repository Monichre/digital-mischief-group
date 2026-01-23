'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import type { RadarEvent, RadarRule, RadarSource } from '@/daedalus/radar/types'
import {AuthLinks} from '@/components/AuthLinks'

const ALL_SOURCES: RadarSource[] = ['firecrawl', 'exa', 'reddit', 'hackernews', 'twitter']

export default function RadarPage() {
  const [rules, setRules] = useState<RadarRule[]>([])
  const [selectedRule, setSelectedRule] = useState<string | null>(null)
  const [feed, setFeed] = useState<RadarEvent[]>([])
  const [loadingRules, setLoadingRules] = useState(false)
  const [loadingFeed, setLoadingFeed] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    name: '',
    terms: '',
    sources: new Set<RadarSource>(['firecrawl', 'exa']),
    notify_email: '',
    notify_webhook: '',
    cooldown_minutes: 60,
  })

  const selectedRuleObj = useMemo(
    () => rules.find((r) => r.id === selectedRule) || null,
    [rules, selectedRule]
  )

  const loadRules = async () => {
    setLoadingRules(true)
    const res = await fetch('/api/radar/rules')
    const data = await res.json()
    setRules(data.rules || [])
    setLoadingRules(false)
    if (!selectedRule && data.rules?.[0]?.id) {
      setSelectedRule(data.rules[0].id)
    }
  }

  const loadFeed = async (ruleId?: string | null) => {
    const target = ruleId || selectedRule
    if (!target) return
    setLoadingFeed(true)
    const res = await fetch(`/api/radar/feed?ruleId=${target}`)
    const data = await res.json()
    setFeed(data.feed || [])
    setLoadingFeed(false)
  }

  useEffect(() => {
    loadRules()
  }, [])

  useEffect(() => {
    if (selectedRule) loadFeed(selectedRule)
  }, [selectedRule])

  const toggleSource = (src: RadarSource) => {
    setForm((prev) => {
      const next = new Set(prev.sources)
      if (next.has(src)) next.delete(src)
      else next.add(src)
      return { ...prev, sources: next }
    })
  }

  const createRule = async () => {
    if (!form.name || !form.terms || form.sources.size === 0) return
    setCreating(true)
    const payload = {
      name: form.name,
      terms: form.terms.split(',').map((t) => t.trim()).filter(Boolean),
      sources: Array.from(form.sources),
      notify_email: form.notify_email || undefined,
      notify_webhook: form.notify_webhook || undefined,
      cooldown_minutes: form.cooldown_minutes,
    }

    const res = await fetch('/api/radar/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setCreating(false)
    if (res.ok) {
      setForm({ name: '', terms: '', sources: new Set(['firecrawl', 'exa']), notify_email: '', notify_webhook: '', cooldown_minutes: 60 })
      await loadRules()
    }
  }

  const refreshRule = async () => {
    if (!selectedRule) return
    await fetch('/api/radar/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ruleId: selectedRule }),
    })
    await loadFeed(selectedRule)
  }

  return (
    <div className="min-h-screen bg-background-base">
      <nav className="fixed top-0 w-full border-b border-border-faint bg-background-lighter/90 backdrop-blur-md z-50">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-black-alpha-56 hover:text-accent-black transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to HQ
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-widest text-black-alpha-32">
              RADAR // SIGNALS
            </span>
            <AuthLinks
              linkClassName="text-[10px] text-black-alpha-56 hover:text-accent-black transition-colors"
              ctaClassName="px-2.5 py-1 border border-border-faint text-[10px] text-black-alpha-56 hover:border-accent-black hover:text-accent-black transition-colors"
            />
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 pt-28 pb-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-accent-black">Radar</h1>
            <p className="text-black-alpha-56">Real-time mentions across firecrawl, Exa, Reddit, HN, and more.</p>
          </div>
          <button
            className="rounded-md bg-accent-black px-4 py-2 text-white text-sm font-medium"
            onClick={refreshRule}
            disabled={!selectedRule || loadingFeed}
          >
            {loadingFeed ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-lg border border-border-faint bg-white p-4 lg:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Rules</h2>
              {loadingRules && <span className="text-xs text-black-alpha-56">Loading…</span>}
            </div>
            <div className="space-y-2">
              {rules.map((rule) => (
                <button
                  key={rule.id}
                  onClick={() => setSelectedRule(rule.id)}
                  className={`w-full rounded-md border px-3 py-2 text-left ${
                    selectedRule === rule.id ? 'border-accent-black bg-gray-50' : 'border-border-faint'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-accent-black">{rule.name}</div>
                      <div className="text-xs text-black-alpha-56 truncate">{rule.terms.join(', ')}</div>
                    </div>
                    <div className="text-[11px] text-black-alpha-56">{rule.sources.length} src</div>
                  </div>
                </button>
              ))}
              {rules.length === 0 && !loadingRules && (
                <div className="text-sm text-black-alpha-56">No rules yet.</div>
              )}
            </div>

            <div className="mt-6 border-t border-border-faint pt-4">
              <h3 className="text-sm font-semibold mb-2">New rule</h3>
              <div className="space-y-2">
                <input
                  className="w-full rounded-md border border-border-faint px-3 py-2 text-sm"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                  className="w-full rounded-md border border-border-faint px-3 py-2 text-sm"
                  placeholder="Terms (comma separated)"
                  value={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.value })}
                />
                <div className="text-xs font-medium text-accent-black">Sources</div>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_SOURCES.map((src) => (
                    <label key={src} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={form.sources.has(src)}
                        onChange={() => toggleSource(src)}
                      />
                      {src}
                    </label>
                  ))}
                </div>
                <input
                  className="w-full rounded-md border border-border-faint px-3 py-2 text-sm"
                  placeholder="Notify email (optional)"
                  value={form.notify_email}
                  onChange={(e) => setForm({ ...form, notify_email: e.target.value })}
                />
                <input
                  className="w-full rounded-md border border-border-faint px-3 py-2 text-sm"
                  placeholder="Webhook URL (optional)"
                  value={form.notify_webhook}
                  onChange={(e) => setForm({ ...form, notify_webhook: e.target.value })}
                />
                <input
                  className="w-full rounded-md border border-border-faint px-3 py-2 text-sm"
                  type="number"
                  min={5}
                  placeholder="Cooldown minutes"
                  value={form.cooldown_minutes}
                  onChange={(e) => setForm({ ...form, cooldown_minutes: Number(e.target.value) })}
                />
                <button
                  onClick={createRule}
                  disabled={creating}
                  className="w-full rounded-md bg-accent-black px-3 py-2 text-sm font-medium text-white"
                >
                  {creating ? 'Creating…' : 'Create rule'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-lg border border-border-faint bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Feed</h2>
              {loadingFeed && <span className="text-xs text-black-alpha-56">Loading…</span>}
            </div>
            {selectedRuleObj && (
              <div className="mb-3 text-xs text-black-alpha-56">
                Showing mentions for <span className="font-semibold text-accent-black">{selectedRuleObj.name}</span>
              </div>
            )}
            <div className="space-y-3">
              {feed.map((item) => (
                <div key={item.id} className="rounded-md border border-border-faint p-3">
                  <div className="flex items-center justify-between text-xs text-black-alpha-56 mb-1">
                    <span className="font-semibold text-accent-black">{item.source}</span>
                    <span>{new Date(item.occurred_at).toLocaleString()}</span>
                  </div>
                  <a href={item.url} className="text-sm font-medium text-accent-black" target="_blank" rel="noreferrer">
                    {item.title || item.url}
                  </a>
                  <div className="text-sm text-black-alpha-56 mt-1">{item.snippet}</div>
                  {item.matched_terms?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-accent-black">
                      {item.matched_terms.map((t) => (
                        <span key={t} className="rounded-full bg-gray-100 px-2 py-1">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {!loadingFeed && feed.length === 0 && (
                <div className="text-sm text-black-alpha-56">No mentions yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
