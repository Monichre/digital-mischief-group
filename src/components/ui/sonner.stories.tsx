'use client'

import { toast as sonnerToast } from 'sonner'

import { ThemeProvider } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'

function SonnerDemo() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-[260px] bg-background p-6 text-foreground">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() =>
              sonnerToast.success('Profile enrichment complete', {
                description:
                  'Three new sources were attached to the dossier.',
              })
            }
          >
            Success toast
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              sonnerToast.error('Competitive scan failed', {
                description:
                  'Retry after refreshing your API credits.',
              })
            }
          >
            Error toast
          </Button>
        </div>
        <SonnerToaster closeButton richColors />
      </div>
    </ThemeProvider>
  )
}

const meta = {
  title: 'UI/Sonner',
  component: SonnerToaster,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

export const Interactive = {
  render: () => <SonnerDemo />,
}
