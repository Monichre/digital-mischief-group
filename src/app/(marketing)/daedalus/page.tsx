const primitives = [
  {
    title: "Extract",
    description: "One-off snapshots of a URL with structured brand identity output.",
  },
  {
    title: "Observe",
    description: "Monitor URLs over time with diffs and AI summaries when changes happen.",
  },
  {
    title: "Scout",
    description: "Scheduled web searches with deduped findings and notifications.",
  },
  {
    title: "Enrich",
    description: "Multi-step dossiers for people and companies with clear source attribution.",
  },
  {
    title: "Agent",
    description: "Interactive research sessions that orchestrate tools and log actions.",
  },
] as const

export default function DaedalusPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-20">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
          Daedalus
        </p>
        <h1 className="text-4xl font-semibold text-white md:text-5xl">
          Web intelligence built on stable primitives.
        </h1>
        <p className="max-w-2xl text-lg text-gray-400">
          Extract, Observe, Scout, Enrich, and Agent are the only building
          blocks. Each workflow does one thing clearly, with explicit intent and
          source attribution.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {primitives.map((primitive) => (
          <div
            key={primitive.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="text-xl font-semibold text-white">
              {primitive.title}
            </h2>
            <p className="mt-2 text-sm text-gray-400">{primitive.description}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-6">
        <h3 className="text-xl font-semibold text-white">
          Designed for clarity and control.
        </h3>
        <p className="mt-2 max-w-2xl text-sm text-gray-400">
          Daedalus keeps product language in the UI and metal names in code. No
          hidden expansions, no opaque bundles—just primitives that stay stable
          as the platform evolves.
        </p>
      </section>
    </main>
  )
}
