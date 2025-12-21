# Development Implementation Guide

> This doc is "how to build it" for Cursor / [v0.dev](http://v0.dev), **without any calendar/weeks**, but still phased.
> 

## 1. Phases (Sequence, Not Schedule)

1. **Foundation & Core Infrastructure**
2. **Enrich + Brand Intelligence**
3. **Scouts + Observe (Monitoring)**
4. **Research + GEO (Analysis + Billing)**
5. **Cross-Module Glue + Polish**

Each phase is shippable on its own; deploy incrementally.

---

## 2. Foundation & Core Infrastructure

### 2.1 Project Setup

- New repo: `firecrawl-intelligence-suite` (monorepo not required initially).
- Scaffold:
    - Next.js (App Router, TS)
    - Tailwind + shadcn/ui
- Add core deps:
    - Firecrawl JS SDK
    - Better Auth
    - Drizzle + Postgres driver (Neon/Supabase)
    - Resend
    - AI SDK (ai, provider adapters)
    - Zod
- Migrate **firegeo** auth + billing patterns:
    - Auth routes → `/api/auth/[...all]`
    - Autumn/Stripe billing webhook + plan checks.

### 2.2 Shared Libraries

**lib/firecrawl/**

- `client.ts`: wrapper with:
    - `search`
    - `scrape`
    - `crawl`
    - `extractBrandIdentity` (formats: `['branding']`)
- Single env key for platform default + optional per-user override (from `api_keys`).

**lib/ai/**

- Provider selector + fallback chain:
    - OpenAI → Anthropic → Gemini → Groq
- Streaming wrappers for:
    - Chat/responses
    - Extended thinking (for research)

**lib/db/**

- Bring in Drizzle schema as per PRD (users, jobs, scouts, monitors, etc.).
- Add migration scripts; wire into dev environment.

**components/layout/**

- Basic dashboard layout:
    - Sidebar nav: Enrich, Scouts, Observe, Research, GEO, Brand, Settings.
    - Header with session user + quick links.

**Deliverable:** a **running app** with auth, bare dashboard, empty modules.

---

## 3. Enrich Implementation (CSV → Enriched Leads)

### 3.1 Backend

**API:**

- `POST /api/enrich`
    - Accepts uploaded CSV (or presigned URL) and list of custom fields.
    - Creates `enrichment_job` and `enrichment_rows`.
    - Enqueues background processing (queue or cron trigger).
- `GET /api/enrich/[jobId]`
    - Returns job status + row results.

**Background worker** (Node/Edge function):

- For each row:
    - Pass email to **Agent Orchestrator** (ported from **fire-enrich**).
    - Persist normalized `row_result` JSON and status.
    - Track usage events (`feature = 'enrich'`).

### 3.2 Agents

Port and harden from **fire-enrich**:

- `lib/agents/base-agent.ts`
- `lib/agents/discovery-agent.ts`
- `lib/agents/company-profile-agent.ts`
- `lib/agents/financial-intel-agent.ts`
- `lib/agents/tech-stack-agent.ts`
- `lib/agents/general-purpose-agent.ts`
- `lib/agents/orchestrator.ts`

Keep schemas type-safe with Zod and centralize them in `schemas/enrichment.schema.ts`.

### 3.3 Frontend

- `app/(dashboard)/enrich/page.tsx`
    - CSV upload (email column required).
    - Select custom fields (CEO, HQ phone, etc.).
    - "Start Enrichment" trigger.
- `app/(dashboard)/enrich/[jobId]/page.tsx`
    - Streamed table of rows (status + enriched data).
    - Export button (download CSV).

---

## 4. Brand Intelligence Implementation

### 4.1 Backend: Extraction + Competitive/Market Layer

**API:**

- `POST /api/brand`
    - Payload: `{ url, competitorHints?: string[], generateAssets?: boolean }`
    - Steps:
        1. Call `firecrawl.extractBrandIdentity(url)` → base brand profile.
        2. Derive initial **industry / ICP guess** from:
            - On-page copy
            - Metadata (title/description)
        3. Competitive search:
            - Firecrawl search queries using derived industry + brand name.
            - Rank & dedupe candidate competitors.
        4. Market segmentation:
            - LLM call over brand + competitors → ICP list, use cases, segments.
        5. Opportunity mapping:
            - LLM compares brand vs competitors → overlaps / white space.
        6. Store in:
            - `brand_extractions`
            - `brand_profiles`
            - `brand_competitors`
            - `brand_opportunities`
        7. If `generateAssets`:
            - Call asset-generation routine (see below) and cache results.

### 4.2 Backend: Asset Packs

**Internal module:** `lib/brand/assets.ts`

- Input: `BrandProfile` + `MarketContext` + `Opportunities`
- Output:
    - `emailTemplates[]`
    - `heroVariants[]`
    - `socialSnippets[]`

**Expose via:**

- `GET /api/brand/[id]/assets`

### 4.3 Frontend

- `app/(dashboard)/brand/page.tsx`
    - URL input
    - Checkboxes:
        - "Include competitor & market analysis"
        - "Generate marketing asset pack"
- `app/(dashboard)/brand/[id]/page.tsx`
    - Tabs: **Identity**, **Competitors**, **Opportunities**, **Assets**
    - Reuse components:
        - `BrandCard`, `ColorPalette`, `TypographyDisplay`
        - Tables for competitors + opportunities
        - Collapsible sections for generated templates

---

## 5. Scouts (Reusing Open Scouts)

### 5.1 Backend

- **DB:** `scouts`, `scout_results`
- **API:**
    - `GET /api/scouts`
    - `POST /api/scouts`
    - `GET/PUT/DELETE /api/scouts/[id]`
    - `POST /api/scouts/[id]/run` (manual)

**Worker** (inspired by **open-scouts**):

- Cron/Edge function fetches due scouts:
    - Runs Firecrawl search (with optional location).
    - Compares to `seen_urls`.
    - Inserts new `scout_results`.
    - Sends email (Resend) if configured.
    - Updates `next_run_at`.

### 5.2 Frontend

- `app/(dashboard)/scouts/page.tsx`
    - List of scouts, result counts, last run, status.
- `app/(dashboard)/scouts/new/page.tsx`
    - Scout creation form.
- **Contextual creation:**
    - Buttons from Brand and Enrich flows:
        - "Create scout for this company/keyword".

---

## 6. Observe (Reusing Firecrawl Observer)

### 6.1 Backend

- **DB:** `monitors`, `monitor_changes`
- **API:**
    - `GET /api/observe`, `POST /api/observe`
    - `GET/PUT/DELETE /api/observe/[id]`
    - `POST /api/observe/[id]/check`

**Worker:**

- Cron/Edge function:
    - For each active monitor:
        - Firecrawl scrape → markdown
        - Hash content; compare to previous
        - If changed:
            - Store diff (text diff is fine v1)
            - Generate summary with LLM
            - Optional AI filter pass
            - Send email and/or webhook

### 6.2 Frontend

- `app/(dashboard)/observe/page.tsx`
    - Grid of monitor cards (status, last check, notification modes)
- `app/(dashboard)/observe/[id]/page.tsx`
    - Diff viewer component (ported pattern from **firecrawl-observer**)
    - Change history timeline

---

## 7. Research (Reusing Open Researcher)

### 7.1 Backend

- Single route: `POST /api/research`
    - Accept user query.
    - Firecrawl search + scrape top N URLs.
    - Feed to Anthropic/OpenAI with extended thinking enabled.
    - Stream back:
        - Reasoning (for "thinking" panel)
        - Answer content
        - Source metadata

### 7.2 Frontend

- `app/(dashboard)/research/page.tsx`
    - Split layout:
        - Thinking (scroll)
        - Answer
        - Sources
- Add "Research this company/brand" buttons in Enrich/Brand views:
    - Pre-populate query with company/brand name + context.

---

## 8. GEO (Reusing FireGEO)

### 8.1 Core Reuse

- Lift **firegeo** auth + billing configuration and adjust:
    - Multi-module usage events instead of single brand-monitor focus.
- Add brand monitoring endpoints:
    - `POST /api/geo/mentions` – powered by Firecrawl search + sentiment LLM.

### 8.2 Frontend

- `app/(dashboard)/geo/page.tsx`
    - Brand mention metrics and sentiment chart.
- `app/(dashboard)/geo/[brandId]/page.tsx`
    - Timeline of mentions + sentiment breakdown.
- `app/(dashboard)/geo/chat/page.tsx`
    - Chat UI over brand + mentions.

---

## 9. Cross-Module Glue

Examples (implementation module: `lib/integrations/cross-module.ts`):

- **Enrich → Scouts**
    - After enriching a row, allow a "Track this company" action that:
        - Creates a preconfigured scout (company + industry).
- **Brand → GEO**
    - When a brand extraction is saved:
        - Optionally bootstrap a GEO brand profile and initial mention search.
- **Research → Observe**
    - From a high-value source found during research:
        - "Monitor this page for changes" → new monitor.

All of this should be **thin composition** over the underlying modules, not separate systems.
