# FireGEO - Cursor Rules

## Overview
This document defines patterns and best practices for implementing authentication, billing, and usage tracking features based on the canonical **FireGEO** repository patterns. FireGEO is a SaaS starter that includes Better Auth, Autumn billing (with Stripe integration), and usage tracking.

**Source Repository**: https://github.com/firecrawl/firegeo

## Core Concept
FireGEO provides a complete SaaS foundation with:
- **Better Auth** for authentication (email/password, OAuth)
- **Autumn billing** (usage-based with Stripe integration) OR direct Stripe
- **Usage tracking** with feature limits per plan
- **Plan gating** to restrict features by subscription tier
- **Brand monitoring** integration with Firecrawl

## Authentication Pattern (Better Auth)

### Configuration

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { PostgresDialect } from "kysely";

export const auth = betterAuth({
  database: {
    dialect: new PostgresDialect({ pool }),
    type: "postgres"
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false // or true for production
  },
  user: {
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at"
    },
    additionalFields: {
      stripeCustomerId: {
        type: "string",
        required: false,
        fieldName: "stripe_customer_id"
      },
      subscriptionStatus: {
        type: "string",
        required: false,
        fieldName: "subscription_status",
        defaultValue: "free"
      }
    }
  }
});
```

### API Route Handler

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Server-Side Session Check

```typescript
// In API routes or server components
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userId = session.user.id;
  // Continue with authenticated logic
}
```

### Client-Side Auth Hook

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL
});

// In components
'use client';
import { useSession } from "@/lib/auth-client";

export function Component() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <LoadingSpinner />;
  if (!session) return <SignInPrompt />;
  
  // Render authenticated UI
}
```

## Billing Pattern

### Stripe Integration (Current Implementation)

```typescript
// lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia"
});
```

### Checkout Session Creation

```typescript
// app/api/stripe/checkout/route.ts
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { priceId } = await req.json();
  
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email,
    client_reference_id: session.user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pro/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId: session.user.id }
  });
  
  return NextResponse.json({ url: checkoutSession.url });
}
```

### Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;
  
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await sql`
        UPDATE "user"
        SET stripe_customer_id = ${session.customer as string},
            subscription_status = 'active',
            updated_at = NOW()
        WHERE id = ${session.metadata.userId}
      `;
      break;
    }
    
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const status = mapStripeStatus(subscription.status);
      await sql`
        UPDATE "user"
        SET subscription_status = ${status}
        WHERE stripe_customer_id = ${subscription.customer}
      `;
      break;
    }
    
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await sql`
        UPDATE "user"
        SET subscription_status = 'inactive'
        WHERE stripe_customer_id = ${subscription.customer}
      `;
      break;
    }
  }
  
  return NextResponse.json({ received: true });
}

function mapStripeStatus(status: string): string {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
      return "inactive";
    default:
      return "inactive";
  }
}
```

### Autumn Billing Pattern (Alternative)

```typescript
// lib/autumn.ts
import { Autumn } from "@autumnhq/autumn";

export const autumn = new Autumn({
  secretKey: process.env.AUTUMN_SECRET_KEY!
});

// Usage tracking
await autumn.usage.record({
  customerId: userId,
  featureId: "messages",
  quantity: 1,
  timestamp: new Date()
});

// Check usage limits
const usage = await autumn.usage.get({
  customerId: userId,
  featureId: "messages"
});

const plan = await autumn.plans.get({ customerId: userId });
const limit = plan.features.find(f => f.id === "messages")?.limit || 0;

if (usage.total >= limit && limit > 0) {
  throw new Error("Usage limit exceeded");
}
```

## Usage Tracking Pattern

### Database Schema

```sql
CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id),
  event_type TEXT NOT NULL, -- 'enrichment', 'scout_run', 'monitor_check', etc.
  module TEXT NOT NULL, -- 'enrich', 'scouts', 'monitors', etc.
  input_value TEXT,
  status TEXT DEFAULT 'success', -- 'success', 'failed', 'limited'
  metadata JSONB, -- Additional context
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usage_events_user_id ON usage_events(user_id, created_at DESC);
CREATE INDEX idx_usage_events_module ON usage_events(module, created_at DESC);
```

### Usage Recording Pattern

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
}

// Usage in API routes
try {
  // ... perform operation
  await recordUsage({
    userId,
    eventType: "enrichment",
    module: "enrich",
    inputValue: domain,
    status: "success",
    metadata: { duration_ms: result.duration_ms, icp_score: result.icp_fit_score },
    creditsUsed: calculateCredits(result)
  });
} catch (error) {
  await recordUsage({
    userId,
    eventType: "enrichment",
    module: "enrich",
    inputValue: domain,
    status: "failed",
    metadata: { error: error.message }
  });
  throw error;
}
```

### Usage Limit Checking Pattern

```typescript
// lib/permissions.ts
import { sql } from "@/lib/db/neon";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function checkUsageLimit(
  userId: string,
  module: string,
  period: "daily" | "monthly" = "monthly"
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  // Get user's plan
  const [user] = await sql`
    SELECT subscription_status, stripe_customer_id
    FROM "user"
    WHERE id = ${userId}
  `;
  
  // Get plan limits
  const limits = getPlanLimits(user.subscription_status);
  const moduleLimit = limits[module] || 0; // 0 = unlimited
  
  if (moduleLimit === 0) {
    return { allowed: true, remaining: -1, limit: -1 }; // Unlimited
  }
  
  // Get usage for period
  const startDate = period === "daily"
    ? sql`DATE_TRUNC('day', NOW())`
    : sql`DATE_TRUNC('month', NOW())`;
  
  const [usage] = await sql`
    SELECT COUNT(*) as count
    FROM usage_events
    WHERE user_id = ${userId}
      AND module = ${module}
      AND status = 'success'
      AND created_at >= ${startDate}
  `;
  
  const used = parseInt(usage.count || "0");
  const remaining = moduleLimit - used;
  
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    limit: moduleLimit
  };
}

function getPlanLimits(status: string): Record<string, number> {
  switch (status) {
    case "active": // Pro plan
      return {
        enrich: 0, // Unlimited
        scouts: 0,
        monitors: 0,
        research: 0
      };
    case "free":
    default:
      return {
        enrich: 10, // 10 per month
        scouts: 5,
        monitors: 5,
        research: 10
      };
  }
}

// Usage in API routes
export async function enforceUsageLimit(
  userId: string,
  module: string
): Promise<void> {
  const check = await checkUsageLimit(userId, module);
  
  if (!check.allowed) {
    throw new Error(
      `Usage limit exceeded. You have used ${check.limit}/${check.limit} ${module} operations this month. Upgrade to Pro for unlimited access.`
    );
  }
}
```

## Plan Gating Pattern

### Server-Side Gate

```typescript
// lib/permissions.ts
export async function isProMember(userId: string): Promise<boolean> {
  const [user] = await sql`
    SELECT subscription_status
    FROM "user"
    WHERE id = ${userId}
  `;
  
  return user?.subscription_status === "active";
}

// Usage in API routes
export async function requirePro(req: Request): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  
  const isPro = await isProMember(session.user.id);
  if (!isPro) {
    throw new Error("Pro subscription required");
  }
  
  return session.user.id;
}
```

### Client-Side Gate Component

```typescript
// components/pro-gate.tsx
'use client';
import { useProStatus } from "@/hooks/use-pro-status";
import { UpgradeButton } from "@/components/upgrade-button";

export function ProGate({
  children,
  fallback
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isPro, isLoading } = useProStatus();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isPro) {
    return fallback || (
      <div className="pro-gate">
        <h3>Pro Feature</h3>
        <p>This feature requires a Pro subscription.</p>
        <UpgradeButton />
      </div>
    );
  }
  
  return <>{children}</>;
}
```

### Hook for Pro Status

```typescript
// hooks/use-pro-status.ts
import useSWR from "swr";

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function useProStatus() {
  const { data, error, isLoading } = useSWR("/api/user/pro-status", fetcher);
  
  return {
    isPro: data?.isPro || false,
    isLoading,
    error
  };
}

// API route
// app/api/user/pro-status/route.ts
export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const isPro = await isProMember(session.user.id);
  return NextResponse.json({ isPro });
}
```

## Brand Monitoring Pattern (FireGEO Feature)

### Brand Extraction Integration

```typescript
// app/api/brand-monitor/route.ts
export async function POST(req: Request) {
  const userId = await requirePro(req); // Pro-only feature
  const { url } = await req.json();
  
  // Extract brand identity using Firecrawl
  const firecrawl = getFirecrawlClient();
  const result = await firecrawl.scrape(url, {
    formats: ["markdown", "html"],
    actions: [{ type: "screenshot" }],
    onlyMainContent: true
  });
  
  // Extract brand data
  const brandData = await extractBrandIdentity(result.data);
  
  // Save to database
  await sql`
    INSERT INTO brand_extractions (user_id, url, brand_data, created_at)
    VALUES (${userId}, ${url}, ${JSON.stringify(brandData)}, NOW())
  `;
  
  return NextResponse.json({ success: true, data: brandData });
}
```

## Best Practices

### Security
1. **Always check authentication** in API routes
2. **Validate user ownership** before allowing operations
3. **Use RLS policies** in database for defense in depth
4. **Sanitize webhook payloads** before database updates
5. **Rate limit** usage tracking endpoints

### Billing
1. **Idempotent webhooks**: Handle duplicate webhook events gracefully
2. **Subscription sync**: Periodically sync subscription status from Stripe
3. **Grace period**: Allow usage during grace period for past_due subscriptions
4. **Usage limits**: Enforce limits server-side, not just client-side
5. **Credit calculation**: Track credits used per operation for accurate billing

### Usage Tracking
1. **Async logging**: Log usage events asynchronously to avoid blocking operations
2. **Batch inserts**: Batch multiple usage events when possible
3. **Retention policy**: Archive old usage events periodically
4. **Analytics**: Aggregate usage data for dashboard/analytics
5. **Error handling**: Don't fail operations if usage logging fails

## Integration with Unified Suite

### Current Implementation
- **Location**: `lib/auth.ts`, `lib/stripe.ts`, `lib/permissions.ts`, `app/api/stripe/`, `app/api/webhooks/`
- **Status**: Better Auth + Stripe implemented, usage tracking implemented
- **Missing**: Autumn integration (optional), advanced usage analytics

### Suite-Level Enhancements
1. **Multi-provider auth**: Add OAuth providers (Google, GitHub)
2. **Usage dashboard**: Build dashboard showing usage across all modules
3. **Credit system**: Implement credit-based billing for AI operations
4. **Trial periods**: Add trial period support for new users
5. **Usage alerts**: Notify users when approaching limits

## File Structure
```
lib/
  auth.ts                        # Better Auth configuration
  auth-client.ts                 # Client-side auth hooks
  stripe.ts                      # Stripe client
  permissions.ts                 # Plan gating and usage limits
  usage.ts                       # Usage tracking functions
app/
  api/
    auth/
      [...all]/
        route.ts                 # Catch-all auth handler
    stripe/
      checkout/
        route.ts                 # Create checkout session
      portal/
        route.ts                 # Customer portal
    webhooks/
      stripe/
        route.ts                 # Stripe webhook handler
    user/
      pro-status/
        route.ts                 # Get user pro status
components/
  pro-gate.tsx                   # Pro feature gate component
  upgrade-button.tsx             # Upgrade CTA button
  pricing-page.tsx               # Pricing page
hooks/
  use-pro-status.ts              # Client-side pro status hook
```

## Environment Variables
```bash
# Authentication
BETTER_AUTH_SECRET=your-secret-key  # Generate with: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...  # Pro plan price ID

# Autumn (optional)
AUTUMN_SECRET_KEY=your-autumn-key
```

## References
- [FireGEO Repository](https://github.com/firecrawl/firegeo)
- [FireGEO README](https://github.com/firecrawl/firegeo/blob/main/README.md)
- [Better Auth Docs](https://better-auth.com)
- [Autumn Docs](https://docs.useautumn.com)
- [Stripe Docs](https://stripe.com/docs)
