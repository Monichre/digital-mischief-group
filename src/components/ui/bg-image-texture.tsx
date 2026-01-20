'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type TextureVariant =
  | 'fabric-of-squares'
  | 'grid-noise'
  | 'inflicted'
  | 'debut-light'
  | 'groovepaper'
  | 'none'

type BackgroundImageTextureProps = {
  variant?: TextureVariant
  opacity?: number
  className?: string
  children?: ReactNode
}

const TEXTURE_URLS: Record<Exclude<TextureVariant, 'none'>, string> = {
  'fabric-of-squares':
    'https://www.transparenttextures.com/patterns/fabric-of-squares.png',
  'grid-noise': 'https://www.transparenttextures.com/patterns/grid-noise.png',
  inflicted: 'https://www.transparenttextures.com/patterns/inflicted.png',
  'debut-light':
    'https://www.transparenttextures.com/patterns/debut-light.png',
  groovepaper: 'https://www.transparenttextures.com/patterns/groovepaper.png',
}

export function BackgroundImageTexture({
  variant = 'fabric-of-squares',
  opacity = 0.5,
  className,
  children,
}: BackgroundImageTextureProps) {
  const textureUrl = variant !== 'none' ? TEXTURE_URLS[variant] : null

  return (
    <div className={cn('relative', className)}>
      {textureUrl && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${textureUrl})`,
            opacity,
          }}
        />
      )}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  )
}
