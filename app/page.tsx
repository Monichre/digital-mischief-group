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
  Telescope,
} from 'lucide-react'
import {SignupForm, useSignupForm} from '@/components/SignupForm'
import {MeetTheTeam} from '@/components/MeetTheTeam'
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
import {useState, useRef, useEffect} from 'react'

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
      {/* Background Dot Pattern */}
      <div className='fixed inset-0 z-0'>
        <DotPattern
          width={24}
          height={24}
          cr={1}
          className='text-orange-500/20'
        />
      </div>

      {/* NAVIGATION */}
      <nav className='fixed top-0 w-full border-b border-white/10 bg-zinc-950/80 backdrop-blur-md z-50'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-orange-500 animate-pulse rounded-full' />
            <span className='font-mono font-bold tracking-tighter text-lg'>
              [ DMG ]
            </span>
          </div>
          <div className='hidden md:flex items-center gap-8 text-sm text-zinc-400'>
            <Link href='#cortex' className='hover:text-white transition-colors'>
              Daedalus
            </Link>
            <Link
              href='#protocol'
              className='hover:text-white transition-colors'
            >
              Protocol
            </Link>
            <Link
              href='#mission'
              className='hover:text-white transition-colors'
            >
              The Unit
            </Link>
            <Link
              href='/arsenal'
              className='hover:text-white transition-colors'
            >
              Arsenal
            </Link>
            <div className='relative' ref={dropdownRef}>
              <button
                onClick={() => setDaedalusOpen(!daedalusOpen)}
                className='flex items-center gap-1 hover:text-white transition-colors'
              >
                <Radar className='w-3 h-3 text-orange-500' />
                <span>Daedalus</span>
                <ChevronRight
                  className={`w-3 h-3 transition-transform ${
                    daedalusOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {daedalusOpen && (
                <div className='absolute top-full left-0 mt-2 w-56 rounded-lg border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden'>
                  <div className='px-3 py-2 border-b border-zinc-800'>
                    <span className='text-[10px] font-mono text-orange-500 uppercase tracking-widest'>
                      Reconnaissance Suite
                    </span>
                  </div>
                  <div className='py-1'>
                    <Link
                      href='/enrich'
                      onClick={() => setDaedalusOpen(false)}
                      className='flex items-center gap-3 px-3 py-2 hover:bg-orange-500/10 transition-colors group'
                    >
                      <FileSearch className='w-4 h-4 text-orange-500' />
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
                      className='flex items-center gap-3 px-3 py-2 hover:bg-orange-500/10 transition-colors group'
                    >
                      <Telescope className='w-4 h-4 text-orange-400' />
                      <div>
                        <div className='text-sm text-zinc-200 group-hover:text-white'>
                          Open-Researcher
                        </div>
                        <div className='text-[10px] text-zinc-500'>
                          Autonomous Research Missions
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/scouts'
                      onClick={() => setDaedalusOpen(false)}
                      className='flex items-center gap-3 px-3 py-2 hover:bg-orange-500/10 transition-colors group'
                    >
                      <Shield className='w-4 h-4 text-orange-400' />
                      <div>
                        <div className='text-sm text-zinc-200 group-hover:text-white'>
                          Intel & Competitive Threat Detection
                        </div>
                        <div className='text-[10px] text-zinc-500'>
                          Market Position Analysis
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/brand-recon'
                      onClick={() => setDaedalusOpen(false)}
                      className='flex items-center gap-3 px-3 py-2 hover:bg-orange-500/10 transition-colors group'
                    >
                      <Swords className='w-4 h-4 text-orange-500' />
                      <div>
                        <div className='text-sm text-zinc-200 group-hover:text-white'>
                          Counter Ops
                        </div>
                        <div className='text-[10px] text-zinc-500'>
                          Brand Fracture & Ambush Targeting
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='/observe'
                      onClick={() => setDaedalusOpen(false)}
                      className='flex items-center gap-3 px-3 py-2 hover:bg-orange-500/10 transition-colors group'
                    >
                      <ScanEye className='w-4 h-4 text-orange-400' />
                      <div>
                        <div className='text-sm text-zinc-200 group-hover:text-white'>
                          Surveillance + Extraction
                        </div>
                        <div className='text-[10px] text-zinc-500'>
                          Change Detection & Data Harvesting
                        </div>
                      </div>
                    </Link>
                    <Link
                      href='#daedalus'
                      onClick={() => setDaedalusOpen(false)}
                      className='flex items-center gap-3 px-3 py-2 hover:bg-orange-500/10 transition-colors group'
                    >
                      <Radio className='w-4 h-4 text-orange-500' />
                      <div>
                        <div className='text-sm text-zinc-200 group-hover:text-white'>
                          Recon & Sentinel Suite
                        </div>
                        <div className='text-[10px] text-zinc-500'>
                          Autonomous Watch Protocols
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className='px-3 py-2 border-t border-zinc-800 bg-zinc-900/50'>
                    <Link
                      href='#daedalus'
                      onClick={() => setDaedalusOpen(false)}
                      className='flex items-center gap-2 text-[10px] font-mono text-zinc-500 hover:text-orange-500 transition-colors'
                    >
                      <span>View Full System →</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={signupForm.open}
            className='px-4 py-2 border border-orange-500/50 text-orange-500 text-sm hover:bg-orange-500 hover:text-white transition-all duration-300'
          >
            Deploy →
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className='relative min-h-screen flex items-center justify-center overflow-hidden'>
        {/* Background Grid */}
        <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]' />

        {/* Radial Gradient */}
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08)_0%,transparent_70%)]' />

        {/* Parallax Decorative Elements */}
        <Parallax
          speed={0.3}
          direction='up'
          className='absolute top-20 left-10 text-orange-500/20 text-6xl font-bold'
        >
          //
        </Parallax>
        <Parallax
          speed={0.5}
          direction='down'
          className='absolute bottom-32 right-20 text-orange-500/10 text-8xl font-bold'
        >
          {'{ }'}
        </Parallax>

        <div className='relative z-10 max-w-5xl mx-auto px-6 text-center pt-20'>
          {/* Logo Section */}
          <ScrollReveal y={30} duration={0.8}>
            <div className='mb-8'>
              {/* Corner Accents */}
              <div className='relative inline-block p-8'>
                <div className='absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-orange-500/50' />
                <div className='absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-orange-500/50' />
                <div className='absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-orange-500/50' />
                <div className='absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-orange-500/50' />

                {/* Main Logo Text */}
                <h1 className='text-4xl md:text-6xl font-black tracking-tighter'>
                  <span className='bg-gradient-to-r from-zinc-400 to-zinc-200 bg-clip-text text-transparent'>
                    DIGITAL
                  </span>{' '}
                  <span className='text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.5)]'>
                    MISCHIEF
                  </span>{' '}
                  <span className='text-zinc-400 tracking-[0.2em]'>GROUP</span>
                </h1>
              </div>

              {/* Slogan */}
              <div className='flex items-center justify-center gap-4 mt-4'>
                <div className='h-px w-16 bg-gradient-to-r from-orange-500 to-transparent' />
                <span className='inline-flex items-center gap-2 text-sm text-zinc-500 italic tracking-wide'>
                  an ideas lab with matches
                  <Flame className='w-4 h-4 text-orange-500 animate-pulse' />
                </span>
                <div className='h-px w-16 bg-gradient-to-l from-orange-500 to-transparent' />
              </div>
            </div>
          </ScrollReveal>

          {/* Eyebrow with blinking cursor */}
          <div className='text-xs text-zinc-500 font-mono mb-4 glitch-hover cursor-default'>
            <span>// PROTOCOL: CONTROLLED BURNS</span>
            <span className='animate-pulse'>_</span>
          </div>

          <h2 className='text-5xl md:text-7xl font-black mb-6 leading-[0.9]'>
            <span className='text-white'>
              <TypeWriter text='Your Data Is Cold.' speed={50} />
            </span>
            <br />
            <span className='text-orange-500'>
              <TypeWriter text='We Bring the Matches.' speed={50} delay={1000} />
            </span>
          </h2>

          <ScrollReveal y={20} delay={0.3}>
            <p className='text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed'>
              Digital Mischief is a{' '}
              <span className='text-zinc-200'>
                Systems Engineering Skunkworks
              </span>
              . We test volatile AI agents in the lab—breaking them so you don't
              have to—then deploy the governed, bulletproof version into your
              business.
            </p>
          </ScrollReveal>

          <StaggerReveal
            stagger={0.1}
            className='flex flex-col sm:flex-row items-center justify-center gap-4'
          >
            <Magnetic>
              <button
                onClick={signupForm.open}
                className='group flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all duration-300 btn-glitch'
              >
                <Flame className='w-4 h-4' />
                <span>[ INITIALIZE SYSTEM AUDIT ]</span>
                <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
              </button>
            </Magnetic>
            <Link
              href='#cortex'
              className='flex items-center gap-2 px-8 py-4 border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-all duration-300 btn-glitch'
            >
              <span>[ VIEW THE WEAPON ]</span>
              <ChevronRight className='w-4 h-4' />
            </Link>
          </StaggerReveal>
        </div>

        {/* Scroll Indicator */}
        <div className='absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600'>
          <span className='text-xs tracking-widest'>SCROLL</span>
          <div className='w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent animate-pulse' />
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section
        id='problem'
        className='relative py-32 border-t border-white/5 overflow-hidden'
      >
        <div className='max-w-7xl mx-auto px-6 relative z-10'>
          <ScrollReveal>
            <div className='text-center max-w-4xl mx-auto'>
              <div className='inline-flex items-center gap-2 text-xs text-zinc-500 mb-6 glitch-hover cursor-default'>
                <span>// THE FRICTION</span>
              </div>

              <GlitchText>
                <h2 className='text-4xl md:text-6xl font-black mb-8'>
                  AI Everywhere.{' '}
                  <span className='text-orange-500'>Nowhere It Counts.</span>
                </h2>
              </GlitchText>

              <p className='text-lg text-zinc-400 leading-relaxed mb-16'>
                <span className='text-zinc-200'>Tribal knowledge</span> and{' '}
                <span className='text-zinc-200'>data silos</span> are static.{' '}
                <span className='text-zinc-200'>Context switching</span> is a
                tax on focus, momentum, and execution.{' '}
                <span className='text-orange-500'>It's fatal.</span> We build
                the infrastructure that eliminates the friction and forces your
                dormant data to go kinetic.
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
                    className='p-6 border border-zinc-800 bg-zinc-900/30'
                  >
                    <X className='w-4 h-4 text-orange-500 mb-4' />
                    <h3 className='text-sm font-bold text-zinc-200 mb-2'>
                      {item.title}
                    </h3>
                    <p className='text-xs text-zinc-500'>{item.body}</p>
                  </div>
                ))}
              </StaggerReveal>

              <p className='text-lg text-zinc-300 font-medium'>
                DMG exists to close that gap.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* THE WARNING - Pattern Interrupt */}
      <section className='py-32 bg-black'>
        <div className='max-w-xl mx-auto px-6'>
          <div className='font-mono text-left'>
            {/* Eyebrow */}
            <div className='text-[10px] text-orange-500/70 tracking-widest mb-8 glitch-hover cursor-default'>
              // SYSTEM ALERT: OBSOLESCENCE IMMINENT
            </div>

            {/* Headline */}
            <h2 className='text-3xl md:text-5xl font-black text-white mb-12 leading-tight'>
              The end is near.
              <br />
              <span className='text-zinc-400'>For some more than others.</span>
            </h2>

            {/* Body */}
            <div className='space-y-1 text-lg md:text-xl text-zinc-300 mb-12'>
              <p>For your competitors.</p>
              <p>For your front-end guy.</p>
              <p>For your content guy.</p>
              <p>For your marketing guy.</p>
            </div>

            <p className='text-zinc-500 text-base leading-relaxed mb-8'>
              The "Specialist Class" is dying. While they are booking meetings
              and waiting for approvals, we are deploying infrastructure that
              thinks.
            </p>

            <p className='text-orange-500 font-bold text-lg'>
              Stop hiring "Guys." Start installing Sentience.
            </p>
          </div>
        </div>
      </section>

      {/* SOLUTION / THE WEAPON SECTION */}
      <section
        id='cortex'
        className='relative py-32 border-t border-white/5 bg-zinc-900/30 overflow-hidden'
      >
        <div className='max-w-6xl mx-auto px-6 relative z-10'>
          <ScrollReveal>
            <div className='text-center max-w-4xl mx-auto mb-16'>
              <div className='inline-flex items-center gap-2 px-3 py-1 mb-6 border border-orange-500/30 bg-orange-500/5 glitch-hover cursor-default'>
                <Radar className='w-3 h-3 text-orange-500 animate-pulse' />
                <span className='text-[10px] font-mono text-orange-500 uppercase tracking-widest'>
                  // THE WEAPON
                </span>
              </div>

              <GlitchText>
                <h2 className='text-4xl md:text-6xl font-black mb-4'>
                  Introducing Daedalus.{' '}
                  <span className='text-orange-500'>
                    Your Personal Military-Industrial Complex.
                  </span>
                </h2>
              </GlitchText>

              <p className='text-xl text-zinc-400 max-w-2xl mx-auto mb-4'>
                We don't sell tools. We install a system.
              </p>

              <p className='text-lg text-zinc-500 max-w-3xl mx-auto leading-relaxed'>
                A <span className='text-zinc-200'>Skunkworks-grade intelligence engine</span> that 
                scrapes, maps, and enriches the world. It performs multi-dimensional reconnaissance 
                across brand, market, persona, geography, and narrative structures.
              </p>
            </div>
          </ScrollReveal>

          {/* The System - 4 Core Components */}
          <StaggerReveal className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-16'>
            {[
              {
                icon: Radar,
                title: 'Sentience',
                subtitle: 'Recon',
                desc: 'Autonomous surveillance and threat detection. Always watching, always learning.',
              },
              {
                icon: Layers,
                title: 'The Cortex',
                subtitle: 'Intelligence',
                desc: 'Unified, permissions-aware data layer. RAG pipelines, vector stores, semantic search.',
              },
              {
                icon: Zap,
                title: 'The Autopilot',
                subtitle: 'Action',
                desc: 'Workflow agents that act on signals 24/7. No sleep, no breaks, no excuses.',
              },
              {
                icon: Shield,
                title: 'The Relay',
                subtitle: 'Governance',
                desc: 'The safety switch that keeps you compliant. Guardrails that scale.',
              },
            ].map((item, i) => (
              <ScaleReveal key={i}>
                <div className='group relative p-8 border border-zinc-800 bg-zinc-900/30 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-300'>
                  {/* Corner accents */}
                  <div className='absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-orange-500/50' />
                  <div className='absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-orange-500/50' />
                  <div className='absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-orange-500/50' />
                  <div className='absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-orange-500/50' />

                  <div className='flex items-start gap-4'>
                    <div className='w-12 h-12 border border-zinc-700 flex items-center justify-center bg-zinc-950'>
                      <item.icon className='w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform' />
                    </div>
                    <div className='flex-1'>
                      <div className='text-[10px] text-orange-500/70 font-mono uppercase tracking-widest mb-1'>
                        {item.subtitle}
                      </div>
                      <h3 className='text-xl font-bold text-zinc-200 mb-2'>
                        {item.title}
                      </h3>
                      <p className='text-sm text-zinc-500'>{item.desc}</p>
                    </div>
                  </div>
                </div>
              </ScaleReveal>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section
        id='protocol'
        className='relative py-32 border-t border-white/5 overflow-hidden'
      >
        <div className='max-w-7xl mx-auto px-6 relative z-10'>
          <ScrollReveal>
            <div className='text-center mb-16'>
              <div className='inline-flex items-center gap-2 text-xs text-zinc-500 mb-6'>
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
                <div className='p-6 border border-zinc-800 bg-zinc-900/30 hover:border-orange-500/30 transition-all duration-300 h-full'>
                  <div className='text-3xl font-black text-orange-500 mb-4'>
                    {step.num}
                  </div>
                  <h3 className='text-sm font-bold mb-2 text-zinc-200'>
                    {step.title}
                  </h3>
                  <p className='text-xs text-zinc-500'>{step.desc}</p>
                </div>
              </div>
            ))}
          </StaggerReveal>

          <div className='text-center'>
            <Magnetic>
              <button
                onClick={signupForm.open}
                className='inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors btn-glitch'
              >
                <Flame className='w-4 h-4' />
                [ START WITH A DIAGNOSTIC ]
                <ArrowRight className='w-4 h-4' />
              </button>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* THE UNIT / TEAM SECTION */}
      <section id='mission' className='py-32 border-t border-white/5'>
        <div className='max-w-7xl mx-auto px-6'>
          <ScrollReveal>
            <div className='max-w-4xl mx-auto text-center'>
              <div className='inline-flex items-center gap-2 px-3 py-1 border border-orange-500/30 text-orange-500 text-xs mb-6 glitch-hover cursor-default'>
                <Target className='w-3 h-3' />
                <span>// THE UNIT</span>
              </div>
              <GlitchText>
                <h2 className='text-4xl md:text-5xl font-black mb-8'>
                  You Have To Break It{' '}
                  <span className='text-orange-500'>To Understand It.</span>
                </h2>
              </GlitchText>
              <p className='text-xl text-zinc-400 leading-relaxed mb-12'>
                Meet the team that breaks it.
              </p>
            </div>
          </ScrollReveal>

          <MeetTheTeam />
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className='py-32 border-t border-white/5 bg-zinc-900/50'>
        <div className='max-w-4xl mx-auto px-6 text-center'>
          <ScrollReveal>
            <GlitchText>
              <h2 className='text-4xl md:text-5xl font-black mb-6'>
                The end is near for the Specialist Class.
                <br />
                <span className='text-orange-500'>Don't join them.</span>
              </h2>
            </GlitchText>
            <Magnetic>
              <button
                onClick={signupForm.open}
                className='inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all duration-300 btn-glitch'
              >
                <Flame className='w-4 h-4' />
                <span>[ INITIALIZE SYSTEM AUDIT ]</span>
                <ArrowRight className='w-4 h-4' />
              </button>
            </Magnetic>
            <div className='mt-12 text-xs text-zinc-600 font-mono glitch-hover cursor-default'>
              <p>[ DMG ] // Daedalus Systems // 2025 // An Ideas Lab with Matches.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className='py-8 border-t border-white/5'>
        <div className='max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600'>
          <div className='flex items-center gap-2'>
            <div className='w-2 h-2 bg-orange-500 rounded-full' />
            <span>© 2025 Digital Mischief Group</span>
          </div>
          <div className='flex items-center gap-6'>
            <span>Systems Online</span>
            <span className='text-orange-500'>●</span>
            <span>All Systems Nominal</span>
          </div>
        </div>
      </footer>

      {/* SignupForm modal */}
      <SignupForm isOpen={signupForm.isOpen} onClose={signupForm.close} />
    </div>
  )
}
