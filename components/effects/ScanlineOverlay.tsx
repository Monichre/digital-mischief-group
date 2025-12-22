'use client'

import {memo} from 'react'

/**
 * ScanlineOverlay - CRT scanline effect for retro-tech atmosphere
 * Subtle horizontal lines that reinforce the military/terminal aesthetic
 */
export const ScanlineOverlay = memo(function ScanlineOverlay() {
  return (
    <>
      {/* Static scanlines */}
      <div
        className='pointer-events-none fixed inset-0 z-[9998]'
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 1px,
            rgba(0, 0, 0, 0.15) 1px,
            rgba(0, 0, 0, 0.15) 2px
          )`,
        }}
        aria-hidden='true'
      />

      {/* Animated scan beam - subtle moving line */}
      <div
        className='pointer-events-none fixed inset-0 z-[9997] overflow-hidden'
        aria-hidden='true'
      >
        <div
          className='absolute left-0 right-0 h-[3px] animate-scan-beam'
          style={{
            background:
              'linear-gradient(90deg, transparent 10%, rgba(249, 115, 22, 0.15) 50%, transparent 90%)',
            boxShadow: '0 0 20px rgba(249, 115, 22, 0.3)',
          }}
        />
      </div>
    </>
  )
})
