import type { Meta, StoryObj } from '@storybook/nextjs'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'UI/Alert Dialog',
  component: AlertDialog,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-muted/30 p-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AlertDialog>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex min-h-[70vh] items-center justify-center">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete scout</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove this scout from the watchlist?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will stop scheduled searches, clear queued notifications,
              and remove the scout from the operator dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep scout active</AlertDialogCancel>
            <AlertDialogAction>Delete permanently</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ),
}

export const OpenPreview: Story = {
  render: () => (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Downgrade to read-only access?</AlertDialogTitle>
          <AlertDialogDescription>
            Active monitors and scouts will pause at the end of the billing
            cycle. Existing dossiers stay intact, but automation shuts down
            until a paid plan is restored.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Stay on Pro</AlertDialogCancel>
          <AlertDialogAction>Confirm downgrade</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
}
