import type { Meta } from '@storybook/nextjs'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

const meta = {
  title: 'UI/Drawer',
  component: Drawer,
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
} satisfies Meta<typeof Drawer>

export default meta

export const BottomActionTray = {
  render: () => (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Drawer>
        <DrawerTrigger asChild>
          <Button>Open findings drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-2xl">
            <DrawerHeader>
              <DrawerTitle>Tonight&apos;s scout drop is ready</DrawerTitle>
              <DrawerDescription>
                Review the freshest URLs before sending the digest to the
                operations channel.
              </DrawerDescription>
            </DrawerHeader>
            <div className="grid gap-3 px-4 pb-2 text-sm">
              <div className="rounded-lg border bg-background p-3">
                <p className="font-medium">3 net-new findings</p>
                <p className="text-muted-foreground">
                  Competitor pricing update, hiring surge, and a new security
                  integration landing page.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="font-medium">Delivery route</p>
                <p className="text-muted-foreground">
                  Email digest + #intel-desk webhook in 5 minutes.
                </p>
              </div>
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Hold for review</Button>
              </DrawerClose>
              <Button>Ship the digest</Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  ),
}

export const RightInspector = {
  render: () => (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Drawer direction="right">
        <DrawerTrigger asChild>
          <Button variant="outline">Open side inspector</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Scout filters</DrawerTitle>
            <DrawerDescription>
              Tighten the lane before the next scheduled search fires.
            </DrawerDescription>
          </DrawerHeader>
          <div className="grid gap-3 px-4 pb-2 text-sm">
            <div className="rounded-lg border bg-background p-3">
              <p className="font-medium">Regions</p>
              <p className="text-muted-foreground">North America, UK</p>
            </div>
            <div className="rounded-lg border bg-background p-3">
              <p className="font-medium">Signals</p>
              <p className="text-muted-foreground">
                Pricing, launches, funding mentions
              </p>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Reset</Button>
            </DrawerClose>
            <Button>Apply filters</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  ),
}
