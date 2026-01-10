# Firecrawl Intelligence Suite — Implementation Review

> **Document Purpose:** Map roadmap requirements against DMG Production current state, identify gaps, and define prioritized implementation path.

---

## Executive Summary

The roadmap defines a 4-module intelligence platform (Scouts, Observe, Enrich, Brand) with Phase 0 infrastructure. DMG Production has partial foundations in place but requires significant buildout.

| Area | Current State | Gap |
|------|---------------|-----|
| Next.js App Router | ✅ Complete | None |
| TypeScript + Tailwind | ✅ Complete | None |
| shadcn/ui | ✅ Complete | None |
| FUI Design System | ✅ Custom DMG aesthetic | None — leverage existing |
| Database (Neon) | ⚠️ Connected, **0 tables** | Full schema needed |
| ORM (Drizzle) | ❌ Not installed | Install + configure |
| Auth (Better Auth) | ❌ Not installed | Full implementation |
| Dashboard Layout | ❌ Only marketing site | New `/(dashboard)` route group |
| Brand Module | ⚠️ Basic `/brand-recon` exists | Refactor into full module |
| Scouts Module | ❌ None | Full build |
| Observe Module | ❌ None | Full build |
| Enrich Module | ❌ None | Full build |
| Firecrawl Client | ⚠️ Inline in API route | Extract to shared lib |
| AI Integration | ❌ None | Create `core-ai` wrapper |
| Email (Resend) | ❌ None | Add integration |
| Jobs/Usage Tracking | ❌ None | Create utilities |
| Cron Jobs | ❌ None | Add Vercel Cron routes |
| Redis Cache | ✅ Upstash connected | Leverage for job queues |

---

## Current Assets to Leverage

### 1. FUI Design System
Already have DMG-branded components:
- `fui-decorations.tsx` — Corner accents, grid backgrounds, glitch effects
- `scroll-animations.tsx` — GSAP reveal animations
- `SignupForm.tsx` — Typeform-style modal
- Color tokens: `orange-500` (accent), `zinc-950` (void), `zinc-800` (borders)
- Typography: Monospace, uppercase tracking, technical aesthetic

### 2. Brand Recon Foundation
Existing `/brand-recon` page and `/api/brand-recon` route:
- Accepts URL or email input
- Calls Firecrawl with `formats: ['branding', 'screenshot']`
- Renders colors, typography, spacing, components
- **Refactor path:** Migrate to `/brand` module, add competitor analysis + AI segmentation

### 3. Environment Variables (All Available)
\`\`\`
FIRECRAWL_API_KEY     ✅
OPENAI_API_KEY        ✅
GROQ_API_KEY          ✅
XAI_API_KEY           ✅
EXA_API_KEY           ✅
SERPER_API_KEY        ✅
PERPLEXITY_API_KEY    ✅
DATABASE_URL          ✅ (Neon)
KV_REST_API_URL       ✅ (Upstash Redis)
UPSTASH_SEARCH_*      ✅
\`\`\`

### 4. Integrations Ready
- **Neon PostgreSQL** — Connected, empty, ready for schema
- **Upstash Redis** — Available for caching, job queues, rate limiting
- **Upstash Search** — Available for full-text search across modules

---

## Implementation Phases (DMG-Adapted)

### Phase 0: Foundation (Week 1)

#### 0.1 Database Schema + Drizzle
\`\`\`
lib/
  db/
    index.ts          # Drizzle client
    schema.ts         # All tables
    migrate.ts        # Migration runner
\`\`\`

**Tables to create:**
\`\`\`sql
-- Core
users (id, email, name, createdAt, updatedAt)
sessions (id, userId, expiresAt, token)

-- Scouts
scouts (id, userId, name, searchQuery, schedule, isActive, lastRunAt, nextRunAt, notificationEmail, seenUrls)
scout_results (id, scoutId, url, title, snippet, firstSeenAt)

-- Observe
monitors (id, userId, url, name, checkIntervalSeconds, isActive, lastCheckedAt, lastContentHash, notificationEmail)
monitor_changes (id, monitorId, createdAt, oldHash, newHash, oldExcerpt, newExcerpt, aiSummary)

-- Enrich
enrichment_jobs (id, userId, status, createdAt, startedAt, completedAt, errorMessage, inputMeta)
enrichment_records (id, jobId, inputRow, enrichedRow)

-- Brand
brand_extractions (id, userId, url, createdAt, brandProfile, competitors, segmentation, opportunities, assets)

-- Usage
usage_events (id, userId, feature, units, metadata, createdAt)
\`\`\`

#### 0.2 Auth (Better Auth)
\`\`\`
app/
  api/auth/[...all]/route.ts
  (auth)/
    login/page.tsx
    register/page.tsx
lib/
  auth/
    index.ts          # Better Auth config
    client.ts         # Client helpers
\`\`\`

#### 0.3 Shared Integrations
\`\`\`
lib/
  firecrawl/
    client.ts         # search(), scrape(), crawl(), extractBrand()
  ai/
    model.ts          # getModel() with provider abstraction
    structured.ts     # Typed JSON outputs
  notify/
    email.ts          # sendEmail() via Resend
  jobs/
    status.ts         # JobStatus enum + helpers
    usage.ts          # trackUsage()
\`\`\`

#### 0.4 Dashboard Layout
\`\`\`
app/
  (dashboard)/
    layout.tsx        # Sidebar + topbar (FUI-styled)
    page.tsx          # Welcome/overview
    scouts/
    observe/
    enrich/
    brand/
    settings/
\`\`\`

---

### Phase 1: Scouts (Week 2)

| Task | Description |
|------|-------------|
| Schema | `scouts`, `scout_results` tables |
| API | CRUD + `/run` endpoint |
| Cron | `/api/cron/scouts` with shared `runScout()` |
| UI | List, create, detail pages with FUI styling |

**Key Features:**
- Firecrawl search with deduplication via `seenUrls`
- Email notifications for new results
- Schedule support (cron expressions)
- Manual "Run Now" trigger

---

### Phase 2: Observe (Week 3)

| Task | Description |
|------|-------------|
| Schema | `monitors`, `monitor_changes` tables |
| API | CRUD + `/check` endpoint |
| Cron | `/api/cron/monitors` |
| UI | List, create, detail with diff view |

**Key Features:**
- Content hashing for change detection
- AI-generated change summaries
- Visual diff display (old vs new excerpt)
- Configurable check intervals

---

### Phase 3: Enrich (Week 4)

| Task | Description |
|------|-------------|
| Schema | `enrichment_jobs`, `enrichment_records` tables |
| API | Upload, process, export endpoints |
| UI | CSV upload, field mapping, results table |

**Key Features:**
- Domain extraction from email
- Multi-source enrichment (Firecrawl + AI)
- CSV export with original + enriched columns
- Progress tracking with job status

---

### Phase 4: Brand (Week 5)

| Task | Description |
|------|-------------|
| Schema | `brand_extractions` table |
| API | Orchestration endpoint with competitor + segmentation |
| UI | Full report view with asset generation |

**Refactor Path for Existing `/brand-recon`:**
1. Move `lib/brand-recon/types.ts` → `lib/brand/types.ts`
2. Expand types for competitors, segmentation, assets
3. Migrate API logic to new orchestration flow
4. Add persistence to Neon
5. Build new UI sections for competitors, segmentation, assets

---

## Dashboard UI Architecture

### Sidebar Navigation
\`\`\`
┌─────────────────────────────┐
│ [ DMG ] ─────────── ⚙ User │
├─────────────────────────────┤
│                             │
│  ◆ Dashboard                │
│  ◇ Scouts                   │
│  ◇ Observe                  │
│  ◇ Enrich                   │
│  ◇ Brand                    │
│                             │
│  ─────────────────────      │
│  ◇ Settings                 │
│                             │
└─────────────────────────────┘
\`\`\`

### FUI Dashboard Styling
- Dark zinc background (`bg-zinc-950`)
- Orange accent highlights
- Corner bracket decorations on cards
- Monospace typography throughout
- Scan line effects on loading states
- Glitch text on section headers

---

## File Structure (Target)

\`\`\`
app/
  (marketing)/          # Current site (page.tsx, etc.)
  (auth)/
    login/page.tsx
    register/page.tsx
  (dashboard)/
    layout.tsx
    page.tsx
    scouts/
      page.tsx
      new/page.tsx
      [id]/page.tsx
    observe/
      page.tsx
      new/page.tsx
      [id]/page.tsx
    enrich/
      page.tsx
      [jobId]/page.tsx
    brand/
      page.tsx
      [id]/page.tsx
    settings/page.tsx
  api/
    auth/[...all]/route.ts
    scouts/
    observe/
    enrich/
    brand/
    cron/
      scouts/route.ts
      monitors/route.ts

lib/
  db/
    index.ts
    schema.ts
  auth/
    index.ts
    client.ts
  firecrawl/
    client.ts
  ai/
    model.ts
    structured.ts
  notify/
    email.ts
  jobs/
    status.ts
    usage.ts

components/
  dashboard/
    Sidebar.tsx
    Topbar.tsx
    StatusBadge.tsx
    DataTable.tsx
    EmptyState.tsx
  scouts/
    ScoutCard.tsx
    ScoutForm.tsx
    ResultsList.tsx
  observe/
    MonitorCard.tsx
    MonitorForm.tsx
    DiffView.tsx
  enrich/
    CsvUploader.tsx
    FieldMapper.tsx
    EnrichmentTable.tsx
  brand/
    (existing components)
    CompetitorCard.tsx
    SegmentationView.tsx
    AssetGenerator.tsx
\`\`\`

---

## Dependencies to Add

\`\`\`json
{
  "drizzle-orm": "^0.38.x",
  "drizzle-kit": "^0.30.x",
  "@neondatabase/serverless": "^0.10.x",
  "better-auth": "^1.x",
  "resend": "^4.x",
  "papaparse": "^5.x",
  "diff": "^7.x"
}
\`\`\`

---

## Decision Points for Approval

1. **Auth Timing:** Start with Better Auth in Phase 0, or defer to later?
   - **Recommendation:** Phase 0 — enables user-scoped data from day one

2. **Existing Brand Recon:** Refactor in-place or rebuild from scratch?
   - **Recommendation:** Refactor — preserve working Firecrawl integration

3. **Job Processing:** Inline (v1 simplicity) or queue-based (Upstash)?
   - **Recommendation:** Start inline, add queue for Enrich module (larger datasets)

4. **Email Provider:** Resend vs. other?
   - **Recommendation:** Resend — simple, reliable, good DX

---

## Ready to Begin?

**Awaiting approval to start Phase 0.1 (Database Schema + Drizzle setup).**

Once approved, I will:
1. Install Drizzle dependencies
2. Create `lib/db/` with schema and client
3. Generate migration script
4. Run initial migration against Neon
