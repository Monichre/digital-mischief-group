export function FUIDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {/* Large Circle Outline */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] border border-white/5 rounded-full opacity-20"></div>

      {/* Dashed Ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vh] h-[60vh] border border-dashed border-white/10 rounded-full opacity-30 animate-[spin_60s_linear_infinite]"></div>

      {/* Crosshairs */}
      <div className="absolute top-10 left-1/4 w-4 h-4 border-t border-l border-white/20"></div>
      <div className="absolute bottom-20 right-1/3 w-4 h-4 border-b border-r border-white/20"></div>

      {/* Random Data Points */}
      <div className="absolute top-[15%] right-[10%] text-[0.4rem] text-white/20 flex flex-col items-end gap-1">
        <span>SEC.01</span>
        <div className="w-12 h-[1px] bg-white/20"></div>
        <span>SEC.02</span>
      </div>

      <div className="absolute bottom-[20%] left-[10%] text-[0.4rem] text-white/20">
        <span>// SYSTEM_READY</span>
      </div>

      {/* Vertical Lines */}
      <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-white/5"></div>
      <div className="absolute top-0 bottom-0 right-[20%] w-[1px] bg-white/5"></div>
    </div>
  )
}
