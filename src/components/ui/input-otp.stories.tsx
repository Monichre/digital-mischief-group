import { useState } from 'react'
import type { Meta } from '@storybook/nextjs'

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'

function SixDigitOtpDemo() {
  const [value, setValue] = useState('482913')

  return (
    <div className='space-y-4'>
      <InputOTP maxLength={6} value={value} onChange={setValue}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <p className='text-muted-foreground text-sm'>
        Current code: <span className='font-mono'>{value}</span>
      </p>
    </div>
  )
}

function EmptyOtpDemo() {
  const [value, setValue] = useState('')

  return (
    <InputOTP maxLength={4} value={value} onChange={setValue}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  )
}

const meta = {
  title: 'UI/Input OTP',
  component: InputOTP,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof InputOTP>

export default meta

export const Default = {
  render: () => <SixDigitOtpDemo />,
}

export const EmptyState = {
  render: () => <EmptyOtpDemo />,
}
