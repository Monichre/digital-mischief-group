"use client"

import { useEffect, useRef, useState } from "react"

interface SparkParticle {
  x: number
  y: number
  opacity: number
  id: number
}

interface FlameParticle {
  id: number
  offsetX: number
  offsetY: number
  scale: number
  delay: number
  duration: number
}

export function FuseBackground() {
  const pathRef = useRef<SVGPathElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [sparkPos, setSparkPos] = useState({ x: 0, y: 0 })
  const [isComplete, setIsComplete] = useState(false)
  const [trailParticles, setTrailParticles] = useState<SparkParticle[]>([])
  const [flameParticles] = useState<FlameParticle[]>(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      offsetX: (Math.random() - 0.5) * 2,
      offsetY: -Math.random() * 3,
      scale: 0.5 + Math.random() * 0.8,
      delay: Math.random() * 0.5,
      duration: 0.4 + Math.random() * 0.4,
    })),
  )
  const animationRef = useRef<number>()
  const targetProgressRef = useRef(0)
  const currentProgressRef = useRef(0)
  const particleIdRef = useRef(0)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return

    const pathLength = path.getTotalLength()
    path.style.strokeDasharray = `${pathLength}`
    path.style.strokeDashoffset = `${pathLength}`

    const smoothingFactor = 0.08

    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = window.scrollY
      targetProgressRef.current = Math.min(scrolled / scrollHeight, 1)

      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * smoothingFactor

      const currentProgress = currentProgressRef.current
      setProgress(currentProgress)

      const drawLength = pathLength * currentProgress
      path.style.strokeDashoffset = `${pathLength - drawLength}`

      if (currentProgress > 0) {
        const point = path.getPointAtLength(drawLength)
        setSparkPos({ x: point.x, y: point.y })

        if (currentProgress > 0.01 && currentProgress < 0.99) {
          setTrailParticles((prev) => {
            const newParticle: SparkParticle = {
              x: point.x,
              y: point.y,
              opacity: 1,
              id: particleIdRef.current++,
            }
            const updated = [...prev, newParticle].slice(-8)
            return updated.map((p, i) => ({
              ...p,
              opacity: (i + 1) / updated.length,
            }))
          })
        }
      }

      if (currentProgress >= 0.98 && !isComplete) {
        setIsComplete(true)
      }

      animationRef.current = requestAnimationFrame(updateProgress)
    }

    animationRef.current = requestAnimationFrame(updateProgress)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ minHeight: "100vh" }}
    >
      {/* Flash effect on completion */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: "radial-gradient(circle at 50% 100%, rgba(249,115,22,0.4) 0%, transparent 60%)",
          opacity: isComplete ? 1 : 0,
        }}
      />

      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          {/* Enhanced glow filter */}
          <filter id="fuseGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.3" result="blur1" />
            <feGaussianBlur stdDeviation="0.6" result="blur2" />
            <feGaussianBlur stdDeviation="1.2" result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="flameGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" seed="0">
              <animate attributeName="seed" values="0;100;0" dur="2s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="0.5"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="0.4" result="blur1" />
            <feGaussianBlur in="displaced" stdDeviation="0.8" result="blur2" />
            <feGaussianBlur in="displaced" stdDeviation="1.5" result="blur3" />
            <feColorMatrix
              in="blur3"
              type="matrix"
              values="1.2 0 0 0 0.1
                      0.5 0.8 0 0 0
                      0 0 0.3 0 0
                      0 0 0 1.5 0"
              result="coloredBlur"
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="displaced" />
            </feMerge>
          </filter>

          <filter id="flameCoreGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.2" result="blur" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.3
                      0.9 0.7 0 0 0.1
                      0 0 0.2 0 0
                      0 0 0 2 0"
            />
          </filter>

          {/* Trail particle filter */}
          <filter id="trailGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="0.3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="emberGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="0.15" result="blur" />
            <feColorMatrix
              type="matrix"
              values="1 0.3 0 0 0.2
                      0.3 0.2 0 0 0
                      0 0 0 0 0
                      0 0 0 1.5 0"
            />
          </filter>

          {/* Gradient for the burning fuse */}
          <linearGradient id="fuseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#fb923c" stopOpacity="1" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="flameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="1" />
            <stop offset="25%" stopColor="#ea580c" stopOpacity="1" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="1" />
            <stop offset="75%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.7" />
          </linearGradient>

          <linearGradient id="innerFlameGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="1" />
            <stop offset="40%" stopColor="#fef08a" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
          </linearGradient>

          <radialGradient id="flameBaseGradient" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor="#fef3c7" stopOpacity="1" />
            <stop offset="60%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Unburned fuse path (dim) */}
        <path
          d="M 50 0
             C 50 10, 45 15, 50 25
             C 55 35, 45 40, 50 50
             C 55 60, 45 65, 50 75
             C 55 85, 50 90, 50 100"
          fill="none"
          stroke="rgba(120,120,120,0.15)"
          strokeWidth="0.3"
          strokeLinecap="round"
        />

        {/* Secondary glow layer */}
        <path
          d="M 50 0
             C 50 10, 45 15, 50 25
             C 55 35, 45 40, 50 50
             C 55 60, 45 65, 50 75
             C 55 85, 50 90, 50 100"
          fill="none"
          stroke="rgba(249,115,22,0.3)"
          strokeWidth="1.5"
          strokeLinecap="round"
          filter="url(#fuseGlow)"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: 1000 - 1000 * progress,
          }}
        />

        {/* Burned fuse path (bright) */}
        <path
          ref={pathRef}
          d="M 50 0
             C 50 10, 45 15, 50 25
             C 55 35, 45 40, 50 50
             C 55 60, 45 65, 50 75
             C 55 85, 50 90, 50 100"
          fill="none"
          stroke="url(#fuseGradient)"
          strokeWidth="0.4"
          strokeLinecap="round"
          filter="url(#fuseGlow)"
        />

        {/* Trail particles - now ember-like */}
        {trailParticles.map((particle) => (
          <g key={particle.id}>
            <circle
              cx={particle.x}
              cy={particle.y}
              r={0.3 * particle.opacity}
              fill="#fbbf24"
              opacity={particle.opacity * 0.8}
              filter="url(#emberGlow)"
            />
            <circle
              cx={particle.x + (Math.random() - 0.5) * 0.5}
              cy={particle.y}
              r={0.15 * particle.opacity}
              fill="#ffffff"
              opacity={particle.opacity * 0.5}
            />
          </g>
        ))}

        {progress > 0 && progress < 1 && (
          <g transform={`translate(${sparkPos.x}, ${sparkPos.y})`}>
            {/* Heat distortion base */}
            <ellipse cx={0} cy={0.5} rx={1.5} ry={0.8} fill="url(#flameBaseGradient)" opacity={0.6} />

            {/* Outer flame particles - animated */}
            {flameParticles.map((particle) => (
              <g key={particle.id}>
                {/* Main flame tongue */}
                <path
                  d={`M 0 0.5
                      Q ${particle.offsetX * 0.8} ${-1.5 * particle.scale}
                        ${particle.offsetX * 0.3} ${-3 * particle.scale}
                      Q ${particle.offsetX * 0.1} ${-3.5 * particle.scale}
                        0 ${-4 * particle.scale}
                      Q ${-particle.offsetX * 0.1} ${-3.5 * particle.scale}
                        ${-particle.offsetX * 0.3} ${-3 * particle.scale}
                      Q ${-particle.offsetX * 0.8} ${-1.5 * particle.scale}
                        0 0.5`}
                  fill="url(#flameGradient)"
                  opacity={0.4 + particle.scale * 0.3}
                  filter="url(#flameGlow)"
                  style={{
                    transformOrigin: "0 0.5px",
                    animation: `flame-flicker ${particle.duration}s ease-in-out ${particle.delay}s infinite alternate`,
                  }}
                />
              </g>
            ))}

            {/* Middle flame layer */}
            <path
              d="M 0 0.3
                 Q -0.4 -1.2, -0.2 -2
                 Q 0 -2.8, 0 -3.2
                 Q 0 -2.8, 0.2 -2
                 Q 0.4 -1.2, 0 0.3"
              fill="url(#innerFlameGradient)"
              opacity={0.9}
              filter="url(#flameCoreGlow)"
              style={{
                transformOrigin: "0 0.3px",
                animation: "flame-core 0.3s ease-in-out infinite alternate",
              }}
            />

            {/* Inner white-hot core */}
            <ellipse
              cx={0}
              cy={-0.3}
              rx={0.4}
              ry={0.8}
              fill="#ffffff"
              opacity={0.95}
              style={{
                animation: "flame-core-pulse 0.2s ease-in-out infinite alternate",
              }}
            />

            {/* Bright center point */}
            <circle cx={0} cy={0} r={0.25} fill="#ffffff" opacity={1} />

            {/* Flying embers/sparks */}
            {[...Array(6)].map((_, i) => (
              <circle
                key={`ember-${i}`}
                cx={0}
                cy={0}
                r={0.08}
                fill="#fbbf24"
                opacity={0.9}
                filter="url(#emberGlow)"
                style={{
                  animation: `ember-fly-${i % 3} ${0.6 + i * 0.15}s ease-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </g>
        )}
      </svg>

      <style jsx>{`
        @keyframes flame-flicker {
          0% {
            transform: scaleX(0.9) scaleY(0.95) translateX(-0.1px);
            opacity: 0.6;
          }
          50% {
            transform: scaleX(1.1) scaleY(1.05) translateX(0.1px);
            opacity: 0.8;
          }
          100% {
            transform: scaleX(0.95) scaleY(1) translateX(0px);
            opacity: 0.7;
          }
        }

        @keyframes flame-core {
          0% {
            transform: scaleX(0.9) scaleY(0.92);
          }
          100% {
            transform: scaleX(1.1) scaleY(1.08);
          }
        }

        @keyframes flame-core-pulse {
          0% {
            transform: scale(0.9);
            opacity: 0.9;
          }
          100% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        @keyframes ember-fly-0 {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          100% {
            transform: translate(-1.5px, -4px);
            opacity: 0;
          }
        }

        @keyframes ember-fly-1 {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          100% {
            transform: translate(1.2px, -3.5px);
            opacity: 0;
          }
        }

        @keyframes ember-fly-2 {
          0% {
            transform: translate(0, 0);
            opacity: 1;
          }
          100% {
            transform: translate(0.5px, -5px);
            opacity: 0;
          }
        }
      `}</style>

      {/* Completion text */}
      <div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center transition-all duration-1000"
        style={{
          opacity: isComplete ? 1 : 0,
          transform: `translateX(-50%) translateY(${isComplete ? 0 : 20}px)`,
        }}
      >
        <span className="text-orange-500 text-2xl md:text-4xl font-bold tracking-widest">IGNITION</span>
      </div>
    </div>
  )
}
