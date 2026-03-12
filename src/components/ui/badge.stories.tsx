import { CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Mission ready',
    variant: 'default',
  },
}

export default meta

export const Default = {}

export const Variants = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
}

export const WithIcons = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge>
        <CheckCircle2 className="size-3" />
        Verified
      </Badge>
      <Badge variant="secondary">
        <Sparkles className="size-3" />
        New signal
      </Badge>
      <Badge variant="destructive">
        <ShieldAlert className="size-3" />
        Escalated
      </Badge>
    </div>
  ),
}
