# Auth + Billing Notes (Better Auth + Stripe + Neon/Postgres)

This doc captures the implementation + debugging notes for the Better Auth + Stripe billing integration in this repo.

## Current “known-good” auth configuration

- **Auth instance**: `lib/auth.ts`
  - Uses a **Node Postgres connection** (`pg.Pool`) and provides an explicit **Kysely `PostgresDialect`** to Better Auth.
  - Uses **snake_case field mappings** to match the Postgres schema created by `scripts/002-add-auth-tables.sql`.
- **Route handler**: `app/api/auth/[...all]/route.ts`
  - Uses `toNextJsHandler(auth)`
  - **Forces Node runtime** with `export const runtime = "nodejs"` (important: `pg` is not Edge-compatible).
- **Middleware**: `middleware.ts`
  - **Edge-safe**: does *not* import `auth` (which would pull Node-only deps into Edge).
  - Uses `getSessionCookie(request)` to do a lightweight auth check.

## Why the failures happened (root causes)

### 1) `Failed to initialize database adapter`

This error was caused by Better Auth not being able to construct a DB adapter from the provided `database` config.

What worked best in this repo:

- Pass a **real `pg.Pool`** and/or provide a **Kysely dialect** explicitly (see `lib/auth.ts`).

What was flaky / problematic:

- Passing `@neondatabase/serverless` Pool (version differences and driver behavior).
- Relying on runtime detection in certain bundling situations.

### 2) 422 `UNPROCESSABLE_ENTITY` on sign-up

When sign-up returned **422**, the server logs showed errors like:

- `column "emailVerified" of relation "user" does not exist`

That means:

- Better Auth was writing camelCase fields (e.g. `emailVerified`, `createdAt`) but the DB schema uses snake_case (`email_verified`, `created_at`).

Fix:

- Provide the correct **field mappings** in `lib/auth.ts`:
  - `user.fields.emailVerified -> email_verified`
  - `user.fields.createdAt -> created_at`
  - `user.fields.updatedAt -> updated_at`
  - Similar mappings for `session.fields` and `account.fields`

## Database schema + migrations

- **Core auth tables** are defined in `scripts/002-add-auth-tables.sql`
  - `user`
  - `session`
  - `account`
  - `verification`
- These tables are snake_case by design. `lib/auth.ts` must match them via mappings.

## Required environment variables

Auth:

- **`DATABASE_URL`**: Neon Postgres URL (often includes `sslmode=require`)
- **`BETTER_AUTH_SECRET`**: at least 32 characters
- **`BETTER_AUTH_URL`**: e.g. `http://localhost:3000` (or production origin)
- **`NEXT_PUBLIC_APP_URL`**: used as fallback base URL for client code

Stripe:

- **`STRIPE_SECRET_KEY`**
- **`STRIPE_WEBHOOK_SECRET`**
- **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`** (if used client-side)
- **`STRIPE_PRICE_ID`** (if checkout uses a fixed price)

## How to run locally

1. Ensure env vars are set (`.env.local`).
2. Apply migrations (at minimum `scripts/002-add-auth-tables.sql`).
3. Start dev server:

```bash
bun run dev
```

If port 3000 is stuck:

- Kill the process holding it, then restart.

## Debug checklist (when sign-up/sign-in fails)

- **If you see `Failed to initialize database adapter`**
  - Confirm `app/api/auth/[...all]/route.ts` has `export const runtime = "nodejs"`.
  - Confirm `lib/auth.ts` uses `pg` (Node runtime) and is not imported from middleware.

- **If you get 422 on sign-up**
  - Check server logs for the exact DB error.
  - Most likely it’s a **column mismatch** (snake_case vs camelCase) or a constraint (email unique, etc.).

- **If middleware redirects unexpectedly**
  - Middleware is only checking cookie presence; it does not validate cookie integrity.
  - This is intentional to stay Edge-safe and lightweight.

## Follow-ups / nice-to-haves

- **Next.js middleware warning**: Next 16 is deprecating `middleware.ts` in favor of “proxy”.
  - Functionality is fine; migrating would remove the warning.
- **Stronger Edge auth checks**:
  - If you want verification instead of “cookie present”, we can revisit using Better Auth cookie cache verification strategies.
