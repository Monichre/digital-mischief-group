import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const meta = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  subcomponents: {
    TableHeader,
    TableBody,
    TableFooter,
    TableRow,
    TableHead,
    TableCell,
    TableCaption,
  },
}

export default meta

const scoutFindings = [
  {
    company: 'Northstar Systems',
    signal: 'New pricing page',
    source: 'scout-web-us',
    status: 'new',
    score: 92,
  },
  {
    company: 'Signal Forge',
    signal: 'Product launch mention',
    source: 'scout-news-eu',
    status: 'triaged',
    score: 81,
  },
  {
    company: 'Atlas Security',
    signal: 'Hiring for solutions engineers',
    source: 'scout-jobs-us',
    status: 'escalated',
    score: 77,
  },
  {
    company: 'Vanta Ridge',
    signal: 'Headcount growth across GTM',
    source: 'scout-web-us',
    status: 'new',
    score: 69,
  },
]

const usageRows = [
  {
    primitive: 'Extract',
    included: 250,
    used: 184,
    remaining: 66,
    cadence: 'Immediate',
  },
  {
    primitive: 'Observe',
    included: 100,
    used: 62,
    remaining: 38,
    cadence: 'Hourly',
  },
  {
    primitive: 'Scout',
    included: 150,
    used: 118,
    remaining: 32,
    cadence: 'Daily',
  },
]

function statusVariant(status: string) {
  if (status === 'new') return 'default'
  if (status === 'triaged') return 'secondary'
  return 'outline'
}

export const ScoutResults = {
  render: () => (
    <div className="w-full max-w-5xl space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Scout results review</h3>
        <p className="text-muted-foreground text-sm">
          Demonstrates row hover, selected state, badges, captions, and a
          footer summary in one realistic dataset.
        </p>
      </div>

      <Table>
        <TableCaption>Latest scout run from the last 24 hours.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Signal</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Priority</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scoutFindings.map((finding) => (
            <TableRow
              key={finding.company}
              data-state={finding.status === 'new' ? 'selected' : undefined}
            >
              <TableCell className="font-medium">{finding.company}</TableCell>
              <TableCell>{finding.signal}</TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs">
                {finding.source}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(finding.status)}>
                  {finding.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono">
                {finding.score}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Net-new findings</TableCell>
            <TableCell className="text-right">10</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  ),
}

export const UsageSummary = {
  render: () => (
    <div className="w-full max-w-4xl space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Numeric alignment and totals</h3>
        <p className="text-muted-foreground text-sm">
          Helpful for checking how tabular numbers, right-aligned columns, and
          footer totals read in billing or quota views.
        </p>
      </div>

      <Table>
        <TableCaption>Current monthly usage across core primitives.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Primitive</TableHead>
            <TableHead className="text-right">Included</TableHead>
            <TableHead className="text-right">Used</TableHead>
            <TableHead className="text-right">Remaining</TableHead>
            <TableHead>Cadence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usageRows.map((row) => (
            <TableRow key={row.primitive}>
              <TableCell className="font-medium">{row.primitive}</TableCell>
              <TableCell className="text-right font-mono">
                {row.included}
              </TableCell>
              <TableCell className="text-right font-mono">{row.used}</TableCell>
              <TableCell className="text-right font-mono">
                {row.remaining}
              </TableCell>
              <TableCell>{row.cadence}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell className="text-right">500</TableCell>
            <TableCell className="text-right">364</TableCell>
            <TableCell className="text-right">136</TableCell>
            <TableCell>Across plan</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  ),
}
