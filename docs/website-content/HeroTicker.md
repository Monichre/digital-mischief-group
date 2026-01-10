# Hero Ticker

## What Changed

Added a **capabilities ticker** under the homepage hero paragraph to provide immediate “receipts” in the first viewport.

## Why

Per `docs/feedback/ACTION-PLAN.md` and `docs/feedback/review-02-pivot-to-engineer.md`, technical buyers need scannable proof quickly:

- `[ SHIP ] PRODUCTION RAG PIPELINES`
- `[ SHIP ] AUDITABLE AGENT WORKFLOWS`
- `[ SHIP ] GOVERNED DATA LAYERS`

## Implementation

- **Component**: `components/HeroTicker.tsx`
- **Homepage insertion**: `app/page.tsx` (hero section, directly below hero paragraph)
- **Animation**: a single CSS keyframes rule in `app/globals.css` (`@keyframes hero-ticker`)

## Behavior Notes

- Ticker loops by rendering two copies of the item list and animating translateX from `0` to `-50%`.
- Honors `prefers-reduced-motion` via `motion-reduce:animate-none`.
