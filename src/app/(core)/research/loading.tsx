export default function ResearchLoading() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-500 font-mono text-sm">Initializing Open-Researcher...</p>
      </div>
    </main>
  )
}
