# **Daedalus — Product Requirements Document (PRD)**

**Status:** Active / Source of Truth
**Audience:** Engineers, Designers, Operators
**Goal:** Enable continued feature shipping without naming churn, architectural confusion, or large refactors.

---

## **1. Product Overview**

### **1.1 Vision**

Daedalus is an all-in-one AI-enabled platform that empowers teams to collect and synthesize web intelligence. It performs tasks such as:

* Enriching lead data and company profiles.
* Extracting structured assets from websites.
* Monitoring URLs for meaningful changes.
* Scheduling searches and delivering new web discoveries.
* Running agent-driven research and synthesis workflows.
* Comparing brands and generating marketing assets (e.g., messaging, copy).

Everything runs under one login, one dashboard, and one billing model, with a focus on modularity and clarity of system primitives.

### **1.2 Why This Product?**

Modern businesses need high-quality, up-to-date intelligence from across the web. Existing solutions are fragmented, brittle, or unclear in purpose. Daedalus organizes web data collection and synthesis into clear primitives, avoiding scope creep and enabling incremental improvements.

---

## **2. Core Design Principles**

1. **Metal Names in Code, Domain Names in UI:**

   * Stable, “boring” names are used in the codebase, database, and APIs (e.g., `extract`, `observe`, `scout`).
   * UI can display more user-friendly terminology (“Brand Analysis,” “Threat Monitoring”) via a translation layer.

2. **No Big-Bang Refactors:**

   * Existing routes, tables, and APIs remain intact.
   * New work adheres to the canonical structure. Old modules migrate only when touched.

3. **Explicit Intent Over Implicit Expansion:**

   * Each workflow does one thing and does it clearly. E.g., profile enrichment does not automatically trigger competitive analysis.

4. **Shared Primitives, Separate Workflows:**

   * Firecrawl and LLM integrations are centralized into reusable services.
   * Business logic remains in domain-specific workflows.

---

## **3. Canonical Primitives (System Glossary)**

Daedalus defines only five core primitives. All new functionality must map onto one of these.

| Primitive   | Purpose                                               | Key Characteristics                                                                                                  |
| ----------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Extract** | One-off snapshot of a URL                             | Stateless, immediate output. Example: brand colors, fonts, copy.                                                     |
| **Observe** | Monitor a URL for changes over time                   | Stateful; runs on a schedule; produces diffs and summaries.                                                          |
| **Scout**   | Scheduled web search with deduplication               | Query-based, deduplicates via `seen_urls`, emits new findings only.                                                  |
| **Enrich**  | Generate a structured dossier for a person or company | Multi-step workflow; may call extract/observe/scout under the hood; outputs consolidated JSON.                       |
| **Agent**   | Interactive, tool-using sessions                      | Session-based, orchestrates tools (Firecrawl, LLMs, etc.), logs actions and outputs for user research and synthesis. |

**Important:** Agents are infrastructure; do not present them as a new product category.

---

## **4. Enrich Workflow Clarification**

Enrichment has two separate entry points. They are **not** interchangeable.

1. **Profile Enrichment**

   * *Input:* Email, name, or LinkedIn URL.
   * *Output:* Individual’s role and associated company basics (company name, domain, industry).
   * *Explicitly Not Included:* Competitive analysis or full firmographic deep-dive.

2. **Company Enrichment**

   * *Input:* Company domain or name.
   * *Process:* Sequential agents for discovery, firmographics, funding, tech stack, and optional competitive analysis.
   * *Output:* Structured company dossier (JSON).
   * *Optional:* Competitive analysis must be explicitly toggled; it is not part of a default run.

---

## **5. Modules and Behavior**

Each module corresponds to a use case and maps back to one or more primitives.

1. **Enrich**

   * *Function:* Lead enrichment via CSV or single entry.
   * *Behaviors:* Identity discovery, firmographic profile, funding info, tech stack detection, custom fields.
   * *Output:* Completed row-level records with source attribution.

2. **Extract**

   * *Function:* Single-run extraction of structured assets from a URL (e.g. logos, colors, fonts, voice).
   * *Planned Extensions:* Market segmentation and competitive analysis (opt-in).

3. **Observe**

   * *Function:* Monitor a page (e.g. pricing, policy) on a cadence; store content hashes; produce diffs and summaries.
   * *Notifications:* Emails or webhooks upon change detection.

4. **Scout**

   * *Function:* Scheduled searches across the web.
   * *Use Cases:* Track new job listings, press mentions, competitor launches.
   * *Deduplication:* Uses `seen_urls` array per user to avoid repeated alerts.

5. **Agent**

   * *Function:* Long-lived sessions that can call primitives and LLM services to perform research and complex tasks.
   * *Use Cases:* Research assistant, deep synthesis of competitive landscape, summarization.

6. **Brand Intelligence (an application of Extract and Enrich)**

   * *Function:* Analyze a brand’s site(s), identify branding assets (logo, colors, fonts), infer voice, and optionally research competitors.
   * *Extensions:* Generate personalized marketing assets (emails, landing pages, social posts).

7. **Research (an application of Agent + Extract)**

   * *Function:* Visual research with an ongoing “thinking,” “answer,” and “sources” view.
   * *Use Cases:* Competitive intelligence queries, strategy deep-dives.
   * *Features:* Streaming reasoning, citation tracking, multi-provider search.

8. **GEO (Billing & Sentiment Module)**

   * *Function:* Provide auth and plan management (Better Auth + Autumn + Stripe).
   * *Brand Sentiment:* Pull and analyze social mentions.
   * *Integration:* Billing and usage limit enforcement across all modules.

---

## **6. Architecture & Folder Structure**

To keep implementation straightforward, adhere to this top-level structure for the source code:

```
src/
  app/           # Next.js routes (thin)
  daedalus/      # Domain workflows (enrich, extract, observe, scout, agent)
  ai/            # LLM provider, tools, schemas
  lib/           # Vendor wrappers (Firecrawl, LLM providers)
  platform/      # Auth, DB, billing, jobs, telemetry
  components/    # Shared UI primitives only
```

Key points:

* `app/api/*` defines stable, thin API endpoints (e.g., `POST /api/enrich`, `POST /api/scouts`). Business logic lives in `daedalus/`.
* `daedalus/enrich/` contains workflow orchestrators; `lib/firecrawl/` houses the unified client wrapper.
* No nested `services/services` directories; keep service definitions simple.
* Database tables use primitive names (e.g., `scouts`, `monitors`), not marketing terms.

---

## **7. API Surface (Stable)**

The canonical routes stay fixed unless there is a compelling reason to version them:

* `POST /api/enrich`
* `POST /api/enrich/stream`
* `POST /api/extract`
* `POST /api/observe`
* `POST /api/scouts`
* `POST /api/agent`

Each route is a thin adapter that authenticates, validates input (Zod), enforces usage limits, logs usage, and dispatches to the correct workflow.

---

## **8. Shared Infrastructure**

* **Firecrawl Adapter:** A singleton client in `platform/firecrawl-service` with centralized logging, retry logic, and rate limiting.
* **LLM Provider:** A unified abstraction layer in `platform/llm-service` that can call multiple model providers (OpenAI, Anthropic, Groq), with built-in fallback and streaming support.
* **Schema Definitions:** All API inputs and outputs are validated using Zod schemas stored in `shared/schema/*`.
* **Usage Tracking & Plan Gating:** Recorded in `usage_events` and enforced via plan checks (free vs pro).

---

## **9. Database Guidance**

* Tables retain stable, primitive names (e.g., `scouts`, `monitors`, `enrichment_jobs`).
* User-scoped via `user_id` and row-level security (RLS).
* Include an `api_keys` table (optional per-user API keys).
* All new modules must define corresponding tables and RLS policies.

---

## **10. Success Criteria**

The product is successful when:

1. A user can upload a CSV and get a fully enriched, exportable dataset in the same session.
2. A user can input a URL and see brand identity details plus optional competitive mapping.
3. A brand profile can be turned into:

   * At least one scout,
   * At least one monitor,
   * At least one asset pack (e.g., email sequences, landing copy).
4. Modules reuse patterns from fire-enrich, open-scouts, firecrawl-observer, open-researcher, and firegeo without re-inventing them.
5. The DMG brand site acts as a live dogfooding tenant for ongoing development.

---

## **11. Guardrails & Non-Goals**

1. **No renaming of database tables for marketing reasons**.
2. **No rewriting Firecrawl internals**—integrate via wrappers and adaptors.
3. **No mandatory migrations of untouched code**—modules upgrade gradually.
4. **No silent “free” expansions of scope**—all optional workflows (like competitive research) must be explicitly triggered.
5. **Agents remain infrastructure**, not a new module name. They orchestrate primitives but do not define new APIs.

---

## **12. Future Considerations**

1. **Counter Ops**: Agent-driven response tools (e.g., auto-drafting responses when competitors ship features).
2. **Deeper Market and Segmentation**: Integrate external sources (Exa AI, Clearbit) for improved ICP scoring and segmentation.
3. **Real-Time Chat Interfaces**: Expand agent capabilities to power conversational research.
4. **Marketplace Extensions**: Allow third-party modules to plug into the same primitives (extract/observe/scout) under clear governance.

---

## **13. User Stories**

### US-001: Enrich a CSV of leads

As a **RevOps leader**, I want to upload a CSV of leads and receive enriched records with company, role, firmographics, and tech stack so that my team can segment and prioritize outreach without manual research.

### US-002: Enrich a single lead

As an **AE or SDR**, I want to enrich a single person or company from an email, name, or domain so that I can quickly personalize an email or call without leaving my workflow.

### US-003: Extract brand identity from a URL

As a **marketer**, I want to input a brand’s website URL and receive a structured brand identity (logo, colors, fonts, voice, key messages) so that I can generate on-brand assets and compare against competitors.

### US-004: Monitor critical pages for changes

As a **competitive intelligence owner**, I want to set up monitors on pricing, feature, or policy pages so that I am alerted when competitors ship meaningful changes and can respond quickly.

### US-005: Run scouts to discover new signals

As a **growth or strategy lead**, I want to configure scouts that run recurring web searches and deduplicate results so that I only see new, relevant mentions (jobs, press, launches) instead of noisy, repeated alerts.

### US-006: Run research sessions with agents

As a **strategist or researcher**, I want an agent-driven research view with streaming thinking, answers, and sources so that I can ask complex questions, see how conclusions were reached, and drill into the underlying evidence.

### US-007: Manage plans, usage, and billing (GEO)

As a **workspace admin**, I want to manage plans, usage limits, and billing in one place so that I can control access to primitives (enrich, extract, observe, scout, agent) and stay within budget without unexpected overages.

---

This PRD provides a clear, enforceable definition of Daedalus, focusing on stable names, modularity, and clear separation of concerns. It should make future development and refactoring straightforward while avoiding the confusion and churn that previous naming conventions caused.
