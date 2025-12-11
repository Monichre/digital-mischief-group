"use client"

import Link from "next/link"
import {
  Flame,
  ArrowRight,
  ChevronRight,
  Target,
  X,
  Brain,
  Monitor,
  Bot,
  SlidersHorizontal,
  Radar,
  Crosshair,
  Zap,
  Eye,
  Users,
  Globe,
  Activity,
  Layers,
  AlertTriangle,
  TrendingUp,
  Search,
  FileSearch,
  Shield,
  Swords,
  ScanEye,
  Radio,
} from "lucide-react"
import { SignupForm, useSignupForm } from "@/components/SignupForm"
import { MeetTheTeam } from "@/components/MeetTheTeam"
import { CardSwap, Card } from "@/components/CardSwap"
import {
  ScrollReveal,
  StaggerReveal,
  Parallax,
  GlitchText,
  ScaleReveal,
  Magnetic,
} from "@/components/scroll-animations"
import { useState, useRef, useEffect } from "react"

export default function Home() {
  const signupForm = useSignupForm()
  const [daedalusOpen, setDaedalusOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDaedalusOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDaedalusOpen(!daedalusOpen)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <Radar className="w-3 h-3 text-orange-500" />
                <span>Daedalus</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${daedalusOpen ? "rotate-180" : ""}`} />
              </button>
              {daedalusOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 rounded-lg border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest">
                      Reconnaissance Suite
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/enrich"
                      onClick={() => setDaedalusOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-orange-500/10 transition-colors group"
                    >
                      <FileSearch className="w-4 h-4 text-orange-500" />
                      <div>
                        <div className="text-sm text-zinc-200 group-hover:text-white">Research + Enrichment</div>
                        <div className="text-[10px] text-zinc-500">Deep Company Intelligence</div>
                      </div>
                    </Link>
                    <Link
                      href="/scouts"
                      onClick={() => setDaedalusOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-orange-500/10 transition-colors group"
                    >
                      <Shield className="w-4 h-4 text-orange-400" />
                      <div>
                        <div className="text-sm text-zinc-200 group-hover:text-white">
                          Intel & Competitive Threat Detection
                        </div>
                        <div className="text-[10px] text-zinc-500">Market Position Analysis</div>
                      </div>
                    </Link>
                    <Link
                      href="/brand-recon"
                      onClick={() => setDaedalusOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-orange-500/10 transition-colors group"
                    >
                      <Swords className="w-4 h-4 text-orange-500" />
                      <div>
                        <div className="text-sm text-zinc-200 group-hover:text-white">Counter Ops</div>
                        <div className="text-[10px] text-zinc-500">Brand Fracture & Ambush Targeting</div>
                      </div>
                    </Link>
                    <Link
                      href="/observe"
                      onClick={() => setDaedalusOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-orange-500/10 transition-colors group"
                    >
                      <ScanEye className="w-4 h-4 text-orange-400" />
                      <div>
                        <div className="text-sm text-zinc-200 group-hover:text-white">Surveillance + Extraction</div>
                        <div className="text-[10px] text-zinc-500">Change Detection & Data Harvesting</div>
                      </div>
                    </Link>
                    <Link
                      href="#daedalus"
                      onClick={() => setDaedalusOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-orange-500/10 transition-colors group"
                    >
                      <Radio className="w-4 h-4 text-orange-500" />
                      <div>
                        <div className="text-sm text-zinc-200 group-hover:text-white">Recon & Sentinel Suite</div>
                        <div className="text-[10px] text-zinc-500">Autonomous Watch Protocols</div>
                      </div>
                    </Link>
                  </div>
                  <div className="px-3 py-2 border-t border-zinc-800 bg-zinc-900/50">
                    <Link
                      href="#daedalus"
                      onClick={() => setDaedalusOpen(false)}
                      className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 hover:text-orange-500 transition-colors"
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
            <div className="text-center max-w-4xl mx-auto mb-16">
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

          <div className="flex justify-center items-center" style={{ height: "500px", position: "relative" }}>
            <CardSwap
              width={340}
              height={380}
              cardDistance={50}
              verticalDistance={60}
              delay={4000}
              pauseOnHover={true}
              skewAmount={4}
              easing="elastic"
            >
              <Card className="border border-zinc-700 bg-zinc-900/95 backdrop-blur-sm p-8 hover:border-orange-500/50 transition-colors cursor-pointer">
                <div className="w-14 h-14 border border-zinc-700 flex items-center justify-center mb-6 text-orange-500">
                  <Brain className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-100 mb-3">The Cortex</h3>
                <p className="text-zinc-400 mb-6 leading-relaxed">
                  Unified, permissions-aware data intelligence layer. RAG pipelines, vector stores, and semantic
                  search—governed and ready.
                </p>
                <div className="flex items-center gap-2 text-xs text-orange-500/70 border-t border-zinc-800 pt-4">
                  <Brain className="w-3 h-3" />
                  <span>Data Intelligence</span>
                </div>
              </Card>

              <Card className="border border-zinc-700 bg-zinc-900/95 backdrop-blur-sm p-8 hover:border-orange-500/50 transition-colors cursor-pointer">
                <div className="w-14 h-14 border border-zinc-700 flex items-center justify-center mb-6 text-orange-500">
                  <Monitor className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-100 mb-3">The Interface</h3>
                <p className="text-zinc-400 mb-6 leading-relaxed">
                  Role-specific copilots and command centers. Dashboards that adapt to your team's workflow, not the
                  other way around.
                </p>
                <div className="flex items-center gap-2 text-xs text-orange-500/70 border-t border-zinc-800 pt-4">
                  <Monitor className="w-3 h-3" />
                  <span>Adoption Layer</span>
                </div>
              </Card>

              <Card className="border border-zinc-700 bg-zinc-900/95 backdrop-blur-sm p-8 hover:border-orange-500/50 transition-colors cursor-pointer">
                <div className="w-14 h-14 border border-zinc-700 flex items-center justify-center mb-6 text-orange-500">
                  <Bot className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-100 mb-3">The Autopilot</h3>
                <p className="text-zinc-400 mb-6 leading-relaxed">
                  Agents that act on signals, not just display them. Multi-agent orchestration for autonomous, governed
                  workflows.
                </p>
                <div className="flex items-center gap-2 text-xs text-orange-500/70 border-t border-zinc-800 pt-4">
                  <Bot className="w-3 h-3" />
                  <span>Workflow Agents</span>
                </div>
              </Card>

              <Card className="border border-zinc-700 bg-zinc-900/95 backdrop-blur-sm p-8 hover:border-orange-500/50 transition-colors cursor-pointer">
                <div className="w-14 h-14 border border-zinc-700 flex items-center justify-center mb-6 text-orange-500">
                  <SlidersHorizontal className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-100 mb-3">The Relay</h3>
                <p className="text-zinc-400 mb-6 leading-relaxed">
                  Enablement and governance so it all sticks. Training, documentation, and guardrails that scale with
                  your team.
                </p>
                <div className="flex items-center gap-2 text-xs text-orange-500/70 border-t border-zinc-800 pt-4">
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Governance</span>
                </div>
              </Card>
            </CardSwap>
          </div>
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

      {/* DAEDALUS AUTONOMOUS RECONNAISSANCE SECTION */}
      <section
        id="daedalus"
        className="py-32 px-6 border-t border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-900/20 to-zinc-950"
      >
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-orange-500/30 bg-orange-500/5">
                <Radar className="w-3 h-3 text-orange-500 animate-pulse" />
                <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest">
                  // INTELLIGENCE RECONNAISSANCE SYSTEM
                </span>
              </div>

              <GlitchText>
                <h2 className="text-4xl md:text-6xl font-black mb-4">
                  Daedalus <span className="text-orange-500">Autonomous</span> Reconnaissance
                </h2>
              </GlitchText>

              <p className="text-xl text-zinc-500 font-mono italic mb-8">"No sleep, no surprises."</p>

              <p className="text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                A <span className="text-zinc-200">Skunkworks-grade intelligence engine</span> that scrapes, maps, and
                enriches the world. It performs multi-dimensional reconnaissance across brand, market, persona,
                geography, and narrative structures, then assembles the insights into{" "}
                <span className="text-orange-500">actionable systems</span>.
              </p>
            </div>
          </ScrollReveal>

          {/* Visual Teaser */}
          <ScrollReveal delay={0.2}>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-6 py-3 border border-zinc-800 bg-zinc-900/50 rounded-full">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-sm font-mono text-zinc-400">
                  "It reads the internet's <span className="text-orange-500">thermal signature</span>."
                </span>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              </div>
            </div>
          </ScrollReveal>

          {/* Capabilities Grid */}
          <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {[
              { icon: Zap, title: "Brand DNA Extraction", desc: "Deep identity analysis and visual fingerprinting" },
              { icon: Target, title: "Competitor Recon Packs", desc: "Full competitive intelligence dossiers" },
              { icon: Users, title: "Persona Affinity Mapping", desc: "Audience behavior and preference modeling" },
              { icon: Search, title: "Autonomous Research Missions", desc: "Self-directed deep-dive investigations" },
              { icon: Globe, title: "Geo Intelligence & Scoring", desc: "Location-based market opportunity analysis" },
              { icon: Activity, title: "Narrative Change Detection", desc: "Real-time market sentiment shifts" },
              { icon: Layers, title: "Multi-Step Pipeline Orchestration", desc: "Chained intelligence workflows" },
              { icon: Eye, title: "Autonomous Watch Protocols", desc: "24/7 monitoring without human intervention" },
              { icon: AlertTriangle, title: "Diff/Shift Monitoring", desc: "Instant alerts on critical changes" },
            ].map((item, i) => (
              <ScaleReveal key={i}>
                <div className="group relative p-5 border border-zinc-800 bg-zinc-900/30 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-300">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-orange-500/50" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-orange-500/50" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-orange-500/50" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-orange-500/50" />

                  <item.icon className="w-5 h-5 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-bold text-zinc-200 mb-1">{item.title}</h3>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
              </ScaleReveal>
            ))}
          </StaggerReveal>

          {/* Intelligence Models */}
          <ScrollReveal delay={0.3}>
            <div className="border border-zinc-800 bg-zinc-900/20 p-8 mb-16">
              <div className="flex items-center gap-2 mb-6">
                <Crosshair className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-mono text-orange-500 uppercase tracking-widest">
                  Lock-On Targeting Systems
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Narrative Heat Model */}
                <div className="p-5 border border-zinc-800 bg-zinc-950/50">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <h4 className="font-bold text-zinc-200">Narrative Heat Model</h4>
                  </div>
                  <p className="text-xs text-zinc-500 mb-4">Maps rising/declining narratives in real-time</p>
                  <div className="space-y-1">
                    {["Industries", "Sectors", "Fanbases", "News Cycles"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                        <div className="w-1 h-1 bg-orange-500 rounded-full" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brand Fracture Detection */}
                <div className="p-5 border border-zinc-800 bg-zinc-950/50">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    <h4 className="font-bold text-zinc-200">Brand Fracture Detection</h4>
                  </div>
                  <p className="text-xs text-zinc-500 mb-4">Detects when competitor messaging becomes incoherent</p>
                  <div className="text-xs text-orange-500 font-mono">→ Gives DMG clients the ambush opportunity</div>
                </div>

                {/* Opportunity Aperture Model */}
                <div className="p-5 border border-zinc-800 bg-zinc-950/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Crosshair className="w-5 h-5 text-orange-500" />
                    <h4 className="font-bold text-zinc-200">Opportunity Aperture Model</h4>
                  </div>
                  <p className="text-xs text-zinc-500 mb-4">DMG's targeting system finds:</p>
                  <div className="space-y-1">
                    {[
                      "Weak spots",
                      "Open lanes",
                      "Unclaimed narrative territory",
                      "Content gaps",
                      "Product opportunities",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                        <div className="w-1 h-1 bg-orange-500 rounded-full" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal delay={0.4}>
            <div className="text-center">
              <p className="text-zinc-500 mb-6 font-mono text-sm">
                Daedalus is the reconnaissance eye. <span className="text-orange-500">Sentinels</span> are the boots on
                the ground.
              </p>
              <Magnetic>
                <button
                  onClick={signupForm.open}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors"
                >
                  <Radar className="w-4 h-4" />
                  ACTIVATE RECONNAISSANCE
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Magnetic>
            </div>
          </ScrollReveal>
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
