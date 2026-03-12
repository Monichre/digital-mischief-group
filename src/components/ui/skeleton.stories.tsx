import { Skeleton } from '@/components/ui/skeleton'

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  args: {
    className: 'h-4 w-48',
  },
}

export default meta

export const Default = {}

export const TextBlock = {
  render: () => (
    <div className="w-72 space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[92%]" />
      <Skeleton className="h-4 w-[76%]" />
    </div>
  ),
}

export const CardPlaceholder = {
  render: () => (
    <div className="w-[320px] space-y-4 rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  ),
}
