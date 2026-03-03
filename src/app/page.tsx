'use client'

import Link from 'next/link'
import {
  Flame,
  ArrowRight,
  ChevronRight,
  Target,
  X,
  Radar,
  Zap,
  Layers,
  FileSearch,
  Shield,
  Swords,
  ScanEye,
  Radio,
  Brain,
  MessageSquare,
} from 'lucide-react'
import {useState, useRef, useEffect} from 'react'
import {SignupForm, useSignupForm} from '@/components/SignupForm'
import {MeetTheTeam} from '@/components/MeetTheTeam'
import {HeroTicker} from '@/components/HeroTicker'
import {CapabilitiesStrip} from '@/components/CapabilitiesStrip'
import {AuthLinks} from '@/components/AuthLinks'
import {TypeWriter} from '@/components/TypeWriter'
import {DotPattern} from '@/components/DotPattern'
import {
  ScrollReveal,
  StaggerReveal,
  Parallax,
  GlitchText,
  ScaleReveal,
  Magnetic,
} from '@/components/scroll-animations'
import {
  NoiseOverlay,
  ScanlineOverlay,
  HoloText,
  HUDCorners,
  FloatingStatus,
  CircuitDivider,
  IntelCard,
  AnimatedGridBG,
  HeroBurst,
  GlowingOrb,
  SectionGlow,
  StrikeOutReveal,
  RoleBasedAccessControl,
  RealtimeCollaboration,
} from '@/components/effects'

// Stripe buy link for Operator ($30/mo)
const STRIPE_PRO_LINK = 'https://buy.stripe.com/9B67sM6JF2jWght0gcgMw00'
const CALENDLY_AUDIT_URL =
  'https://calendly.com/liam-liamellis/digital-mischief-group'

export default function Home() {
  const signupForm = useSignupForm()
  const [daedalusOpen, setDaedalusOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDaedalusOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-200 selection:bg-orange-500 selection:text-white font-mono'>
      {/* === ATMOSPHERIC LAYERS === */}
      <AnimatedGridBG />
      <NoiseOverlay />
      <ScanlineOverlay />

      {/* Background Dot Pattern (secondary layer) */}
      <div className='fixed inset-0 z-[1] opacity-30 pointer-events-none'>
        <DotPattern
          width={32}
          height={32}
          cr={0.5}
          className='text-orange-500/10'
        />
      </div>

      {/* NAVIGATION */}
      <nav className='fixed top-0 w-full border-b border-white/5 bg-zinc-950/60 backdrop-blur-xl z-50'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]' />
            <span className='font-mono font-bold tracking-tighter text-lg'>
              [ DMG ]
            </span>
          </div>
          <div className='hidden md:flex items-center gap-8 text-sm text-zinc-400'>
            <Link
              href='#cortex'
              className='hover:text-white transition-colors relative group'
            >
              Daedalus
              <span className='absolute -bottom-1 left-0 w-0 h-px bg-orange-500 transition-all group-hover:w-full' />
            </Link>
            <Link
              href='#protocol'
              className='hover:text-white transition-colors relative group'
            >
              Protocol
              <span className='absolute -bottom-1 left-0 w-0 h-px bg-orange-500 transition-all group-hover:w-full' />
            </Link>
            <Link
              href='/war-games'
              className='hover:text-white transition-colors relative group'
            >
              War Games
              <span className='absolute -bottom-1 left-0 w-0 h-px bg-orange-500 transition-all group-hover:w-full' />
            </Link>
            <div className='relative' ref={dropdownRef}>
              <button
                onClick={() => setDaedalusOpen(!daedalusOpen)}
                className='flex items-center gap-1 hover:text-white transition-colors'
              >
                <Radar className='w-3 h-3 text-orange-500' />
                <span>Recon</span>
                <ChevronRight
                  className={`w-3 h-3 transition-transform ${
                    daedalusOpen ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {daedalusOpen && (
                <div className='absolute top-full left-0 mt-2 w-64 rounded-lg border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden'>
                  <div className='px-4 py-3 border-b border-zinc-800/50'>
                    <span className='text-[10px] font-mono text-orange-500 uppercase tracking-widest'>
                      Reconnaissance Suite
                    </span>
                  </div>
                  <div className='py-2'>
                    <Link
                      href='/cortex'
                      onClick={() => setDaedalusOpen(false)}
                      className='flex items-center gap-3 px-4 py-3 hover:bg-orange-500/10 transition-colors group'
                    >
                      <div className='w-8 h-8 rounded border border-orange-500/30 flex items-center justify-center bg-zinc-900'>
                        <Layers className='w-4 h-4 text-orange-500' />
                      </div>
                      <div>
                        <div className='text-sm text-zinc-200 group-hover:text-white'>
                          Cortex Vault
                        </div>
                        <div className='text-[10px] text-zinc-500'>
                          Classified Dossier Library
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/enrich'
                      onClick={() => setDaedalusOpen(false)}
                      className='flex items-center gap-3 px-4 py-3 hover:bg-orange-500/10 transition-colors group'
                    >
                      <div className='w-8 h-8 rounded border border-orange-500/30 flex items-center justify-center bg-zinc-900'>
                        <FileSearch className='w-4 h-4 text-orange-500' />
                      </div>
                      <div>
                        <div className='text-sm text-zinc-200 group-hover:text-white'>
                          Research + Enrichment
                        </div>
                        <div className='text-[10px] text-zinc-500'>
                          Deep Company Intelligence
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/research'
                      onClick={() => setDaedalusOpen(false)}
                      className='flex items-center gap-3 px-4 py-3 hover:bg-orange-500/10 transition-colors group'
                    >
                      <div className='w-8 h-8 rounded border border-orange-500/30 flex items-center justify-center bg-zinc-900'>
                        <Brain className='w-4 h-4 text-orange-400' />
                      </div>
                      <div>
                        <div className='text-sm text-zinc-200 group-hover:text-white'>
                          Deep Intel
                        </div>
                        <div className='text-[10px] text-zinc-500'>
                          Intelligence Synthesis Missions
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/scouts'
                      onClick={() => setDaedalusOpen(false)}
                      className='flex items-center gap-3 px-4 py-3 hover:bg-orange-500/10 transition-colors group'
                    >
                      <div className='w-8 h-8 rounded border border-orange-500/30 flex items-center justify-center bg-zinc-900'>
                        <Shield className='w-4 h-4 text-orange-400' />
                      </div>
                      <div>
                        <div className='text-sm text-zinc-200 group-hover:text-white'>
                          Competitive Intel
                        </div>
                        <div className='text-[10px] text-zinc-500'>
                          Market Position Analysis
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/brand-recon'
                      onClick={() => setDaedalusOpen(false)}
                      className='flex items-center gap-3 px-4 py-3 hover:bg-orange-500/10 transition-colors group'
                    >
                      <div className='w-8 h-8 rounded border border-orange-500/30 flex items-center justify-center bg-zinc-900'>
                        <Swords className='w-4 h-4 text-orange-500' />
                      </div>
                      <div>
                        <div className='text-sm text-zinc-200 group-hover:text-white'>
                          Counter Ops
                        </div>
                        <div className='text-[10px] text-zinc-500'>
                          Brand Fracture & Ambush
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/observe'
                      onClick={() => setDaedalusOpen(false)}
                      className='flex items-center gap-3 px-4 py-3 hover:bg-orange-500/10 transition-colors group'
                    >
                      <div className='w-8 h-8 rounded border border-orange-500/30 flex items-center justify-center bg-zinc-900'>
                        <ScanEye className='w-4 h-4 text-orange-400' />
                      </div>
                      <div>
                        <div className='text-sm text-zinc-200 group-hover:text-white'>
                          Surveillance
                        </div>
                        <div className='text-[10px] text-zinc-500'>
                          Change Detection & Extraction
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className='px-4 py-3 border-t border-zinc-800/50 bg-zinc-900/30'>
                    <Link
                      href='#cortex'
                      onClick={() => setDaedalusOpen(false)}
                      className='flex items-center gap-2 text-[10px] font-mono text-zinc-500 hover:text-orange-500 transition-colors'
                    >
                      <Radio className='w-3 h-3' />
                      <span>View Full System Architecture →</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <AuthLinks />
            <Magnetic strength={0.15}>
              <Link
                href='/loadout'
                className='px-4 py-2 border border-orange-500/50 text-orange-500 text-sm hover:bg-orange-500 hover:text-white transition-all duration-300 btn-glow'
              >
                LOADOUT →
              </Link>
            </Magnetic>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className='relative min-h-screen flex items-center justify-center overflow-hidden'>
        {/* Dramatic Hero Burst - the main visual anchor */}
        <HeroBurst />

        {/* Floating Status HUD */}
        <FloatingStatus />

        {/* Floating orbs for depth */}
        <GlowingOrb size='lg' className='top-[15%] left-[5%]' pulseSpeed={5} />
        <GlowingOrb
          size='xl'
          className='bottom-[20%] right-[8%]'
          pulseSpeed={7}
        />
        <GlowingOrb
          size='md'
          color='cyan'
          className='top-[40%] right-[15%]'
          pulseSpeed={4}
        />

        {/* Parallax Decorative Elements */}
        <Parallax
          speed={0.3}
          direction='up'
          className='absolute top-20 left-10 text-orange-500/10 text-8xl font-bold select-none'
        >
          //
        </Parallax>
        <Parallax
          speed={0.5}
          direction='down'
          className='absolute bottom-32 right-20 text-orange-500/5 text-9xl font-bold select-none'
        >
          {'{ }'}
        </Parallax>
        <Parallax
          speed={0.2}
          direction='left'
          className='absolute top-1/3 right-10 text-zinc-800 text-6xl font-mono select-none'
        >
          01
        </Parallax>

        <div className='relative z-10 max-w-5xl mx-auto px-6 text-center pt-20'>
          {/* Logo Section with HUD */}
          <ScrollReveal y={30} duration={0.8}>
            <div className='mb-12'>
              <HUDCorners status='online' showTimestamp label='SYSTEM ACTIVE'>
                <div className='p-12'>
                  {/* Main Logo Text */}
                  <h1 className='text-4xl md:text-7xl font-black tracking-tighter'>
                    <span className='bg-gradient-to-r from-zinc-500 to-zinc-200 bg-clip-text text-transparent'>
                      DIGITAL
                    </span>{' '}
                    <HoloText className='text-orange-500' glitchInterval={4000}>
                      MISCHIEF
                    </HoloText>{' '}
                  </h1>
                </div>
              </HUDCorners>

              {/* Slogan */}
              <div className='flex items-center justify-center gap-4 mt-8'>
                <div className='h-px w-20 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent' />
                <span className='inline-flex items-center gap-2 text-sm text-zinc-500 italic tracking-wide'>
                  an ideas lab with matches
                  <Flame className='w-4 h-4 text-orange-500 animate-pulse' />
                </span>
                <div className='h-px w-20 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent' />
              </div>
            </div>
          </ScrollReveal>

          {/* Eyebrow with blinking cursor */}
          <div className='text-xs text-zinc-600 font-mono mb-6 glitch-hover cursor-default'>
            <span className='text-orange-500/60'>{'>'}</span>
            <span> PROTOCOL: CONTROLLED BURNS</span>
            <span className='animate-pulse text-orange-500'>_</span>
          </div>

          <h2 className='text-display-lg mb-10'>
            <span className='text-white'>
              <TypeWriter text='Your Data Is Cold.' speed={50} />
            </span>
            <br />
            <span className='text-orange-500 text-glow-orange'>
              <TypeWriter
                text='We Bring the Matches.'
                speed={50}
                delay={1000}
              />
            </span>
          </h2>

          <ScrollReveal y={20} delay={0.3}>
            <p className='text-body-xl text-zinc-400 max-w-3xl mx-auto mb-10'>
              Digital Mischief is a{' '}
              <span className='text-zinc-200 font-semibold'>
                systems skunkworks
              </span>
              . We turn messy AI experiments into governed, production-grade
              workflows—then ship them as repeatable tools.
            </p>
          </ScrollReveal>

          {/* Capabilities Strip - "receipts" */}
          <ScrollReveal y={10} delay={0.35}>
            <CapabilitiesStrip />
          </ScrollReveal>

          <ScrollReveal y={10} delay={0.4}>
            <HeroTicker />
          </ScrollReveal>

          <StaggerReveal
            stagger={0.1}
            className='flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap'
          >
            {/* Primary CTA - Revenue */}
            <Magnetic>
              <a
                href={STRIPE_PRO_LINK}
                target='_blank'
                rel='noopener noreferrer'
                className='group flex items-center gap-3 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all duration-300 btn-glow rounded-sm'
              >
                <Zap className='w-5 h-5' />
                <span>[ START OPERATOR — $30/mo ]</span>
                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </a>
            </Magnetic>
            {/* Secondary CTA - Demo */}
            <Link
              href='/enrich'
              className='group flex items-center gap-2 px-8 py-4 border border-zinc-700 text-zinc-300 hover:border-orange-500/50 hover:text-white transition-all duration-300 rounded-sm glass-panel'
            >
              <Radar className='w-4 h-4 text-orange-500' />
              <span>[ RUN LIVE DEMO ]</span>
              <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
            </Link>
            {/* Tertiary CTA - Audit */}
            <a
              href={CALENDLY_AUDIT_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-2 px-6 py-3 text-zinc-500 hover:text-orange-500 transition-colors text-sm'
            >
              <MessageSquare className='w-4 h-4' />
              <span>REQUEST SYSTEM AUDIT</span>
            </a>
          </StaggerReveal>
        </div>

        {/* Scroll Indicator */}
        <div className='absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600'>
          <span className='text-[10px] tracking-[0.3em] uppercase'>Scroll</span>
          <div className='w-px h-10 bg-gradient-to-b from-orange-500/50 to-transparent' />
        </div>
      </section>

      <CircuitDivider />

      {/* PROBLEM SECTION */}
      <section id='problem' className='relative py-32 overflow-hidden'>
        {/* Section glow accent */}
        <SectionGlow position='left' intensity='medium' />
        <div className='max-w-7xl mx-auto px-6 relative z-10'>
          <ScrollReveal>
            <div className='text-center max-w-4xl mx-auto'>
              <div className='inline-flex items-center gap-2 text-xs text-zinc-600 mb-6 glitch-hover cursor-default'>
                <span className='text-orange-500/60'>{'>'}</span>
                <span>// THE FRICTION</span>
              </div>

              <GlitchText>
                <h2 className='text-4xl md:text-6xl font-black mb-8'>
                  AI Everywhere.{' '}
                  <span className='text-orange-500'>Results Are Not.</span>
                </h2>
              </GlitchText>

              <p className='text-body-xl text-zinc-400 mb-16'>
                <span className='text-zinc-200 font-medium'>
                  Tribal knowledge
                </span>{' '}
                and{' '}
                <span className='text-zinc-200 font-medium'>data silos</span>{' '}
                are static.{' '}
                <span className='text-zinc-200 font-medium'>
                  Context switching
                </span>{' '}
                is a tax on focus, momentum, and execution.{' '}
                <span className='text-orange-500 font-semibold'>
                  It's fatal.
                </span>{' '}
                We build the infrastructure that eliminates the friction and
                forces your dormant data to go kinetic.
              </p>

              <StaggerReveal
                stagger={0.1}
                className='grid md:grid-cols-3 gap-6 mb-12'
              >
                {[
                  {
                    title: 'Data Silos',
                    body: 'You are locked out of your own intelligence.',
                  },
                  {
                    title: 'Zero Trust',
                    body: "You don't trust autonomous agents in production.",
                  },
                  {
                    title: 'Compliance Paralysis',
                    body: 'You are burning budget on pilots that never ship.',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className='p-8 border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm rounded-lg group hover:border-orange-500/30 transition-colors'
                  >
                    <X className='w-6 h-6 text-red-500/70 mb-5' />
                    <h3 className='text-xl font-bold text-zinc-200 mb-3'>
                      {item.title}
                    </h3>
                    <p className='text-base text-zinc-400 leading-relaxed'>
                      {item.body}
                    </p>
                  </div>
                ))}
              </StaggerReveal>

              <p className='text-body-xl text-zinc-300 font-semibold'>
                DMG exists to close that gap.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <CircuitDivider />

      {/* THE WARNING - Pattern Interrupt */}
      <section className='py-32 bg-black relative overflow-hidden'>
        {/* Red glow for danger/warning */}
        <div
          className='absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none'
          style={{
            background:
              'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Subtle vignette */}
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,black_70%)]' />

        <div className='max-w-xl mx-auto px-6 relative z-10'>
          <div className='font-mono text-left'>
            {/* Eyebrow */}
            <div className='text-[10px] text-red-500/70 tracking-widest mb-8 flex items-center gap-2'>
              <div className='w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse' />
              <span>// SYSTEM ALERT: OBSOLESCENCE IMMINENT</span>
            </div>

            {/* Headline */}
            <h2 className='text-3xl md:text-5xl font-black text-white mb-12 leading-tight'>
              The end is near.
              <br />
              <span className='text-zinc-500'>
                For some it's already too late.
              </span>
            </h2>

            {/* Body - Animated strikethrough list */}
            <div className='space-y-5 text-body-lg text-zinc-300 mb-12'>
              <StrikeOutReveal delay={0} duration={0.5}>
                <span className='opacity-90'>your competitors.</span>
              </StrikeOutReveal>
              <StrikeOutReveal delay={0.3} duration={0.5}>
                <span className='opacity-80'>your front-end guy.</span>
              </StrikeOutReveal>
              <StrikeOutReveal delay={0.6} duration={0.5}>
                <span className='opacity-70'>your content guy.</span>
              </StrikeOutReveal>
              <StrikeOutReveal delay={0.9} duration={0.5}>
                <span className='opacity-60'>your marketing guy.</span>
              </StrikeOutReveal>
            </div>

            <p className='text-body-lg text-zinc-500 mb-8'>
              The "Specialist Class" is dying. While they are booking meetings
              and waiting for approvals, we are deploying infrastructure that
              thinks.
            </p>

            <p className='text-body-lg text-orange-500 font-bold text-glow-orange'>
              Stop hiring "Guys." Start installing Sentience.
            </p>
          </div>
        </div>
      </section>

      <CircuitDivider />

      {/* SOLUTION / THE WEAPON SECTION */}
      <section id='cortex' className='relative py-32 overflow-hidden'>
        {/* Dramatic center glow for the weapon reveal */}
        <SectionGlow position='center' intensity='strong' />
        <GlowingOrb size='lg' className='top-[10%] right-[5%]' pulseSpeed={6} />
        <GlowingOrb
          size='md'
          color='cyan'
          className='bottom-[15%] left-[8%]'
          pulseSpeed={5}
        />

        {/* Governance visual - floating behind grid */}
        <div className='absolute bottom-0 right-0 opacity-40 pointer-events-none hidden lg:block'>
          <RoleBasedAccessControl size='lg' />
        </div>

        <div className='max-w-6xl mx-auto px-6 relative z-10'>
          <ScrollReveal>
            <div className='text-center max-w-4xl mx-auto mb-20'>
              <div className='inline-flex items-center gap-2 px-4 py-2 mb-8 border border-orange-500/30 bg-orange-500/5 rounded-full glitch-hover cursor-default'>
                <Radar className='w-4 h-4 text-orange-500 animate-pulse' />
                <span className='text-[10px] font-mono text-orange-500 uppercase tracking-widest'>
                  // THE WEAPON
                </span>
              </div>

              <GlitchText>
                <h2 className='text-4xl md:text-6xl font-black mb-6'>
                  Introducing <span className='text-orange-500'>Daedalus.</span>
                </h2>
              </GlitchText>

              <p className='text-heading-md text-zinc-300 font-semibold mb-6'>
                Your Personal Military-Industrial Complex.
              </p>

              <p className='text-body-xl text-zinc-500 max-w-3xl mx-auto'>
                A{' '}
                <span className='text-zinc-300 font-medium'>
                  Skunkworks-grade intelligence engine
                </span>{' '}
                that scrapes, maps, and enriches the world. It performs
                multi-dimensional reconnaissance across brand, market, persona,
                geography, and narrative structures.
              </p>
            </div>
          </ScrollReveal>

          {/* The System - 4 Core Components */}
          <StaggerReveal className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <IntelCard
              icon={Radar}
              title='Sentience'
              subtitle='Recon'
              description='Autonomous surveillance and threat detection. Always watching, always learning.'
              classification='classified'
            />
            <IntelCard
              icon={Layers}
              title='The Cortex'
              subtitle='Intelligence'
              description='Unified, permissions-aware data layer. RAG pipelines, vector stores, semantic search.'
              classification='secret'
            />
            <IntelCard
              icon={Zap}
              title='The Autopilot'
              subtitle='Action'
              description='Workflow agents that act on signals 24/7. No sleep, no breaks, no excuses.'
              classification='classified'
            >
              <div className='mt-4 text-sm font-mono font-bold text-red-500 tracking-wide'>
                {'>'} PERMISSION GRANTED: SHOOT TO KILL.
              </div>
            </IntelCard>
            <IntelCard
              icon={Shield}
              title='The Relay'
              subtitle='Governance'
              description='The safety switch that keeps you compliant. Guardrails that scale.'
              classification='restricted'
            />
          </StaggerReveal>

          {/* Daedalus CTA */}
          <ScrollReveal>
            <div className='mt-16 text-center'>
              <a
                href={STRIPE_PRO_LINK}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-3 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all duration-300 btn-glow rounded-sm'
              >
                <Zap className='w-5 h-5' />
                <span>[ UNLOCK DAEDALUS — $30/mo ]</span>
                <ArrowRight className='w-5 h-5' />
              </a>
              <p className='mt-4 text-sm text-zinc-500'>
                Full access to the arsenal. Cancel anytime.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <CircuitDivider />

      {/* PROCESS SECTION */}
      <section id='protocol' className='relative py-32 overflow-hidden'>
        <SectionGlow position='right' intensity='medium' />
        <div className='max-w-7xl mx-auto px-6 relative z-10'>
          <ScrollReveal>
            <div className='text-center mb-16'>
              <div className='inline-flex items-center gap-2 text-xs text-zinc-600 mb-6'>
                <span className='text-orange-500/60'>{'>'}</span>
                <span>// PROCESS</span>
              </div>
              <GlitchText>
                <h2 className='text-4xl md:text-6xl font-black mb-4'>
                  The DMG{' '}
                  <span className='text-orange-500'>Ignition Protocol</span>
                </h2>
              </GlitchText>
            </div>
          </ScrollReveal>

          <StaggerReveal
            stagger={0.08}
            className='grid md:grid-cols-5 gap-4 mb-12'
          >
            {[
              {
                num: '01',
                title: 'DIAGNOSTIC',
                desc: 'We map your architecture and friction points to identify the kill chain.',
              },
              {
                num: '02',
                title: 'ARCHITECTURE',
                desc: 'Design the system: data flows, agent workflows, and governance rails.',
              },
              {
                num: '03',
                title: 'FABRICATION',
                desc: 'Build the weapon. Deploy agents. Wire everything together.',
              },
              {
                num: '04',
                title: 'DEPLOYMENT',
                desc: 'Go live with real users. We monitor the blast radius.',
              },
              {
                num: '05',
                title: 'OVERWATCH',
                desc: 'Continuous ops retainer. We keep the system lethal.',
              },
            ].map((step, i) => (
              <div key={i} className='relative group'>
                <div className='p-6 border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm rounded-lg hover:border-orange-500/30 transition-all duration-300 h-full'>
                  {/* Number with glow on hover */}
                  <div className='text-4xl font-black text-orange-500 mb-4 transition-all duration-300 group-hover:text-glow-orange'>
                    {step.num}
                  </div>
                  <h3 className='text-base font-bold mb-3 text-zinc-200 tracking-wide'>
                    {step.title}
                  </h3>
                  <p className='text-base text-zinc-400 leading-relaxed'>
                    {step.desc}
                  </p>
                </div>
                {/* Connector line */}
                {i < 4 && (
                  <div className='hidden md:block absolute top-1/2 -right-2 w-4 h-px bg-gradient-to-r from-orange-500/30 to-transparent' />
                )}
              </div>
            ))}
          </StaggerReveal>

          <div className='text-center flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Magnetic>
              <Link
                href='/loadout'
                className='inline-flex items-center gap-3 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-colors btn-glow rounded-sm'
              >
                <Zap className='w-5 h-5' />
                [ ACTIVATE OPERATOR ]
                <ArrowRight className='w-5 h-5' />
              </Link>
            </Magnetic>
            <Link
              href='/brand-recon'
              className='inline-flex items-center gap-3 px-6 py-4 border border-zinc-700 text-zinc-300 hover:border-orange-500/50 hover:text-white transition-all rounded-sm'
            >
              <Radar className='w-4 h-4 text-orange-500' />[ RUN DEMO ]
            </Link>
          </div>
        </div>
      </section>

      <CircuitDivider />

      {/* THE UNIT / TEAM SECTION */}
      <section id='mission' className='py-32 relative overflow-hidden'>
        {/* Multi-cursor collaboration visual - positioned to the right, out of the way */}
        <div className='absolute top-1/4 right-0 opacity-20 pointer-events-none hidden lg:block translate-x-1/4'>
          <RealtimeCollaboration />
        </div>

        <div className='max-w-7xl mx-auto px-6 relative z-10'>
          <ScrollReveal>
            <div className='max-w-4xl mx-auto text-center'>
              <div className='inline-flex items-center gap-2 px-4 py-2 border border-orange-500/30 text-orange-500 text-xs mb-8 rounded-full glitch-hover cursor-default'>
                <Target className='w-4 h-4' />
                <span>// THE UNIT</span>
              </div>
              <GlitchText>
                <h2 className='text-4xl md:text-5xl font-black mb-8'>
                  You Have To Break It{' '}
                  <span className='text-orange-500'>To Understand It.</span>
                </h2>
              </GlitchText>
              <p className='text-body-xl text-zinc-400 mb-12'>
                Meet the team that breaks it.
              </p>
              <p className='text-body-lg text-zinc-500 italic max-w-2xl mx-auto'>
                We're an ideas lab with matches{' '}
                <Flame className='inline w-4 h-4 text-orange-500' /> — curious
                enough to blow it up, disciplined enough to put it back together
                again.
              </p>
            </div>
          </ScrollReveal>

          <MeetTheTeam />
        </div>
      </section>

      <CircuitDivider />

      {/* FOOTER CTA */}
      <section className='py-32 relative overflow-hidden'>
        {/* Background glow */}
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(249,115,22,0.05)_0%,transparent_60%)]' />

        <div className='max-w-4xl mx-auto px-6 text-center relative z-10'>
          <ScrollReveal>
            <GlitchText>
              <h2 className='text-4xl md:text-5xl font-black mb-8'>
                The end is near for the Specialist Class.
                <br />
                <span className='text-orange-500'>
                  Don't join them.{' '}
                  <Flame className='inline w-3 h-3 text-orange-500' /> Join us.
                </span>
              </h2>
            </GlitchText>

            <p className='text-body-lg text-zinc-500 italic max-w-2xl mx-auto mb-10'>
              If your business runs on 12 disconnected tools and tribal
              knowledge, you're already bleeding margin.
            </p>
            <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
              <Magnetic>
                <a
                  href={STRIPE_PRO_LINK}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-3 px-10 py-5 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all duration-300 btn-glow rounded-sm text-lg'
                >
                  <Zap className='w-6 h-6' />
                  <span>[ DEPLOY OPERATOR ]</span>
                  <ArrowRight className='w-6 h-6' />
                </a>
              </Magnetic>
              <button
                onClick={signupForm.open}
                className='inline-flex items-center gap-3 px-8 py-5 border border-zinc-700 text-zinc-300 hover:border-orange-500/50 hover:text-white transition-all rounded-sm text-lg cursor-pointer'
              >
                <MessageSquare className='w-5 h-5 text-orange-500' />
                <span>[ REQUEST AUDIT ]</span>
              </button>
            </div>
            <p className='text-[10px] text-zinc-600 mt-2 font-mono'>
              // Deliverable: Architecture Map + Friction Report in 48 hours
            </p>
            <div className='mt-16 text-xs text-zinc-700 font-mono glitch-hover cursor-default'>
              <p>
                [ DMG ] // Daedalus Systems // 2025 // An Ideas Lab with
                Matches.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className='py-12 border-t border-white/5'>
        <div className='max-w-7xl mx-auto px-6'>
          {/* Contact / Feedback Section */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-12'>
            <div>
              <h4 className='text-base font-bold text-zinc-300 mb-3 flex items-center gap-2'>
                <span className='text-orange-500'>{'>'}</span> Report a Bug
              </h4>
              <p className='text-sm text-zinc-500 mb-3 leading-relaxed'>
                Found something broken? Let us know.
              </p>
              <a
                href='mailto:liam@liamellis.dev?subject=DMG%20Bug%20Report'
                className='text-sm text-orange-500 hover:text-orange-400 transition-colors'
              >
                Email bug report →
              </a>
            </div>
            <div>
              <h4 className='text-base font-bold text-zinc-300 mb-3 flex items-center gap-2'>
                <span className='text-orange-500'>{'>'}</span> Suggestions
              </h4>
              <p className='text-sm text-zinc-500 mb-3 leading-relaxed'>
                Ideas for new features or improvements?
              </p>
              <a
                href='mailto:liam@liamellis.dev?subject=DMG%20Feature%20Suggestion'
                className='text-sm text-orange-500 hover:text-orange-400 transition-colors'
              >
                Send a suggestion →
              </a>
            </div>
            <div>
              <h4 className='text-base font-bold text-zinc-300 mb-3 flex items-center gap-2'>
                <span className='text-orange-500'>{'>'}</span> General Inquiries
              </h4>
              <p className='text-sm text-zinc-500 mb-3 leading-relaxed'>
                Questions, partnerships, or just want to chat?
              </p>
              <a
                href='mailto:liam@liamellis.dev?subject=DMG%20Inquiry'
                className='text-sm text-orange-500 hover:text-orange-400 transition-colors'
              >
                Contact us by email →
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className='pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600'>
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
        </div>
      </footer>

      {/* SignupForm modal */}
      <SignupForm isOpen={signupForm.isOpen} onClose={signupForm.close} />
    </div>
  )
}
