"use client"

type BackgroundLayersProps = {
  mousePos: { x: number; y: number }
}

export function BackgroundLayers({ mousePos }: BackgroundLayersProps) {
  return (
    <>
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#34d399 1px, transparent 1px), linear-gradient(90deg, #34d399 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)`,
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)] pointer-events-none" />

      {/* Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-repeat"
        style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}
      />
    </>
  )
}
