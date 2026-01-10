# Repository Restructure Plan

This document provides the complete playbook for restructuring the repository: principles, folder contracts, naming rules, migration order, examples (pages, API routes, services, schemas), scripts, and guardrails to prevent "folders as feelings."

⸻

## The One Rule That Makes This Work

**`src/app` is routing only.**

Everything else lives elsewhere and gets imported in.

- If a file's purpose is "because Next.js expects it," it goes in `app/`.
- If its purpose is "because the product needs it," it goes in `features/`, `services/`, `platform/`, `lib/`, or `shared/`.

⸻

## Final Target Structure (The Contract)

Use this as your canonical tree:

```
src/
  app/                       # Next.js router layer ONLY (thin)
    (auth)/...
    (core)/...
    (pages)/...
    api/...
    actions/                 # optional: route-level server actions adapters
    layout.tsx
    page.tsx
    globals.css

  features/                  # product modules (domain-owned)
    enrich/
    brand-recon/
    scouts/
    observe/
    research/
    billing/                 # "billing" is a feature (UX) not the platform SDK

  services/                  # shared business capabilities (reused by multiple features)
    enrichment/
    monitoring/
    research/
    notifications/
    search/
    documents/

  platform/                  # foundations: auth/db/billing/observability/config
    auth/
    db/
    billing/
    config/
    observability/
    cache/

  lib/                       # third-party adapters & primitives (SDK wrappers)
    firecrawl/
    exa/
    vercel-ai/
    openai/
    stripe/
    resend/
    neon/
    redis/

  shared/                    # cross-runtime pure code: types, schemas, utilities
    schema/                  # zod schemas: request/response, events, DB IO contracts
    types/
    constants/
    utils/
    runtime/                 # small helpers safe in edge/node

  components/                # shared UI primitives ONLY (design system)
    ui/                      # shadcn-style primitives
    layout/                  # app shells, header/footer, nav
    effects/                 # shared visual effects
    providers/               # theme, query client, etc.

  hooks/                     # truly shared hooks (rare). Otherwise live in features/<x>/hooks
  styles/                    # optional if you have non-tailwind stuff
```

**Key discipline:** `components/` is shared UI only. Feature UI goes under `features/<feature>/components`.

⸻

## Folder Definitions (What Goes Where)

### `lib/` = Vendor Adapters

Only: SDK init, client wrappers, vendor-specific helpers, rate limiting for a vendor, response normalization.

**✅ Good:**

- `lib/firecrawl/client.ts`
- `lib/stripe/stripe.ts`
- `lib/exa/types.ts`

**❌ Bad:**

- "enrichment orchestration"
- "agent strategy" (that's product logic)

**Rule:** If you swapped Firecrawl for another crawler, you should mostly rewrite `lib/firecrawl`, not your feature/service code.

⸻

### `services/` = Reusable Capabilities

These are your product engines that multiple features can call.

**Examples:**

- `services/enrichment/runBatch.ts`
- `services/monitoring/checkMonitor.ts`
- `services/notifications/sendEmail.ts`
- `services/search/searchWeb.ts`

**Services can call:**

- `lib/*` adapters
- `platform/*` foundations
- `shared/*` schemas/types

**Services should not import UI.**

⸻

### `features/` = Domain Product Modules

Each feature owns:

- UI components
- feature hooks
- feature server actions (optional)
- feature-specific orchestrators that aren't reused elsewhere
- feature types that don't belong globally

**Rule:** If only Enrich uses it, put it in `features/enrich`, not `services/`.

⸻

### `platform/` = Foundations Everyone Depends On

- auth session retrieval, role checks
- db connection + RLS helpers
- billing entitlement checks
- config/env parsing
- observability: logger/tracer/request IDs
- cache clients

This is not product logic. It's the "operating system."

⸻

### `shared/` = Pure, Cross-Runtime Contracts

- Zod request/response schemas
- types shared across server/client
- constants, small pure utilities

**Rule:** If it can run anywhere (node/edge/client) and has no SDK knowledge, it belongs here.

⸻

## Current State vs Target (What You Tell the Other Guy)

**Current `src/app` content is valid as an intermediate stage because:**

- Next routes need to exist now
- co-location helps shipping while boundaries stabilize
- refactor goal is extraction, not rewrite

**Target behavior:**

- `app/(core)/enrich/page.tsx` becomes an import wrapper around `features/enrich`
- `app/api/enrich/*` becomes an HTTP adapter that calls `services/enrichment/*`
- shared UI moves from `components/enrich/*` → `features/enrich/components/*`

⸻

## Versioned API Layout (Do This Now)

You have a lot of `app/api/...`. Make it systematic:

```
src/app/api/
  v1/
    enrich/
      route.ts
      stream/route.ts
      batch/route.ts
      history/route.ts
    scouts/
    research/
    monitors/
    brand-recon/
    stripe/
    auth/
    webhooks/
  internal/                  # optional internal-only routes
```

**Why:** versioning prevents "we can never change this endpoint again" syndrome.

⸻

## Schema Strategy (Your Zod Truth Layer)

Put request/response schemas here:

```
src/shared/schema/
  enrich.ts
  scouts.ts
  research.ts
  monitors.ts
  stripe.ts
  auth.ts
  common.ts
```

**Contract:** API routes parse with Zod at the boundary; services operate on typed, validated inputs.

**Example:**

```typescript
// shared/schema/enrich.ts
import { z } from "zod";

export const EnrichRequest = z.object({
  jobId: z.string().optional(),
  rows: z.array(z.record(z.any())),
  fields: z.array(z.object({
    key: z.string(),
    prompt: z.string(),
  })),
  mode: z.enum(["single", "batch"]).default("batch"),
});

export type EnrichRequest = z.infer<typeof EnrichRequest>;
```

⸻

## Concrete "Thin App" Examples (Copy/Paste Patterns)

### A) Route Page Wrapper

```typescript
// src/app/(core)/enrich/page.tsx
import { EnrichPage } from "@/features/enrich/page";

export default EnrichPage;
```

### B) API Route Wrapper

```typescript
// src/app/api/v1/enrich/route.ts
import { NextResponse } from "next/server";
import { EnrichRequest } from "@/shared/schema/enrich";
import { runEnrich } from "@/services/enrichment/runEnrich";

export async function POST(req: Request) {
  const json = await req.json();
  const input = EnrichRequest.parse(json);

  const result = await runEnrich(input);
  return NextResponse.json(result);
}
```

### C) Service Function (Real Logic Lives Here)

```typescript
// src/services/enrichment/runEnrich.ts
import type { EnrichRequest } from "@/shared/schema/enrich";
import { firecrawlSearch } from "@/lib/firecrawl/search";
import { extractFields } from "./workflows/extractFields";

export async function runEnrich(input: EnrichRequest) {
  // orchestration + business rules
  const sources = await firecrawlSearch(input.rows);
  return extractFields({ input, sources });
}
```

⸻

## How to Structure a Feature (Enrich Example)

```
src/features/enrich/
  page.tsx                     # route-level UI entry (client/server)
  components/
    CsvUploader.tsx
    EnrichmentTable.tsx
    FieldMapper.tsx
  hooks/
    useEnrichStream.ts
  server/
    actions.ts                 # optional server actions for UI flows
    queries.ts                 # optional: feature-owned data fetchers
  types.ts                     # feature-local types
  index.ts                     # barrel exports
```

And `features/enrich/index.ts`:

```typescript
export { default as EnrichPage } from "./page";
```

**Rule:** If a component isn't reused outside Enrich, it has no business in global `components/`.

⸻

## What to Do With Your Existing `components/` Folder

**Keep these in `src/components/`:**

- `components/ui/*` (primitives)
- `components/layout/*` (header/footer/nav shells)
- `components/effects/*` (shared visuals)
- global providers

**Move these to features:**

- `components/enrich/*` → `features/enrich/components/*`
- `components/brand-recon/*` → `features/brand-recon/components/*`
- `components/scouts/*` → `features/scouts/components/*`

This one change will make the repo feel 5x smaller overnight.

⸻

## Agents: Where They Should Live

Right now you have `src/lib/agents/*`. That's mixing "product logic" into `lib/`.

**Preferred split:**

- `lib/<provider>/...` = SDK wrappers (OpenAI/Vercel AI/etc.)
- `services/<capability>/...` = orchestration engine
- `features/<feature>/...` = feature-specific agent selection / UI-driven behavior

**If agents are a reusable engine across multiple features:**

```
src/services/agents/
  orchestrator.ts
  registry.ts
  tools/
  prompts/
  types.ts
```

**If agents are Enrich-specific:**

```
src/features/enrich/server/agents/
  ...
```

⸻

## Scripts (Yes, You Want Scripts)

Scripts are not part of runtime. They're tooling and ops.

**Put them here:**

```
scripts/
  db/
    migrate.ts
    seed.ts
    reset.ts
  jobs/
    run-enrich.ts             # manual runner for a job
    run-monitor-check.ts
  maintenance/
    backfill-entitlements.ts
    replay-webhook.ts
  dev/
    smoke-api.ts
    generate-types.ts
```

**Script rules:**

- Use `tsx` or `ts-node` equivalent
- Scripts import from `src/` (same codepaths as app), but do not import UI
- Scripts should call services (not route handlers)

**Example command style:**

```json
{
  "scripts": {
    "db:migrate": "tsx scripts/db/migrate.ts",
    "db:seed": "tsx scripts/db/seed.ts",
    "jobs:monitor": "tsx scripts/jobs/run-monitor-check.ts"
  }
}
```

⸻

## Naming Conventions (So You Don't Regret This Later)

- **Folders:** kebab-case (`brand-recon`, `burn-logs`)
- **Feature entry:** `features/<feature>/page.tsx` exports default component
- **Components:** PascalCase.tsx
- **Services:** camelCase.ts functions, kebab-case folders
- **API:** nouns/plurals where possible (`monitors`, `scouts`)

**Avoid these folder names unless they're truly global:**

- `ui/` (except shared primitives)
- `app/` (already reserved by Next)
- `common/` (means "I gave up naming it")

⸻

## Import Boundaries (The Real Enforcement)

This is the dependency direction you want:

**✅ Allowed:**

- `features` → `services` → `platform` → `lib`/`shared`
- `services` → `lib`/`platform`/`shared`
- `platform` → `lib`/`shared`
- `lib` → `shared`

**🚫 Forbidden:**

- `services` → `features`
- `lib` → `services`/`features`/`platform`
- `shared` → anything else
- UI importing services directly without an adapter layer (ok sometimes, but prefer actions/routes)

If you want to enforce it: use ESLint boundaries later. But even without tooling, these rules prevent spaghetti.

⸻

## Migration Plan (Do This Without Breaking Everything)

### Phase 1 — Establish "Thin App" Behavior

1. Create `features/`, `services/`, `platform/`, `shared/`, `lib/` (if not already)
2. Add "wrapper page" pattern for 1 route (Enrich) to prove it works
3. Add `shared/schema/*` and make 1 API route validate inputs

### Phase 2 — Move Feature UI Out of `components/`

1. Move `components/enrich/*` → `features/enrich/components/*`
2. Fix imports, add `features/enrich/index.ts`

### Phase 3 — Move Orchestration Out of API

1. Extract business logic from `app/api/enrich/*` into `services/enrichment/*`
2. Make API routes call services

### Phase 4 — Normalize Platform Foundations

1. Centralize env parsing `platform/config/env.ts`
2. Centralize auth/entitlements `platform/auth/*` and `platform/billing/*`
3. Add `platform/observability/*` (request ID + logger)

### Phase 5 — Repeat for Scouts/Observe/Research/Brand-Recon

Do one feature at a time. No big-bang.

⸻

## Specific Feedback on Your Posted "Updated Structure"

### What's Strong

- Your `app/(auth)/(core)/(pages)` route taxonomy is clean.
- Your API breakdown is already close to "versioned modules."
- Your `lib/firecrawl`, `lib/stripe`, `lib/db`, `lib/auth` direction is good.

### What I Would Change Next (High Leverage)

1. **Stop growing `src/components/<feature>/...`**  
   Start moving those into `src/features/<feature>/components`.

2. **Move agent stuff out of `lib/agents`**  
   That's product logic. It belongs in `services/agents` or feature server.

3. **Move stream-types to `shared/schema`**  
   Stream contracts are API contracts. Treat them as schemas.

4. **Add `platform/config` and `platform/observability` now**  
   AI workflows + streaming routes + webhooks will punish you if you don't.

⸻

## The Exact Message You Can Send to "Him" (Paste This)

The current `src/app` layout is an intentional Next.js-native staging layer: it reflects routing taxonomy, not final domain boundaries. Nothing is "wrong" in `app/` right now—routes must exist and shipping matters—BUT the target architecture is to make `app/` thin and move product logic out into `features/`, reusable engines into `services/`, foundations into `platform/`, vendor wrappers into `lib/`, and contracts into `shared/`.

Concretely: route pages become wrappers that import `features/<module>/page.tsx`, API routes become adapters that validate with Zod from `shared/schema/*` and then call `services/*`. Feature-specific UI moves from `src/components/<feature>` into `src/features/<feature>/components` so shared `components/` contains only primitives/layout/effects. This is an extraction path, not a rewrite—one feature at a time.

⸻

If you want, I can also give you a "move list" for Enrich (exact folders/files to relocate first, in order) and the resulting import changes—but everything above is the full playbook you asked for.
