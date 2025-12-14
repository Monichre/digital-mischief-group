"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

export type Variant = "recon" | "impact" | "blackout"

type ClassifiedCompositionProps = {
  grainOpacity?: number
  scratchOpacity?: number
  variant?: Variant
}

type LayerImageProps = {
  src: string
  alt: string
  widthClass: string
  heightClass: string
  rotateClass?: string
  positionClasses?: string
  label: string
  code?: string
}

type VariantConfig = {
  top: { visible: boolean } & Pick<LayerImageProps, "widthClass" | "heightClass" | "rotateClass" | "positionClasses">
  center: { visible: boolean } & Pick<LayerImageProps, "widthClass" | "heightClass" | "rotateClass" | "positionClasses">
  bottom: { visible: boolean } & Pick<LayerImageProps, "widthClass" | "heightClass" | "rotateClass" | "positionClasses">
  typeLevel: "dense" | "minimal" | "blackout"
  showStamp: boolean
  stampSubtle?: boolean
  stampPosition?: "bottom-right" | "top-left"
  containerClass?: string
  extras?: {
    impactRibbon?: boolean
    blackoutVignette?: boolean
  }
}

const VARIANT_CONFIG: Record<Variant, VariantConfig> = {
  recon: {
    top: {
      visible: true,
      widthClass: "w-[280px]",
      heightClass: "h-[320px]",
      rotateClass: "-rotate-2",
      positionClasses: "left-6 top-8 md:left-14 md:top-14",
    },
    center: {
      visible: true,
      widthClass: "w-[280px]",
      heightClass: "h-[320px]",
      rotateClass: "rotate-1",
      positionClasses: "left-1/2 top-1/3 -translate-x-1/2",
    },
    bottom: {
      visible: true,
      widthClass: "w-[280px]",
      heightClass: "h-[320px]",
      rotateClass: "-rotate-1",
      positionClasses: "left-10 bottom-16",
    },
    typeLevel: "dense",
    showStamp: true,
    containerClass: "",
    stampPosition: "bottom-right",
  },
  impact: {
    top: {
      visible: true,
      widthClass: "w-[280px]",
      heightClass: "h-[320px]",
      rotateClass: "-rotate-8",
      positionClasses: "left-4 top-3 md:left-6 md:top-4",
    },
    center: {
      visible: true,
      widthClass: "w-[280px]",
      heightClass: "h-[320px]",
      rotateClass: "rotate-6",
      positionClasses: "left-1/2 top-[22%] -translate-x-1/2",
    },
    bottom: {
      visible: true,
      widthClass: "w-[280px]",
      heightClass: "h-[320px]",
      rotateClass: "rotate-5",
      positionClasses: "right-4 bottom-8 md:right-8 md:bottom-10",
    },
    typeLevel: "minimal",
    showStamp: true,
    stampSubtle: false,
    stampPosition: "top-left",
    containerClass: "contrast-[1.25] brightness-[1.05]",
    extras: { impactRibbon: true },
  },
  blackout: {
    top: {
      visible: false,
      widthClass: "w-0",
      heightClass: "h-0",
      rotateClass: "",
      positionClasses: "",
    },
    center: {
      visible: true,
      widthClass: "w-[280px]",
      heightClass: "h-[320px]",
      rotateClass: "rotate-0",
      positionClasses: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    },
    bottom: {
      visible: false,
      widthClass: "w-0",
      heightClass: "h-0",
      rotateClass: "",
      positionClasses: "",
    },
    typeLevel: "blackout",
    showStamp: false,
    stampSubtle: true,
    stampPosition: "bottom-right",
    containerClass: "",
    extras: { blackoutVignette: true },
  },
}

export function ClassifiedComposition({
  grainOpacity = 0.35,
  scratchOpacity = 0.45,
  variant = "recon",
}: ClassifiedCompositionProps) {
  const cfg = VARIANT_CONFIG[variant]

  return (
    <div
      className={cn(
        "relative mx-auto mt-2 h-[1200px] w-full overflow-hidden rounded-lg border border-zinc-800 bg-[#0b0b0b] md:h-[1000px]",
        cfg.containerClass,
      )}
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 32px)",
        backgroundBlendMode: "soft-light",
      }}
      aria-label="Experimental military documentary collage composition"
      role="img"
    >
      {/* Film grain underlay */}
      <img
        src="/images/grain.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-multiply"
        style={{ opacity: grainOpacity }}
      />

      {cfg.top.visible && (
        <LayerImage
          src="/images/footballs.jpg"
          alt="Floating oval, football-shaped unidentified objects above horizon"
          widthClass={cfg.top.widthClass}
          heightClass={cfg.top.heightClass}
          rotateClass={cfg.top.rotateClass}
          positionClasses={cfg.top.positionClasses}
          label="PLATE I"
          code="OBS-SCN/014-FO"
        />
      )}

      {cfg.center.visible && (
        <LayerImage
          src="/images/explosion.jpg"
          alt="Expansive smoke plumes and debris from explosive combat scene"
          widthClass={cfg.center.widthClass}
          heightClass={cfg.center.heightClass}
          rotateClass={cfg.center.rotateClass}
          positionClasses={cfg.center.positionClasses}
          label="PLATE II"
          code="AAR/SECT-III/EXP-Σ"
        />
      )}

      {cfg.bottom.visible && (
        <LayerImage
          src="/images/night-fire.jpg"
          alt="Nighttime fire with industrial silhouettes"
          widthClass={cfg.bottom.widthClass}
          heightClass={cfg.bottom.heightClass}
          rotateClass={cfg.bottom.rotateClass}
          positionClasses={cfg.bottom.positionClasses}
          label="PLATE III"
          code="NOC/THERM-TRACE/009"
        />
      )}

      <TypeFragments variant={variant} />

      {cfg.extras?.impactRibbon && <ImpactRibbon />}
      {cfg.showStamp && <OfficialStamp subtle={cfg.stampSubtle} position={cfg.stampPosition} />}
      {cfg.extras?.blackoutVignette && <BlackoutVignette />}

      {/* Scratches overlay */}
      <img
        src="/images/scratches.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-screen"
        style={{ opacity: scratchOpacity }}
      />
    </div>
  )
}

export function LayerImage({
  src,
  alt,
  widthClass,
  heightClass,
  rotateClass = "",
  positionClasses = "",
  label,
  code,
}: LayerImageProps) {
  return (
    <figure
      className={cn(
        "absolute",
        positionClasses,
        rotateClass,
        widthClass,
        heightClass,
        "shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_60px_rgba(0,0,0,0.6)]",
      )}
    >
      <div className="relative w-full h-full rounded-md bg-zinc-100/95 text-zinc-900 ring-1 ring-black/10 shadow-[0_10px_35px_rgba(0,0,0,0.55)] flex flex-col items-center pt-4 pb-4">
        <div className="relative w-[85%] aspect-[4/3] overflow-hidden rounded-[4px] border border-zinc-300 bg-black/90">
          <Image
            src={src || "/placeholder.svg"}
            alt={alt}
            fill
            sizes="280px"
            className="object-cover grayscale contrast-125 brightness-95"
            priority
          />
        </div>

        <figcaption className="mt-3 flex flex-col items-center gap-1 px-4 text-center">
          <span className="text-[11px] tracking-[0.25em] uppercase text-zinc-700">{label}</span>
          <span className="text-[10px] font-mono tracking-widest text-zinc-500">{code}</span>
        </figcaption>
      </div>
    </figure>
  )
}

export function TypeFragments({ variant = "recon" }: { variant?: Variant }) {
  const level = VARIANT_CONFIG[variant].typeLevel

  return (
    <>
      {level === "dense" && (
        <div className="pointer-events-none absolute left-2 top-24 rotate-180 origin-top-left" aria-hidden="true">
          <p className="rotate-180 whitespace-pre text-[12px] leading-4 tracking-[0.35em] text-zinc-400">
            {"観測報告書 // 指揮系統 // 暗号化記録 // 未確認物体\n夜間行動記録 // 機密扱い"}
          </p>
        </div>
      )}

      {(level === "dense" || level === "minimal") && (
        <div className="pointer-events-none absolute right-6 top-8 text-right">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">AFTER-ACTION REPORT</div>
          <div className="mt-1 text-xs font-mono uppercase tracking-[0.25em] text-zinc-300">FILE: AAR-47/Θ-REDLINE</div>
          <div className="mt-1 text-[10px] font-mono text-zinc-500">REF: SIGINT-Δ / IMG-SEC-12</div>
        </div>
      )}

      <div className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2">
        <div
          className={cn(
            "text-[10px] font-mono tracking-[0.25em]",
            level === "blackout" ? "text-zinc-600" : "text-zinc-400",
          )}
        >
          LOC: 35.6895° N / 139.6917° E // ALT: 0.15km
        </div>
      </div>

      {level === "dense" && (
        <div className="pointer-events-none absolute left-1/2 top-[58%] -translate-x-1/2 bg-white/0 px-2">
          <div className="text-[10px] font-mono text-zinc-400">Σ: 7F:22:AC:19 · QNH 1013 · VIS 2.1</div>
        </div>
      )}

      {(level === "dense" || level === "minimal") && (
        <div
          className={cn(
            "pointer-events-none absolute",
            variant === "impact" ? "right-8 top-1/4 -rotate-2" : "right-12 top-1/3 rotate-3",
          )}
        >
          <div className="border border-zinc-600 px-2 py-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-zinc-200">
              CONFIDENTIAL // EYES ONLY
            </span>
          </div>
        </div>
      )}

      {level === "dense" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex items-center justify-between px-6">
          <div className="h-px w-[48%] bg-gradient-to-r from-white/30 to-transparent" />
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400">DOC-ID: 9X-77-ALPHA</div>
          <div className="h-px w-[28%] bg-gradient-to-l from-white/30 to-transparent" />
        </div>
      )}

      {level === "blackout" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-10 flex items-center justify-center">
          <div className="rounded-sm bg-white/5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 ring-1 ring-white/10">
            DOC: 9X-77-ALPHA
          </div>
        </div>
      )}
    </>
  )
}

export function OfficialStamp({
  subtle = false,
  position = "bottom-right",
}: {
  subtle?: boolean
  position?: "bottom-right" | "top-left"
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute text-right",
        position === "top-left" ? "left-6 top-6 text-left" : "right-6 bottom-6 text-right",
      )}
    >
      <div className="relative inline-block">
        <img
          src="/images/stamp.jpg"
          alt="Official classified stamp"
          className={cn(
            "h-24 w-24 rotate-[-12deg] select-none mix-blend-multiply",
            subtle ? "opacity-40" : "opacity-80",
          )}
        />
        <div className={cn("absolute right-1", position === "top-left" ? "-bottom-3 left-1 right-auto" : "-bottom-3")}>
          <span className="rounded-sm bg-white/5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.35em] text-zinc-300 ring-1 ring-white/10">
            DATE: 1972-11-03Z
          </span>
        </div>
      </div>
    </div>
  )
}

function ImpactRibbon() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-[-12%] top-[46%] z-30 w-[124%] -rotate-8">
      <div className="flex items-center justify-center border-y border-white/20 bg-white/15 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset]">
        <span className="text-[12px] font-mono uppercase tracking-[0.6em] text-zinc-100">
          CONTACT REPORT // SEVERITY: HIGH // RADIO TRAFFIC: SATURATED
        </span>
      </div>
    </div>
  )
}

function BlackoutVignette() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.85) 100%)",
        mixBlendMode: "multiply",
      }}
    />
  )
}
