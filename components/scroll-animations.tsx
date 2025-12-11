"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// =============================================================================
// SCROLL REVEAL - Fade in elements on scroll
// =============================================================================
interface ScrollRevealProps {
  children: ReactNode
  className?: string
  y?: number
  x?: number
  scale?: number
  rotation?: number
  duration?: number
  delay?: number
  ease?: string
}

export function ScrollReveal({
  children,
  className = "",
  y = 60,
  x = 0,
  scale = 1,
  rotation = 0,
  duration = 1,
  delay = 0,
  ease = "power3.out",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y, x, scale, rotation },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          rotation: 0,
          duration,
          delay,
          ease,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      )
    })

    return () => ctx.revert()
  }, [y, x, scale, rotation, duration, delay, ease])

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}

// =============================================================================
// STAGGER REVEAL - Sequential reveal of child elements
// =============================================================================
interface StaggerRevealProps {
  children: ReactNode
  className?: string
  stagger?: number
  y?: number
  duration?: number
  childSelector?: string
}

export function StaggerReveal({
  children,
  className = "",
  stagger = 0.1,
  y = 40,
  duration = 0.8,
  childSelector,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      const targets = childSelector ? ref.current!.querySelectorAll(childSelector) : Array.from(ref.current!.children)

      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      )
    })

    return () => ctx.revert()
  }, [stagger, y, duration, childSelector])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// =============================================================================
// PARALLAX - Multi-directional parallax movement
// =============================================================================
interface ParallaxProps {
  children: ReactNode
  className?: string
  speed?: number
  direction?: "up" | "down" | "left" | "right"
}

export function Parallax({ children, className = "", speed = 50, direction = "up" }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const directionMap = {
      up: { y: speed },
      down: { y: -speed },
      left: { x: speed },
      right: { x: -speed },
    }

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        ...directionMap[direction],
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      })
    })

    return () => ctx.revert()
  }, [speed, direction])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// =============================================================================
// GLITCH TEXT - Glitch effect on scroll
// =============================================================================
interface GlitchTextProps {
  children: ReactNode
  className?: string
}

export function GlitchText({ children, className = "" }: GlitchTextProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      })

      tl.fromTo(
        ref.current,
        { opacity: 0, skewX: -10, x: -50 },
        { opacity: 1, skewX: 0, x: 0, duration: 0.6, ease: "power3.out" },
      )
        .to(ref.current, {
          skewX: 3,
          x: 5,
          duration: 0.1,
          ease: "power1.inOut",
        })
        .to(ref.current, {
          skewX: -2,
          x: -3,
          duration: 0.1,
          ease: "power1.inOut",
        })
        .to(ref.current, { skewX: 0, x: 0, duration: 0.1, ease: "power1.out" })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}

// =============================================================================
// REVEAL LINE - Animated line reveal
// =============================================================================
interface RevealLineProps {
  className?: string
  direction?: "left" | "right" | "center"
  color?: string
  height?: number
}

export function RevealLine({
  className = "",
  direction = "left",
  color = "rgb(249 115 22)",
  height = 1,
}: RevealLineProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const origins = {
      left: "left center",
      right: "right center",
      center: "center center",
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { scaleX: 0, transformOrigin: origins[direction] },
        {
          scaleX: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      )
    })

    return () => ctx.revert()
  }, [direction])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        height: `${height}px`,
        backgroundColor: color,
        transform: "scaleX(0)",
      }}
    />
  )
}

// =============================================================================
// SCALE REVEAL - Scale-up with bounce
// =============================================================================
interface ScaleRevealProps {
  children: ReactNode
  className?: string
  duration?: number
  delay?: number
}

export function ScaleReveal({ children, className = "", duration = 0.8, delay = 0 }: ScaleRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration,
          delay,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      )
    })

    return () => ctx.revert()
  }, [duration, delay])

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}

// =============================================================================
// MAGNETIC - Cursor-following effect on CTA buttons
// =============================================================================
interface MagneticProps {
  children: ReactNode
  className?: string
  strength?: number
}

export function Magnetic({ children, className = "", strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const el = ref.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: "power2.out",
      })
    }

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)",
      })
    }

    el.addEventListener("mousemove", handleMouseMove)
    el.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      el.removeEventListener("mousemove", handleMouseMove)
      el.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [strength])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// =============================================================================
// TEXT SPLIT REVEAL - Character-by-character reveal
// =============================================================================
interface TextSplitRevealProps {
  text: string
  className?: string
  stagger?: number
}

export function TextSplitReveal({ text, className = "", stagger = 0.03 }: TextSplitRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      const chars = ref.current!.querySelectorAll(".char")
      gsap.fromTo(
        chars,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        },
      )
    })

    return () => ctx.revert()
  }, [stagger])

  return (
    <div ref={ref} className={className}>
      {text.split("").map((char, i) => (
        <span key={i} className="char inline-block" style={{ opacity: 0 }}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  )
}

// =============================================================================
// COUNTER - Animated number counter
// =============================================================================
interface CounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

export function Counter({ end, duration = 2, suffix = "", prefix = "", className = "" }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = gsap.context(() => {
      const obj = { value: 0 }
      gsap.to(obj, {
        value: end,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = `${prefix}${Math.round(obj.value)}${suffix}`
          }
        },
      })
    })

    return () => ctx.revert()
  }, [end, duration, suffix, prefix])

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  )
}
