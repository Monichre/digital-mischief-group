export function Radar() {
  return (
    <div className="aspect-square w-full border border-white/10 relative p-2 bg-black/40">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-copper"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-copper"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-copper"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-copper"></div>

      {/* Radar Content */}
      <div className="w-full h-full border border-white/5 rounded-full flex items-center justify-center relative overflow-hidden">
        {/* Rotating Scan */}
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(196,138,88,0.2)_360deg)] animate-spin-slow"></div>

        {/* Grid Lines */}
        <div className="w-[1px] h-full bg-white/10 absolute"></div>
        <div className="h-[1px] w-full bg-white/10 absolute"></div>
        <div className="w-2/3 h-2/3 border border-white/5 rounded-full absolute"></div>
        <div className="w-1/3 h-1/3 border border-white/5 rounded-full absolute"></div>

        {/* Target Blips */}
        <div className="absolute top-[30%] left-[60%] w-1 h-1 bg-copper animate-pulse shadow-[0_0_4px_#C48A58]"></div>
        <div className="absolute bottom-[40%] right-[30%] w-0.5 h-0.5 bg-white/50"></div>
        <div className="absolute top-[20%] left-[40%] w-0.5 h-0.5 bg-white/50"></div>
      </div>

      <div className="absolute bottom-1 left-2 text-[0.4rem] text-copper/80">RADAR.ACT</div>
    </div>
  )
}
