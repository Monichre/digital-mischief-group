"use client"

import Link from "next/link"
import { Flame, ArrowRight, ChevronRight, Target, X, Brain, Monitor, Bot, SlidersHorizontal } from "lucide-react"
import { SignupForm, useSignupForm } from "@/components/SignupForm"
import { MeetTheTeam } from "@/components/MeetTheTeam"
import {
  ScrollReveal,
  StaggerReveal,
  Parallax,
  GlitchText,
  ScaleReveal,
  Magnetic,
} from "@/components/scroll-animations"

export default function Home() {
  const signupForm = useSignupForm()

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-orange-500 selection:text-white font-mono">
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full border-b border-white/10 bg-zinc-950/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 animate-pulse rounded-full" />
            <span className="font-mono font-bold tracking-tighter text-lg">[ DMG ]</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <Link href="#cortex" className="hover:text-white transition-colors">
              Revenue Cortex
            </Link>
            <Link href="#protocol" className="hover:text-white transition-colors">
              Protocol
            </Link>
            <Link href="#cases" className="hover:text-white transition-colors">
              Burn Logs
            </Link>
            <Link href="#mission" className="hover:text-white transition-colors">
              Mission
            </Link>
            <Link href="/arsenal" className="hover:text-white transition-colors">
              Arsenal
            </Link>
            <Link href="/enrich" className="hover:text-white transition-colors">
              Enrich
            </Link>
            <Link href="/brand-recon" className="hover:text-white transition-colors">
              Brand Recon
            </Link>
            <Link href="/scouts" className="hover:text-white transition-colors">
              Sentinels
            </Link>
            <Link href="/observe" className="hover:text-white transition-colors">
              Recon
            </Link>
          </div>
          <button
            onClick={signupForm.open}
            className="px-4 py-2 border border-orange-500/50 text-orange-500 text-sm hover:bg-orange-500 hover:text-white transition-all duration-300"
          >
            Deploy →
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

        {/* Radial Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08)_0%,transparent_70%)]" />

        {/* Parallax Decorative Elements */}
        <Parallax speed={0.3} direction="up" className="absolute top-20 left-10 text-orange-500/20 text-6xl font-bold">
          //
        </Parallax>
        <Parallax
          speed={0.5}
          direction="down"
          className="absolute bottom-32 right-20 text-orange-500/10 text-8xl font-bold"
        >
          {"{ }"}
        </Parallax>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
          {/* Logo Section */}
          <ScrollReveal y={30} duration={0.8}>
            <div className="mb-8">
              {/* Corner Accents */}
              <div className="relative inline-block p-8">
                <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-orange-500/50" />
                <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-orange-500/50" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-orange-500/50" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-orange-500/50" />

                {/* Main Logo Text */}
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
                  <span className="bg-gradient-to-r from-zinc-400 to-zinc-200 bg-clip-text text-transparent">
                    DIGITAL
                  </span>{" "}
                  <span className="text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.5)]">MISCHIEF</span>{" "}
                  <span className="text-zinc-400 tracking-[0.2em]">GROUP</span>
                </h1>
              </div>

              {/* Slogan */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="h-px w-16 bg-gradient-to-r from-orange-500 to-transparent" />
                <span className="inline-flex items-center gap-2 text-sm text-zinc-500 italic tracking-wide">
                  an ideas lab with matches
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                </span>
                <div className="h-px w-16 bg-gradient-to-l from-orange-500 to-transparent" />
              </div>
            </div>
          </ScrollReveal>

          <GlitchText>
            <h2 className="text-5xl md:text-7xl font-black mb-6 leading-[0.9]">
              <span className="text-white">Your Data Is Cold.</span>
              <br />
              <span className="text-orange-500">We Bring the Matches.</span>
            </h2>
          </GlitchText>

          <ScrollReveal y={20} delay={0.3}>
            <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Digital Mischief is a <span className="text-zinc-200">Systems Engineering Skunkworks</span>. We test
              volatile AI agents in the lab—breaking them so you don't have to—then deploy the governed, bulletproof
              version into your business.
            </p>
          </ScrollReveal>

          <StaggerReveal stagger={0.1} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Magnetic>
              <button
                onClick={signupForm.open}
                className="group flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all duration-300"
              >
                <Flame className="w-4 h-4" />
                <span>INITIALIZE SYSTEM AUDIT</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Magnetic>
            <Link
              href="#cases"
              className="flex items-center gap-2 px-8 py-4 border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-all duration-300"
            >
              <span>ACCESS BURN LOGS</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </StaggerReveal>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600">
          <span className="text-xs tracking-widest">SCROLL</span>
          <div className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent animate-pulse" />
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section id="problem" className="relative py-32 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 text-xs text-zinc-500 mb-6">
                <span>// THE PROBLEM</span>
              </div>

              <GlitchText>
                <h2 className="text-4xl md:text-6xl font-black mb-8">
                  AI Everywhere. <span className="text-orange-500">Nowhere You Need It.</span>
                </h2>
              </GlitchText>

              <p className="text-lg text-zinc-400 leading-relaxed mb-16">
                <span className="text-zinc-200">Tribal knowledge</span> and{" "}
                <span className="text-zinc-200">data silos</span> are static.{" "}
                <span className="text-zinc-200">Context switching</span> is a tax on focus, momentum, and execution.{" "}
                <span className="text-orange-500">It's fatal.</span> We build the infrastructure that eliminates the
                friction and forces your dormant data to go kinetic.
              </p>

              <StaggerReveal stagger={0.1} className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                  { title: "Data Silos are locking you out." },
                  { title: "Zero trust in autonomous output." },
                  { title: "Compliance risk is paralyzing you." },
                ].map((item, i) => (
                  <div key={i} className="p-6 border border-zinc-800 bg-zinc-900/30">
                    <X className="w-4 h-4 text-orange-500 mb-4" />
                    <p className="text-sm text-zinc-500">{item.title}</p>
                  </div>
                ))}
              </StaggerReveal>

              <p className="text-lg text-zinc-300 font-medium">DMG exists to close that gap.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SOLUTION / CORTEX SECTION */}
      <section id="cortex" className="relative py-32 border-t border-white/5 bg-zinc-900/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 text-xs text-zinc-500 mb-6">
                <span>// THE SOLUTION</span>
              </div>

              <GlitchText>
                <h2 className="text-4xl md:text-6xl font-black mb-8">
                  The Revenue Cortex: <span className="text-orange-500">Your AI Nervous System</span>
                </h2>
              </GlitchText>

              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                We don't sell isolated features. We install a system.
              </p>
            </div>
          </ScrollReveal>

          <StaggerReveal stagger={0.1} className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: <Brain className="w-6 h-6" />,
                title: "The Cortex",
                desc: "Unified, permissions-aware data intelligence layer.",
                tag: "Data Intelligence",
                tagIcon: <Brain className="w-3 h-3" />,
              },
              {
                icon: <Monitor className="w-6 h-6" />,
                title: "The Interface",
                desc: "Role-specific copilots and command centers.",
                tag: "Adoption Layer",
                tagIcon: <Monitor className="w-3 h-3" />,
              },
              {
                icon: <Bot className="w-6 h-6" />,
                title: "The Autopilot",
                desc: "Agents that act on signals, not just display them.",
                tag: "Workflow Agents",
                tagIcon: <Bot className="w-3 h-3" />,
              },
              {
                icon: <SlidersHorizontal className="w-6 h-6" />,
                title: "The Relay",
                desc: "Enablement and governance so it all sticks.",
                tag: "Governance",
                tagIcon: <SlidersHorizontal className="w-3 h-3" />,
              },
            ].map((item, i) => (
              <ScaleReveal key={i}>
                <div className="group p-6 border border-zinc-800 bg-zinc-900/50 hover:border-orange-500/50 transition-all duration-300 h-full">
                  <div className="w-12 h-12 border border-zinc-700 flex items-center justify-center mb-6 text-zinc-400 group-hover:border-orange-500/50 group-hover:text-orange-500 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-500 mb-4">{item.desc}</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    {item.tagIcon}
                    <span>{item.tag}</span>
                  </div>
                </div>
              </ScaleReveal>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* PROCESS SECTION */}
      <section id="protocol" className="relative py-32 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-xs text-zinc-500 mb-6">
                <span>// PROCESS</span>
              </div>
              <GlitchText>
                <h2 className="text-4xl md:text-6xl font-black mb-4">
                  The DMG <span className="text-orange-500">Ignition Protocol</span>
                </h2>
              </GlitchText>
            </div>
          </ScrollReveal>

          <StaggerReveal stagger={0.08} className="grid md:grid-cols-5 gap-4 mb-12">
            {[
              { num: "01", title: "DIAGNOSTIC", desc: "System Architecture Audit to map your current state" },
              { num: "02", title: "ARCHITECTURE", desc: "Cortex architecture, workflows, guardrails" },
              { num: "03", title: "FABRICATION", desc: "Implement Cortex, Interface, and Autopilot v1" },
              { num: "04", title: "DEPLOYMENT", desc: "Deploy to real users, monitor everything" },
              { num: "05", title: "OVERWATCH", desc: "Cortex Ops retainer for continuous improvements" },
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="p-6 border border-zinc-800 bg-zinc-900/30 hover:border-orange-500/30 transition-all duration-300 h-full">
                  <div className="text-3xl font-black text-orange-500 mb-4">{step.num}</div>
                  <h3 className="text-sm font-bold mb-2 text-zinc-200">{step.title}</h3>
                  <p className="text-xs text-zinc-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </StaggerReveal>

          <div className="text-center">
            <Magnetic>
              <button
                onClick={signupForm.open}
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all duration-300"
              >
                START WITH A DIAGNOSTIC
                <ArrowRight className="w-4 h-4" />
              </button>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* CASE STUDIES / BURN LOGS */}
      <section id="cases" className="py-32 border-t border-white/5 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-orange-500/30 text-orange-500 text-xs mb-6">
                <Flame className="w-3 h-3" />
                <span>BURN_LOGS</span>
              </div>
              <GlitchText>
                <h2 className="text-4xl md:text-6xl font-black mb-4">
                  Controlled <span className="text-orange-500">Burns</span>
                </h2>
              </GlitchText>
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                Real results from real deployments. No vanity metrics.
              </p>
            </div>
          </ScrollReveal>

          <StaggerReveal stagger={0.15} className="grid md:grid-cols-2 gap-8">
            {[
              {
                client: "Series B SaaS",
                metric: "340%",
                label: "Pipeline Increase",
                desc: "Automated lead scoring and outreach sequencing across 12 data sources.",
              },
              {
                client: "Enterprise FinTech",
                metric: "67%",
                label: "Faster Deal Cycles",
                desc: "AI-powered buying committee mapping and engagement tracking.",
              },
            ].map((study, i) => (
              <ScaleReveal key={i}>
                <div className="p-8 border border-zinc-800 bg-zinc-950 hover:border-orange-500/30 transition-all duration-300">
                  <div className="text-xs text-zinc-600 mb-4 font-mono">{study.client}</div>
                  <div className="text-6xl font-black text-orange-500 mb-2">{study.metric}</div>
                  <div className="text-lg font-bold mb-4">{study.label}</div>
                  <p className="text-zinc-400">{study.desc}</p>
                </div>
              </ScaleReveal>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ABOUT / MISSION SECTION */}
      <section id="mission" className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-orange-500/30 text-orange-500 text-xs mb-6">
                <Target className="w-3 h-3" />
                <span>MISSION_BRIEF</span>
              </div>
              <GlitchText>
                <h2 className="text-4xl md:text-5xl font-black mb-8">
                  Built by operators, <span className="text-orange-500">for operators</span>
                </h2>
              </GlitchText>
              <p className="text-xl text-zinc-400 leading-relaxed mb-12">
                We're not consultants. We're engineers who've built and scaled revenue systems at high-growth companies.
                We know what works because we've deployed it ourselves.
              </p>
            </div>
          </ScrollReveal>

          <MeetTheTeam />
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-32 border-t border-white/5 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal>
            <GlitchText>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Stop playing in the sandbox.
                <br />
                <span className="text-orange-500">Move to production.</span>
              </h2>
            </GlitchText>
            <p className="text-zinc-400 text-lg mb-10">
              Start with a System Architecture Audit and we'll map your Cortex.
            </p>
            <Magnetic>
              <button
                onClick={signupForm.open}
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all duration-300"
              >
                <Flame className="w-4 h-4" />
                <span>INITIALIZE SYSTEM AUDIT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Magnetic>
            <div className="mt-8 text-xs text-zinc-600 font-mono">
              <p>Liam Ellis — Founding Partner, Digital Mischief Group</p>
              <p className="text-orange-500/70">liam@digitalmischief.group</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span>© 2025 Digital Mischief Group</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Systems Online</span>
            <span className="text-orange-500">●</span>
            <span>All Systems Nominal</span>
          </div>
        </div>
      </footer>

      {/* SignupForm modal */}
      <SignupForm isOpen={signupForm.isOpen} onClose={signupForm.close} />
    </div>
  )
}
