# Daedalus Workspace Merge

## Goal

Keep Digital Mischief Group as the public front door and make Daedalus the authenticated command center for the existing intelligence suite.

## First Release

- Add a Higgsfield-inspired workspace shell at `/workspace` without replacing existing workflows.
- Launch Enrich, Research, Brand Recon, Sentinels, Observe, and Weaponize Browser from one composer.
- Persist launcher activity as user-scoped tasks.
- Add Delphi knowledge ingestion for text, URLs, and private file uploads.
- Expose user-scoped task, source, file, and knowledge search surfaces in the workspace.
- Redirect successful sign-in and sign-up to `/workspace` when no callback is supplied.
- Route the Daedalus product CTA and signed-in navigation into the workspace.

## Constraints

- Preserve the existing marketing site, routes, APIs, auth, billing, and primitive workflows.
- Code and database names use stable primitives; product language stays in the UI.
- All new data is scoped by the authenticated Better Auth user id.
- Raw files use private Vercel Blob storage; normalized text and embeddings use Neon PostgreSQL.
- If embeddings are unavailable, ingestion still succeeds and search falls back to PostgreSQL full-text search.
- Deployment requires migration `015-add-workspace-knowledge.sql` and `BLOB_READ_WRITE_TOKEN` for file ingestion.

## Acceptance

- An unauthenticated `/workspace` request redirects to sign-in.
- An authenticated user can launch every existing primitive with their input prefilled.
- Workspace tasks survive reloads and never expose another user's rows.
- Text, URL, and supported file sources persist; files are private; knowledge is chunked and searchable.
- Desktop and mobile layouts expose the same core navigation and primary actions.
- Typecheck, lint, production build, and browser smoke checks pass.

## Verification and Rollout

- Production build passes with the existing local application environment.
- Targeted lint for every touched TypeScript/TSX file passes with zero errors.
- Desktop and mobile Storybook smoke checks render without console errors or horizontal overflow; Memory, Files, and Search navigation works.
- Unauthenticated `/workspace` redirects to `/sign-in?callbackUrl=%2Fworkspace`, with no hydration or console errors.
- Repository-wide typecheck and lint remain blocked by pre-existing Remotion/homepage errors outside this change.
- Before deployment, apply `scripts/migrations/015-add-workspace-knowledge.sql` and provision `BLOB_READ_WRITE_TOKEN` for private file ingestion.
