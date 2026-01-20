'use client'

import Link from 'next/link'
import {
  Check,
  Zap,
  Eye,
  Shield,
  ArrowRight,
  Flame,
  Radio,
  FileSearch,
  Radar,
  Telescope,
  MessageSquare,
} from 'lucide-react'
import {useState} from 'react'
import {cn} from '@/lib/utils'
import {authClient} from '@/platform/auth/client'

// =============================================================================
// CONSTANTS
// =============================================================================

const TIERS = [
  {
    id: 'observer',
    name: 'OBSERVER',
    tagline: 'Recon access',
    price: '$0',
    period: '/mo',
    description: 'Test the intel suite. Limited access, zero commitment.',
    features: [
      'Limited Intel Missions (3/mo)',
      'Basic Brand Analysis (1/mo)',
      'Community Support',
      'Public documentation',
    ],
    cta: {
      label: 'RUN DEMO',
      href: '/brand-recon',
      variant: 'outline' as const,
    },
    icon: Eye,
    highlight: false,
  },
  {
    id: 'operator',
    name: 'OPERATOR',
    tagline: 'Full clearance',
    price: '$30',
    period: '/mo',
    description:
      'Pro is the DMG Arsenal: field-tested templates, teardown reports, and deployable system protocols—built for operators.',
    features: [
      'Unlimited Intel Missions (Brand/Research/Observe)',
      'Lead Enrich runs + exports',
      'Field Reports + Templates',
      'Priority uplink (email support)',
      'API access',
    ],
    cta: {
      label: 'DEPLOY PRO',
      href: 'https://buy.stripe.com/9B67sM6JF2jWght0gcgMw00',
      variant: 'primary' as const,
      isExternal: true,
    },
    icon: Zap,
    highlight: true,
    badge: 'RECOMMENDED',
  },
  {
    id: 'skunkworks',
    name: 'SKUNKWORKS',
    tagline: 'Custom deployment',
    price: 'Custom',
    period: '',
    description:
      'Full system architecture. Custom agent development. Your dedicated engineering line.',
    features: [
      'Full System Architecture Review',
      'Custom Agent Development',
      'Dedicated Deployment Support',
      'Direct Line to Engineering',
      'White-glove onboarding',
    ],
    cta: {
      label: 'REQUEST AUDIT',
      href: 'https://calendly.com/liam-liamellis/digital-mischief-group',
      variant: 'outline' as const,
      isExternal: true,
    },
    icon: Shield,
    highlight: false,
    microcopy: '// Deliverable: Architecture Map + Friction Report in 48 hours',
  },
]

// =============================================================================
// COMPONENT
// =============================================================================

export default function LoadoutPage() {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null)
  const {data: session} = authClient.useSession()

  const handleProClick = async (tier: (typeof TIERS)[0]) => {
    // If it's the operator tier and we don't have a payment link, use the checkout API
    if (
      tier.id === 'operator' &&
      !process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK
    ) {
      // Check if user is authenticated before calling checkout
      if (!session?.user) {
        // Redirect to sign-in with callback to return here
        window.location.href = `/sign-in?callbackUrl=${encodeURIComponent('/loadout')}`
        return
      }

      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          console.error('Checkout error:', data)
          return
        }
        if (data.url) window.location.href = data.url
      } catch (error) {
        console.error('Checkout error:', error)
      }
      return
    }
    // Otherwise, navigate normally
    window.location.href = tier.cta.href
  }

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-200 font-mono selection:bg-orange-500 selection:text-white'>
      {/* Background grid */}
      <div className='fixed inset-0 bg-[linear-gradient(rgba(249,115,22,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none' />

      {/* Radial glow */}
      <div
        className='fixed inset-0 pointer-events-none'
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 50%)',
        }}
      />

      {/* Scan lines */}
      <div className='fixed inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.03)_50%)] bg-[size:100%_4px] pointer-events-none' />

      {/* Header */}
      <nav className='fixed top-0 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl z-50'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <Link
            href='/'
            className='flex items-center gap-2 hover:opacity-80 transition-opacity'
          >
            <div className='w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]' />
            <span className='font-bold tracking-tighter text-lg'>[ DMG ]</span>
          </Link>
          <div className='flex items-center gap-4'>
            <span className='text-[10px] text-zinc-600 tracking-widest'>
              SELECT_LOADOUT
            </span>
            <Link
              href='/'
              className='text-xs text-zinc-500 hover:text-orange-500 transition-colors'
            >
              ← Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className='relative z-10 pt-32 pb-24 px-6'>
        <div className='max-w-6xl mx-auto'>
          {/* Header section */}
          <div className='text-center mb-16'>
            <div className='inline-flex items-center gap-2 px-4 py-2 mb-6 border border-orange-500/30 bg-orange-500/5 rounded-full'>
              <Radar className='w-4 h-4 text-orange-500 animate-pulse' />
              <span className='text-[10px] text-orange-500 uppercase tracking-widest'>
                // SELECT LOADOUT
              </span>
            </div>

            <h1 className='text-display-lg mb-6'>
              Choose Your{' '}
              <span className='text-orange-500'>Clearance Level</span>
            </h1>

            <p className='text-body-xl text-zinc-400 max-w-2xl mx-auto'>
              The Intel Suite for operators who ship. No pilots, no
              committees—just deployed infrastructure.
            </p>
          </div>

          {/* Pricing grid */}
          <div className='grid md:grid-cols-3 gap-6 mb-16'>
            {TIERS.map((tier) => {
              const Icon = tier.icon
              const isHovered = hoveredTier === tier.id

              return (
                <div
                  key={tier.id}
                  onMouseEnter={() => setHoveredTier(tier.id)}
                  onMouseLeave={() => setHoveredTier(null)}
                  className={cn(
                    'relative flex flex-col p-8 border transition-all duration-500',
                    tier.highlight
                      ? 'border-orange-500/50 bg-zinc-900/80 shadow-lg shadow-orange-500/10'
                      : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700',
                    isHovered && !tier.highlight && 'border-orange-500/30'
                  )}
                >
                  {/* HUD corners */}
                  <div className='absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-orange-500/50' />
                  <div className='absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-orange-500/50' />
                  <div className='absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-orange-500/50' />
                  <div className='absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-orange-500/50' />

                  {/* Badge */}
                  {tier.badge && (
                    <div className='absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-black text-[10px] font-bold tracking-widest'>
                      {tier.badge}
                    </div>
                  )}

                  {/* Icon & Header */}
                  <div className='flex items-start gap-4 mb-6'>
                    <div
                      className={cn(
                        'w-12 h-12 flex items-center justify-center border transition-all duration-300',
                        tier.highlight || isHovered
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-zinc-700 bg-zinc-800'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-6 h-6 transition-colors duration-300',
                          tier.highlight || isHovered
                            ? 'text-orange-500'
                            : 'text-zinc-500'
                        )}
                      />
                    </div>
                    <div>
                      <h2 className='text-xl font-bold text-white'>
                        {tier.name}
                      </h2>
                      <p className='text-xs text-zinc-500 uppercase tracking-wider'>
                        {tier.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className='mb-6'>
                    <span className='text-4xl font-black text-white'>
                      {tier.price}
                    </span>
                    <span className='text-zinc-500'>{tier.period}</span>
                  </div>

                  {/* Description */}
                  <p className='text-sm text-zinc-400 mb-6 leading-relaxed'>
                    {tier.description}
                  </p>

                  {/* Features */}
                  <ul className='flex-1 space-y-3 mb-8'>
                    {tier.features.map((feature, i) => (
                      <li key={i} className='flex items-start gap-3 text-sm'>
                        <Check
                          className={cn(
                            'w-4 h-4 mt-0.5 flex-shrink-0',
                            tier.highlight
                              ? 'text-orange-500'
                              : 'text-green-500/70'
                          )}
                        />
                        <span className='text-zinc-300'>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {tier.cta.isExternal ? (
                    <a
                      href={tier.cta.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className={cn(
                        'flex items-center justify-center gap-2 px-6 py-4 font-bold text-sm transition-all duration-300',
                        tier.cta.variant === 'primary'
                          ? 'bg-orange-500 text-white hover:bg-orange-400'
                          : 'border border-zinc-700 text-zinc-300 hover:border-orange-500/50 hover:text-white'
                      )}
                    >
                      <span>[ {tier.cta.label} ]</span>
                      <ArrowRight className='w-4 h-4' />
                    </a>
                  ) : tier.id === 'operator' ? (
                    <button
                      onClick={() => handleProClick(tier)}
                      className={cn(
                        'flex items-center justify-center gap-2 px-6 py-4 font-bold text-sm transition-all duration-300',
                        'bg-orange-500 text-white hover:bg-orange-400'
                      )}
                    >
                      <Zap className='w-4 h-4' />
                      <span>[ {tier.cta.label} ]</span>
                      <ArrowRight className='w-4 h-4' />
                    </button>
                  ) : (
                    <Link
                      href={tier.cta.href}
                      className={cn(
                        'flex items-center justify-center gap-2 px-6 py-4 font-bold text-sm transition-all duration-300',
                        'border border-zinc-700 text-zinc-300 hover:border-orange-500/50 hover:text-white'
                      )}
                    >
                      <span>[ {tier.cta.label} ]</span>
                      <ArrowRight className='w-4 h-4' />
                    </Link>
                  )}

                  {/* Microcopy */}
                  {tier.microcopy && (
                    <p className='mt-4 text-[10px] text-zinc-600 text-center'>
                      {tier.microcopy}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Bottom section - What's included */}
          <div className='border border-zinc-800 bg-zinc-900/30 p-8'>
            <div className='flex items-center gap-3 mb-6'>
              <Radio className='w-5 h-5 text-orange-500' />
              <h3 className='text-lg font-bold'>
                What&apos;s in the Intel Suite?
              </h3>
            </div>

            <div className='grid md:grid-cols-4 gap-6'>
              {[
                {
                  icon: Radar,
                  label: 'OBSERVE',
                  desc: 'URL change monitors. Know when competitors move.',
                },
                {
                  icon: FileSearch,
                  label: 'ENRICH',
                  desc: 'Lead firmographics + tech stack intel.',
                },
                {
                  icon: Flame,
                  label: 'BRAND',
                  desc: 'Competitor extraction. Positioning diffs.',
                },
                {
                  icon: Telescope,
                  label: 'RESEARCH',
                  desc: 'Live web missions. Cited briefs.',
                },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className='flex items-start gap-3'>
                    <div className='w-8 h-8 flex items-center justify-center border border-zinc-700 bg-zinc-800'>
                      <Icon className='w-4 h-4 text-orange-500' />
                    </div>
                    <div>
                      <span className='text-xs font-bold text-zinc-200'>
                        {item.label}
                      </span>
                      <p className='text-[11px] text-zinc-500 mt-1'>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* FAQ/Contact */}
          <div className='text-center mt-12'>
            <p className='text-sm text-zinc-500 mb-4'>
              Questions? Need a custom deployment?
            </p>
            <a
              href={
                process.env.NEXT_PUBLIC_CALENDLY_AUDIT_URL ||
                'mailto:audit@digitalmischief.group'
              }
              className='inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors text-sm'
            >
              <MessageSquare className='w-4 h-4' />
              <span>Schedule a call →</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='py-8 border-t border-white/5'>
        <div className='max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600'>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]' />
            <span>© 2025 Digital Mischief Group</span>
          </div>
          <div className='flex items-center gap-6'>
            <span>Systems Online</span>
            <span className='text-green-500'>●</span>
            <span>All Systems Nominal</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
