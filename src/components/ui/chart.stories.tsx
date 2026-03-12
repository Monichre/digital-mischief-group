import { Activity, Radar, ShieldCheck } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const meta = {
  title: 'UI/Chart',
  component: ChartContainer,
  parameters: {
    layout: 'padded',
  },
}

export default meta

const scoutVolumeData = [
  { day: 'Mon', runs: 42, findings: 12 },
  { day: 'Tue', runs: 38, findings: 9 },
  { day: 'Wed', runs: 51, findings: 17 },
  { day: 'Thu', runs: 47, findings: 15 },
  { day: 'Fri', runs: 58, findings: 21 },
  { day: 'Sat', runs: 31, findings: 8 },
]

const monitorLatencyData = [
  { window: '00:00', fetchDiff: 2.2, summary: 4.8 },
  { window: '04:00', fetchDiff: 2.4, summary: 5.1 },
  { window: '08:00', fetchDiff: 2.8, summary: 5.5 },
  { window: '12:00', fetchDiff: 2.6, summary: 5.0 },
  { window: '16:00', fetchDiff: 3.1, summary: 6.2 },
  { window: '20:00', fetchDiff: 2.7, summary: 5.4 },
]

const scoutVolumeConfig = {
  runs: {
    label: 'Search runs',
    color: 'var(--color-chart-1)',
    icon: Radar,
  },
  findings: {
    label: 'Net-new findings',
    color: 'var(--color-chart-2)',
    icon: Activity,
  },
} satisfies ChartConfig

const monitorLatencyConfig = {
  fetchDiff: {
    label: 'Fetch + diff',
    theme: {
      light: 'var(--color-chart-3)',
      dark: 'var(--color-chart-4)',
    },
    icon: Radar,
  },
  summary: {
    label: 'AI summary',
    theme: {
      light: 'var(--color-chart-5)',
      dark: 'var(--color-chart-2)',
    },
    icon: ShieldCheck,
  },
} satisfies ChartConfig

export const GroupedBars = {
  render: () => (
    <div className="w-full max-w-5xl space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Grouped comparison</h3>
        <p className="text-muted-foreground text-sm">
          Review categorical spacing, legend treatment, tooltip chrome, and
          chart color balance for a dashboard-ready summary.
        </p>
      </div>

      <ChartContainer
        className="min-h-[300px] w-full"
        config={scoutVolumeConfig}
      >
        <BarChart accessibilityLayer data={scoutVolumeData}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dashed" />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="runs" fill="var(--color-runs)" radius={[8, 8, 0, 0]} />
          <Bar
            dataKey="findings"
            fill="var(--color-findings)"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  ),
}

export const DualLineTrend = {
  render: () => (
    <div className="w-full max-w-5xl space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Dual-line performance trend</h3>
        <p className="text-muted-foreground text-sm">
          Shows line contrast, theme-aware series colors, and how the shared
          tooltip reads for operational metrics over time.
        </p>
      </div>

      <ChartContainer
        className="min-h-[300px] w-full"
        config={monitorLatencyConfig}
      >
        <LineChart accessibilityLayer data={monitorLatencyData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="window"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${value}m`}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <ChartLegend verticalAlign="top" content={<ChartLegendContent />} />
          <Line
            dataKey="fetchDiff"
            type="monotone"
            stroke="var(--color-fetchDiff)"
            strokeWidth={2.5}
            dot={false}
          />
          <Line
            dataKey="summary"
            type="monotone"
            stroke="var(--color-summary)"
            strokeWidth={2.5}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  ),
}
