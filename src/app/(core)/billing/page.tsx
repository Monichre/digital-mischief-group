'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CreditCard,
  Zap,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Eye,
  Radar,
  Bot,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {AuthLinks} from '@/components/AuthLinks'

interface UsageData {
  plan: {
    status: string
    name: string
    hasStripeCustomer: boolean
  }
  limits: Record<string, number>
  usage: Record<string, { used: number; limit: number; remaining: number }>
  billingPeriod: {
    start: string
    end: string
  }
  recentEvents: Array<{
    id: string
    type: string
    module: string
    status: string
    createdAt: string
  }>
  credits: number
}

const MODULE_ICONS = {
  enrich: Sparkles,
  extract: Zap,
  observe: Eye,
  scout: Radar,
  agent: Bot,
} as const

const MODULE_LABELS: Record<string, string> = {
  enrich: 'Enrich',
  extract: 'Extract',
  observe: 'Observe',
  scout: 'Scout',
  agent: 'Agent',
}

export default function BillingPage() {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [upgrading, setUpgrading] = useState(false)
  const [managingBilling, setManagingBilling] = useState(false)

  useEffect(() => {
    fetchUsageData()
  }, [])

  const fetchUsageData = async () => {
    try {
      const res = await fetch('/api/billing/usage')
      if (!res.ok) throw new Error('Failed to fetch usage data')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
      if (!priceId) {
        throw new Error('Price ID not configured')
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      if (!res.ok) throw new Error('Failed to create checkout session')

      const { url } = await res.json()
      if (url) window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout')
    } finally {
      setUpgrading(false)
    }
  }

  const handleManageBilling = async () => {
    setManagingBilling(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Failed to open billing portal')
      }

      const { url } = await res.json()
      if (url) window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open portal')
    } finally {
      setManagingBilling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (!data) return null

  const isPro = data.plan.status === 'active'
  const periodEnd = new Date(data.billingPeriod.end)

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-200 font-mono'>
      <nav className='fixed top-0 w-full border-b border-white/10 bg-zinc-950/90 backdrop-blur-md z-50'>
        <div className='max-w-4xl mx-auto px-6 h-16 flex items-center justify-between'>
          <Link
            href='/'
            className='flex items-center gap-2 text-zinc-400 hover:text-orange-500 transition-colors'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='text-sm'>Back to HQ</span>
          </Link>
          <div className='flex items-center gap-4'>
            <span className='text-[10px] tracking-widest text-zinc-500'>
              LOADOUT // BILLING
            </span>
            <AuthLinks
              linkClassName='text-[10px] text-zinc-500 hover:text-white transition-colors'
              ctaClassName='px-2.5 py-1 border border-zinc-700 text-[10px] text-zinc-400 hover:border-orange-500/60 hover:text-orange-500 transition-colors'
            />
          </div>
        </div>
      </nav>

      <div className="container max-w-4xl pt-28 pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Loadout & Billing</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your loadout and monitor usage across all primitives
        </p>
      </div>

      {/* Current Loadout */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Loadout
              </CardTitle>
              <CardDescription>
                Your loadout and billing details
              </CardDescription>
            </div>
            <Badge variant={isPro ? 'default' : 'secondary'} className="text-sm">
              {data.plan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {isPro ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Active loadout</span>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  Limited access to primitives
                </div>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                Billing period ends: {periodEnd.toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              {isPro && data.plan.hasStripeCustomer ? (
                <Button
                  variant="outline"
                  onClick={handleManageBilling}
                  disabled={managingBilling}
                >
                  {managingBilling ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                  )}
                  Manage Billing
                </Button>
              ) : (
                <Button onClick={handleUpgrade} disabled={upgrading}>
                  {upgrading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  Upgrade to Operator
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>
            Track your usage across all five primitives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(data.usage).map(([module, stats]) => {
              const Icon = MODULE_ICONS[module as keyof typeof MODULE_ICONS] ?? Zap
              const label = MODULE_LABELS[module] || module
              const isUnlimited = stats.limit === 0
              const percentage = isUnlimited
                ? 0
                : Math.min(100, (stats.used / stats.limit) * 100)
              const isNearLimit = !isUnlimited && stats.remaining <= 3

              return (
                <div key={module} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stats.used} / {isUnlimited ? '∞' : stats.limit}
                    </span>
                  </div>
                  {!isUnlimited && (
                    <Progress
                      value={percentage}
                      className={
                        isNearLimit ? '[&>[data-slot=progress-indicator]]:bg-amber-500' : ''
                      }
                    />
                  )}
                  {isNearLimit && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      {stats.remaining === 0
                        ? 'Limit reached - upgrade for more'
                        : `Only ${stats.remaining} remaining this month`}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Loadout Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Loadout Comparison</CardTitle>
          <CardDescription>
            See what&apos;s included in each loadout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Observer Loadout */}
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Observer</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started with basic access
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  10 enrichments / month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  20 extractions / month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  5 monitors / month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  3 scouts / month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  10 agent sessions / month
                </li>
              </ul>
            </div>

            {/* Operator Loadout */}
            <div className="rounded-lg border border-primary/50 bg-primary/5 p-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Operator</h3>
                <Badge variant="secondary" className="text-xs">
                  Popular
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                For power users and teams
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  500 enrichments / month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  1,000 extractions / month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  50 monitors / month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  25 scouts / month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  200 agent sessions / month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Priority support
                </li>
              </ul>
              {!isPro && (
                <Button
                  className="mt-4 w-full"
                  onClick={handleUpgrade}
                  disabled={upgrading}
                >
                  {upgrading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  Upgrade to Operator
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
