const modules = [
  {
    label: "Research + Enrichment",
    role: "Target Research & Data Enrichment",
    primitives: "enrich",
    description:
      "Ingest leads and produce structured dossiers with sources, firmographics, and intent signals.",
  },
  {
    label: "Surveillance + Extraction",
    role: "Digital Surveillance & Asset Extraction",
    primitives: "extract · observe",
    description:
      "Snapshot brand identity and monitor critical pages for changes with diffs and summaries.",
  },
  {
    label: "Threat Detection",
    role: "Intel & Competitive Threat Detection",
    primitives: "scout",
    description:
      "Scheduled web searches with deduplicated findings that surface new signals.",
  },
  {
    label: "Counter Ops",
    role: "Response Tooling",
    primitives: "agent",
    description:
      "Operator-driven response playbooks that turn signals into structured actions.",
  },
] as const

const tiers = [
  {
    name: "Observer",
    price: "$0",
    period: "/mo",
    description: "Recon access to test the intel suite with limited missions.",
    cta: { label: "Enter Workspace", href: "/workspace" },
    highlight: false,
  },
  {
    name: "Operator",
    price: "$30",
    period: "/mo",
    description:
      "Full clearance for brand, research, observe, and enrich workflows with exports.",
    cta: { label: "Deploy Operator", href: "/loadout" },
    highlight: true,
  },
  {
    name: "Skunkworks",
    price: "Custom",
    period: "",
    description:
      "Custom deployment and agent development with dedicated engineering support.",
    cta: { label: "Request Audit", href: "/loadout" },
    highlight: false,
  },
] as const

const ballisticsCapabilities = [
  {
    name: 'Ghost Protocol',
    tech: 'Firecrawl Stealth Browser + Agent Integration',
    mission: 'Infiltration',
    quote: 'Most agents get stopped at the gate. Ours walk through walls.',
    description:
      'Advanced fingerprint masking mimics human signatures to navigate JavaScript-heavy targets and contested perimeters without triggering alarms.',
    capability: 'Undetectable Surveillance',
  },
  {
    name: 'Swarm Engine',
    tech: 'Hyper Browser Infrastructure',
    mission: 'Saturation',
    quote: 'One agent is a nuisance. A thousand agents is a siege.',
    description:
      'Spin up hundreds of concurrent browser sessions for Time-on-Target sweeps across competitors, trends, and market intelligence in parallel.',
    capability: 'Convergent Operations',
  },
] as const

export default function DaedalusPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-16 px-6 py-20 text-gray-300">
      <header className="space-y-5">
        <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
          // SYSTEM CLASSIFICATION: UNRESTRICTED
        </p>
        <h1 className="text-4xl font-semibold text-white md:text-5xl">
          The architecture of unfair advantage.
        </h1>
        <p className="max-w-2xl text-lg text-gray-400">
          Daedalus is a coherent intelligence architecture. It replaces
          fragmented SaaS workflows with stable primitives, a shared data spine,
          and explicit intent across every run.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/workspace"
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-orange-400"
          >
            Initialize System
          </a>
          <a
            href="#specs"
            className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
          >
            View Technical Specs
          </a>
        </div>
      </header>

      <section id="specs" className="space-y-6">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gray-500">
          <span className="h-px w-12 bg-gray-700" />
          Recon & Sentinel Suite
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {modules.map((module) => (
            <div
              key={module.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-orange-400">
                {module.label}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                {module.role}
              </h2>
              <p className="mt-3 text-sm text-gray-400">{module.description}</p>
              <p className="mt-4 text-xs text-gray-500">
                Primitives: <span className="text-gray-300">{module.primitives}</span>
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          UI language stays human‑friendly. Code stays metal: extract, observe,
          scout, enrich, agent.
        </p>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gray-500">
          <span className="h-px w-12 bg-gray-700" />
          // Upgrade: Ballistics Package v2.5
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            Multi-Vector Strike Capability.
          </h2>
          <p className="max-w-3xl text-sm text-gray-400 md:text-base">
            We solved detection and scale with two mission-specific browser
            warheads. Use Ghost Protocol to breach high-security targets. Use
            Swarm Engine to strip-mine the open web. This is orchestrated
            execution.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {ballisticsCapabilities.map((capability) => (
            <article
              key={capability.name}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-orange-400">
                {capability.mission}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                {capability.name}
              </h3>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                {capability.tech}
              </p>
              <p className="mt-4 text-sm italic text-gray-300">
                “{capability.quote}”
              </p>
              <p className="mt-4 text-sm text-gray-400">{capability.description}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-gray-500">
                Capability: <span className="text-gray-300">{capability.capability}</span>
              </p>
            </article>
          ))}
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Operational Synchronization
          </p>
          <p className="mt-2 text-sm text-gray-300">
            Old way: one agent, one tab, blocked at the perimeter. New way:
            distributed infiltration + mass parallel execution across every
            mission target.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-gray-500">
          <span className="h-px w-12 bg-gray-700" />
          Acquire Daedalus
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border border-white/10 bg-white/5 p-6 ${
                tier.highlight ? "border-orange-500/50 bg-orange-500/10" : ""
              }`}
            >
              <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
              <div className="mt-3 flex items-end gap-2 text-2xl font-semibold text-white">
                <span>{tier.price}</span>
                <span className="text-xs text-gray-400">{tier.period}</span>
              </div>
              <p className="mt-3 text-sm text-gray-400">{tier.description}</p>
              <a
                href={tier.cta.href}
                className={`mt-5 inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  tier.highlight
                    ? "bg-orange-500 text-black hover:bg-orange-400"
                    : "border border-white/15 text-white/80 hover:border-white/35 hover:text-white"
                }`}
              >
                {tier.cta.label}
              </a>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Pricing and access map to the Loadout tiers: Observer ($0), Operator
          ($30/mo), Skunkworks (Custom).
        </p>
      </section>
    </main>
  )
}
