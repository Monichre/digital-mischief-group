import type { Meta, StoryObj } from '@storybook/nextjs'

import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const meta = {
  title: 'UI/Field',
  component: Field,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Field>

export default meta

type Story = StoryObj<typeof meta>

export const VerticalFields: Story = {
  render: () => (
    <FieldSet className='w-[560px]'>
      <FieldLegend>Target research intake</FieldLegend>
      <Field>
        <FieldLabel htmlFor='company'>Company domain</FieldLabel>
        <FieldContent>
          <Input id='company' placeholder='linear.app' />
          <FieldDescription>
            Enter a domain to build a structured company dossier.
          </FieldDescription>
        </FieldContent>
      </Field>
      <Field>
        <FieldLabel htmlFor='notes'>Mission notes</FieldLabel>
        <FieldContent>
          <Textarea
            id='notes'
            rows={4}
            placeholder='What do you want the operator to focus on?'
          />
          <FieldDescription>
            These notes are included in the operator handoff.
          </FieldDescription>
        </FieldContent>
      </Field>
    </FieldSet>
  ),
}

export const GroupedChecklist: Story = {
  render: () => (
    <FieldGroup className='w-[560px]'>
      <FieldSet>
        <FieldLegend variant='label'>Monitoring policy</FieldLegend>
        <Field orientation='horizontal'>
          <Checkbox id='pricing-alerts' defaultChecked />
          <FieldContent>
            <FieldLabel htmlFor='pricing-alerts'>Pricing alerts</FieldLabel>
            <FieldDescription>
              Escalate immediately when packaging or pricing shifts.
            </FieldDescription>
          </FieldContent>
        </Field>
        <Field orientation='horizontal'>
          <Checkbox id='team-alerts' />
          <FieldContent>
            <FieldLabel htmlFor='team-alerts'>Team page changes</FieldLabel>
            <FieldDescription>
              Batch low-signal people-page edits into the daily digest.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldSet>
      <FieldSeparator>Escalation</FieldSeparator>
      <Field>
        <FieldTitle>Slack destination</FieldTitle>
        <FieldContent>
          <Input defaultValue='#intel-desk' />
          <FieldError errors={[{ message: 'Webhook token needs rotation.' }]} />
        </FieldContent>
      </Field>
    </FieldGroup>
  ),
}
