'use client'

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'

type ToastExampleProps = {
  variant?: 'default' | 'destructive'
}

function ToastExample({ variant = 'default' }: ToastExampleProps) {
  const copy =
    variant === 'destructive'
      ? {
          title: 'Scout run failed',
          description: 'Quota was exhausted before the search finished.',
          action: 'Review limits',
        }
      : {
          title: 'Brand extraction complete',
          description:
            'Logos, colors, and voice notes are ready for review.',
          action: 'Open report',
        }

  return (
    <div className="min-h-[240px] bg-background p-6">
      <ToastProvider duration={60000} swipeDirection="right">
        <Toast defaultOpen variant={variant}>
          <div className="grid gap-1">
            <ToastTitle>{copy.title}</ToastTitle>
            <ToastDescription>{copy.description}</ToastDescription>
          </div>
          <ToastAction altText={copy.action}>{copy.action}</ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport className="sm:top-0 sm:bottom-auto" />
      </ToastProvider>
    </div>
  )
}

const meta = {
  title: 'UI/Toast',
  component: Toast,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

export const Default = {
  render: () => <ToastExample />,
}

export const Destructive = {
  render: () => <ToastExample variant="destructive" />,
}
