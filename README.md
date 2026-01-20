# Daedalus

**An AI-enabled platform for web intelligence collection and synthesis**

Daedalus is built on **five core primitives** that enable teams to collect, monitor, and synthesize web intelligence with clarity and purpose.

---

## The Five Primitives

| Primitive | What It Does |
|-----------|--------------|
| **Extract** | One-off snapshot of a URL → structured data (brand identity, assets) |
| **Observe** | Monitor URLs for changes → diffs, summaries, notifications |
| **Scout** | Scheduled searches → deduplicated new findings, alerts |
| **Enrich** | Person/company input → structured dossier (firmographics, funding, tech) |
| **Agent** | Interactive research sessions → reasoning, citations, tool orchestration |

Everything runs under **one login, one dashboard, one billing model**, with shared authentication, database, and AI infrastructure.

---

## Why Primitives?

Modern web intelligence tools are fragmented and unclear in purpose. Daedalus organizes capabilities into **stable primitives** that:

- **Avoid scope creep**: Each primitive does one thing clearly
- **Enable composition**: Combine primitives for complex workflows
- **Stay maintainable**: "Metal names" in code (extract, observe, scout) prevent naming churn
- **Support incremental improvement**: No big-bang refactors required

**Design Philosophy**: Metal names in code, domain names in UI. The codebase uses stable primitive names (`extract`, `observe`, `scout`), while the UI can present user-friendly terminology.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database (Neon recommended)
- Stripe account (for billing)
- Firecrawl API key

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/Monichre/digital-mischief-group.git
cd digital-mischief-group
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Create `.env.local` with required variables:
```env
# Database
DATABASE_URL=postgresql://...

# Better Auth
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-32-character-secret-here
BETTER_AUTH_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...

# Firecrawl
FIRECRAWL_API_KEY=fc-...

# AI Providers (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
XAI_API_KEY=xai-...

# Admin (optional)
ADMIN_EMAILS=admin@example.com
```

4. Run database migrations:
```bash
# Apply core migrations
psql $DATABASE_URL -f scripts/migrations/001-core-tables.sql
psql $DATABASE_URL -f scripts/migrations/002-auth-tables.sql
```

5. Start the development server:
```bash
bun run dev
# or
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### First-Time Setup
1. Navigate to `/sign-up` to create an account
2. Sign in at `/sign-in`
3. Visit `/pricing` to upgrade to Pro (or add your email to `ADMIN_EMAILS` for free Pro access)

---

## 🏗️ Architecture

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Database**: PostgreSQL (Neon) + Kysely ORM
- **UI**: Tailwind CSS 4 + Radix UI + shadcn/ui
- **Auth**: Better Auth 1.4.7
- **Billing**: Stripe + Autumn
- **AI**: OpenAI, Anthropic, Groq, Perplexity (multi-provider)
- **Scraping**: Firecrawl API
- **Deployment**: Vercel
- **Notifications**: Resend (email)

### Folder Structure

```
src/
  app/           # Next.js routes (thin controllers)
  daedalus/      # Domain workflows (business logic)
    /extract/    # Brand extraction, market analysis
    /observe/    # URL monitoring, change detection
    /scout/      # Scheduled search, deduplication
    /enrich/     # Profile/company enrichment
    /agent/      # Research sessions, tool orchestration
  ai/            # LLM providers, tools, schemas
  platform/      # Auth, DB, billing, jobs
  components/    # Shared UI primitives
```

**Key Principles**:
- `app/api/*` = thin adapters (auth, validation, dispatch)
- `daedalus/*` = business logic for each primitive
- `platform/*` = shared infrastructure
- Database tables use primitive names (e.g., `scouts`, `monitors`)

---

## 📊 Primitive Status

| Primitive | Implementation | Status |
|-----------|----------------|--------|
| **Platform** (Auth, Billing, DB) | 100% | ✅ Complete |
| **Extract** | 80% | 🔄 In Progress |
| **Observe** | 75% | 🔄 In Progress |
| **Scout** | 70% | 🔄 In Progress |
| **Enrich** | 65% | 🔄 In Progress |
| **Agent** | 85% | 🔄 In Progress |

**Note**: Implementation percentages reflect adherence to canonical patterns from source repositories and integration with the unified platform.

---

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Full development guide, patterns, and conventions for AI agents
- **[PRD.md](./PRD.md)** - Canonical product requirements and primitive definitions
- **[Firecrawl Docs](https://docs.firecrawl.dev)** - API reference for web scraping
- **[Better Auth Docs](https://www.better-auth.com/docs)** - Authentication guide
- **[Next.js Docs](https://nextjs.org/docs)** - Framework documentation

---

## 🎯 Use Cases

### Extract Primitive
- **Brand Analysis**: Extract logo, colors, fonts, voice from company websites
- **Market Research**: Analyze competitive landscape and positioning (opt-in)
- **Asset Generation**: Create branded content based on extracted identity

### Observe Primitive
- **Competitive Monitoring**: Track competitor pricing pages, feature updates
- **Compliance Tracking**: Monitor regulatory pages for changes
- **Content Surveillance**: Watch documentation, blogs, or product pages

### Scout Primitive
- **Lead Discovery**: Find new companies matching search criteria
- **News Monitoring**: Track press mentions, job postings, RFPs
- **Market Intelligence**: Discover emerging competitors or trends

### Enrich Primitive
- **Profile Enrichment**: Email/LinkedIn → role + basic company info
- **Company Enrichment**: Domain → firmographics + funding + tech stack
- **Lead Qualification**: Enrich CSV uploads for sales outreach

### Agent Primitive
- **Research Assistant**: Multi-turn research with streaming reasoning
- **Competitive Intelligence**: Deep analysis combining extract, scout, observe
- **Synthesis Workflows**: Combine data from multiple primitives

---

## 🔒 Security

**Important:** This repository has been cleaned of sensitive files and API keys.

1. Ensure your `.gitignore` includes:
   ```
   .env
   .env.local
   .env.*.local
   .next
   node_modules/
   ```

2. **Never commit** `.env.local` or other environment files
3. Use environment variables for all secrets
4. Rotate any API keys if accidentally committed

---

## 🛠️ Development

### Common Commands

```bash
# Development server
bun run dev

# Type checking
bunx tsc --noEmit

# Linting
bun run lint

# Build for production
bun run build

# Database migrations
psql $DATABASE_URL -f scripts/migrations/[file].sql
```

### Adding a New Primitive Workflow

1. Identify the primitive (`extract`, `observe`, `scout`, `enrich`, `agent`)
2. Create workflow in `/src/daedalus/[primitive]/[workflow-name].ts`
3. Define schemas in `/src/ai/schemas/[primitive].ts`
4. Add thin API adapter in `/app/api/[primitive]/route.ts`
5. Implement UI in `/app/(authenticated)/[page]/`

### Code Conventions

- **Primitives**: Always lowercase (`extract`, `observe`, `scout`, `enrich`, `agent`)
- **Database**: Tables use primitive names (`scouts`, `monitors`, `enrichment_jobs`)
- **APIs**: Stable routes (`/api/extract`, `/api/observe`, `/api/scouts`)
- **Business Logic**: Lives in `/daedalus/`, not `/app/api/`
- **Metal Names**: Use stable names in code, friendly names in UI only

---

## 🚢 Deployment

Daedalus is optimized for Vercel deployment:

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

**Database**: Use Neon or any PostgreSQL provider with connection pooling

**Edge Functions**: API routes automatically deploy as edge functions

**Monitoring**: Configure Sentry or similar for error tracking (optional)

---

## 🤝 Contributing

This is a unified platform integrating patterns from multiple source repositories:

- **fire-enrich** → Enrich primitive
- **open-scouts** → Scout primitive
- **firecrawl-observer** → Observe primitive
- **open-researcher** → Agent primitive
- **firegeo** → Platform (auth, billing)

When contributing:
1. Reference source repositories for canonical behavior
2. Use primitive names in code (not marketing terms)
3. Keep business logic in `/daedalus/`, not `/app/api/`
4. Document any deviations from source patterns

---

## 📄 License

See repository for license details.

---

## 🔗 Links

- **Firecrawl**: [docs.firecrawl.dev](https://docs.firecrawl.dev)
- **Better Auth**: [better-auth.com](https://www.better-auth.com)
- **Next.js**: [nextjs.org](https://nextjs.org)
- **Vercel**: [vercel.com](https://vercel.com)

---

## Success Criteria

The platform is successful when:

1. A user can upload a CSV and get a fully enriched, exportable dataset in one session
2. A user can input a URL and see brand identity with optional competitive mapping
3. A user can turn insights from one primitive into workflows in another (e.g., extract → scout → observe)
4. All primitives share authentication, billing, and usage tracking seamlessly
5. The codebase maintains clear separation between primitives without naming confusion

---

**Built on stable primitives. Designed for clarity. Optimized for composition.**
