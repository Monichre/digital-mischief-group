export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono tracking-[0.3em] text-zinc-500 uppercase">Decrypting Archives...</p>
      </div>
    </div>
  )
}
