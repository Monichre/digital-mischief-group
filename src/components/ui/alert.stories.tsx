import { CircleAlert, ShieldAlert } from 'lucide-react'

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  subcomponents: {
    AlertTitle,
    AlertDescription,
  },
}

export default meta

export const Default = {
  render: () => (
    <div className="w-[420px]">
      <Alert>
        <CircleAlert className="size-4" />
        <AlertTitle>Observe is watching this page</AlertTitle>
        <AlertDescription>
          Change detection is active and will summarize meaningful diffs
          for the team.
        </AlertDescription>
      </Alert>
    </div>
  ),
}

export const Destructive = {
  render: () => (
    <div className="w-[420px]">
      <Alert variant="destructive">
        <ShieldAlert className="size-4" />
        <AlertTitle>Monitor paused</AlertTitle>
        <AlertDescription>
          Daedalus could not refresh the target URL. Reauthenticate or
          retry the job.
        </AlertDescription>
      </Alert>
    </div>
  ),
}
