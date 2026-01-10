# Revenue Conversion Plan (Pseudocode)

## Objective

Sell the **$29/mo PRO “system”** as the primary monetization path, with two higher-value service lead-ins:

- **System Audit** (lead-in)
- **Ignition / Deployment Protocol** (productized implementation)

## Core Conversion Ladder

### Ladder A: Product-first ($29/mo)

**Homepage → (auth) → demo → pricing → checkout → app**

Pseudocode:

```text
WHEN user lands on homepage
  SHOW primary CTA: "Start Pro ($29/mo)" (or equivalent)
  SHOW secondary CTA: "Run a live demo" -> /enrich (free-tier)
  SHOW tertiary CTA: "Book System Audit" (service lead-in)

ON click Start Pro
  IF user is authenticated
    NAVIGATE /pricing
  ELSE
    NAVIGATE /sign-up?redirect=/pricing

ON click Run a live demo
  IF user is authenticated
    NAVIGATE /enrich
  ELSE
    NAVIGATE /sign-up?redirect=/enrich

ON /pricing page, user clicks Upgrade
  POST /api/stripe/checkout { priceId: PRO_PRICE_ID }
  IF response 401
    NAVIGATE /sign-in?redirect=/pricing
  ELSE IF response contains url
    REDIRECT browser to Stripe Checkout URL

ON Stripe success redirect (/profile?success=true)
  SHOW subscription active state
  SHOW next action CTA(s): /enrich, /brand-recon, /research
```

### Ladder B: System Audit (lead-in to services)

**Homepage → audit request capture → follow-up → upsell to protocol + ongoing**

Pseudocode:

```text
ON click Book System Audit
  IF using external scheduler
    NAVIGATE to scheduler URL
  ELSE
    OPEN modal (or navigate to /system-audit) with:
      - deliverables microcopy
      - timeline promise (non-calendar-based if preferred)
      - minimal fields: name, email, company url, problem
    SUBMIT -> POST /api/audit-requests
      - persist to database
      - (optional) notify internal channel/email
    SHOW success screen with clear next step
```

### Ladder C: Ignition / Deployment Protocol (productized services)

**Homepage → protocol inquiry capture → scope call → delivery → retainers**

Pseudocode:

```text
ON click Request Ignition Protocol
  ROUTE to same capture mechanism as audit (or separate endpoint)
  CAPTURE: team size, current stack, target outcome, constraints
  SUBMIT -> POST /api/protocol-requests
  SHOW success state + what happens next
```

## Homepage Content Requirements (Behavioral)

```text
ABOVE THE FOLD
  - In 3 seconds, buyer can answer:
      1) what it is (system)
      2) what it does (3-6 concrete outputs)
      3) what to do next (Start Pro / Run demo)

BELOW THE FOLD
  - Proof section: show real modules (Enrich, Brand Recon, Research)
  - Services section: audit + protocol as escalation paths (no pricing)
```

## Stripe/Checkout Requirements (Behavioral)

```text
ENSURE consistent env var for PRO price id across:
  - pricing upgrade button
  - profile upgrade button

ENSURE unauthenticated user cannot dead-end on checkout:
  - handle 401 by redirecting to sign-in / sign-up with redirect param
```
