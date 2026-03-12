import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  args: {
    type: 'text',
    placeholder: 'Search company domain',
    className: 'w-[360px]',
  },
}

export default meta

export const Default = {}

export const FormStates = {
  render: () => (
    <div className="grid w-[420px] gap-5">
      <div className="space-y-2">
        <Label htmlFor="input-default-state">Search term</Label>
        <Input
          id="input-default-state"
          placeholder="ai competitor alerts"
        />
        <p className="text-muted-foreground text-sm">
          Default field state for queries, domains, and operator notes.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="input-invalid-state">Target URL</Label>
        <Input
          id="input-invalid-state"
          aria-invalid
          defaultValue="not-a-valid-url"
        />
        <p className="text-destructive text-sm">
          Enter a valid URL beginning with https://
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="input-disabled-state">Workspace ID</Label>
        <Input
          id="input-disabled-state"
          defaultValue="dmg-alpha"
          disabled
        />
      </div>
    </div>
  ),
}

export const InputTypes = {
  render: () => (
    <div className="grid w-[420px] gap-5">
      <div className="space-y-2">
        <Label htmlFor="input-email">Operator email</Label>
        <Input
          id="input-email"
          type="email"
          placeholder="lead@digitalmischief.group"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="input-password">Access token</Label>
        <Input
          id="input-password"
          type="password"
          defaultValue="hunter2hunter2"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="input-search">Search query</Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="input-search"
            type="search"
            placeholder="Find new AI infrastructure startups"
            className="pl-9"
          />
        </div>
      </div>
    </div>
  ),
}

export const FileUpload = {
  render: () => (
    <div className="w-[420px] space-y-2">
      <Label htmlFor="input-file">Attach source file</Label>
      <Input id="input-file" type="file" />
      <p className="text-muted-foreground text-sm">
        Useful for reviewing the built-in file input styling and spacing.
      </p>
    </div>
  ),
}
