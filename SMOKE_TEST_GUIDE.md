# Production Smoke Test Guide

## URL

- Production app: `https://digitalmischief.com`

## Access

1. Send Liam the email you want to use for testing.
2. Accept the invite and create your account.
3. Sign in and start from `/daedalus`.

## 15-Minute Test Checklist

### 1) Core navigation

- [ ] Home (`/`) loads and main CTA buttons work.
- [ ] Pricing (`/pricing`) loads and plan cards render.
- [ ] App shell (`/daedalus`) loads after sign-in.

### 2) Extract

- [ ] Open extract/brand workflow.
- [ ] Run extraction on a public URL.
- [ ] Confirm response includes brand output (at least summary + structured fields).

### 3) Observe

- [ ] Create one monitor on a public page.
- [ ] Open monitor detail page and click **Check Now**.
- [ ] Confirm a run/check is recorded and status updates.

### 4) Scout

- [ ] Create one scout query.
- [ ] Run it manually.
- [ ] Confirm findings appear and run history updates.

### 5) Research live

- [ ] Open `/research/live`.
- [ ] Run a query.
- [ ] Confirm split view works: thinking events, sources, and synthesis output.
- [ ] Click a citation/source link and confirm source highlight/scroll behavior.

### 6) Cross-primitive actions

- [ ] From Scout/Observe/Research pages, use quick actions to create a Monitor or Scout.
- [ ] Confirm the **Enrich This Company** action routes correctly to `/enrich` with prefilled input.

### 7) Notification test endpoints (authenticated)

- [ ] `POST /api/scouts/notifications/test` returns `{ success: true }` when email is configured.
- [ ] `POST /api/monitors/notifications/test` returns `{ success: true }` when email is configured.

## What to report

When you find an issue, send:

1. Page URL
2. Exact steps to reproduce
3. Expected result
4. Actual result
5. Screenshot or short recording (if possible)

## Known environment dependencies

- `CRON_SECRET` must be set in production runtime.
- `RESEND_API_KEY` must be set for email notifications.
- Neon database must have `app.base_url` and `app.cron_secret` configured for pg_cron dispatchers.
