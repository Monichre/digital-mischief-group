# Make-It-Run Implementation Summary (2026-02-19)

## Objective

Ship the operations-first reliability release to make Scout and Observe run continuously with scheduler dispatch, shared notifications, and stronger in-app action loops.

## What Was Implemented

### 1) Scheduler foundation

- Added migration: `scripts/migrations/015-add-pg-cron-dispatchers.sql`
- Introduced database functions:
  - `dispatch_due_scouts()`
  - `dispatch_due_monitors()`
  - `cleanup_stuck_runs()`
- Added cron schedules:
  - every minute for scout/monitor dispatchers
  - every 5 minutes for stuck-run cleanup

### 2) Shared notification platform

- Added centralized notification layer:
  - `src/platform/notifications/types.ts`
  - `src/platform/notifications/client.ts`
  - `src/platform/notifications/templates/scout.ts`
  - `src/platform/notifications/templates/observe.ts`
- Refactored existing flows to use shared client/templates:
  - `src/daedalus/scout/notifications.ts`
  - `src/daedalus/observe/notifications.ts`

### 3) Research split-view improvements

- Added provider-agnostic stream normalization:
  - `src/daedalus/agent/research/stream-normalizer.ts`
- Extended stream types with reasoning event support:
  - `src/daedalus/agent/research/stream-types.ts`
- Updated UI behavior:
  - Thinking panel renders reasoning tokens
  - Synthesis panel supports inline citation actions
  - Source panel supports highlighted source navigation
  - Research page wires citation -> source highlight flow

### 4) Cross-primitive action expansion

- Added CTA surface for Scout, Observe, and Research views.
- Added “Enrich This Company” route to prefill enrich input.

### 5) Notification test routes

- Added authenticated test endpoints:
  - `POST /api/scouts/notifications/test`
  - `POST /api/monitors/notifications/test`
- Restricted recipient to authenticated user email only.

### 6) Typecheck command hardening

- Added script in `package.json`:
  - `typecheck: NODE_OPTIONS=--max-old-space-size=8192 tsc --noEmit`

## Security and Quality Notes

- Fixed interval SQL interpolation risk in observe notification suppression by switching to `make_interval(...)` parameterization.
- Lint passes with no errors.
- Typecheck executes and reports existing repo-wide TypeScript issues outside this change set.
- No new typecheck failures were detected in the touched files.

## Deployment Follow-Ups

1. Apply migration `015-add-pg-cron-dispatchers.sql` to production database.
2. Set Neon DB settings:
   - `app.base_url`
   - `app.cron_secret`
3. Ensure runtime env vars are set:
   - `CRON_SECRET`
   - `RESEND_API_KEY`
4. Verify cron jobs exist in `cron.job` and execute successfully.
