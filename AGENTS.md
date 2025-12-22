# Repository Guidelines

## Project Structure & Module Organization
- `app/` is the Next.js App Router with feature routes (`enrich/`, `brand-recon/`, `observe/`, `research/`, `scouts/`), auth flows (`sign-in/`, `sign-up/`), and APIs under `app/api/`.
- `components/` holds shared UI (e.g., `components/ui`, `components/ai`) and feature-specific pieces; co-locate new UI with its route when practical.
- `lib/` has server helpers (`lib/auth.ts`, `lib/agents`, `lib/db`, `lib/firecrawl`, `lib/stripe.ts`, `lib/utils.ts`); `hooks/` stores reusable React hooks.
- Styling lives in `app/globals.css` (Tailwind base); assets sit in `public/`. Reference docs are under `docs/`. Database SQL lives in `scripts/00*.sql` and `scripts/run-migration.mjs`.

## Build, Test, and Development Commands
- Install: `bun install` (preferred) or `npm install`.
- Local dev: `bun run dev` / `npm run dev` for hot reload.
- Lint: `bun run lint` / `npm run lint` (Next + ESLint rules).
- Build & serve: `bun run build` then `bun run start` (or npm equivalents).
- Database: `psql $DATABASE_URL -f scripts/002-add-auth-tables.sql` (then `003/004/005`) or `node scripts/run-migration.mjs` once `.env.local` has `DATABASE_URL`.

## Coding Style & Naming Conventions
- TypeScript-first with `strict` mode; use the `@/` alias for root-relative imports.
- Favor functional components, PascalCase component files, kebab-case route folders, and hooks prefixed with `use`.
- Follow the existing formatting (2-space indentation, no semicolons, Tailwind utility-first classes). Use `lib/utils.ts` `cn` for class merging.
- Keep feature logic near its route/component and isolate server-only code in `lib/` to avoid client bundle bloat.

## Testing Guidelines
- No automated suite is checked in yet; at minimum run `npm run lint` and exercise sign-up/sign-in, pricing upgrade, and dashboard paths before opening a PR.
- When adding tests, prefer Vitest + Testing Library; name files `*.test.ts(x)` beside the code and add a `npm test`/`bun test` script to document how to run them.
- Cover data transforms, server actions, and API handlers first; use fixture data instead of live API calls.

## Commit & Pull Request Guidelines
- Use short, imperative summaries; optional scopes match history (e.g., `docs: ...`, `fix: ...`). Keep bodies focused on intent and rationale.
- In PRs, include what changed and why, linked issues, screenshots for UI updates, migration steps (`scripts/00*.sql` order), env var additions, and manual test notes.
- Avoid committing `.env*`, database URLs, or API keys; keep `.gitignore` intact. Reference `docs/SECURITY_BEST_PRACTICES.md` when touching auth, billing, or scraping flows.
