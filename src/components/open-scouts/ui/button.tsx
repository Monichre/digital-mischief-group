import {ButtonHTMLAttributes, forwardRef} from 'react'

import {cn} from '@/lib/utils'

import './button.css'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'playground' | 'destructive'
  size?: 'default' | 'large'
  disabled?: boolean
  loadingLabel?: string
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      variant = 'primary',
      size = 'default',
      disabled,
      isLoading = false,
      loadingLabel = 'Loading...',
      ...attrs
    },
    ref
  ) => {
    const isNonInteractive = Boolean(disabled || isLoading)

    const focusRing =
      variant === 'primary' || variant === 'destructive'
        ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white'
        : 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black'

    return (
      <button
        {...attrs}
        ref={ref}
        type={attrs.type ?? 'button'}
        aria-disabled={isNonInteractive || undefined}
        aria-busy={isLoading || undefined}
        aria-live={isLoading ? 'polite' : undefined}
        data-state={
          isLoading ? 'loading' : isNonInteractive ? 'disabled' : 'idle'
        }
        className={cn(
          attrs.className,
          'flex items-center justify-center button relative [&>*]:relative cursor-pointer',
          'text-label-medium lg-max:[&_svg]:size-[24px]',
          `button-${variant} group/button`,
          focusRing,
          'disabled:cursor-not-allowed',
          isNonInteractive && 'cursor-not-allowed',
          size === 'default' && 'rounded-[8px] px-[10px] py-[6px] gap-[4px]',
          size === 'large' && 'rounded-[10px] px-[12px] py-[8px] gap-[6px]',
          variant === 'primary' && [
            'text-accent-white',
            !isNonInteractive &&
              'hover:bg-[color:var(--heat-90)] active:[scale:0.995]',
            'disabled:opacity-80',
            'disabled:[&_.button-background]:opacity-70',
          ],
          ['secondary', 'tertiary', 'playground'].includes(variant) && [
            'text-accent-black',
            !isNonInteractive &&
              'active:[scale:0.99] active:bg-[color:var(--black-alpha-7)]',
          ],
          variant === 'secondary' && [
            'bg-[color:var(--black-alpha-4)]',
            !isNonInteractive && 'hover:bg-[color:var(--black-alpha-6)]',
            'disabled:bg-[color:var(--black-alpha-3)]',
            'disabled:text-[color:var(--black-alpha-48)]',
            'disabled:hover:bg-[color:var(--black-alpha-3)]',
          ],
          variant === 'tertiary' && [
            !isNonInteractive && 'hover:bg-[color:var(--black-alpha-4)]',
            'disabled:text-[color:var(--black-alpha-48)]',
            'disabled:hover:bg-transparent',
          ],
          variant === 'destructive' && [
            'bg-red-600 text-accent-white',
            !isNonInteractive && 'hover:bg-red-700 active:scale-[0.98]',
            'disabled:bg-red-600/70',
            'disabled:text-[color:var(--white-alpha-72)]',
            'disabled:hover:bg-red-600/70',
          ],
          variant === 'playground' && [
            'before:inside-border before:border-[color:var(--black-alpha-4)]',
            isNonInteractive
              ? 'before:opacity-0 bg-[color:var(--black-alpha-4)] text-black-alpha-24'
              : 'hover:bg-[color:var(--black-alpha-4)] hover:before:opacity-0 active:before:opacity-0',
          ]
        )}
        disabled={isNonInteractive}
      >
        {variant === 'primary' && (
          <div className='overlay button-background !absolute' />
        )}

        {isLoading && (
          <div
            className={cn(
              'w-[16px] h-[16px] border-2 rounded-full animate-spin',
              variant === 'primary' || variant === 'destructive'
                ? 'border-white/30 border-t-white'
                : 'border-black/30 border-t-black'
            )}
            aria-hidden
          />
        )}

        {isLoading && <span className='sr-only'>{loadingLabel}</span>}

        {attrs.children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
