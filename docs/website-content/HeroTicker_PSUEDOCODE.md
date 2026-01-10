# Hero Ticker (Pseudocode)

## Objective

Add a **high-contrast capabilities ticker** directly below the homepage hero paragraph to give “receipts” in the first viewport.

## Placement

```text
app/page.tsx
  HERO SECTION:
    hero headline
    hero paragraph
    INSERT: HeroTicker
    hero CTAs
```

## Content

```text
[ SHIP ] PRODUCTION RAG PIPELINES
[ SHIP ] AUDITABLE AGENT WORKFLOWS
[ SHIP ] GOVERNED DATA LAYERS
```

## Behavior

```text
RENDER a horizontally-scrolling marquee that loops seamlessly
  - duplicate the items once (two copies back-to-back)
  - animate translateX from 0 -> -50%
  - disable animation for prefers-reduced-motion
```

## Visual Requirements

```text
BACKGROUND: translucent dark panel (readability)
BORDER: subtle zinc border
TYPOGRAPHY: monospace + uppercase + high contrast
```
