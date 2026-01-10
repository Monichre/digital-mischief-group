# DMG Repo - Customer Zero Integration Rules

## Overview
This document defines patterns and best practices for integrating features from source repositories into the **Digital Mischief Group** unified suite. This repository serves as the "customer zero" implementation, combining patterns from multiple source repos into a single cohesive platform.

**Repository**: https://github.com/Monichre/digital-mischief-group

## Core Concept
The DMG repository integrates:
- **Unified authentication** (Better Auth) across all modules
- **Shared database** (PostgreSQL/Neon) with user-scoped tables
- **Common UI components** with DMG brand system
- **Module-specific APIs** (enrich, scouts, monitors, research, brand-recon)
- **Usage tracking** and plan gating for all features
- **Firecrawl integration** as the core scraping/search engine

## Integration Patterns

### Module Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Unified Suite (DMG Repo)                                │
├─────────────────────────────────────────────────────────┤
│  Shared Infrastructure                                    │
│  ├── Auth (Better Auth)                                  │
│  ├── Database (PostgreSQL with RLS)                      │
│  ├── Billing (Stripe + Usage Tracking)                   │
│  └── UI Components (DMG Brand System)                    │
├─────────────────────────────────────────────────────────┤
│  Module: Enrich (from fire-enrich)                       │
│  ├── Multi-phase agent orchestration                     │
│  ├── Sequential execution with parallel searches         │
│  └── Source attribution                                  │
├─────────────────────────────────────────────────────────┤
│  Module: Scouts (from open-scouts)                       │
│  ├── Scheduled web monitoring                            │
│  ├── URL deduplication (seen_urls)                       │
│  └── Email notifications                                 │
├─────────────────────────────────────────────────────────┤
│  Module: Observe (from firecrawl-observer)               │
│  ├── Change detection (hash comparison)                  │
│  ├── Diff generation                                     │
│  └── AI-powered change analysis                          │
├─────────────────────────────────────────────────────────┤
│  Module: Research (from open-researcher)                 │
│  ├── Split-view UI (thinking/synthesis/sources)          │
│  ├── Streaming reasoning                                 │
│  └── Automatic citations                                 │
├─────────────────────────────────────────────────────────┤
│  Module: Brand Recon (from FireGEO)                      │
│  ├── Brand identity extraction                           │
│  ├── Competitive analysis                                │
│  └── Market positioning                                  │
└─────────────────────────────────────────────────────────┘
```

### Database Schema Pattern

```sql
-- Shared user table (Better Auth)
CREATE TABLE "user" (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module: Enrich
CREATE TABLE enrichment_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  input_value TEXT NOT NULL,
  domain TEXT,
  discovery_data JSONB,
  profile_data JSONB,
  funding_data JSONB,
  tech_stack_data JSONB,
  sources TEXT[],
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module: Scouts
CREATE TABLE scouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  name TEXT NOT NULL,
  search_query TEXT NOT NULL,
  schedule TEXT DEFAULT 'manual',
  seen_urls TEXT[] DEFAULT '{}',
  last_run_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module: Monitors
CREATE TABLE monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  check_interval INTEGER DEFAULT 60,
  last_content_hash TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shared: Usage Tracking
CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  event_type TEXT NOT NULL,
  module TEXT NOT NULL,
  status TEXT DEFAULT 'success',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (applied to all tables)
ALTER TABLE enrichment_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own enrichment jobs"
  ON enrichment_jobs FOR ALL
  USING (auth.uid() = user_id);

-- Repeat for all module tables...
```

### API Route Pattern

```typescript
// Standard API route pattern for all modules
// app/api/[module]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    
    // 2. Usage limit check (if applicable)
    await enforceUsageLimit(userId, "module_name");
    
    // 3. Parse and validate input
    const body = await req.json();
    const validated = validateInput(body); // Zod schema
    
    // 4. Execute module-specific logic
    const result = await executeModuleLogic(validated, userId);
    
    // 5. Record usage
    await recordUsage({
      userId,
      eventType: "module_operation",
      module: "module_name",
      status: "success",
      metadata: { /* relevant data */ }
    });
    
    // 6. Return result
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    // Error handling
    await recordUsage({
      userId,
      eventType: "module_operation",
      module: "module_name",
      status: "failed",
      metadata: { error: error.message }
    });
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### Module Integration Pattern

```typescript
// lib/modules/index.ts
// Centralized module configuration and utilities

export const MODULES = {
  enrich: {
    name: "Enrich",
    route: "/enrich",
    api: "/api/enrich",
    icon: "Target",
    description: "Multi-phase lead enrichment",
    plan: "free" // or "pro"
  },
  scouts: {
    name: "Scouts",
    route: "/scouts",
    api: "/api/scouts",
    icon: "Search",
    description: "Scheduled web monitoring",
    plan: "free"
  },
  observe: {
    name: "Observe",
    route: "/observe",
    api: "/api/monitors",
    icon: "Eye",
    description: "Website change detection",
    plan: "free"
  },
  research: {
    name: "Research",
    route: "/research",
    api: "/api/research",
    icon: "Brain",
    description: "AI-powered research assistant",
    plan: "pro"
  },
  brandRecon: {
    name: "Brand Recon",
    route: "/brand-recon",
    api: "/api/brand-recon",
    icon: "Shield",
    description: "Brand identity extraction",
    plan: "pro"
  }
} as const;

export function getModuleConfig(moduleName: keyof typeof MODULES) {
  return MODULES[moduleName];
}

export function checkModuleAccess(userPlan: string, moduleName: keyof typeof MODULES): boolean {
  const module = MODULES[moduleName];
  if (module.plan === "free") return true;
  return userPlan === "active"; // Pro plan
}
```

## Shared Utilities Pattern

### Firecrawl Client Wrapper

```typescript
// lib/firecrawl/client.ts
import FirecrawlApp from "@mendable/firecrawl-js";

let firecrawlInstance: FirecrawlApp | null = null;

export function getFirecrawlClient(): FirecrawlApp {
  if (!firecrawlInstance) {
    firecrawlInstance = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY!
    });
  }
  return firecrawlInstance;
}

// Shared wrapper methods
export async function searchFirecrawl(query: string, options?: { limit?: number }) {
  const client = getFirecrawlClient();
  return client.search(query, { limit: options?.limit || 20 });
}

export async function scrapeFirecrawl(url: string, options?: { formats?: string[] }) {
  const client = getFirecrawlClient();
  return client.scrapeUrl(url, {
    formats: options?.formats || ["markdown"],
    onlyMainContent: true
  });
}
```

### Usage Tracking Utility

```typescript
// lib/usage.ts
import { sql } from "@/lib/db/neon";

export async function recordUsage(event: {
  userId: string;
  eventType: string;
  module: string;
  inputValue?: string;
  status: "success" | "failed" | "limited";
  metadata?: Record<string, any>;
  creditsUsed?: number;
}): Promise<void> {
  try {
    await sql`
      INSERT INTO usage_events (
        user_id, event_type, module, input_value, status, metadata, credits_used
      ) VALUES (
        ${event.userId},
        ${event.eventType},
        ${event.module},
        ${event.inputValue || null},
        ${event.status},
        ${event.metadata ? JSON.stringify(event.metadata) : null},
        ${event.creditsUsed || 0}
      )
    `;
  } catch (error) {
    // Log but don't fail the operation
    console.error("[Usage] Failed to record usage:", error);
  }
}
```

### Plan Gating Utility

```typescript
// lib/permissions.ts
import { sql } from "@/lib/db/neon";

export async function isProMember(userId: string): Promise<boolean> {
  const [user] = await sql`
    SELECT subscription_status
    FROM "user"
    WHERE id = ${userId}
  `;
  return user?.subscription_status === "active";
}

export async function requirePro(userId: string): Promise<void> {
  const isPro = await isProMember(userId);
  if (!isPro) {
    throw new Error("Pro subscription required for this feature");
  }
}

export async function checkUsageLimit(
  userId: string,
  module: string
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const [user] = await sql`SELECT subscription_status FROM "user" WHERE id = ${userId}`;
  const limits = getPlanLimits(user?.subscription_status || "free");
  const moduleLimit = limits[module] || 0;
  
  if (moduleLimit === 0) {
    return { allowed: true, remaining: -1, limit: -1 }; // Unlimited
  }
  
  const [usage] = await sql`
    SELECT COUNT(*) as count
    FROM usage_events
    WHERE user_id = ${userId}
      AND module = ${module}
      AND status = 'success'
      AND created_at >= DATE_TRUNC('month', NOW())
  `;
  
  const used = parseInt(usage.count || "0");
  const remaining = Math.max(0, moduleLimit - used);
  
  return {
    allowed: remaining > 0,
    remaining,
    limit: moduleLimit
  };
}
```

## Component Sharing Pattern

### Shared UI Components

```typescript
// components/ui/module-card.tsx
interface ModuleCardProps {
  module: typeof MODULES[keyof typeof MODULES];
  userPlan: string;
  usage?: { count: number; limit: number };
}

export function ModuleCard({ module, userPlan, usage }: ModuleCardProps) {
  const hasAccess = checkModuleAccess(userPlan, module.name as keyof typeof MODULES);
  const Icon = getIcon(module.icon);
  
  return (
    <Link href={hasAccess ? module.route : "/pricing"}>
      <div className={cn(
        "border rounded-lg p-6 hover:border-orange-500/50 transition-colors",
        !hasAccess && "opacity-50 cursor-not-allowed"
      )}>
        <div className="flex items-center gap-3 mb-3">
          <Icon className="w-6 h-6 text-orange-500" />
          <h3 className="font-mono text-lg">{module.name}</h3>
          {module.plan === "pro" && (
            <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded">
              PRO
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-400 mb-4">{module.description}</p>
        {usage && (
          <div className="text-xs text-zinc-500 font-mono">
            {usage.count} / {usage.limit === -1 ? "∞" : usage.limit} used
          </div>
        )}
      </div>
    </Link>
  );
}
```

## Best Practices

### Module Isolation
1. **Separate API routes**: Each module has its own `/api/[module]` route
2. **Isolated logic**: Module-specific logic in `lib/[module]/` directory
3. **Shared utilities**: Common patterns in `lib/` (auth, db, firecrawl, usage)
4. **Component sharing**: UI components in `components/ui/` and `components/[module]/`

### User Scoping
1. **Always filter by user_id**: All database queries must include `user_id` filter
2. **RLS policies**: Enable Row Level Security on all tables
3. **Auth checks**: Verify authentication in every API route
4. **Usage tracking**: Log all operations to `usage_events` table

### Error Handling
1. **Graceful degradation**: Modules should fail independently
2. **User-friendly errors**: Return meaningful error messages
3. **Error logging**: Log errors with context for debugging
4. **Usage tracking**: Record failed operations for analytics

### Performance
1. **Parallel operations**: Use `Promise.all()` where possible
2. **Streaming responses**: Use SSE for long-running operations
3. **Caching**: Cache expensive operations when appropriate
4. **Rate limiting**: Implement rate limits per user/module

## File Structure
```
app/
  api/
    enrich/                      # Enrich module API
    scouts/                      # Scouts module API
    monitors/                    # Observe module API
    research/                    # Research module API
    brand-recon/                 # Brand Recon module API
    stripe/                      # Shared billing API
    user/                        # Shared user API
  enrich/                        # Enrich UI pages
  scouts/                        # Scouts UI pages
  observe/                       # Observe UI pages
  research/                      # Research UI pages
  brand-recon/                   # Brand Recon UI pages
lib/
  agents/                        # Enrich agents (from fire-enrich)
  scouts/                        # Scouts utilities (from open-scouts)
  monitors/                      # Observer utilities (from firecrawl-observer)
  research/                      # Research utilities (from open-researcher)
  brand-recon/                   # Brand recon utilities (from FireGEO)
  firecrawl/                     # Shared Firecrawl client
  auth.ts                        # Shared auth (from FireGEO)
  stripe.ts                      # Shared Stripe client
  permissions.ts                 # Shared plan gating
  usage.ts                       # Shared usage tracking
components/
  ui/                            # Shared UI components
  enrich/                        # Enrich-specific components
  scouts/                        # Scouts-specific components
  monitors/                      # Observer-specific components
  research/                      # Research-specific components
  brand-recon/                   # Brand recon-specific components
scripts/
  00*.sql                        # Database migrations
docs/
  code/
    FIRE_ENRICH_RULES.md         # Enrich module rules
    OPEN_SCOUTS_RULES.md         # Scouts module rules
    FIRECRAWL_OBSERVER_RULES.md  # Observer module rules
    FIREGEO_RULES.md             # Auth/billing rules
    OPEN_RESEARCHER_RULES.md     # Research module rules
    DMG_BRAND_SYSTEM_RULES.md    # Brand system rules
    DMG_REPO_RULES.md            # This file
```

## Migration Strategy

### Adding New Module from Source Repo

1. **Analyze source patterns**: Review source repository for core patterns
2. **Extract shared logic**: Identify what can be shared vs. module-specific
3. **Create module directory**: Set up `lib/[module]/` and `app/api/[module]/`
4. **Database schema**: Add tables with `user_id` column and RLS policies
5. **API routes**: Implement following standard API route pattern
6. **UI pages**: Create pages using shared UI components
7. **Usage tracking**: Integrate with shared usage tracking system
8. **Plan gating**: Add plan restrictions if module requires Pro
9. **Documentation**: Create cursor rules file in `docs/code/`

### Example: Adding Observer Module

```typescript
// 1. Create database migration
// scripts/007-add-monitors-tables.sql
CREATE TABLE monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  -- ... rest of schema
);

// 2. Create API routes
// app/api/monitors/route.ts
export async function POST(req: NextRequest) {
  const userId = await requireAuth(req);
  // ... observer-specific logic
}

// 3. Create UI pages
// app/observe/page.tsx
export default function ObservePage() {
  // ... observer UI
}

// 4. Add to module registry
// lib/modules/index.ts
export const MODULES = {
  // ... existing
  observe: {
    name: "Observe",
    route: "/observe",
    api: "/api/monitors",
    // ...
  }
};
```

## Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Billing
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# Firecrawl (core integration)
FIRECRAWL_API_KEY=fc-...

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PERPLEXITY_API_KEY=pplx-...
EXA_API_KEY=...
SERPER_API_KEY=...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@digitalmischiefgroup.com
```

## References
- [DMG Repository](https://github.com/Monichre/digital-mischief-group)
- [PRD.md](./PRD.md) - Complete module mappings and requirements
- [PLAN.md](./PLAN.md) - Implementation guidance
- Source repository rules in `docs/code/`:
  - FIRE_ENRICH_RULES.md
  - OPEN_SCOUTS_RULES.md
  - FIRECRAWL_OBSERVER_RULES.md
  - FIREGEO_RULES.md
  - OPEN_RESEARCHER_RULES.md
  - DMG_BRAND_SYSTEM_RULES.md
