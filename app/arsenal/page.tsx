import Link from "next/link"
import { ArrowLeft, Cpu, Zap, Database, Globe, Code2, Layers, Shield, Rocket } from "lucide-react"
import { ScrollReveal, StaggerReveal, Magnetic, GlitchText } from "@/components/scroll-animations"

const TOOLS = [
  {
    name: "Neural Engine",
    category: "AI/ML",
    icon: Cpu,
    description: "Custom-trained models for predictive analytics and automation",
    status: "DEPLOYED",
  },
  {
    name: "Flux Pipeline",
    category: "DATA",
    icon: Database,
    description: "Real-time data processing and ETL infrastructure",
    status: "ACTIVE",
  },
  {
    name: "Quantum Grid",
    category: "COMPUTE",
    icon: Zap,
    description: "Distributed computing mesh for parallel workloads",
    status: "DEPLOYED",
  },
  {
    name: "Sentinel",
    category: "SECURITY",
    icon: Shield,
    description: "Zero-trust security layer with anomaly detection",
    status: "MONITORING",
  },
  {
    name: "Nexus API",
    category: "INTEGRATION",
    icon: Globe,
    description: "Universal connector for third-party services",
    status: "ACTIVE",
  },
  {
    name: "Forge SDK",
    category: "DEVELOPMENT",
    icon: Code2,
    description: "Rapid prototyping toolkit for custom solutions",
    status: "DEPLOYED",
  },
  {
    name: "Stack Mesh",
    category: "INFRASTRUCTURE",
    icon: Layers,
    description: "Multi-cloud orchestration and deployment",
    status: "ACTIVE",
  },
  {
    name: "Launch Pad",
    category: "DEPLOYMENT",
    icon: Rocket,
    description: "CI/CD automation with zero-downtime releases",
    status: "DEPLOYED",
  },
]

export default function ArsenalPage() {
  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-200 selection:bg-orange-500 selection:text-white font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b border-white/10 bg-zinc-950/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-orange-500 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 animate-pulse rounded-full" />
              <span className="font-mono font-bold tracking-tighter text-lg">[ DMG ]</span>
            </div>
          </div>
          <div className="text-xs text-zinc-500">ARSENAL // TACTICAL SYSTEMS</div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal y={40}>
            <div className="flex items-center gap-3 text-xs text-zinc-500 mb-6">
              <div className="w-8 h-px bg-orange-500" />
              <span>SYSTEMS INVENTORY</span>
            </div>
          </ScrollReveal>

          <ScrollReveal y={60} delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
              <GlitchText>ARSENAL</GlitchText>
            </h1>
          </ScrollReveal>

          <ScrollReveal y={40} delay={0.2}>
            <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed">
              Our proprietary toolkit of battle-tested systems. Each weapon in our arsenal has been forged through
              countless deployments and refined for maximum impact.
            </p>
          </ScrollReveal>

          <ScrollReveal y={30} delay={0.3}>
            <div className="flex items-center gap-6 mt-8 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>8 SYSTEMS ONLINE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>100% OPERATIONAL</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <StaggerReveal staggerDelay={0.08}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {TOOLS.map((tool) => (
                <Magnetic key={tool.name} strength={0.1}>
                  <div className="group relative border border-white/10 bg-zinc-900/50 p-6 hover:border-orange-500/50 transition-all duration-500 hover:bg-zinc-900/80">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-orange-500/0 group-hover:border-orange-500 transition-colors" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-orange-500/0 group-hover:border-orange-500 transition-colors" />

                    {/* Status indicator */}
                    <div className="absolute top-4 right-4">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          tool.status === "DEPLOYED"
                            ? "bg-green-500"
                            : tool.status === "ACTIVE"
                              ? "bg-orange-500"
                              : "bg-yellow-500"
                        } animate-pulse`}
                      />
                    </div>

                    {/* Category */}
                    <div className="text-[10px] text-zinc-500 tracking-widest mb-4">{tool.category}</div>

                    {/* Icon */}
                    <div className="w-12 h-12 border border-white/10 flex items-center justify-center mb-4 group-hover:border-orange-500/50 transition-colors">
                      <tool.icon className="w-6 h-6 text-zinc-400 group-hover:text-orange-500 transition-colors" />
                    </div>

                    {/* Name */}
                    <h3 className="text-lg font-bold tracking-tight mb-2 group-hover:text-orange-500 transition-colors">
                      {tool.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-zinc-500 leading-relaxed mb-4">{tool.description}</p>

                    {/* Status badge */}
                    <div className="text-[10px] tracking-widest text-zinc-600">
                      STATUS:{" "}
                      <span
                        className={
                          tool.status === "DEPLOYED"
                            ? "text-green-500"
                            : tool.status === "ACTIVE"
                              ? "text-orange-500"
                              : "text-yellow-500"
                        }
                      >
                        {tool.status}
                      </span>
                    </div>
                  </div>
                </Magnetic>
              ))}
            </div>
          </StaggerReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal y={40}>
            <div className="border border-white/10 bg-zinc-900/30 p-12 text-center">
              <div className="text-xs text-zinc-500 tracking-widest mb-4">READY TO DEPLOY?</div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6">Let&apos;s weaponize your growth</h2>
              <Magnetic strength={0.15}>
                <Link
                  href="/#audit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors"
                >
                  REQUEST ACCESS
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </Magnetic>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
