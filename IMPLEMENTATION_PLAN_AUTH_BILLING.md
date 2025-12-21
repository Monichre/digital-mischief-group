# Implementation Plan: User Authentication (Better Auth) & Stripe Billing

## Status: ✅ IMPLEMENTED

---

## 1. Project Review & Context

- **Framework**: Next.js 16 (App Router)
- **Database**: Neon PostgreSQL
- **Auth Solution**: Better Auth (zero-cost, self-hosted)
- **Billing**: Stripe (pay-as-you-go)

---

## 2. Files Created/Modified

### Authentication

| File | Purpose |
|------|---------|
| `lib/auth.ts` | Better Auth configuration with Neon Postgres |
| `lib/auth-client.ts` | Client-side auth hooks |
| `app/api/auth/[...all]/route.ts` | Catch-all auth API handler |
| `app/sign-in/page.tsx` | Sign-in page with DMG FUI styling |
| `app/sign-up/page.tsx` | Sign-up page with password requirements |
| `middleware.ts` | Route protection for authenticated routes |

### Billing

| File | Purpose |
|------|---------|
| `lib/stripe.ts` | Stripe SDK client |
| `lib/permissions.ts` | `isProMember()` check with admin whitelist |
| `app/api/stripe/checkout/route.ts` | Creates Stripe Checkout sessions |
| `app/api/webhooks/stripe/route.ts` | Handles `checkout.session.completed`, `subscription.updated`, `subscription.deleted`, `invoice.payment_failed` |
| `app/actions/user.ts` | Server action for pro status |
| `hooks/use-pro-status.ts` | SWR hook for client-side pro status |

### UI Components

| File | Purpose |
|------|---------|
| `components/pricing-page.tsx` | Pricing page with Free/Pro tiers |
| `components/pro-gate.tsx` | Gate component to lock Pro features |
| `components/upgrade-button.tsx` | CTA button that initiates checkout |
| `components/ui/card.tsx` | Card UI components (shadcn-style) |
| `components/ui/skeleton.tsx` | Skeleton loading component |
| `app/pricing/page.tsx` | Pricing route |

### Database Migrations

| File | Purpose |
|------|---------|
| `scripts/002-add-auth-tables.sql` | User, Session, Account, Verification tables |
| `scripts/003-add-missing-columns.sql` | Add missing columns to existing tables |
| `scripts/004-add-user-scoping.sql` | Add `user_id` to `brand_extractions`, `enrichment_jobs`, `usage_events` |

---

## 3. Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://...

# Better Auth
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...

# Admin Whitelist (optional)
ADMIN_EMAILS=admin@example.com,another@example.com
```

---

## 4. Protected Routes

The following routes require authentication (handled by `middleware.ts`):

- `/enrich`
- `/brand-recon`
- `/scouts`
- `/observe`
- `/research`
- `/arsenal`
- `/burn-logs`
- `/settings`
- `/api/enrich`
- `/api/brand-recon`
- `/api/scouts`
- `/api/monitors`
- `/api/research`
- `/api/stripe/checkout`

---

## 5. Usage Examples

### Gate a feature to Pro users

```tsx
import { ProGate } from "@/components/pro-gate";

export default function EnrichPage() {
  return (
    <ProGate>
      {/* Pro-only content */}
      <EnrichmentTool />
    </ProGate>
  );
}
```

### Check Pro status in server component

```ts
import { auth } from "@/lib/auth";
import { isProMember } from "@/lib/permissions";
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const isPro = await isProMember(session.user.id);
  // ...
}
```

### Check Pro status in client component

```tsx
"use client";
import { useProStatus } from "@/hooks/use-pro-status";

export function MyComponent() {
  const { isPro, isLoading } = useProStatus();
  
  if (isLoading) return <Skeleton />;
  if (!isPro) return <UpgradePrompt />;
  
  return <ProFeature />;
}
```

---

## 6. Next Steps (Optional Enhancements)

- [ ] Add email verification via Resend
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Create a `/settings` page for subscription management
- [ ] Add Stripe Customer Portal for self-serve billing changes
- [ ] Implement usage-based credits system
- [ ] Add rate limiting per plan tier
