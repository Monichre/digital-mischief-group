'use client'

import type {BrandComponents, BrandColors} from '@/daedalus/extract/brand/types'

interface ComponentPreviewProps {
  components?: BrandComponents
  colors?: BrandColors
}

export function ComponentPreview({components, colors}: ComponentPreviewProps) {
  // Extract button patterns from generic buttons record
  const buttonPatterns = components?.buttons
    ? Object.entries(components.buttons)
    : []
  const primaryButton = buttonPatterns.find(([key]) =>
    key.toLowerCase().includes('primary')
  )?.[1]
  const secondaryButton = buttonPatterns.find(([key]) =>
    key.toLowerCase().includes('secondary')
  )?.[1]

  // Extract input patterns from generic inputs record
  const inputPatterns = components?.inputs
    ? Object.entries(components.inputs)
    : []
  const defaultInput = inputPatterns[0]?.[1]

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
          UI Components
        </span>
      </div>

      {/* Buttons */}
      {(buttonPatterns.length > 0 || colors) && (
        <div className='mb-8'>
          <div className='text-[10px] uppercase tracking-wider text-zinc-600 mb-4'>
            Button Styles
          </div>
          <div className='flex flex-wrap gap-4'>
            {/* Primary Button */}
            <div className='space-y-2'>
              <button
                className='px-6 py-3 text-sm font-medium transition-all'
                style={{
                  backgroundColor:
                    primaryButton?.background || colors?.primary || '#f97316',
                  color:
                    primaryButton?.textColor ||
                    primaryButton?.color ||
                    '#ffffff',
                  borderRadius: primaryButton?.borderRadius || '0px',
                }}
              >
                Primary Button
              </button>
              <div className='text-[10px] text-zinc-600'>
                {primaryButton?.background || colors?.primary || 'N/A'}
              </div>
            </div>

            {/* Secondary Button */}
            <div className='space-y-2'>
              <button
                className='px-6 py-3 text-sm font-medium border transition-all'
                style={{
                  backgroundColor: secondaryButton?.background || 'transparent',
                  color:
                    secondaryButton?.textColor ||
                    secondaryButton?.color ||
                    colors?.primary ||
                    '#f97316',
                  borderColor:
                    secondaryButton?.borderColor ||
                    colors?.primary ||
                    '#f97316',
                  borderRadius: secondaryButton?.borderRadius || '0px',
                }}
              >
                Secondary Button
              </button>
              <div className='text-[10px] text-zinc-600'>
                {secondaryButton?.borderColor || colors?.primary || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      {(defaultInput || colors) && (
        <div className='mb-8'>
          <div className='text-[10px] uppercase tracking-wider text-zinc-600 mb-4'>
            Input Field
          </div>
          <input
            type='text'
            placeholder='Input placeholder...'
            className='w-full max-w-sm px-4 py-3 text-sm border outline-none transition-all'
            style={{
              backgroundColor:
                defaultInput?.background || colors?.background || '#18181b',
              color:
                defaultInput?.textColor ||
                defaultInput?.color ||
                colors?.textPrimary ||
                '#ffffff',
              borderColor:
                defaultInput?.borderColor || colors?.secondary || '#3f3f46',
              borderRadius: defaultInput?.borderRadius || '0px',
            }}
          />
        </div>
      )}

      {/* Color Scheme Preview */}
      {colors && (
        <div>
          <div className='text-[10px] uppercase tracking-wider text-zinc-600 mb-4'>
            Semantic Colors
          </div>
          <div className='flex gap-3'>
            {colors.success && (
              <div className='flex items-center gap-2'>
                <div
                  className='w-4 h-4 rounded-full'
                  style={{backgroundColor: colors.success}}
                />
                <span className='text-[10px] text-zinc-500'>Success</span>
              </div>
            )}
            {colors.warning && (
              <div className='flex items-center gap-2'>
                <div
                  className='w-4 h-4 rounded-full'
                  style={{backgroundColor: colors.warning}}
                />
                <span className='text-[10px] text-zinc-500'>Warning</span>
              </div>
            )}
            {colors.error && (
              <div className='flex items-center gap-2'>
                <div
                  className='w-4 h-4 rounded-full'
                  style={{backgroundColor: colors.error}}
                />
                <span className='text-[10px] text-zinc-500'>Error</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
