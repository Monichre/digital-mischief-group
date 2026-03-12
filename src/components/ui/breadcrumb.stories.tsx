import type { MouseEvent } from 'react'

import { Slash } from 'lucide-react'

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const meta = {
  title: 'UI/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'padded',
  },
  subcomponents: {
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
  },
}

export default meta

function preventNavigation(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
}

export const DefaultTrail = {
  render: () => (
    <div className="w-full max-w-3xl space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Default hierarchy</h3>
        <p className="text-muted-foreground text-sm">
          Standard breadcrumb path from the main command surface into a
          specific scout report.
        </p>
      </div>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/loadout" onClick={preventNavigation}>
              Loadout
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/scouts" onClick={preventNavigation}>
              Scouts
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/scouts/competitors"
              onClick={preventNavigation}
            >
              Competitors
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>OpenAI watchlist</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
}

export const CollapsedTrail = {
  render: () => (
    <div className="w-full max-w-3xl space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Collapsed path</h3>
        <p className="text-muted-foreground text-sm">
          Uses the ellipsis slot when operators drill into deep archive
          paths that would otherwise dominate the header.
        </p>
      </div>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/field-reports" onClick={preventNavigation}>
              Field reports
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/field-reports/2026" onClick={preventNavigation}>
              2026
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/field-reports/2026/q1/war-games"
              onClick={preventNavigation}
            >
              War games
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Agent lab findings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
}

export const CustomSeparator = {
  render: () => (
    <div className="w-full max-w-3xl space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Custom separator and truncation</h3>
        <p className="text-muted-foreground text-sm">
          Useful for checking custom iconography plus long current-page
          labels inside constrained layouts.
        </p>
      </div>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/brand-recon" onClick={preventNavigation}>
              Brand recon
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/brand-recon/competitive"
              onClick={preventNavigation}
            >
              Competitive mode
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[18rem] truncate sm:max-w-none">
              Q2 competitive battlefield review and design language audit
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  ),
}
