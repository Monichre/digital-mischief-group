# Repository Restructure Plan

**Date**: 2026-01-10
**Status**: Planning Phase
**Related Ticket**: #28

---

## 🎯 Goal

Transform the current flat `src/lib/` structure into a layered, domain-driven architecture that clearly separates concerns:

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
    billing/                 # Stripe SDK wrapper, not billing UX
    config/
    observability/
    cache/

  lib/                       # third-party adapters & primitives (SDK wrappers)
    firecrawl/
    exa/
    vercel-ai/
    openai/
    stripe/                  # Raw Stripe SDK adapter
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

---

## 📐 Folder Definitions (What Goes Where)

### `lib/` = Vendor Adapters ONLY

**Purpose**: SDK initialization, client wrappers, vendor-specific helpers

**Contains**:
- SDK init and configuration
- Client wrappers for third-party APIs
- Vendor-specific helpers (rate limiting, retry logic)
- Response normalization

**Rule**: If you swap Vendor X for Vendor Y, you should mostly rewrite `lib/vendor-x/`, not your feature/service code.

**Examples**:
- ✅ `lib/firecrawl/client.ts` - Firecrawl SDK wrapper
- ✅ `lib/stripe/stripe.ts` - Stripe SDK initialization
- ✅ `lib/exa/types.ts` - Exa response types
- ❌ "enrichment orchestration" - That's product logic (services/)
- ❌ "agent strategy" - That's product logic (services/ or features/)

---

### `services/` = Reusable Capabilities (Product Engines)

**Purpose**: Product logic that multiple features can call

**Contains**:
- Shared business workflows
- Multi-step orchestration
- Cross-feature capabilities
- Reusable domain logic

**Can call**:
- ✅ `lib/*` adapters
- ✅ `platform/*` foundations
- ✅ `shared/*` schemas/types

**Cannot import**:
- ❌ UI components
- ❌ React hooks
- ❌ Feature-specific code

**Examples**:
- ✅ `services/enrichment/runBatch.ts` - Batch enrichment orchestration
- ✅ `services/monitoring/checkMonitor.ts` - Monitor checking workflow
- ✅ `services/notifications/sendEmail.ts` - Email notification logic
- ✅ `services/search/searchWeb.ts` - Web search orchestration

**Key Rule**: If only ONE feature uses it, it belongs in `features/[feature]/`, not `services/`.

---

### `features/` = Domain Product Modules

**Purpose**: Self-contained feature modules owned by a single domain

**Each feature owns**:
- UI components specific to this feature
- Feature-specific hooks
- Feature-specific server actions (optional)
- Feature-specific orchestrators that aren't reused elsewhere
- Feature-specific types that don't belong globally

**Structure**:
```
features/[feature]/
  ├── components/       # Feature UI components
  ├── hooks/           # Feature-specific hooks
  ├── actions/         # Feature server actions (optional)
  ├── types/           # Feature domain types
  ├── utils/           # Feature-specific utilities
  └── index.ts         # Public API
```

**Key Rule**: If only Enrich uses it, put it in `features/enrich/`, not `services/`.

**Examples**:
- ✅ `features/enrich/components/BulkEnrichTable.tsx`
- ✅ `features/enrich/hooks/useEnrichStream.ts`
- ✅ `features/billing/components/PricingCard.tsx` - Billing UX, not SDK

---

### `platform/` = Foundations (The "Operating System")

**Purpose**: Infrastructure that everything else depends on

**Contains**:
- Auth session retrieval, role checks
- Database connection + RLS helpers
- Billing entitlement checks (SDK, not UX)
- Config/environment parsing
- Observability: logger, tracer, request IDs
- Cache clients

**Key Rule**: This is NOT product logic. It's the infrastructure foundation.

**Examples**:
- ✅ `platform/auth/getSession.ts`
- ✅ `platform/db/neon.ts`
- ✅ `platform/billing/checkEntitlement.ts` - Stripe SDK wrapper
- ✅ `platform/config/env.ts`
- ❌ Billing UX components - That's `features/billing/`

---

### `shared/` = Pure, Cross-Runtime Contracts

**Purpose**: Code that can run anywhere (node/edge/client) with no SDK knowledge

**Contains**:
- Zod request/response schemas
- Types shared across server/client
- Constants
- Small pure utilities (no dependencies)

**Key Rule**: If it can run in node/edge/client and has no SDK knowledge, it belongs here.

**Examples**:
- ✅ `shared/schema/enrichment.ts` - Zod schemas
- ✅ `shared/types/api.ts` - Shared API types
- ✅ `shared/constants/limits.ts` - Rate limits, quotas
- ✅ `shared/utils/formatting.ts` - Pure formatting functions

---

## 🎯 Target Behavior

### Current State (Valid Intermediate)
- ✅ Next routes exist now for shipping
- ✅ Co-location helps while boundaries stabilize
- ✅ Refactor goal is **extraction**, not rewrite

### Target State

**App Router** → Import wrapper:
```typescript
// app/(core)/enrich/page.tsx
import { EnrichDashboard } from '@/features/enrich'
export default EnrichDashboard
```

**API Routes** → HTTP adapter:
```typescript
// app/api/enrich/route.ts
import { runEnrichment } from '@/services/enrichment'
export async function POST(req) {
  const result = await runEnrichment(data)
  return Response.json(result)
}
```

**Components** → Feature ownership:
```typescript
// Before: components/enrich/BulkEnrichTable.tsx
// After:  features/enrich/components/BulkEnrichTable.tsx
```

---

## 📊 Current State Analysis

### Existing Directories

| Directory | Status | Contents |
|-----------|--------|----------|
| `src/app/` | ✅ Good | Next.js routes and API endpoints |
| `src/lib/` | ❌ Needs refactor | Mixed: adapters, agents, platform, feature logic |
| `src/components/` | ⚠️ Partially organized | Mix of shared UI + feature-specific components |
| `src/hooks/` | ⚠️ Needs cleanup | Mix of feature-specific + platform hooks |
| `src/features/` | ✅ Ready | Empty directories (enrich, monitor, observe, recon, research) |
| `src/platform/` | ✅ Ready | Empty directory |
| `src/services/` | ✅ Ready | Empty directory |
| `src/shared/` | ✅ Ready | Empty directory |
| `src/context/` | 🆕 Needs creation | Doesn't exist yet |

---

## 🗺️ Migration Mapping

### 1. Platform Layer (Foundations)

**Purpose**: Infrastructure that everything else depends on

#### `platform/auth/`
- ✅ Move `lib/auth.ts` → `platform/auth/index.ts`
- ✅ Move `lib/auth-client.ts` → `platform/auth/client.ts`

#### `platform/db/`
- ✅ Move `lib/db/neon.ts` → `platform/db/neon.ts`
- 🆕 Add `platform/db/index.ts` (re-export)
- 🆕 Add `platform/db/kysely.ts` (if using Kysely)

#### `platform/billing/`
- ✅ Move `lib/stripe/stripe.ts` → `platform/billing/stripe.ts`
- ✅ Move `hooks/use-pro-status.ts` → `platform/billing/hooks/use-pro-status.ts`
- 🆕 Add `platform/billing/index.ts`

#### `platform/cache/`
- ✅ Move `lib/redis.ts` → `platform/cache/redis.ts`
- 🆕 Add `platform/cache/index.ts`

#### `platform/config/`
- 🆕 Create `platform/config/env.ts` (environment variables)
- 🆕 Create `platform/config/constants.ts` (app-wide constants)

#### `platform/observability/`
- 🆕 Create `platform/observability/logger.ts` (structured logging)
- 🆕 Create `platform/observability/metrics.ts` (telemetry)
- 🆕 Create `platform/observability/tracing.ts` (optional)

---

### 2. Lib Layer (Third-Party Adapters)

**Purpose**: Wrappers around external services and SDKs

#### `lib/firecrawl/`
- ✅ Keep `lib/firecrawl/client.ts` (already well-organized)
- ✅ Keep `lib/firecrawl/types.ts`
- ✅ Keep `lib/firecrawl/ai-tools.ts`

#### `lib/exa/` (to be created - Ticket #17)
- 🆕 Create `lib/exa/client.ts` (Exa SDK wrapper)
- 🆕 Create `lib/exa/types.ts`

#### `lib/ai/`
- ✅ Keep `lib/ai/models.ts` (Vercel AI SDK model configs)
- 🆕 Consider renaming to `lib/vercel-ai/` for clarity

#### `lib/stripe/` → Move to `platform/billing/`
- ❌ Delete (moved to platform)

---

### 3. Shared Layer (Cross-Runtime Utilities)

**Purpose**: Pure functions, types, schemas - no React dependencies

#### `shared/utils/`
- ✅ Move `lib/utils.ts` → `shared/utils/index.ts`
- 🆕 Extract non-React utilities from components

#### `shared/types/`
- 🆕 Create `shared/types/api.ts` (common API types)
- 🆕 Create `shared/types/common.ts` (shared domain types)

#### `shared/schemas/`
- 🆕 Create `shared/schemas/validation.ts` (Zod schemas used across features)

#### `shared/constants/`
- 🆕 Move app-wide constants from various places

---

### 4. Services Layer (Shared Behaviors)

**Purpose**: Orchestration, workflows, business logic shared across features

#### `services/enrichment/`
- ✅ Move `lib/agents/conductor.ts` → `services/enrichment/conductor.ts`
- ✅ Move `lib/agents/orchestrator.ts` → `services/enrichment/orchestrator.ts`
- ✅ Move `lib/agents/llm-provider.ts` → `services/enrichment/llm-provider.ts`
- ✅ Move `lib/agents/schemas.ts` → `services/enrichment/schemas.ts`
- ✅ Move `lib/agents/types.ts` → `services/enrichment/types.ts`
- ✅ Move `lib/agents/utils.ts` → `services/enrichment/utils.ts`

**Individual Agents**:
- ✅ Move `lib/agents/discovery.ts` → `services/enrichment/agents/discovery.ts`
- ✅ Move `lib/agents/company-profile.ts` → `services/enrichment/agents/company-profile.ts`
- ✅ Move `lib/agents/funding.ts` → `services/enrichment/agents/funding.ts`
- ✅ Move `lib/agents/tech-stack.ts` → `services/enrichment/agents/tech-stack.ts`
- ✅ Move `lib/agents/custom-fields.ts` → `services/enrichment/agents/custom-fields.ts`
- ✅ Move `lib/agents/competitive-discovery.ts` → `services/enrichment/agents/competitive-discovery.ts`
- ✅ Move `lib/agents/sentinel-agent.ts` → `services/enrichment/agents/sentinel-agent.ts`
- ✅ Move `lib/agents/index.ts` → `services/enrichment/index.ts`

#### `services/monitoring/` (future)
- 🆕 For shared monitoring/observability workflows

#### `services/notifications/` (future)
- 🆕 For email/webhook notification orchestration

---

### 5. Features Layer (Product Modules)

**Purpose**: Self-contained feature modules with their own components, hooks, types

#### `features/enrich/`
```
features/enrich/
  ├── components/           # Enrich-specific React components
  │   └── (move from src/components/enrich/)
  ├── hooks/               # Enrich-specific hooks
  │   └── useEnrichStream.ts  (from src/hooks/)
  ├── types/               # Enrich domain types
  │   └── stream-types.ts  (from lib/enrich/)
  ├── api/                 # API route handlers (if needed)
  └── index.ts             # Public API
```

**Migrations**:
- ✅ Move `hooks/useEnrichStream.ts` → `features/enrich/hooks/useEnrichStream.ts`
- ✅ Move `lib/enrich/stream-types.ts` → `features/enrich/types/stream-types.ts`
- ✅ Move `components/enrich/*` → `features/enrich/components/`

---

#### `features/research/`
```
features/research/
  ├── components/
  │   ├── SourcePanel.tsx      (from components/research/)
  │   ├── ThinkingPanel.tsx
  │   └── SynthesisPanel.tsx
  ├── types/
  │   ├── stream-types.ts      (from lib/research/)
  │   └── types.ts
  └── index.ts
```

**Migrations**:
- ✅ Move `components/research/*` → `features/research/components/`
- ✅ Move `lib/research/stream-types.ts` → `features/research/types/stream-types.ts`
- ✅ Move `lib/research/types.ts` → `features/research/types/types.ts`

---

#### `features/scouts/`
```
features/scouts/
  ├── components/
  │   ├── SearchProgressIndicator.tsx  (from components/scouts/)
  │   ├── StreamingInsightCard.tsx
  │   ├── AIThinkingStream.tsx
  │   └── LiveSentinelRunner.tsx
  ├── types/
  │   ├── stream-types.ts      (from lib/scouts/)
  │   └── types.ts
  └── index.ts
```

**Migrations**:
- ✅ Move `components/scouts/*` → `features/scouts/components/`
- ✅ Move `lib/scouts/stream-types.ts` → `features/scouts/types/stream-types.ts`
- ✅ Move `lib/scouts/types.ts` → `features/scouts/types/types.ts`

---

#### `features/brand-recon/`
```
features/brand-recon/
  ├── components/
  │   ├── ScreenshotPreview.tsx   (from components/brand-recon/)
  │   ├── ComponentPreview.tsx
  │   ├── BrandHeader.tsx
  │   ├── SpacingCard.tsx
  │   ├── TypographyCard.tsx
  │   ├── PositioningMatrix.tsx
  │   └── ColorSwatch.tsx
  ├── types/
  │   └── types.ts          (from lib/brand-recon/)
  └── index.ts
```

**Migrations**:
- ✅ Move `components/brand-recon/*` → `features/brand-recon/components/`
- ✅ Move `lib/brand-recon/types.ts` → `features/brand-recon/types/types.ts`

---

#### `features/observe/`
```
features/observe/
  ├── components/       # Monitor-related components
  ├── types/
  └── index.ts
```

---

### 6. Components Layer (Shared UI)

**Purpose**: React components used across features - primitives, layout, effects

#### Keep in `components/`
- ✅ `components/ui/*` - shadcn/ui primitives (stays)
- ✅ `components/effects/*` - Shared visual effects
- ✅ `components/particle-face.tsx` - Shared visual component
- ✅ `components/DynamicIsland.tsx` - Shared UI pattern
- ✅ `components/theme-provider.tsx` - Global theme
- ✅ `components/MenuProvider.tsx` - Global menu state
- ✅ `components/CommandMenu.tsx` - Global command palette
- ✅ `components/pricing-page.tsx` - Shared marketing component
- ✅ `components/upgrade-button.tsx` - Shared conversion component
- ✅ `components/pro-gate.tsx` - Shared access control
- ✅ `components/monitor-graph.tsx` - Shared visualization
- ✅ `components/radar.tsx` - Shared visualization
- ✅ `components/TypeWriter.tsx` - Shared effect
- ✅ `components/TargetCursor.tsx` - Shared effect
- ✅ `components/DotPattern.tsx` - Shared pattern
- ✅ `components/fui-decorations.tsx` - Shared FUI elements
- ✅ `components/classified-composition/*` - Shared layout

#### Move out to features
- ❌ `components/ai/*` → Delete or move to appropriate features
- ❌ `components/documents/*` → Move to features if feature-specific
- ❌ `components/research/*` → `features/research/components/`
- ❌ `components/scouts/*` → `features/scouts/components/`
- ❌ `components/brand-recon/*` → `features/brand-recon/components/`
- ❌ `components/enrich/*` → `features/enrich/components/`

---

### 7. Hooks Layer (Global Hooks Only)

**Purpose**: Truly global React hooks (should be rare)

#### Keep in `hooks/`
- Maybe none? Most hooks should be feature-specific

#### Move to features or platform
- ❌ `hooks/useEnrichStream.ts` → `features/enrich/hooks/`
- ❌ `hooks/use-pro-status.ts` → `platform/billing/hooks/`

---

### 8. Context Layer (Global Providers Only)

**Purpose**: Truly global React context providers (should be rarer)

#### To be created
- 🆕 `context/ThemeContext.tsx` (if theme-provider uses context)
- 🆕 `context/MenuContext.tsx` (if MenuProvider uses context)

Most feature-specific contexts should live in `features/[feature]/context/`

---

## 🔧 Migration Strategy

### Phase 1: Platform Foundation (Week 1)
**Goal**: Establish platform layer so everything can depend on it

1. Create `platform/` structure:
   - `platform/auth/`
   - `platform/db/`
   - `platform/billing/`
   - `platform/cache/`
   - `platform/config/`

2. Move platform files:
   - Auth: `lib/auth.ts`, `lib/auth-client.ts`
   - DB: `lib/db/neon.ts`
   - Billing: `lib/stripe/`, `hooks/use-pro-status.ts`
   - Cache: `lib/redis.ts`

3. Update imports across codebase:
   - Search/replace `@/src/lib/auth` → `@/src/platform/auth`
   - Search/replace `@/src/lib/db` → `@/src/platform/db`
   - Search/replace `@/src/lib/stripe` → `@/src/platform/billing`

4. Verify builds and tests pass

---

### Phase 2: Shared Utilities (Week 1)
**Goal**: Extract pure utilities and types

1. Create `shared/` structure:
   - `shared/utils/`
   - `shared/types/`
   - `shared/schemas/`

2. Move shared files:
   - `lib/utils.ts` → `shared/utils/index.ts`
   - Extract common types to `shared/types/`

3. Update imports:
   - Search/replace `@/src/lib/utils` → `@/src/shared/utils`

4. Verify builds and tests pass

---

### Phase 3: Services Layer (Week 2)
**Goal**: Organize enrichment orchestration logic

1. Create `services/enrichment/` structure:
   - `services/enrichment/agents/`
   - `services/enrichment/conductor.ts`
   - `services/enrichment/orchestrator.ts`

2. Move all agent files from `lib/agents/`

3. Update imports across codebase:
   - Search/replace `@/src/lib/agents` → `@/src/services/enrichment`

4. Verify enrichment workflow still works

---

### Phase 4: Features Migration (Week 2-3)
**Goal**: Self-contained feature modules

1. Migrate Enrich feature:
   - Create `features/enrich/` structure
   - Move components, hooks, types
   - Update imports

2. Migrate Research feature:
   - Create `features/research/` structure
   - Move components, types
   - Update imports

3. Migrate Scouts feature:
   - Create `features/scouts/` structure
   - Move components, types
   - Update imports

4. Migrate Brand Recon feature:
   - Create `features/brand-recon/` structure
   - Move components, types
   - Update imports

5. For each feature, verify:
   - Feature still works end-to-end
   - No broken imports
   - Tests pass

---

### Phase 5: Cleanup (Week 3)
**Goal**: Remove old structure, clean up

1. Delete empty directories:
   - `lib/agents/` (moved to services)
   - `lib/enrich/` (moved to features)
   - `lib/research/` (moved to features)
   - `lib/scouts/` (moved to features)
   - `lib/brand-recon/` (moved to features)
   - `lib/stripe/` (moved to platform)
   - `lib/db/` (moved to platform)

2. Clean up `components/`:
   - Remove feature-specific component directories
   - Keep only shared UI

3. Clean up `hooks/`:
   - Should be nearly empty
   - Only truly global hooks remain

4. Update documentation:
   - Update CLAUDE.md with new structure
   - Update PRD.md references
   - Update PLAN.md

5. Full test suite:
   - All modules
   - All API routes
   - All UI features

---

## 📋 Import Path Updates

### Before → After

```typescript
// Platform
'@/src/lib/auth' → '@/src/platform/auth'
'@/src/lib/db/neon' → '@/src/platform/db'
'@/src/lib/stripe' → '@/src/platform/billing'
'@/src/lib/redis' → '@/src/platform/cache'

// Shared
'@/src/lib/utils' → '@/src/shared/utils'

// Services
'@/src/lib/agents' → '@/src/services/enrichment'
'@/src/lib/agents/conductor' → '@/src/services/enrichment/conductor'
'@/src/lib/agents/discovery' → '@/src/services/enrichment/agents/discovery'

// Features
'@/src/lib/enrich/stream-types' → '@/src/features/enrich/types/stream-types'
'@/src/lib/research/types' → '@/src/features/research/types'
'@/src/components/research/SourcePanel' → '@/src/features/research/components/SourcePanel'
'@/src/hooks/useEnrichStream' → '@/src/features/enrich/hooks/useEnrichStream'
'@/src/hooks/use-pro-status' → '@/src/platform/billing/hooks/use-pro-status'

// Lib (mostly unchanged)
'@/src/lib/firecrawl/client' → '@/src/lib/firecrawl/client' (stays)
'@/src/lib/ai/models' → '@/src/lib/vercel-ai/models' (renamed)
```

---

## 🎯 Success Criteria

- [ ] All platform code in `platform/`
- [ ] All third-party adapters in `lib/`
- [ ] All feature code in `features/[feature]/`
- [ ] All shared orchestration in `services/`
- [ ] All cross-runtime utilities in `shared/`
- [ ] Feature-specific components in `features/[feature]/components/`
- [ ] Only shared UI components in `components/`
- [ ] `hooks/` is minimal or empty (feature hooks in features)
- [ ] All imports updated and verified
- [ ] All tests passing
- [ ] No duplicate code
- [ ] No dead code
- [ ] Documentation updated

---

## 🚨 Risks & Mitigation

### Risk: Breaking Imports
**Mitigation**:
- Work in feature branch
- Update imports in batches
- Run TypeScript check after each phase
- Keep rollback plan ready

### Risk: Test Failures
**Mitigation**:
- Run full test suite after each phase
- Fix tests immediately before moving to next phase
- Keep test coverage metrics

### Risk: Runtime Errors
**Mitigation**:
- Test in development environment first
- Deploy to staging before production
- Monitor error logs closely
- Have rollback script ready

### Risk: Developer Confusion
**Mitigation**:
- Update CLAUDE.md with new structure immediately
- Create migration guide for team
- Update import path conventions in docs
- Use lint rules to enforce new structure

---

## 📚 Benefits

### Developer Experience
- **Clear separation of concerns**: Easy to find code
- **Feature isolation**: Work on features without cross-contamination
- **Explicit dependencies**: Platform → Services → Features hierarchy
- **Easier onboarding**: New developers understand structure instantly

### Code Quality
- **Reduced coupling**: Features don't depend on each other
- **Better testability**: Each layer can be tested independently
- **Easier refactoring**: Feature boundaries make changes safer
- **Less dead code**: Clear ownership prevents orphaned files

### Maintenance
- **Scalability**: Easy to add new features
- **Team collaboration**: Multiple teams can work on different features
- **Code reuse**: Shared services and platform code well-organized
- **Documentation**: Structure itself is documentation

---

## 🔗 Related Tickets

- **Ticket #17**: Exa SDK Integration → Creates `lib/exa/`
- **Ticket #18**: Remove Dead Enrich Prototype → Cleanup before restructure
- **Ticket #28**: Repository Restructure (this plan)

---

**Plan Status**: Ready for Review
**Estimated Effort**: 3-4 weeks
**Risk Level**: Medium (import changes across large codebase)
**Priority**: P1 (technical debt reduction, developer experience improvement)
