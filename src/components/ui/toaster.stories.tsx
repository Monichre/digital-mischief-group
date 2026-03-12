'use client'

import { Button } from '@/components/ui/button'
import { ToastAction } from '@/components/ui/toast'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/hooks/use-toast'

function ToasterDemo() {
  return (
    <div className="min-h-[260px] bg-background p-6">
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() =>
            toast({
              title: 'Deployment complete',
              description: 'Observe is now tracking 3 live targets.',
            })
          }
        >
          Open toast
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast({
              variant: 'destructive',
              title: 'Run failed',
              description: 'Scout quota reached for this workspace.',
              action: (
                <ToastAction altText="Review limits">
                  Review limits
                </ToastAction>
              ),
            })
          }
        >
          Open destructive toast
        </Button>
      </div>
      <Toaster />
    </div>
  )
}

const meta = {
  title: 'UI/Toaster',
  component: Toaster,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

export const Interactive = {
  render: () => <ToasterDemo />,
}
