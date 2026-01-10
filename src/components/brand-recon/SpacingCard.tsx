'use client'

import type {BrandSpacing} from '@/lib/brand-recon/types'

interface SpacingCardProps {
  spacing?: BrandSpacing
}

export function SpacingCard({spacing}: SpacingCardProps) {
  if (!spacing) return null

  // Parse base unit (e.g., "8px" -> 8)
  const baseUnitValue = spacing.unit
    ? parseInt(spacing.unit.replace(/[^\d]/g, ''))
    : null
  const scaleEntries = spacing.scale ? Object.entries(spacing.scale) : []

  return (
    <div className='border border-zinc-800 bg-zinc-900/30 p-6 relative'>
      {/* Corner Accents */}
      <div className='absolute top-0 left-0 w-3 h-3 border-t border-l border-orange-500/50' />
      <div className='absolute top-0 right-0 w-3 h-3 border-t border-r border-orange-500/50' />
      <div className='absolute bottom-0 left-0 w-3 h-3 border-b border-l border-orange-500/50' />
      <div className='absolute bottom-0 right-0 w-3 h-3 border-b border-r border-orange-500/50' />

      {/* Header */}
      <div className='flex items-center gap-2 mb-6'>
        <div className='w-1 h-4 bg-orange-500' />
        <span className='text-xs uppercase tracking-widest text-zinc-500'>
          Spacing System
        </span>
      </div>

      {/* Base Unit */}
      {spacing.unit && (
        <div className='mb-6'>
          <div className='text-[10px] uppercase tracking-wider text-zinc-600 mb-3'>
            Base Unit
          </div>
          <div className='flex items-center gap-3'>
            {baseUnitValue && (
              <div
                className='bg-orange-500/30 border border-orange-500'
                style={{width: baseUnitValue, height: baseUnitValue}}
              />
            )}
            <span className='text-lg font-mono text-zinc-300'>
              {spacing.unit}
            </span>
          </div>
        </div>
      )}

      {/* Spacing Scale */}
      {scaleEntries.length > 0 && (
        <div className='mb-6'>
          <div className='text-[10px] uppercase tracking-wider text-zinc-600 mb-3'>
            Spacing Scale
          </div>
          <div className='grid grid-cols-4 gap-3'>
            {scaleEntries.slice(0, 8).map(([key, value]) => (
              <div key={key} className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <div
                    className='bg-orange-500/30 border border-orange-500'
                    style={{
                      width: '100%',
                      height: parseInt(value.replace(/[^\d]/g, '')) || 8,
                      maxHeight: '48px',
                    }}
                  />
                </div>
                <div className='text-[9px] text-zinc-500'>
                  <div className='font-mono text-orange-500/70'>{key}</div>
                  <div className='text-zinc-600'>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spacing Scale Visual (if we have base unit) */}
      {baseUnitValue && (
        <div className='mt-6'>
          <div className='text-[10px] uppercase tracking-wider text-zinc-600 mb-3'>
            Unit Multipliers
          </div>
          <div className='flex items-end gap-2'>
            {[1, 2, 3, 4, 6, 8].map((multiplier) => (
              <div
                key={multiplier}
                className='flex flex-col items-center gap-1'
              >
                <div
                  className='bg-gradient-to-t from-orange-500/50 to-orange-500/20 border-t border-orange-500'
                  style={{
                    width: 24,
                    height: baseUnitValue * multiplier,
                  }}
                />
                <span className='text-[9px] text-zinc-600'>
                  {baseUnitValue * multiplier}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
