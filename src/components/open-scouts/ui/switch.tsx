'use client'

import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import {cva, type VariantProps} from 'class-variance-authority'

import {cn} from '@/lib/utils'

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--heat-100)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background-base)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[color:var(--heat-100)] data-[state=unchecked]:bg-gray-200',
  {
    variants: {
      size: {
        default: 'h-[24px] w-[44px]',
        sm: 'h-[20px] w-[36px]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

const thumbVariants = cva(
  'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform',
  {
    variants: {
      size: {
        default:
          'h-[20px] w-[20px] data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-0',
        sm: 'h-[16px] w-[16px] data-[state=checked]:translate-x-[16px] data-[state=unchecked]:translate-x-0',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({className, size, ...props}, ref) => (
  <SwitchPrimitives.Root
    className={cn(switchVariants({size, className}))}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb className={cn(thumbVariants({size}))} />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export {Switch}
