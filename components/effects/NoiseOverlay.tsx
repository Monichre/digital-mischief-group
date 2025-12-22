'use client'

import {memo} from 'react'

/**
 * NoiseOverlay - Adds analog film grain texture across entire viewport
 * Creates warmth and depth in the dark UI aesthetic
 */
export const NoiseOverlay = memo(function NoiseOverlay() {
  // SVG noise pattern for performance (no canvas needed)
  const noiseSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" opacity="1"/>
    </svg>
  `

  const encodedSvg = `data:image/svg+xml;base64,${btoa(noiseSvg)}`

  return (
    <div
      className='pointer-events-none fixed inset-0 z-[9999]'
      style={{
        backgroundImage: `url("${encodedSvg}")`,
        backgroundRepeat: 'repeat',
        opacity: 0.08,
        mixBlendMode: 'soft-light',
      }}
      aria-hidden='true'
    />
  )
})
