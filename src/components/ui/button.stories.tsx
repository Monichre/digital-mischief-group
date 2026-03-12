import {
  ArrowUpRight,
  LoaderCircle,
  Radar,
  ShieldAlert,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Run extract',
    variant: 'default',
    size: 'default',
  },
}

export default meta

export const Default = {}

export const Variants = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link action</Button>
    </div>
  ),
}

export const Sizes = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Run radar sweep">
        <Radar className="size-4" />
      </Button>
      <Button size="icon-sm" aria-label="Run compact radar sweep">
        <Radar className="size-4" />
      </Button>
      <Button size="icon-lg" aria-label="Run expanded radar sweep">
        <Radar className="size-5" />
      </Button>
    </div>
  ),
}

export const OperationalStates = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>
        <Radar className="size-4" />
        Search web
      </Button>
      <Button variant="secondary" disabled>
        <LoaderCircle className="size-4 animate-spin" />
        Running
      </Button>
      <Button variant="destructive">
        <ShieldAlert className="size-4" />
        Escalate
      </Button>
      <Button variant="link">
        View dossier
        <ArrowUpRight className="size-4" />
      </Button>
    </div>
  ),
}
