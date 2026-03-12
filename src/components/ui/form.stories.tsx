import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { useForm } from 'react-hook-form'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type IntakeValues = {
  email: string
  notes: string
}

function IntakeForm({ withError = false }: { withError?: boolean }) {
  const form = useForm<IntakeValues>({
    defaultValues: {
      email: 'ops@digitalmischief.group',
      notes: 'Track competitor pricing, homepage framing, and launch motion.',
    },
  })

  useEffect(() => {
    if (!withError) {
      return
    }

    form.setError('email', {
      type: 'manual',
      message: 'Operator email must belong to an approved domain.',
    })
  }, [form, withError])

  return (
    <Form {...form}>
      <form className='grid w-[560px] gap-6'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operator email</FormLabel>
              <FormControl>
                <Input placeholder='ops@company.com' {...field} />
              </FormControl>
              <FormDescription>
                Delivery notifications and analyst escalations will route here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='notes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mission notes</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormDescription>
                Use this space to bias the run toward pricing, product, or brand signals.
              </FormDescription>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

const meta = {
  title: 'UI/Form',
  component: FormItem,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof FormItem>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <IntakeForm />,
}

export const WithValidationError: Story = {
  render: () => <IntakeForm withError />,
}
