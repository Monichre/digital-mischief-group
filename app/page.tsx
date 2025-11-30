import Link from "next/link"
import {
  ArrowRight,
  ChevronRight,
  Activity,
  Brain,
  Monitor,
  Bot,
  SlidersHorizontal,
  Flame,
  Search,
  FileText,
} from "lucide-react"
import { MeetTheTeam } from "@/components/MeetTheTeam"

export default function DigitalMischief() {
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
            <Link href="#cortex" className="hover:text-orange-500 transition-colors">
              Revenue Cortex
            </Link>
            <Link href="#process" className="hover:text-orange-500 transition-colors">
              How We Work
            </Link>
            <Link href="#cases" className="hover:text-orange-500 transition-colors">
              Lab Reports
            </Link>
            <Link href="#about" className="hover:text-orange-500 transition-colors">
              About DMG
            </Link>
            <Link href="/lab" className="hover:text-orange-500 transition-colors">
              Lab
            </Link>
            <Link href="/landing" className="hover:text-orange-500 transition-colors">
              Landing
            </Link>
          </div>
          <Link
            href="#audit"
            className="px-4 py-2 border border-orange-500/50 text-orange-500 text-sm hover:bg-orange-500 hover:text-white transition-all duration-300"
          >
            Start an Audit →
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

        {/* Floating Technical Elements */}
        <div className="absolute top-32 left-10 text-xs text-zinc-600 font-mono hidden lg:block">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-orange-500" />
            <span>SYS.STATUS: OPERATIONAL</span>
          </div>
          <div className="mt-1 text-zinc-700">v2.4.1 // BUILD:2024.12</div>
        </div>

        <div className="absolute bottom-32 right-10 text-xs text-zinc-600 font-mono text-right hidden lg:block">
          <div>LAT: 37.7749° N</div>
          <div>LNG: 122.4194° W</div>
          <div className="text-orange-500/50 mt-1">NODE: ACTIVE</div>
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 border border-zinc-800 text-xs text-zinc-500">
            <Flame className="w-3 h-3 text-orange-500" />
            <span>AN IDEAS LAB WITH MATCHES</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-none mb-6">
            <span className="block text-zinc-100">Your Data Is Cold.</span>
            <span className="block text-orange-500 match-glow mt-2">We Bring the Matches.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl mb-10 leading-relaxed">
            Digital Mischief Group is an AI systems lab that builds{" "}
            <span className="text-zinc-200">Revenue Cortexes</span> — governed AI infrastructure that turns dormant data
            into autonomous workflows and real revenue.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#audit"
              className="group flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all duration-300"
            >
              <Flame className="w-4 h-4" />
              <span>IGNITE A SYSTEM ARCHITECTURE AUDIT</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/lab"
              className="flex items-center gap-2 px-8 py-4 border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-all duration-300"
            >
              <span>ENTER THE LAB</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-20 left-6 w-16 h-16 border-l border-t border-zinc-800" />
        <div className="absolute bottom-20 right-6 w-16 h-16 border-r border-b border-zinc-800" />
      </section>

      <section className="py-32 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-xs text-zinc-600 font-mono mb-2">// THE PROBLEM</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8">
            AI Everywhere. <span className="text-orange-500">Nowhere It Counts.</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            Most teams have AI "experiments": POCs, scripts, prototypes.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-6 border border-zinc-800 bg-zinc-900/30">
              <div className="text-orange-500 text-2xl mb-2">✗</div>
              <p className="text-zinc-500 text-sm">No unified intelligence layer</p>
            </div>
            <div className="p-6 border border-zinc-800 bg-zinc-900/30">
              <div className="text-orange-500 text-2xl mb-2">✗</div>
              <p className="text-zinc-500 text-sm">No agents they trust in production</p>
            </div>
            <div className="p-6 border border-zinc-800 bg-zinc-900/30">
              <div className="text-orange-500 text-2xl mb-2">✗</div>
              <p className="text-zinc-500 text-sm">No observability and governance</p>
            </div>
          </div>
          <p className="text-zinc-300 text-xl mt-10 font-medium">DMG exists to close that gap.</p>
        </div>
      </section>

      <section id="cortex" className="py-32 border-t border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs text-zinc-600 font-mono mb-2">// THE SOLUTION</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
              The Revenue Cortex: <span className="text-orange-500">Your AI Nervous System</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              We don't sell isolated features. We install a system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* The Cortex */}
            <div className="group p-8 border border-zinc-800 hover:border-orange-500/50 transition-all duration-500 technical-border">
              <div className="w-12 h-12 flex items-center justify-center border border-zinc-700 mb-6 group-hover:border-orange-500 group-hover:text-orange-500 transition-colors">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">The Cortex</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Unified, permissions-aware data intelligence layer.
              </p>
              <div className="mt-6 text-xs text-zinc-600 font-mono">
                <span className="text-orange-500">🧠</span> Data Intelligence
              </div>
            </div>

            {/* The Interface */}
            <div className="group p-8 border border-zinc-800 hover:border-orange-500/50 transition-all duration-500 technical-border">
              <div className="w-12 h-12 flex items-center justify-center border border-zinc-700 mb-6 group-hover:border-orange-500 group-hover:text-orange-500 transition-colors">
                <Monitor className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">The Interface</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Role-specific copilots and command centers.</p>
              <div className="mt-6 text-xs text-zinc-600 font-mono">
                <span className="text-orange-500">🖥</span> Adoption Layer
              </div>
            </div>

            {/* The Autopilot */}
            <div className="group p-8 border border-zinc-800 hover:border-orange-500/50 transition-all duration-500 technical-border">
              <div className="w-12 h-12 flex items-center justify-center border border-zinc-700 mb-6 group-hover:border-orange-500 group-hover:text-orange-500 transition-colors">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">The Autopilot</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Agents that act on signals, not just display them.
              </p>
              <div className="mt-6 text-xs text-zinc-600 font-mono">
                <span className="text-orange-500">🤖</span> Workflow Agents
              </div>
            </div>

            {/* The Relay */}
            <div className="group p-8 border border-zinc-800 hover:border-orange-500/50 transition-all duration-500 technical-border">
              <div className="w-12 h-12 flex items-center justify-center border border-zinc-700 mb-6 group-hover:border-orange-500 group-hover:text-orange-500 transition-colors">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">The Relay</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Enablement and governance so it all sticks.</p>
              <div className="mt-6 text-xs text-zinc-600 font-mono">
                <span className="text-orange-500">🎛</span> Governance
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-zinc-300 text-lg">
              Together, this becomes your <span className="text-orange-500 font-bold">Revenue Cortex</span>.
            </p>
          </div>
        </div>
      </section>

      <section className="py-32 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs text-zinc-600 font-mono mb-2">// OUTCOMES</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              What Changes When the Cortex Is <span className="text-orange-500">Live</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-orange-500 mt-2 shrink-0" />
              <div>
                <p className="text-zinc-200 font-medium">8–12× faster access</p>
                <p className="text-zinc-500 text-sm">to institutional knowledge</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-orange-500 mt-2 shrink-0" />
              <div>
                <p className="text-zinc-200 font-medium">Agents handle ops 24/7</p>
                <p className="text-zinc-500 text-sm">repetitive work eliminated</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-orange-500 mt-2 shrink-0" />
              <div>
                <p className="text-zinc-200 font-medium">Clear metrics & audit trails</p>
                <p className="text-zinc-500 text-sm">for everything AI does</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-orange-500 mt-2 shrink-0" />
              <div>
                <p className="text-zinc-200 font-medium">3× faster onboarding</p>
                <p className="text-zinc-500 text-sm">for new hires</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-orange-500 mt-2 shrink-0" />
              <div>
                <p className="text-zinc-200 font-medium">Leadership trusts</p>
                <p className="text-zinc-500 text-sm">the system actually works</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-orange-500 mt-2 shrink-0" />
              <div>
                <p className="text-zinc-200 font-medium">20–40% reduction</p>
                <p className="text-zinc-500 text-sm">in repetitive operational work</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="py-32 border-t border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs text-zinc-600 font-mono mb-2">// PROCESS</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              The DMG <span className="text-orange-500">Ignition Protocol</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {[
              { num: "01", title: "AUDIT", desc: "System Architecture Audit to map your current state" },
              { num: "02", title: "DESIGN", desc: "Cortex architecture, workflows, guardrails" },
              { num: "03", title: "BUILD", desc: "Implement Cortex, Interface(s), and Autopilot v1" },
              { num: "04", title: "IGNITE", desc: "Deploy to real users, monitor everything" },
              { num: "05", title: "SUSTAIN", desc: "Cortex Ops retainer for improvements" },
            ].map((step) => (
              <div
                key={step.num}
                className="relative p-6 border border-zinc-800 hover:border-orange-500/30 transition-colors"
              >
                <div className="text-orange-500 text-3xl font-bold mb-2">{step.num}</div>
                <h3 className="text-zinc-200 font-bold mb-2">{step.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="#audit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all duration-300"
            >
              <span>START WITH AN AUDIT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="cases" className="py-32 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <div className="text-xs text-zinc-600 font-mono mb-2">// RESOURCES</div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Lab Reports & <span className="text-orange-500">Cases</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="group p-8 border border-zinc-800 hover:border-orange-500/50 transition-all duration-500 technical-border">
              <div className="flex items-center gap-2 text-xs text-orange-500 mb-4">
                <FileText className="w-4 h-4" />
                <span>CASE STUDY</span>
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">B2B SaaS Revenue Cortex</h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-4">
                From scattered POCs to a single Cortex powering sales & CS. 8× faster access to institutional knowledge.
              </p>
              <Link href="#" className="text-orange-500 text-sm hover:underline">
                Read Case Study →
              </Link>
            </div>

            <div className="group p-8 border border-zinc-800 hover:border-orange-500/50 transition-all duration-500 technical-border">
              <div className="flex items-center gap-2 text-xs text-orange-500 mb-4">
                <Search className="w-4 h-4" />
                <span>LAB REPORT</span>
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">AI Chasm Diagnostic</h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-4">
                The patterns we see when AI "isn't working" inside enterprises. POC Hell, Script Sprawl, and how to
                escape.
              </p>
              <Link href="#" className="text-orange-500 text-sm hover:underline">
                Explore Report →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-32 border-t border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-xs text-zinc-600 font-mono mb-2">// ABOUT DMG</div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8">
            Digital Mischief <span className="text-orange-500">Group</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed mb-6">
            Digital Mischief Group is an AI systems engineering collective led by{" "}
            <span className="text-zinc-200">Liam Ellis</span>.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left my-10">
            <div className="p-4 border border-zinc-800">
              <p className="text-zinc-300 text-sm font-medium">RAG Architectures</p>
              <p className="text-zinc-600 text-xs">& data intelligence</p>
            </div>
            <div className="p-4 border border-zinc-800">
              <p className="text-zinc-300 text-sm font-medium">Multi-Agent Systems</p>
              <p className="text-zinc-600 text-xs">& workflow automation</p>
            </div>
            <div className="p-4 border border-zinc-800">
              <p className="text-zinc-300 text-sm font-medium">Observability & UX</p>
              <p className="text-zinc-600 text-xs">for AI systems</p>
            </div>
          </div>
          <p className="text-zinc-500 italic">
            We're an ideas lab with matches — curious enough to find new patterns, disciplined enough to ship reliable
            infrastructure.
          </p>
        </div>

        <MeetTheTeam />
      </section>

      <section id="audit" className="py-32 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
            Ready to turn AI experiments into a system that actually <span className="text-orange-500">ships</span>?
          </h2>
          <p className="text-zinc-400 text-lg mb-10">
            Start with a System Architecture Audit and we'll map your Cortex.
          </p>
          <a
            href="mailto:liam@digitalmischief.group"
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all duration-300"
          >
            <Flame className="w-4 h-4" />
            <span>BOOK A SYSTEM ARCHITECTURE AUDIT</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <div className="mt-8 text-xs text-zinc-600 font-mono">
            <p>Liam Ellis — Founding Partner, Digital Mischief Group</p>
            <p className="text-orange-500/70">liam@digitalmischief.group</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <div className="w-2 h-2 bg-orange-500/50 rounded-full" />
            <span className="font-mono">[ DMG ] // Revenue Cortex Systems // 2024</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <span>digitalmischief.group</span>
            <span className="text-orange-500/70">●</span>
            <span>An ideas lab with matches.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
