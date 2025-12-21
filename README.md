A unified, AI-powered web intelligence suite built on Firecrawl.

It combines four core capabilities in a single dashboard:

- **Scouts** – Always-on search agents that watch the web for new pages and send alerts.
- **Observe** – URL monitors that detect content changes and summarize what changed.
- **Enrich** – CSV → enriched leads (firmographics + light tech intel).
- **Brand** – Brand + competitor extraction with optional asset generation.

The suite shares **auth, database, Firecrawl integration, AI, notifications, and usage tracking**.

---

# Canonical PRD

## 0. Source Repositories

### Firecrawl / Core Apps

- **Fire Enrich** – email → enriched company data
    
    https://github.com/firecrawl/fire-enrich
    
- **Open Scouts** – AI-powered web monitoring "scouts"
    
    https://github.com/Monichre/open-scouts
    
- **Firecrawl Observer** – website change detection
    
    https://github.com/firecrawl/firecrawl-observer
    
- **FireGEO** – GEO-powered SaaS starter (auth, billing, brand monitor)
    
    https://github.com/firecrawl/firegeo
    
- **Open Researcher** – visual AI research assistant
    
    https://github.com/firecrawl/open-researcher
    
- **Firecrawl Docs / Brand Extraction** – brand identity extraction
    
    https://docs.firecrawl.dev/features/scrape#extract-brand-identity
    

### Digital Mischief Group

- **DMG Marketing Site / Brand System**
    
    https://www.digitalmischiefgroup.com/
    
- **DMG Repo** (for initial "customer zero" integration and templates)
    
    https://github.com/Monichre/digital-mischief-group
    

> These repos are **source-of-truth** for feature behavior and implementation patterns. The Suite wraps them into one governed product.
> 

---

## 1. Product Overview

### 1.1 Vision

Create an **all-in-one AI web intelligence platform** that can:

- Enrich lead data from emails/domains
- Monitor the web and specific URLs for changes
- Research topics with live web + AI reasoning
- Extract, compare, and operationalize brand identities
- Track brand presence, sentiment, competitors, and opportunities
- Generate outbound assets (emails, landing-page snippets, social posts) directly from brand/market understanding

All from **one login, one dashboard, one billing model**.

### 1.2 Modules (Mapped to Repos)

| **Module** | **Core Behavior** | **Primary Source Repos** |
| --- | --- | --- |
| Enrich | Lead enrichment from CSV emails | fire-enrich |
| Scouts | Scheduled web monitors w/ email alerts | open-scouts |
| Observe | URL change detection + diffs | firecrawl-observer |
| Research | Visual research, streaming thinking | open-researcher |
| GEO | Brand monitoring, auth, billing | firegeo |
| Brand | Brand identity extraction + ops | firecrawl branding docs + DMG site/repo |

---

## 2. Shared Architecture & Patterns

### 2.1 Common Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling/UI**: Tailwind + shadcn/ui
- **Backend**:
    - PostgreSQL (Supabase / Neon)
    - Drizzle ORM
    - Convex (optional, for realtime monitors if needed)
- **AI**: OpenAI / Anthropic / Gemini / Groq via unified provider layer
- **Scraping**: Firecrawl API (search, scrape, crawl, branding)
- **Infra**: Vercel + Edge Functions / Supabase Functions
- **Notifications**: Resend (email), webhooks
- **Auth/Billing**: Better Auth + Autumn + Stripe (from **firegeo**)

### 2.2 Shared Modules

Core cross-cutting modules:

- `lib/firecrawl/*` – unified Firecrawl client (search/scrape/crawl/branding)
- `lib/ai/*` – provider abstraction, streaming utilities
- `lib/agents/*` – multi-phase enrichment agents (from **fire-enrich**)
- `lib/notifications/*` – email + webhook utilities (used by scouts/observe/geo)
- `lib/billing/*` – usage tracking + plan checks (from **firegeo**)
- `lib/db/*` + `schemas/*` – unified DB schema across all modules
- `components/ui/*` + `components/shared/*` – shared layout and primitives

---

## 3. Modules – Canonical Behavior

### 3.1 Enrich (Lead Enrichment from CSV)

**Input:**

- CSV upload of lead data (at minimum: email; optionally name, company, title, etc.)
- This mirrors **fire-enrich** but in a multi-tenant, job-based UX.

**Pipeline** (reuse fire-enrich behavior, wrapped in Suite):

1. **CSV Ingest**
    - Parse CSV, validate emails.
    - Store as an `enrichment_job` + `enrichment_job_rows` (row-level status).
2. **Agent Orchestration**
    - Reuse multi-phase design from fire-enrich:
        - Discovery → Company Profile → Funding → Tech Stack → General/Custom.
    - Each agent: search via Firecrawl, synthesize via LLM with Zod schemas.
3. **Outputs per row**
    - Standardized object:
        - Company (name, domain, website, business type)
        - Profile (industry, segment, HQ, size, year founded)
        - Funding (stage, total, last round, investors)
        - Tech stack (languages, frameworks, infra)
        - Custom fields (e.g., CEO name, ICP fit notes)
        - **Sources** (URLs per field)
4. **Exports**
    - Download enriched CSV.
    - Push to CRM in later iteration (HubSpot/Salesforce export not required v1).

---

### 3.2 Brand (Brand Identity + Market/Competitive Layer)

This is the **big extension** beyond Firecrawl's default branding format.

**Input:**

- One or more URLs (e.g., homepage, product page)
- Optionally: brand name override, primary competitors (by name or domain)

**Base Extraction (reuse Firecrawl "branding" format)**

- Logo, colors, fonts
- Site name, tagline, description
- Brand voice (tone/style) inferred from copy

**New Layer: Competitive & Market Intelligence**

1. **Competitive Neighborhood**
    - From brand's extracted industry + copy, query Firecrawl search for:
        - "Alternatives to X"
        - "Competitors of X"
        - "Top tools in [industry]"
    - Identify 5–15 likely competitors with:
        - Name
        - URL
        - Positioning tagline
        - ICP / segment guess
        - Price-tier guess (cheap / mid / premium; text, not numeric)
2. **Market Segmentation**
    - For the extracted brand:
        - ICPs (who they're clearly targeting)
        - Segments (SMB vs mid-market vs enterprise; dev vs marketing; etc.)
        - Use-case clusters (3–7 "jobs to be done" surfaced from web copy + social).
3. **Opportunity Mapping**
    - Compare brand's positioning vs competitor set:
        - **Overlaps**: crowded messages, commoditized claims
        - **White space**: features/angles brand *could* credibly own
    - Output:
        - "Opportunities to Lean Into" (3–5 bullets)
        - "Messages to Avoid / De-emphasize" (3–5 bullets)
4. **Optional: DMG-style Brand Archetype**
    - Use DMG as **internal library** of tone/structure, not copy.
    - Map brand into 1–2 archetypes (e.g., "Skunkworks Lab," "Trusted Operator") for later content templates.

**Automated Branded Assets (Opt-In)**

From a single brand+market extraction, allow user to **toggle**:

- ✅ Generate outbound email templates
- ✅ Generate landing-page hero variants
- ✅ Generate social snippets

**Examples of asset packs:**

- **Sales Emails**
    - 2–3 cold outbound email sequences
    - Personalized tokens: industry, pain points, competitor references
- **Lifecycle / Retention Emails** (later)
- **Marketing Copy**
    - Hero line + subhead variants
    - 5–10 tweet/LinkedIn snippets
- **Internal Docs**
    - Brand one-pager (voice, do/don't, positioning grid)
    - "How we talk vs how competitors talk" heatmap

These are **generated from the same brand+market object**, so no extra user config.

---

### 3.3 Scouts (Open Scouts Behavior Inside Suite)

From **open-scouts**, but standardized:

- Create "scouts" that:
    - Run Firecrawl search on a schedule
    - Dedupe via `seen_urls`
    - Notify via email (Resend) and/or dashboard feed

**Suite-level enhancements:**

- Users can:
    - Start from **Enrich** or **Brand** ("Create scout for this company/keyword")
    - Choose **location** (country/state/city) if supported by Firecrawl
    - Tag scouts: #competitors, #press, #jobs, #RFP, etc.

---

### 3.4 Observe (Firecrawl Observer Behavior)

From **firecrawl-observer**:

- Allow user to point monitors at:
    - Pricing pages
    - Docs
    - Competitor feature pages
    - Regulatory or vendor pages

**Core behaviors:**

- Content hash comparison + diff viewer
- Optional AI summary / filtering (only notify if change "matters")
- Webhook for machines, email for humans

**Suite-level integration:**

- 1-click "Watch this competitor page" from Brand/Competitive view
- Link change events back to brand profiles and scouts

---

### 3.5 Research (Open Researcher Behavior)

From **open-researcher**:

- Split-view research UI:
    - Thinking panel (streaming reasoning)
    - Answer panel (structured response)
    - Sources panel (links & citations)

**Inputs:**

- Freeform queries
- Pre-seeded queries from:
    - Enrich (e.g., "Research this company's competitive landscape")
    - Brand module ("Validate this white-space opportunity")

---

### 3.6 GEO (FireGEO Behavior)

From **firegeo**:

- Auth (Better Auth) and billing (Autumn + Stripe)
- Brand monitoring:
    - Brand profiles, mention search, sentiment, trend visualization
- AI chat over brand mentions and tracked signals

**Suite re-use:**

- GEO becomes the **billing + multi-tenant core**, not an isolated app.
- Brand monitoring & sentiment piggyback on:
    - Brand profiles
    - Scouts (for discovery)
    - Research (for analysis)

---

## 4. Data Model – Canonical Concepts (High-Level)

Key entities (short version):

- `users`, `user_preferences`, `api_keys`
- `enrichment_jobs`, `enrichment_rows`
- `brand_extractions`, `brand_profiles`, `brand_competitors`, `brand_opportunities`
- `scouts`, `scout_results`
- `monitors`, `monitor_changes`
- `research_sessions`
- `brand_mentions`
- `usage_events`

No time estimates baked into schema; we track events, not durations.

---

## 5. Success Criteria (Conceptual, Not Timelines)

- User can:
    - Upload CSV → get enriched, exportable dataset in one session.
    - Drop a URL → see brand identity + competitor map + opportunities.
    - Turn a brand profile into:
        - At least one scout
        - At least one monitor
        - At least one asset pack (emails or web copy).
- Module reuse:
    - **fire-enrich**, **open-scouts**, **firecrawl-observer**, **open-researcher**, **firegeo** patterns all visible in codebase and not re-invented.
- DMG:
    - DMG site integrated as an internal "live example" brand/tenant, used as first dogfood project.
