# Revenue Conversion Ship - Pseudocode

## Overview

Transform DMG from brochure → live revenue funnel with $30/mo PRO tier.

---

## 1. /loadout Page (Pricing)

```
COMPONENT LoadoutPage:
  TIERS:
    OBSERVER ($0):
      - Limited Intel Missions (3/mo)
      - Basic Brand Analysis (1/mo)
      - Community Support
      CTA: "RUN DEMO" → /brand-recon

    OPERATOR/PRO ($30/mo) [RECOMMENDED]:
      - Unlimited Intel Missions (Brand/Research/Observe)
      - Lead Enrich runs + exports
      - Field Reports + Templates drop
      - Priority uplink (email support)
      CTA: "ACTIVATE PRO" → Stripe Payment Link or Checkout

    SKUNKWORKS (Custom):
      - Full System Architecture
      - Custom Agent Development
      - Dedicated Deployment Support
      - Direct Line to Engineering
      CTA: "REQUEST AUDIT" → Calendly/mailto

  VISUAL PATTERN:
    - Dark cyberpunk aesthetic (match FullscreenMenu)
    - HUD corner accents
    - Glowing recommended card
    - Scan line effects
```

---

## 2. Receipts/Capabilities Strip

```
COMPONENT CapabilitiesStrip:
  ITEMS (inline row, horizontal scroll on mobile):
    [ INTEL ]   → URL change monitors → "what changed + why"
    [ ENRICH ]  → leads → firmographics + tech intel
    [ BRAND ]   → competitor extraction → positioning diffs
    [ RESEARCH ]→ live web missions → cited briefs
    [ OPS ]     → repeatable workflows → logs, guardrails

  STYLE:
    - Tight strip below hero paragraph
    - Monospace tags
    - Orange accents
    - Subtle border/dividers
    - Links to respective routes
```

---

## 3. ⌘K Command Menu

```
COMPONENT CommandMenu:
  TRIGGER: ⌘K (Mac) or Ctrl+K (Windows)
  
  GROUPS:
    ACTIONS:
      - Start Pro (Loadout) → /loadout
      - Run Brand Recon → /brand-recon  
      - Enrich Leads → /enrich
      - Set Up Monitor → /observe
      - Research Mission → /research

    NAVIGATION:
      - Home → /
      - Arsenal → /arsenal
      - Profile → /profile

    SUPPORT:
      - Request Audit → Calendly/mailto

  STYLE:
    - cmdk library (already installed)
    - Dark modal with orange accents
    - HUD corner styling
    - Keyboard hints
```

---

## 4. Homepage CTA Architecture

```
CURRENT STATE:
  - Hero Primary: signupForm.open (audit modal)
  - Hero Secondary: #cortex anchor
  - Mid-page "ACTIVATE RECONNAISSANCE": signupForm.open
  - Footer CTA: signupForm.open

TARGET STATE:
  - Hero Primary: "START PRO — $30/mo" → /loadout
  - Hero Secondary: "RUN LIVE DEMO" → /brand-recon
  - Hero Tertiary: "REQUEST SYSTEM AUDIT" → Calendly/mailto
  - Mid-page: "ACTIVATE RECONNAISSANCE" → /brand-recon (demo)
  - Footer CTA: Same tiered structure
```

---

## 5. Audit CTA Enhancement

```
OPTIONS (pick one):
  A) Calendly: "REQUEST AUDIT" → calendly.com/dmg/audit (BEST)
  B) Mailto: mailto:audit@digitalmischief.group?subject=...
  C) API route (if DB ready)

MICROCOPY:
  "// Deliverable: Architecture Map + Friction Report in 48 hours"

CHANGES:
  - SignupForm → rename to AuditForm or keep as fallback
  - All audit CTAs → external link or mailto
  - Add microcopy under CTA buttons
```

---

## 6. Updated Copy

```
HERO PARAGRAPH:
  "Digital Mischief is a systems skunkworks. We turn messy AI experiments 
   into governed, production-grade workflows—then ship them as repeatable tools."

DEMO CTA HELPER:
  "Run a live recon mission. Get a usable output in under 2 minutes."

PRO POSITIONING (/loadout):
  "The Intel Suite for operators who don't want another 'AI initiative.' Just outputs."
```

---

## File Changes

```
CREATE:
  - app/loadout/page.tsx
  - components/CommandMenu.tsx
  - components/CapabilitiesStrip.tsx

MODIFY:
  - app/page.tsx (CTAs, add CapabilitiesStrip)
  - app/layout.tsx (add CommandMenu provider)
  - components/SignupForm.tsx (add Calendly/mailto option)
```

---

## Environment Variables

```
# .env.local additions (if using Stripe Payment Link)
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/...
NEXT_PUBLIC_CALENDLY_AUDIT_URL=https://calendly.com/dmg/audit
```
