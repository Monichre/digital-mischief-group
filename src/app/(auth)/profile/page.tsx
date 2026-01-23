'use client'

import {useState, useEffect} from 'react'
import Link from 'next/link'
import {useRouter, useSearchParams} from 'next/navigation'
import {formatDistanceToNow} from 'date-fns'
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  CreditCard,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Building2,
  Search,
  Palette,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Zap,
  Crown,
} from 'lucide-react'
import {authClient} from '@/platform/auth/client'
import {AuthLinks} from '@/components/AuthLinks'

interface UserProfile {
  id: string
  name: string
  email: string
  image?: string
  subscriptionStatus: string
  credits: number
  createdAt: string
  hasStripeCustomer: boolean
}

interface UsageStats {
  enrichments: {total: number; thisMonth: number}
  research: {total: number; thisMonth: number}
  brands: {total: number; thisMonth: number}
}

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)

  // Check for success/cancel from Stripe
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/sign-in')
          return
        }
        throw new Error('Failed to fetch profile')
      }
      const data = await res.json()
      setUser(data.user)
      setUsage(data.usage)
      setNewName(data.user.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveName = async () => {
    if (!newName.trim() || newName === user?.name) {
      setEditingName(false)
      return
    }

    setSavingName(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: newName.trim()}),
      })
      if (!res.ok) throw new Error('Failed to update name')
      setUser((u) => (u ? {...u, name: newName.trim()} : null))
      setEditingName(false)
    } catch {
      // Show error
    } finally {
      setSavingName(false)
    }
  }

  const handleManageBilling = async () => {
    setBillingLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', {method: 'POST'})
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (data.error) {
        // No subscription yet - redirect to loadout
        router.push('/loadout')
      }
    } catch {
      router.push('/loadout')
    } finally {
      setBillingLoading(false)
    }
  }

  const handleUpgrade = async () => {
    setBillingLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      // Error
    } finally {
      setBillingLoading(false)
    }
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-orange-500' />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <p className='text-zinc-400'>{error || 'Failed to load profile'}</p>
          <Link
            href='/'
            className='text-orange-500 hover:underline mt-4 inline-block'
          >
            Return home
          </Link>
        </div>
      </div>
    )
  }

  const isPro = user.subscriptionStatus === 'active'

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-200 font-mono'>
      {/* Background */}
      <div className='fixed inset-0 pointer-events-none z-0'>
        <div className='absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem]' />
      </div>

      {/* Navigation */}
      <nav className='fixed top-0 w-full border-b border-white/10 bg-zinc-950/90 backdrop-blur-md z-50'>
        <div className='max-w-4xl mx-auto px-6 h-16 flex items-center justify-between'>
          <Link
            href='/'
            className='flex items-center gap-3 text-zinc-400 hover:text-orange-500 transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            <span className='text-sm'>Back to HQ</span>
          </Link>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <User className='w-4 h-4 text-orange-500' />
              <span className='font-bold tracking-tighter'>[ PROFILE ]</span>
            </div>
            <AuthLinks
              linkClassName='text-[10px] text-zinc-500 hover:text-white transition-colors'
              ctaClassName='px-2.5 py-1 border border-zinc-700 text-[10px] text-zinc-400 hover:border-orange-500/60 hover:text-orange-500 transition-colors'
            />
          </div>
        </div>
      </nav>

      <main className='relative z-10 pt-24 pb-20 px-6'>
        <div className='max-w-4xl mx-auto space-y-8'>
          {/* Success/Cancel Messages */}
          {success && (
            <div className='flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded'>
              <CheckCircle2 className='w-5 h-5 text-green-500' />
              <span className='text-green-400'>
                Loadout activated successfully!
              </span>
            </div>
          )}
          {canceled && (
            <div className='flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded'>
              <AlertCircle className='w-5 h-5 text-yellow-500' />
              <span className='text-yellow-400'>Loadout upgrade canceled.</span>
            </div>
          )}

          {/* Profile Header */}
          <div className='border border-zinc-800 bg-zinc-900/30 p-6 relative'>
            <div className='absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-orange-500' />
            <div className='absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-orange-500' />
            <div className='absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-orange-500' />
            <div className='absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-orange-500' />

            <div className='flex items-start gap-6'>
              <div className='w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-3xl font-bold text-white'>
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-1'>
                  {editingName ? (
                    <div className='flex items-center gap-2'>
                      <input
                        type='text'
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className='bg-zinc-800 border border-zinc-700 px-3 py-1 rounded text-lg focus:outline-none focus:border-orange-500'
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={savingName}
                        className='px-3 py-1 bg-orange-500 text-black rounded text-sm hover:bg-orange-400 disabled:opacity-50'
                      >
                        {savingName ? (
                          <Loader2 className='w-4 h-4 animate-spin' />
                        ) : (
                          'Save'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingName(false)
                          setNewName(user.name)
                        }}
                        className='px-3 py-1 text-zinc-400 hover:text-zinc-200 text-sm'
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className='text-2xl font-bold'>{user.name}</h1>
                      <button
                        onClick={() => setEditingName(true)}
                        className='text-xs text-zinc-500 hover:text-orange-500 transition-colors'
                      >
                        Edit
                      </button>
                    </>
                  )}
                </div>
                <div className='flex items-center gap-2 text-zinc-400 text-sm mb-3'>
                  <Mail className='w-4 h-4' />
                  <span>{user.email}</span>
                </div>
                <div className='flex items-center gap-4 text-xs text-zinc-500'>
                  <div className='flex items-center gap-1'>
                    <Calendar className='w-3 h-3' />
                    <span>
                      Joined{' '}
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  {isPro ? (
                    <div className='flex items-center gap-1 text-orange-400'>
                      <Crown className='w-3 h-3' />
                      <span>OPERATOR</span>
                    </div>
                  ) : (
                    <div className='flex items-center gap-1 text-zinc-500'>
                      <Zap className='w-3 h-3' />
                      <span>OBSERVER</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Loadout Card */}
          <div className='border border-zinc-800 bg-zinc-900/30 p-6'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-3'>
                <CreditCard className='w-5 h-5 text-orange-500' />
                <h2 className='text-lg font-bold'>Loadout</h2>
              </div>
              <div
                className={`px-3 py-1 rounded text-xs font-bold ${
                  isPro
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {isPro ? 'OPERATOR LOADOUT' : 'OBSERVER LOADOUT'}
              </div>
            </div>

            {isPro ? (
              <div className='space-y-4'>
                <div className='flex items-center gap-2 text-green-400'>
                  <CheckCircle2 className='w-5 h-5' />
                  <span>Your loadout is active</span>
                </div>
                <ul className='grid grid-cols-2 gap-2 text-sm text-zinc-400'>
                  <li className='flex items-center gap-2'>
                    <Sparkles className='w-4 h-4 text-orange-500' />
                    Unlimited Enrichment
                  </li>
                  <li className='flex items-center gap-2'>
                    <Sparkles className='w-4 h-4 text-orange-500' />
                    Unlimited Brand Analysis
                  </li>
                  <li className='flex items-center gap-2'>
                    <Sparkles className='w-4 h-4 text-orange-500' />
                    Deep Research Agent
                  </li>
                  <li className='flex items-center gap-2'>
                    <Sparkles className='w-4 h-4 text-orange-500' />
                    Priority Support
                  </li>
                </ul>
                <button
                  onClick={handleManageBilling}
                  disabled={billingLoading}
                  className='flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors'
                >
                  {billingLoading ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    <>
                      <Settings className='w-4 h-4' />
                      Manage Billing
                      <ExternalLink className='w-3 h-3 text-zinc-500' />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className='space-y-4'>
                <p className='text-zinc-400'>
                  Upgrade to Operator for unlimited access to all features.
                </p>
                <div className='flex items-center gap-4'>
                  <button
                    onClick={handleUpgrade}
                    disabled={billingLoading}
                    className='flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded transition-colors'
                  >
                    {billingLoading ? (
                      <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                      <>
                        <Crown className='w-4 h-4' />
                        Upgrade to Operator - $30/mo
                      </>
                    )}
                  </button>
                  <Link
                    href='/loadout'
                    className='text-sm text-zinc-400 hover:text-orange-500 transition-colors'
                  >
                    View loadout details
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Usage Stats */}
          {usage && (
            <div className='border border-zinc-800 bg-zinc-900/30 p-6'>
              <div className='flex items-center gap-3 mb-6'>
                <BarChart3 className='w-5 h-5 text-orange-500' />
                <h2 className='text-lg font-bold'>Usage This Month</h2>
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <Link
                  href='/enrich'
                  className='p-4 bg-zinc-800/50 border border-zinc-700 rounded hover:border-orange-500/50 transition-colors group'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <Building2 className='w-5 h-5 text-orange-500' />
                    <ChevronRight className='w-4 h-4 text-zinc-600 group-hover:text-orange-500 transition-colors' />
                  </div>
                  <div className='text-2xl font-bold'>
                    {usage.enrichments.thisMonth}
                  </div>
                  <div className='text-xs text-zinc-500'>Enrichments</div>
                  <div className='text-[10px] text-zinc-600 mt-1'>
                    {usage.enrichments.total} total
                  </div>
                </Link>

                <Link
                  href='/research'
                  className='p-4 bg-zinc-800/50 border border-zinc-700 rounded hover:border-orange-500/50 transition-colors group'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <Search className='w-5 h-5 text-purple-500' />
                    <ChevronRight className='w-4 h-4 text-zinc-600 group-hover:text-purple-500 transition-colors' />
                  </div>
                  <div className='text-2xl font-bold'>
                    {usage.research.thisMonth}
                  </div>
                  <div className='text-xs text-zinc-500'>Research</div>
                  <div className='text-[10px] text-zinc-600 mt-1'>
                    {usage.research.total} total
                  </div>
                </Link>

                <Link
                  href='/brand-recon'
                  className='p-4 bg-zinc-800/50 border border-zinc-700 rounded hover:border-orange-500/50 transition-colors group'
                >
                  <div className='flex items-center justify-between mb-2'>
                    <Palette className='w-5 h-5 text-pink-500' />
                    <ChevronRight className='w-4 h-4 text-zinc-600 group-hover:text-pink-500 transition-colors' />
                  </div>
                  <div className='text-2xl font-bold'>
                    {usage.brands.thisMonth}
                  </div>
                  <div className='text-xs text-zinc-500'>Brand Analyses</div>
                  <div className='text-[10px] text-zinc-600 mt-1'>
                    {usage.brands.total} total
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className='border border-zinc-800 bg-zinc-900/30 p-6'>
            <h2 className='text-lg font-bold mb-4'>Quick Actions</h2>
            <div className='grid grid-cols-2 gap-3'>
              <Link
                href='/enrich'
                className='flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded hover:border-orange-500/50 transition-colors'
              >
                <Building2 className='w-5 h-5 text-orange-500' />
                <span>Target Research</span>
                <ChevronRight className='w-4 h-4 text-zinc-600 ml-auto' />
              </Link>
              <Link
                href='/research'
                className='flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded hover:border-purple-500/50 transition-colors'
              >
                <Search className='w-5 h-5 text-purple-500' />
                <span>Deep Research</span>
                <ChevronRight className='w-4 h-4 text-zinc-600 ml-auto' />
              </Link>
              <Link
                href='/brand-recon'
                className='flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded hover:border-pink-500/50 transition-colors'
              >
                <Palette className='w-5 h-5 text-pink-500' />
                <span>Brand Recon</span>
                <ChevronRight className='w-4 h-4 text-zinc-600 ml-auto' />
              </Link>
              <Link
                href='/scouts'
                className='flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-700 rounded hover:border-cyan-500/50 transition-colors'
              >
                <Zap className='w-5 h-5 text-cyan-500' />
                <span>Active Recon</span>
                <ChevronRight className='w-4 h-4 text-zinc-600 ml-auto' />
              </Link>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className='w-full flex items-center justify-center gap-2 p-3 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/50 transition-colors rounded'
          >
            <LogOut className='w-4 h-4' />
            Sign Out
          </button>
        </div>
      </main>
    </div>
  )
}
