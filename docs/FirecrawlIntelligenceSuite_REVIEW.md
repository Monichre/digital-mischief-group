# FireCrawl Intelligence Suite – Implementation Review

## 0. Source Repositories Reference

| Repo | Purpose | URL |
|------|---------|-----|
| fire-enrich | Email → enriched company data | https://github.com/firecrawl/fire-enrich |
| open-scouts | AI-powered web monitoring | https://github.com/Monichre/open-scouts |
| firecrawl-observer | Website change detection | https://github.com/firecrawl/firecrawl-observer |
| firegeo | GEO-powered SaaS (auth, billing, brand monitor) | https://github.com/firecrawl/firegeo |
| open-researcher | Visual AI research assistant | https://github.com/firecrawl/open-researcher |
| DMG Production | Current project (customer zero) | https://github.com/Monichre/digital-mischief-group |

---

## 1. Current State Analysis

### 1.1 What We Have

| Asset | Status | Notes |
|-------|--------|-------|
| **Brand Recon** | ✅ Built | Basic extraction via Firecrawl `branding` format + screenshot |
| **Signup Form** | ✅ Built | Typeform-style agentic lead capture |
| **FUI Design System** | ✅ Built | Copper/orange accents, zinc backgrounds, monospace, corner accents |
| **Neon DB** | ✅ Connected | Empty schema - ready for tables |
| **Upstash Redis** | ✅ Connected | Available for caching/queues |
| **Upstash Search** | ✅ Connected | Available for vector search |
| **Firecrawl API** | ✅ Key Present | `FIRECRAWL_API_KEY` available |
| **AI Providers** | ✅ Multiple | OpenAI, Groq, Perplexity, Gemini, xAI, AI Gateway |
| **Research APIs** | ✅ Multiple | Exa, Serper, Perplexity for web search |

### 1.2 What Needs Building

| Module | Priority | Complexity | Dependencies |
|--------|----------|------------|--------------|
| **Database Schema** | P0 | Medium | Neon |
| **Enrich** | P1 | High | Schema, Firecrawl, AI SDK |
| **Brand Intelligence** (expand) | P1 | High | Schema, current Brand Recon |
| **Scouts** | P2 | Medium | Schema, Firecrawl, Redis (queues) |
| **Observe** | P2 | Medium | Schema, Firecrawl |
| **Research** | P3 | Medium | Firecrawl, AI SDK |
| **GEO** | P3 | High | Schema, Auth, Billing |
| **Cross-Module Glue** | P4 | Low | All modules |

---

## 2. Proposed Architecture

### 2.1 Directory Structure

\`\`\`
lib/
├── db/
│   ├── schema.ts          # Drizzle schema (all tables)
│   ├── client.ts          # Neon connection
│   └── migrations/        # SQL migrations
├── firecrawl/
│   ├── client.ts          # Unified Firecrawl wrapper
│   ├── search.ts          # Search operations
│   ├── scrape.ts          # Scrape operations
│   └── branding.ts        # Brand extraction
├── ai/
│   ├── provider.ts        # Multi-provider abstraction
│   ├── streaming.ts       # Streaming utilities
│   └── prompts/           # System prompts
├── agents/
│   ├── base-agent.ts      # Base agent class
│   ├── orchestrator.ts    # Multi-agent coordinator
│   ├── discovery/         # Discovery agent
│   ├── enrichment/        # Enrichment agents
│   └── research/          # Research agent
├── notifications/
│   ├── email.ts           # Resend integration
│   └── webhooks.ts        # Webhook dispatch
└── brand-recon/           # (existing)
    └── types.ts

app/
├── (dashboard)/           # Protected dashboard routes
│   ├── layout.tsx         # Dashboard shell with sidebar
│   ├── enrich/
│   │   ├── page.tsx       # CSV upload + job list
│   │   └── [jobId]/page.tsx
│   ├── brand/
│   │   ├── page.tsx       # Brand extraction
│   │   └── [id]/page.tsx  # Brand detail + assets
│   ├── scouts/
│   │   ├── page.tsx       # Scout list
│   │   ├── new/page.tsx   # Create scout
│   │   └── [id]/page.tsx  # Scout results
│   ├── observe/
│   │   ├── page.tsx       # Monitor list
│   │   └── [id]/page.tsx  # Change history + diffs
│   ├── research/
│   │   └── page.tsx       # Research interface
│   └── geo/
│       ├── page.tsx       # Brand mentions dashboard
│       └── chat/page.tsx  # Chat over mentions
├── api/
│   ├── enrich/
│   │   ├── route.ts       # POST: create job
│   │   └── [jobId]/route.ts
│   ├── brand/
│   │   ├── route.ts       # POST: extract brand
│   │   └── [id]/
│   │       ├── route.ts
│   │       └── assets/route.ts
│   ├── scouts/
│   │   └── ...
│   ├── observe/
│   │   └── ...
│   └── research/
│       └── route.ts
└── brand-recon/           # (existing - will merge into brand/)
\`\`\`

### 2.2 Database Schema (Drizzle)

\`\`\`typescript
// Core entities
users
user_preferences
api_keys

// Enrich module
enrichment_jobs
enrichment_rows

// Brand module
brand_extractions
brand_profiles
brand_competitors
brand_opportunities
brand_assets

// Scouts module
scouts
scout_results
seen_urls

// Observe module
monitors
monitor_changes

// Research module
research_sessions

// GEO module
brand_mentions
usage_events
\`\`\`

---

## 3. Implementation Phases

### Phase 1: Foundation & Core Infrastructure
- [ ] Database schema (Drizzle + Neon migrations)
- [ ] Unified Firecrawl client (`lib/firecrawl/*`)
- [ ] AI provider abstraction (`lib/ai/*`)
- [ ] Dashboard layout with sidebar navigation
- [ ] Base agent architecture (`lib/agents/base-agent.ts`)

### Phase 2: Enrich + Brand Intelligence
- [ ] Enrich API routes + background processing
- [ ] Agent orchestrator (port from fire-enrich)
- [ ] CSV upload UI + job tracking
- [ ] Expand Brand Recon → Brand Intelligence
- [ ] Competitive/market layer (competitor search, ICP, opportunities)
- [ ] Asset generation (emails, hero variants, social snippets)

### Phase 3: Scouts + Observe
- [ ] Scouts CRUD API + cron worker
- [ ] Scout results + deduplication via `seen_urls`
- [ ] Email notifications (Resend)
- [ ] Observe monitors CRUD + diff engine
- [ ] Change detection worker
- [ ] AI-powered change summarization

### Phase 4: Research + GEO
- [ ] Research streaming API (thinking + answer + sources)
- [ ] Split-view research UI
- [ ] GEO brand monitoring endpoints
- [ ] Mention search + sentiment analysis
- [ ] Chat interface over brand data

### Phase 5: Cross-Module Glue + Polish
- [ ] Enrich → Scouts (auto-create company scouts)
- [ ] Brand → GEO (bootstrap brand profiles)
- [ ] Research → Observe (monitor discovered sources)
- [ ] Usage tracking + billing hooks

---

## 4. Tech Stack Alignment

| Layer | PRD Spec | DMG Current | Decision |
|-------|----------|-------------|----------|
| Framework | Next.js App Router | ✅ Next.js 16 | Keep |
| Styling | Tailwind + shadcn | ✅ Tailwind + shadcn + FUI | Keep + extend |
| DB | Postgres (Neon/Supabase) | ✅ Neon connected | Use Neon |
| ORM | Drizzle | Not installed | Add Drizzle |
| AI | OpenAI/Anthropic/Gemini/Groq | ✅ All available | Use AI SDK v5 |
| Scraping | Firecrawl | ✅ API key present | Use Firecrawl |
| Cache/Queue | Redis | ✅ Upstash Redis | Use for job queues |
| Vector Search | - | ✅ Upstash Search | Use for semantic search |
| Email | Resend | Not configured | Need RESEND_API_KEY |
| Auth | Better Auth | Not installed | Add later (Phase 4) |
| Billing | Autumn + Stripe | Not installed | Add later (Phase 4) |

---

## 5. Environment Variables Status

### ✅ Available
- `FIRECRAWL_API_KEY` - Core scraping
- `OPENAI_API_KEY` - Primary AI
- `GROQ_API_KEY` - Fast inference
- `PERPLEXITY_API_KEY` - Research
- `EXA_API_KEY` - Semantic search
- `SERPER_API_KEY` - Web search
- `DATABASE_URL` - Neon Postgres
- `KV_REST_API_*` - Upstash Redis
- `UPSTASH_SEARCH_*` - Vector search

### ❌ Missing (Need to Add)
- `RESEND_API_KEY` - Email notifications
- `BETTER_AUTH_*` - Authentication (Phase 4)
- `STRIPE_*` - Billing (Phase 4)

---

## 6. Questions for Approval

1. **Phase Priority**: Start with Phase 1 (Foundation) → Phase 2 (Enrich + Brand)?
2. **Auth Timing**: Defer authentication to Phase 4, or add basic auth earlier?
3. **Resend**: Should I prompt for `RESEND_API_KEY` now or stub notifications?
4. **Branding Merge**: Merge existing `/brand-recon` into new `/brand` module?
5. **Dashboard Route**: Use `(dashboard)` route group with shared layout?

---

## 7. Recommended Start

**If approved, begin with:**

1. Database schema SQL script (creates all tables)
2. `lib/db/schema.ts` + `lib/db/client.ts` (Drizzle setup)
3. `lib/firecrawl/client.ts` (unified Firecrawl wrapper)
4. `lib/ai/provider.ts` (multi-provider abstraction)
5. Dashboard layout with sidebar (`app/(dashboard)/layout.tsx`)

This establishes the foundation for all subsequent modules.

---

**Awaiting approval to proceed with Phase 1 implementation.**
