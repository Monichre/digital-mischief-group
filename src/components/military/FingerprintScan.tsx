"use client"

import { motion, useMotionValue, animate, useTransform } from "framer-motion"

export interface FingerprintScanProps {
  duration?: number
  onComplete?: () => void
}

const FINGERPRINT_PATH =
  "M78.99 70.384c6.128-1.642 12.427 1.994 14.068 8.122a179.609 179.609 0 0 1 4.733 24.151m-91.563 8.777a87.148 87.148 0 0 0-1.933-9.144 82.29 82.29 0 0 1-.597-2.367m80.861-7.248a169.016 169.016 0 0 0-2.596-11.196m.737 83.493a166.01 166.01 0 0 0 2.082-9.463m1.014-5.935a165.476 165.476 0 0 0-.156-50.796m3.04 65.929a171.42 171.42 0 0 0 3.707-21.21m-4.51-62.116c-.12-.463-.242-.926-.366-1.388a5.743 5.743 0 0 0-11.096 2.973 161.908 161.908 0 0 1 4.794 26.513m11.731 28.073c1.251-16.583.101-33.598-3.713-50.587m-12.402 77.797a159.741 159.741 0 0 0 4.842-49.311m-10.6 48.624c.515-1.949.993-3.911 1.433-5.884m1.108-5.434a153.991 153.991 0 0 0 1.272-48.123m-.905-6a157.03 157.03 0 0 0-3.107-14.182 11.48 11.48 0 0 1 2.778-10.899m21.083 90.519a177.255 177.255 0 0 0 2.664-14.383m.73-5.796a176.735 176.735 0 0 0 .323-35.168m2.452 54.046a182.553 182.553 0 0 0 3.914-31.968m.102-6.27c-.014-15.691-2.054-31.638-6.308-47.514a17.15 17.15 0 0 0-5.496-8.68M88.3 65.455a17.153 17.153 0 0 0-10.797-.62c-8.725 2.338-14.083 10.969-12.499 19.7m.386 78.533a148.503 148.503 0 0 0 4.893-31.487m.16-6.137a149.259 149.259 0 0 0-4.101-35.47m-6.501 71.608a143.02 143.02 0 0 0 3.746-19.139m.648-6.268c1.292-15.957-.083-32.402-4.464-48.751a22.867 22.867 0 0 1 .398-13.226m2.799-5.644a22.884 22.884 0 0 1 13.048-9.267c9.08-2.433 18.346.928 23.875 7.817m3.004 4.9a23.16 23.16 0 0 1 1.258 3.528 192.094 192.094 0 0 1 3.225 14.15m-.275 71.426c.215-1.094.421-2.189.617-3.288m1.027-6.369a188.324 188.324 0 0 0-.342-55.801m4.97 63.182a193.99 193.99 0 0 0 1.976-13.956m-5.176-69.025c-.155-.602-.313-1.204-.474-1.806-2.261-8.436-8.053-14.984-15.359-18.48m21.556 83.118c1.351-18.682.014-37.84-4.305-56.969M88.679 53.553a28.59 28.59 0 0 0-14.148.187c-12.36 3.312-20.667 14.203-21.258 26.333m.3 5.743c.159 1.031.375 2.064.651 3.096a138.813 138.813 0 0 1 4.037 21.988 136.805 136.805 0 0 1-.851 34.281m-2.99 14.436a137.594 137.594 0 0 0 1.96-8.525m-7.342 6.399a131.369 131.369 0 0 0 4.034-26.797m.139-5.983a131.735 131.735 0 0 0-2.918-30.197"

export default function FingerprintScan({ duration = 3, onComplete }: FingerprintScanProps) {
  const progress = useMotionValue(0)
  const pathLength = useTransform(progress, [0, 1], [80, 0])

  const handleStart = () => {
    const animation = animate(progress, 1, {
      duration,
      ease: "linear",
      onComplete,
    })

    const handleEnd = () => {
      animation.stop()
      animate(progress, 0, { duration: 0.35 })
    }

    window.addEventListener("mouseup", handleEnd, { once: true })
    window.addEventListener("touchend", handleEnd, { once: true })
    window.addEventListener("touchcancel", handleEnd, { once: true })
  }

  return (
    <div className="relative w-48 h-48 rounded-full flex items-center justify-center touch-none">
      {/* Fingerprint SVG */}
      <motion.svg
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onTouchMove={(e) => e.preventDefault()}
        width="120"
        height="120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 164 164"
        className="cursor-pointer select-none"
        style={{ WebkitTapHighlightColor: "transparent", WebkitTouchCallout: "none" }}
      >
        {/* Base fingerprint path (dark) */}
        <path d={FINGERPRINT_PATH} stroke="#064e3b" strokeWidth="2" strokeLinecap="round" />
        {/* Animated fill path (emerald glow) */}
        <motion.path
          d={FINGERPRINT_PATH}
          stroke="#34d399"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="80 80"
          style={{ strokeDashoffset: pathLength }}
        />
      </motion.svg>

      {/* Glow overlay */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          boxShadow: "0 0 30px rgba(52,211,153,0.4), 0 0 100px rgba(52,211,153,0.3)",
          background:
            "radial-gradient(50% 50% at 50% 50%, transparent 85%, rgba(52,211,153,0.18) 96%, rgba(255,255,255,0.8) 98%, rgba(52,211,153,0.2) 100%), rgba(52,211,153,0.15)",
        }}
      />
    </div>
  )
}
