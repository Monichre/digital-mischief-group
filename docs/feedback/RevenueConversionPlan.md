# Revenue Conversion Plan

## Interpretation of Objective

You want the site to **make money** by primarily selling the **$29/mo PRO “system”**, while also capturing higher-value engagements via:

- **System Audits** (lead-in)
- **Ignition / Deployment Protocol** (productized delivery)

This plan stays aligned with the feedback in `docs/feedback/`:

- Keep the tactical vibe
- Fix readability where it blocks comprehension
- Add scannable proof and concrete outputs so technical buyers convert

## Core Insight From The Feedback

The brand is strong, but the page needs to function like an engineering artifact:

- **Readable**: contrast + size + isolation from background FX
- **Provable**: capability receipts in the first viewport
- **Actionable**: CTAs that map to money paths (subscribe + demo + services)

## Current Reality Check (Repo)

- **Stripe checkout exists** at `app/api/stripe/checkout/route.ts` and requires auth.
- **Pricing route exists** at `app/pricing/page.tsx` with UI in `components/pricing-page.tsx`.
- **Real “demo” capability exists** (e.g. `app/enrich/page.tsx`), but enrich APIs require auth (`app/api/enrich/*`).
- **Homepage “System Audit” modal is not wired** (submission is simulated in `components/SignupForm.tsx`).
- **Price id env var naming is inconsistent**:
  - `components/upgrade-button.tsx` uses `NEXT_PUBLIC_STRIPE_PRICE_ID`
  - `app/profile/page.tsx` uses `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`

## What We Should Change (Minimal + Contained)

### 1) Homepage Conversion Architecture (Primary)

**Goal**: make the homepage route users into either:

- Product ladder (**subscribe to PRO**)
- Product demo ladder (**run an existing tool**)
- Services ladder (**audit / protocol request**)

**Exact insertion points** (all in `app/page.tsx`):

- **Hero CTAs**: around the main CTA button and secondary link (`onClick={signupForm.open}` appears multiple times in the hero section).
- **Daedalus section**: “Introducing Daedalus…” block (product framing).
- **Footer CTA**: repeats “Initialize System Audit” CTA.

**Plan**:

- Replace/augment the hero CTAs so the primary button routes to revenue:
  - Primary CTA: **Start Pro ($29/mo)** → `/pricing` (or `/sign-up?redirect=/pricing` if not authed)
  - Secondary CTA: **Run Live Demo** → `/enrich` (or `/sign-up?redirect=/enrich` if not authed)
  - Tertiary CTA: **Book System Audit** → capture flow (see section 4)

T‑shirt size: **S**

---

### 2) “Receipts” Above The Fold (Proof Fast)

**Goal**: technical buyer understands what the system does in seconds.

**Where**: directly below the hero paragraph in `app/page.tsx`.

**Content shape**:

- A short capability strip/ticker (3–6 items)
- Must name concrete outputs, not brand poetry

Examples (from the feedback docs):

- `[ SHIP ] PRODUCTION RAG PIPELINES (evals + monitoring + citations)`
- `[ SHIP ] AUDITABLE AGENT WORKFLOWS (guardrails + approvals + logs)`
- `[ SHIP ] GOVERNED DATA LAYERS (permissions + lineage + retrieval)`

T‑shirt size: **S**

---

### 3) Make The Demo Real (Without Inventing New “Demo Pages”)

**Goal**: show value using existing production routes, not a fake playground.

**Primary demo destination**: `/enrich` (real output, visually impressive, already built).

**Constraint**: enrich APIs require auth → homepage/demo CTA must route users through sign-up/sign-in with redirect.

**Implementation touchpoints**:

- Homepage CTA routing: `app/page.tsx`
- Redirect handling on auth pages: `app/sign-up/page.tsx` and `app/sign-in/page.tsx` (support `redirect` query param)
- Optional: `components/upgrade-button.tsx` to handle 401 gracefully

T‑shirt size: **M** (auth redirect wiring spans a few routes)

---

### 4) Services Upsell (Audit + Protocol) Without Pricing

**Goal**: capture high-intent service leads with concrete deliverables, while keeping scope unpriced.

**Current state**: homepage uses `SignupForm` modal for “System Audit”, but it does not persist anything (simulated delay).

**Two viable approaches**:

- **Option A (fastest)**: route to an external scheduler (Calendly or similar).
  - Requires: you provide the scheduler URL.
- **Option B (first-party)**: implement a minimal API + DB table for audit requests.
  - Add a `system_audit_requests` table + an `app/api/audit-requests/route.ts`.
  - Wire `components/SignupForm.tsx` to submit real data.

**Deliverable microcopy** (from feedback) to place under the audit CTA anywhere it appears:

`// Deliverable: Full Architecture Map + Friction Report in 48 Hours`

T‑shirt size:

- Option A: **XS**
- Option B: **M**

---

### 5) Readability + Contrast Fixes (From Feedback)

These are conversion blockers and should be treated as “core revenue work”, not polish.

**Primary changes** (all in `app/page.tsx` unless noted):

- Add semi-opaque panels behind major text blocks (problem/solution/process/team intros).
- Increase paragraph sizing where still `text-lg` and dark zinc colors are used.
- Ensure the Daedalus reveal block is readable on average monitors.

T‑shirt size: **S**

## Prioritized Backlog (T‑Shirt Sized)

### Tier 0 (Revenue-critical, minimal scope)

- **Homepage CTAs point to product + demo** (S)
- **Add proof strip/ticker below hero** (S)
- **Make pricing upgrade flow not dead-end for anon users** (S)
  - unify env var naming for price id
  - handle 401 by redirecting to sign-in/up with redirect param

### Tier 1 (Service capture that actually captures)

- **Wire System Audit CTA to real destination** (XS–M depending on approach)
- **Add deliverable microcopy under audit CTA** (XS)

### Tier 2 (Retention + upsell polish)

- **Improve Daedalus/Arsenal copy** with concrete outputs + deliverables (M)
- **Ground “end is near” section with business outcomes** (S)

## Acceptance Criteria (No Vibes, Just Checks)

- **3‑second test**: above the fold clearly communicates:
  - what the product is
  - what it does (3–6 concrete outcomes)
  - what to do next (subscribe / demo)
- **No dead-end CTAs**:
  - anon users clicking demo/upgrade are routed into auth, then returned to the intended page
- **Audit CTA is real**:
  - either it schedules a meeting or it stores a request; no simulated submission
- **Readability**:
  - key sections are readable on non-perfect monitors (contrast + paneling)

## Required Inputs From You (To Finalize Implementation)

- **Audit destination**: scheduler URL (if using Option A), or confirm DB/API approach (Option B).
- **Preferred CTA hierarchy copy**: exact button labels for:
  - subscribe CTA
  - demo CTA
  - audit CTA
