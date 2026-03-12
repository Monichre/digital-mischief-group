import type { ComponentProps } from 'react'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type SelectTriggerSize = ComponentProps<typeof SelectTrigger>['size']

type WorkflowSelectProps = {
  id: string
  defaultValue?: string
  disabled?: boolean
  placeholder?: string
  size?: SelectTriggerSize
}

function WorkflowSelect({
  id,
  defaultValue,
  disabled = false,
  placeholder = 'Choose a workflow',
  size = 'default',
}: WorkflowSelectProps) {
  return (
    <Select defaultValue={defaultValue} disabled={disabled}>
      <SelectTrigger id={id} className="w-[260px]" size={size}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Discovery</SelectLabel>
          <SelectItem value="extract">Extract</SelectItem>
          <SelectItem value="observe">Observe</SelectItem>
          <SelectItem value="scout">Scout</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Synthesis</SelectLabel>
          <SelectItem value="enrich">Enrich</SelectItem>
          <SelectItem value="agent">Agent session</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
}

export default meta

export const Default = {
  render: () => (
    <div className="w-[280px] space-y-2">
      <Label htmlFor="select-default">Workflow</Label>
      <WorkflowSelect id="select-default" />
      <p className="text-muted-foreground text-sm">
        Compact selector for routing operators into the right primitive.
      </p>
    </div>
  ),
}

export const PreselectedValue = {
  render: () => (
    <div className="w-[280px] space-y-2">
      <Label htmlFor="select-preselected">Follow-up action</Label>
      <WorkflowSelect id="select-preselected" defaultValue="observe" />
      <p className="text-muted-foreground text-sm">
        Demonstrates the selected state after a workflow has already been chosen.
      </p>
    </div>
  ),
}

export const SizesAndStates = {
  render: () => (
    <div className="grid gap-5">
      <div className="space-y-2">
        <Label htmlFor="select-small">Compact trigger</Label>
        <WorkflowSelect
          id="select-small"
          size="sm"
          defaultValue="extract"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="select-default-size">Default trigger</Label>
        <WorkflowSelect id="select-default-size" defaultValue="agent" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="select-disabled">Disabled state</Label>
        <WorkflowSelect id="select-disabled" disabled defaultValue="scout" />
      </div>
    </div>
  ),
}
