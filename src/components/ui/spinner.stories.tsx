import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
}

export default meta

export const Default = {}

export const Sizes = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner className="size-4" />
      <Spinner className="size-6" />
      <Spinner className="size-8" />
    </div>
  ),
}

export const InButton = {
  render: () => (
    <Button disabled>
      <Spinner className="size-4" />
      Syncing intel
    </Button>
  ),
}
