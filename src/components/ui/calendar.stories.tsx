import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { addDays, format } from 'date-fns'

import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const REVIEW_DATE = new Date(2026, 2, 12)
const RANGE_START = new Date(2026, 2, 16)
const RANGE_END = addDays(RANGE_START, 4)

const meta = {
  title: 'UI/Calendar',
  component: Calendar,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Calendar>

export default meta

type Story = StoryObj<typeof meta>

function CalendarFrame({
  badge,
  title,
  description,
  children,
}: {
  badge: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card className="w-fit min-w-[320px]">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{badge}</Badge>
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">{children}</CardContent>
    </Card>
  )
}

export const SingleSelection: Story = {
  render: function Render() {
    const [selected, setSelected] = React.useState<Date | undefined>(REVIEW_DATE)

    return (
      <CalendarFrame
        badge="Single select"
        title="Analyst scheduling"
        description="Review the base calendar treatment, selected day state, and supporting status copy in one compact surface."
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          defaultMonth={REVIEW_DATE}
        />
        <p className="text-muted-foreground text-sm">
          {selected
            ? `Selected review window: ${format(selected, 'MMMM d, yyyy')}`
            : 'No review window selected.'}
        </p>
      </CalendarFrame>
    )
  },
}

export const RangePlanningView: Story = {
  render: () => (
    <CalendarFrame
      badge="Range select"
      title="Multi-day monitoring window"
      description="Shows dual-month layout, week numbers, and outline navigation for planning an observe run across several days."
    >
      <Calendar
        mode="range"
        defaultMonth={RANGE_START}
        selected={{ from: RANGE_START, to: RANGE_END }}
        numberOfMonths={2}
        showWeekNumber
        fixedWeeks
        buttonVariant="outline"
      />
      <p className="text-muted-foreground text-sm">
        Scheduled sweep: {format(RANGE_START, 'MMM d')} –{' '}
        {format(RANGE_END, 'MMM d, yyyy')}
      </p>
    </CalendarFrame>
  ),
}

export const CaptionModes: Story = {
  render: () => (
    <div className="grid gap-6 xl:grid-cols-2">
      <CalendarFrame
        badge="Label caption"
        title="Default month label"
        description="Baseline calendar for reviewing spacing, weekday rhythm, and single-month density."
      >
        <Calendar mode="single" defaultMonth={REVIEW_DATE} selected={REVIEW_DATE} />
      </CalendarFrame>

      <CalendarFrame
        badge="Dropdown caption"
        title="Navigation-heavy state"
        description="Adds month and year dropdowns plus disabled weekends to review advanced scheduling controls."
      >
        <Calendar
          mode="single"
          defaultMonth={REVIEW_DATE}
          selected={addDays(REVIEW_DATE, 6)}
          captionLayout="dropdown"
          startMonth={new Date(2024, 0)}
          endMonth={new Date(2027, 11)}
          disabled={[{ dayOfWeek: [0, 6] }]}
          buttonVariant="outline"
          showWeekNumber
        />
      </CalendarFrame>
    </div>
  ),
}
