# Revenue Conversion Ship

## Summary

Converted DMG homepage from brochure → revenue funnel with $30/mo PRO tier.

---

## What Changed

### 1. New `/loadout` Page (Pricing)
- **File**: `app/loadout/page.tsx`
- 3-tier pricing with ApexStrike cyberpunk aesthetic:
  - **OBSERVER** ($0) → "RUN DEMO" → `/brand-recon`
  - **OPERATOR/PRO** ($30/mo) → "ACTIVATE PRO" → Stripe checkout
  - **SKUNKWORKS** (Custom) → "REQUEST AUDIT" → Calendly/mailto
- HUD corners, glowing recommended card, dark theme

### 2. Capabilities Strip ("Receipts")
- **File**: `components/CapabilitiesStrip.tsx`
- Horizontal strip below hero showing:
  - `[ INTEL ]` → URL monitors
  - `[ ENRICH ]` → Lead enrichment
  - `[ BRAND ]` → Competitor extraction
  - `[ RESEARCH ]` → Live web missions
  - `[ OPS ]` → Repeatable workflows
- Each links to respective feature route

### 3. ⌘K Command Menu
- **File**: `components/CommandMenu.tsx`
- Keyboard shortcut: `⌘K` (Mac) / `Ctrl+K` (Windows)
- Actions: Start Pro, Brand Recon, Enrich, Observe, Research
- Navigation: Home, Arsenal, Sentinels, Profile
- Support: Request Audit
- Provider added to `app/layout.tsx`

### 4. Homepage CTA Architecture
- **File**: `app/page.tsx`
- **Hero CTAs**:
  - Primary: `[ START PRO — $30/mo ]` → `/loadout`
  - Secondary: `[ RUN LIVE DEMO ]` → `/brand-recon`
  - Tertiary: `REQUEST SYSTEM AUDIT` → mailto/Calendly
- **Mid-page Protocol CTA**: `[ ACTIVATE PRO ]` + `[ RUN DEMO ]`
- **Footer CTA**: Same tiered structure with microcopy
- **Nav**: `LOADOUT →` link (replaces "Deploy")

### 5. Updated Copy
- Hero paragraph now reads:
  > "Digital Mischief is a systems skunkworks. We turn messy AI experiments into governed, production-grade workflows—then ship them as repeatable tools."
- Audit microcopy: `// Deliverable: Architecture Map + Friction Report in 48 hours`

---

## Environment Variables

Add to `.env.local`:

```bash
# Optional: Stripe Payment Link for PRO ($30/mo)
# Create at: Stripe Dashboard → Payment Links → New
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/your-link

# Optional: Calendly for audit requests
NEXT_PUBLIC_CALENDLY_AUDIT_URL=https://calendly.com/your-link
```

**Note**: Without `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`, the system falls back to the existing `/api/stripe/checkout` API route which uses `NEXT_PUBLIC_STRIPE_PRICE_ID`.

---

## Stripe Setup Clarification

The billing portal link (`https://billing.stripe.com/p/login/...`) is for **existing customers** to manage subscriptions.

For **new customers** to subscribe, create a Payment Link:
1. Stripe Dashboard → **Products** → Create "OPERATOR PRO" at $30/mo
2. Stripe Dashboard → **Payment Links** → Create new → Select your product
3. Copy the resulting `https://buy.stripe.com/...` URL
4. Set as `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`

---

## Files Modified

| File | Change |
|------|--------|
| `app/loadout/page.tsx` | Created - 3-tier pricing page |
| `components/CapabilitiesStrip.tsx` | Created - Hero receipts strip |
| `components/CommandMenu.tsx` | Created - ⌘K command palette |
| `app/layout.tsx` | Added CommandMenuProvider |
| `app/page.tsx` | Updated CTAs, added CapabilitiesStrip, new copy |

---

## Testing Checklist

- [ ] ⌘K opens command menu
- [ ] Hero "START PRO" → `/loadout`
- [ ] Hero "RUN LIVE DEMO" → `/brand-recon`
- [ ] Hero "REQUEST SYSTEM AUDIT" → opens mailto
- [ ] Nav "LOADOUT" → `/loadout`
- [ ] `/loadout` PRO button → Stripe checkout
- [ ] `/loadout` Demo button → `/brand-recon`
- [ ] `/loadout` Audit button → mailto/Calendly
- [ ] Capabilities strip links work

