# Product Requirements Document (PRD) & Development Implementation Plan

## **FireCrawl Intelligence Suite**

### *A Unified AI-Powered Web Intelligence Platform*

---

## Executive Summary

This PRD outlines the consolidation of six Firecrawl-based applications into a single, unified platform called **FireCrawl Intelligence Suite**. The suite combines web scraping, data enrichment, monitoring, research, and brand analysis capabilities into one cohesive application with shared infrastructure and a consistent user experience.

---

## 1. Product Overview

### 1.1 Vision Statement

Create an all-in-one AI-powered web intelligence platform that enables users to monitor, extract, enrich, research, and analyze web data through a unified interface with automated notifications and actionable insights.

### 1.2 Source Applications Analysis

| Application | Primary Function | Key Technology | Database |
|---|---|---|---|
| **Fire Enrich** | Email/company data enrichment | Multi-agent AI system, Zod schemas | N/A (stateless) |
| **Open Scouts** | Automated web monitoring with alerts | Supabase, pg_cron, Resend | Supabase (PostgreSQL) |
| **Firecrawl Observer** | Website change detection | Convex, diff detection | Convex |
| **FireGEO** | SaaS starter with brand monitoring | Better Auth, Drizzle, Autumn billing | PostgreSQL |
| **Open Researcher** | AI research assistant | Claude, split-view analysis | N/A (stateless) |
| **Firecrawl Scrape** | Brand identity extraction | Firecrawl API | N/A |

### 1.3 Shared Architecture Patterns

All applications share:

* **Framework**: Next.js 15 with App Router
* **Language**: TypeScript (93-97%)
* **Styling**: Tailwind CSS + shadcn/ui
* **API Layer**: Firecrawl SDK
* **AI Providers**: OpenAI, Anthropic, Google AI
* **Build Tools**: pnpm/Bun

### 1.4 Module Synergies

```
┌──────────────────────────────────────────────────────────────────────┐
│                   FireCrawl Intelligence Suite                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│   │   ENRICH    │───▶│   RESEARCH  │───▶│     GEO     │             │
│   │             │    │             │    │             │             │
│   │ Lead Data   │    │ Deep        │    │ Brand       │             │
│   │ Enrichment  │    │ Analysis    │    │ Monitoring  │             │
│   └─────────────┘    └─────────────┘    └─────────────┘             │
│          │                  │                  │                     │
│          └──────────────────┼──────────────────┘                     │
│                             ▼                                        │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│   │   SCOUTS    │◀──▶│   OBSERVE   │◀──▶│    BRAND    │             │
│   │             │    │             │    │             │             │
│   │ Automated   │    │ Change      │    │ Identity    │             │
│   │ Web Search  │    │ Detection   │    │ Extraction  │             │
│   └─────────────┘    └─────────────┘    └─────────────┘             │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                 🔥 Unified Firecrawl Core Engine 🔥                   │
│              Authentication • Billing • Notifications                 │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Unified Feature Set

### 2.1 Core Modules Overview

| Module | Source | Purpose | Key Capabilities |
|---|---|---|---|
| **Enrich** | Fire Enrich | Transform emails into rich datasets | Multi-agent orchestration, company profiles, funding data, tech stacks |
| **Scouts** | Open Scouts | Automated scheduled web monitoring | Cron-based execution, location-aware search, email alerts |
| **Observe** | Firecrawl Observer | Website change detection | Diff viewer, AI-filtered notifications, webhook support |
| **Research** | Open Researcher | Deep AI research assistant | Real-time thinking display, split-view, automatic citations |
| **GEO** | FireGEO | Brand monitoring across web | Brand mention tracking, AI chat, usage-based billing |
| **Brand** | Firecrawl Scrape | Brand identity extraction | Logo, colors, typography, voice extraction |

---

## 3. Detailed Feature Specifications

### 3.1 Enrich Module (from Fire Enrich)

**Purpose**: Transform a simple list of emails into rich datasets with company profiles, funding data, tech stacks, and more.

**Architecture - Multi-Agent Orchestration System**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Orchestrator                        │
│         Executes agents in optimized sequence                │
│           Each phase builds on previous data                 │
└─────────────────────────────────────────────────────────────┘
                              │
     ┌────────────────────────┼────────────────────────┐
     ▼                        ▼                        ▼
┌──────────┐            ┌──────────┐            ┌──────────┐
│ Phase 1  │            │ Phase 2  │            │ Phase 3  │
│Discovery │───────────▶│ Company  │───────────▶│Financial │
│  Agent   │            │ Profile  │            │  Intel   │
└──────────┘            └──────────┘            └──────────┘
     │                        │                        │
     ▼                        ▼                        ▼
┌──────────┐            ┌──────────┐            ┌──────────┐
│Company   │            │Industry  │            │Funding   │
│Name/Site │            │Category  │            │Stage/Amt │
└──────────┘            └──────────┘            └──────────┘
                              │
     ┌────────────────────────┼────────────────────────┐
     ▼                        ▼                        ▼
┌──────────┐            ┌──────────┐            ┌──────────┐
│ Phase 4  │            │ Phase 5  │            │  Final   │
│Tech Stack│───────────▶│ General  │───────────▶│Synthesis │
│  Agent   │            │ Purpose  │            │  (GPT-4) │
└──────────┘            └──────────┘            └──────────┘
```

**Agent Specifications**:

| Agent | Phase | Inputs | Outputs | Search Strategy |
|---|---|---|---|---|
| Discovery | 1 | Email domain | Company name, website, type | 3 parallel searches |
| Company Profile | 2 | Company name | Industry, HQ, founded year | Industry-specific sources |
| Financial Intel | 3 | Company + industry | Funding stage, investors, valuation | Crunchbase, TechCrunch |
| Tech Stack | 4 | Company + type | Languages, frameworks, infra | GitHub, HTML analysis |
| General Purpose | 5 | All context | Custom fields (CEO, etc.) | Cross-reference sources |

**Type-Safe Schemas**:

```typescript
// Zod schemas for agent outputs
const DiscoverySchema = z.object({
  companyName: z.string(),
  website: z.string().url(),
  domain: z.string(),
  businessType: z.enum(["B2B", "B2C", "B2B2C", "Marketplace"]),
});

const ProfileSchema = z.object({
  industry: z.string(),
  subCategory: z.string().optional(),
  headquarters: z.string().optional(),
  yearFounded: z.number().optional(),
  employeeRange: z.string().optional(),
});

const FundingSchema = z.object({
  fundingStage: z.enum(["Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Public", "Bootstrapped"]),
  totalRaised: z.string().optional(),
  lastRoundAmount: z.string().optional(),
  lastRoundDate: z.string().optional(),
  investors: z.array(z.string()).optional(),
});

const TechStackSchema = z.object({
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  infrastructure: z.array(z.string()),
  tools: z.array(z.string()),
});
```

---

### 3.2 Scouts Module (from Open Scouts)

**Purpose**: Create automated "scouts" that run on schedules to continuously search for and track information, with email notifications.

**Key Features**:

* Scheduled cron-based execution
* Location-aware searches
* Email alerts via Resend
* Firecrawl credits tracking
* Per-user API key support (Partner integration)
* Dispatcher pattern for scalability

**Architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Scout Dispatcher                          │
│         Runs every minute via pg_cron                        │
│           Identifies due scouts, dispatches                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Scout Executor                            │
│         Individual function per scout                        │
│           Handles search, filtering, notifications           │
└─────────────────────────────────────────────────────────────┘
          │                   │                    │
          ▼                   ▼                    ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │Firecrawl │        │ Filter   │        │  Resend  │
    │  Search  │        │New Results│       │  Email   │
    └──────────┘        └──────────┘        └──────────┘
```

**Scout Data Model**:

```typescript
interface Scout {
  id: string;
  userId: string;
  name: string;
  searchQuery: string;
  schedule: string; // cron expression
  location?: {
    country: string;
    state?: string;
    city?: string;
  };
  isActive: boolean;
  lastRunAt?: Date;
  nextRunAt: Date;
  seenUrls: string[]; // for deduplication
  notificationEmail?: string;
  createdAt: Date;
}

interface ScoutResult {
  id: string;
  scoutId: string;
  url: string;
  title: string;
  snippet: string;
  discoveredAt: Date;
  notified: boolean;
}
```

---

### 3.3 Observe Module (from Firecrawl Observer)

**Purpose**: Monitor websites for changes with powerful change detection and intelligent notifications.

**Key Features**:

* Single page or entire website monitoring
* AI-powered noise filtering
* Email and webhook notifications
* Encrypted API key storage (AES-256-GCM)
* Real-time updates via Convex
* Visual diff viewer

**Notification Types**:

| Type | Description | Use Case |
|---|---|---|
| Email | HTML email via Resend | Personal alerts |
| Webhook | HTTP POST to custom URL | Integration with external systems |
| AI-Filtered | AI determines relevance before notifying | Reduce noise |
| Dashboard-only | No external notification | Manual review |

**Change Detection Flow**:

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Fetch   │────▶│  Hash    │────▶│ Compare  │────▶│  Notify  │
│  Page    │     │ Content  │     │ Previous │     │(if changed)│
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                        │
                                        ▼
                                  ┌──────────┐
                                  │AI Filter │
                                  │(optional)│
                                  └──────────┘
```

**Monitor Data Model**:

```typescript
interface Monitor {
  id: string;
  userId: string;
  url: string;
  name: string;
  checkInterval: number; // seconds (default: 3600)
  lastCheckedAt?: Date;
  lastContentHash?: string;
  lastContent?: string; // for diff generation
  isActive: boolean;
  notificationSettings: {
    email: boolean;
    emailAddress?: string;
    webhook?: string;
    aiFilter: boolean;
    aiFilterPrompt?: string;
  };
  createdAt: Date;
}

interface ChangeEvent {
  id: string;
  monitorId: string;
  detectedAt: Date;
  previousHash: string;
  newHash: string;
  diff: string; // stored diff
  notificationSent: boolean;
  aiFilterResult?: {
    shouldNotify: boolean;
    reason: string;
  };
}
```

---

### 3.4 Research Module (from Open Researcher)

**Purpose**: Visual AI research assistant with real-time thinking display, split-view analysis, and automatic citations.

**Key Features**:

* AI-powered web search and analysis
* Real-time thinking display (Claude extended thinking)
* Automatic source tracking and citation generation
* Split-view interface (thinking | results | sources)
* Firecrawl-powered web scraping

**Research Flow**:

```
┌─────────────────────────────────────────────────────────────┐
│                      User Query                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Firecrawl Search                           │
│              Search web for relevant sources                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Firecrawl Scrape                           │
│           Scrape top 5-10 results for full content           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Claude Analysis                            │
│         Extended thinking + citation generation              │
│              Streaming response to UI                        │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │ Thinking │        │  Answer  │        │Citations │
    │  Panel   │        │  Panel   │        │  Panel   │
    └──────────┘        └──────────┘        └──────────┘
```

**UI Layout**:

```
┌────────────────────────────────────────────────────────────────────┐
│  [Query Input]                                          [Search]   │
├──────────────┬────────────────────────────┬────────────────────────┤
│              │                            │                        │
│   THINKING   │          ANSWER            │       SOURCES          │
│              │                            │                        │
│  • Step 1... │   Based on my research...  │  [1] firecrawl.dev    │
│  • Step 2... │                            │  [2] techcrunch.com   │
│  • Step 3... │   Key findings:            │  [3] github.com       │
│              │   - Point A [1]            │                        │
│              │   - Point B [2][3]         │                        │
│              │                            │                        │
└──────────────┴────────────────────────────┴────────────────────────┘
```

---

### 3.5 GEO Module (from FireGEO)

**Purpose**: AI-powered brand monitoring SaaS with authentication, billing, and AI chat capabilities.

**Key Features**:

* Brand mention tracking across the web
* AI chat interface for brand analysis
* Usage-based billing via Autumn
* Better Auth for authentication
* PostgreSQL with Drizzle ORM

**Functional Areas**:

| Area | Features |
|---|---|
| **Brand Monitor** | Search brand mentions, sentiment analysis, competitor tracking |
| **AI Chat** | Chat with AI about brand insights, ask questions, get recommendations |
| **Dashboard** | Usage metrics, recent mentions, trend visualization |
| **Pricing** | Free tier, Pro tier with usage-based billing |

**GEO API Endpoints**:

```typescript
// API structure from FireGEO
const apiRoutes = {
  auth: "/api/auth/[...all]",      // Better Auth handler
  billing: "/api/autumn/[...all]", // Autumn billing endpoints
  brandMonitor: {
    analyze: "/api/brand-monitor/analyze",
    mentions: "/api/brand-monitor/mentions",
    competitors: "/api/brand-monitor/competitors",
  },
  chat: "/api/chat",               // AI chat endpoint
};
```

---

### 3.6 Brand Module (from Firecrawl Scrape)

**Purpose**: Extract complete brand identity from any website using Firecrawl's branding format.

**Key Features**:

* Logo extraction and download
* Color palette detection (primary, secondary, accent, background)
* Typography analysis (heading and body fonts)
* Brand voice identification
* Structured branding profile output

**Brand Profile Structure**:

```typescript
interface BrandProfile {
  logo?: {
    url: string;
    alt?: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  voice?: {
    tone: string; // e.g., "professional", "casual", "technical"
    style: string; // e.g., "informative", "persuasive"
  };
  metadata: {
    siteName: string;
    tagline?: string;
    description?: string;
  };
}
```

**Firecrawl Integration**:

```typescript
// Using Firecrawl's branding format
const response = await firecrawl.scrapeUrl(url, {
  formats: ["branding"],
});

// Response includes structured brand data
const brandProfile: BrandProfile = response.branding;
```

---

## 4. Technical Architecture

### 4.1 Unified Technology Stack

```typescript
const techStack = {
  // Core Framework
  framework: "Next.js 15.3 (App Router)",
  language: "TypeScript 5.7",
  runtime: "Bun 1.x",
  
  // Frontend
  styling: "Tailwind CSS v4",
  components: "shadcn/ui + Radix UI",
  stateManagement: "React hooks + Jotai",
  
  // Backend / Database
  primaryDB: "PostgreSQL (Supabase)",
  realtimeDB: "Convex (for Observer)",
  orm: "Drizzle ORM",
  
  // Authentication
  auth: "Better Auth",
  
  // AI/ML
  llmProviders: {
    primary: "OpenAI (GPT-4o)",
    secondary: "Anthropic (Claude)",
    tertiary: "Google AI (Gemini)",
    fallback: "Groq (Llama)",
  },
  scraping: "Firecrawl API",
  
  // Infrastructure
  hosting: "Vercel",
  email: "Resend",
  billing: "Autumn + Stripe",
  scheduling: "pg_cron (Supabase)",
  analytics: "PostHog",
  
  // Security
  encryption: "AES-256-GCM (for API keys)",
};
```

### 4.2 Database Schema

```sql
-- ============================================
-- CORE TABLES
-- ============================================

-- Users (managed by Better Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences & Settings
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  notification_email TEXT,
  location JSONB, -- { country, state, city }
  timezone TEXT DEFAULT 'UTC',
  firecrawl_api_key TEXT, -- encrypted, for partner integration
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Encrypted API Keys (for multi-provider support)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'firecrawl', 'openai', 'anthropic', etc.
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- ============================================
-- ENRICH MODULE
-- ============================================

CREATE TABLE enrichment_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  input_emails TEXT[] NOT NULL,
  custom_fields TEXT[], -- additional fields to extract
  results JSONB, -- array of enriched records
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enrichment_jobs_user ON enrichment_jobs(user_id);
CREATE INDEX idx_enrichment_jobs_status ON enrichment_jobs(status);

-- ============================================
-- SCOUTS MODULE
-- ============================================

CREATE TABLE scouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_query TEXT NOT NULL,
  schedule TEXT NOT NULL, -- cron expression, e.g., '0 */6 * * *'
  location JSONB, -- { country, state, city }
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  seen_urls TEXT[] DEFAULT '{}', -- for deduplication
  notification_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scout_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id UUID REFERENCES scouts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  snippet TEXT,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_scouts_user ON scouts(user_id);
CREATE INDEX idx_scouts_next_run ON scouts(next_run_at) WHERE is_active = TRUE;
CREATE INDEX idx_scout_results_scout ON scout_results(scout_id);

-- ============================================
-- OBSERVE MODULE
-- ============================================

CREATE TABLE monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT,
  check_interval INTEGER DEFAULT 3600, -- seconds
  is_active BOOLEAN DEFAULT TRUE,
  last_checked_at TIMESTAMPTZ,
  last_content_hash TEXT,
  notification_settings JSONB DEFAULT '{
    "email": true,
    "webhook": null,
    "aiFilter": false,
    "aiFilterPrompt": null
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE monitor_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID REFERENCES monitors(id) ON DELETE CASCADE,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  previous_hash TEXT,
  new_hash TEXT,
  diff_summary TEXT, -- AI-generated summary
  diff_content TEXT, -- full diff
  notification_sent BOOLEAN DEFAULT FALSE,
  ai_filter_result JSONB -- { shouldNotify, reason }
);

CREATE INDEX idx_monitors_user ON monitors(user_id);
CREATE INDEX idx_monitors_active ON monitors(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_monitor_changes_monitor ON monitor_changes(monitor_id);

-- ============================================
-- RESEARCH MODULE
-- ============================================

CREATE TABLE research_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  thinking TEXT, -- AI reasoning process
  answer TEXT, -- final answer
  sources JSONB, -- array of { url, title, snippet }
  citations JSONB, -- array of { number, url, title, usedIn }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_research_sessions_user ON research_sessions(user_id);

-- ============================================
-- GEO MODULE (Brand Monitoring)
-- ============================================

CREATE TABLE brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  keywords TEXT[], -- additional keywords to track
  competitors TEXT[], -- competitor brand names
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE brand_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  snippet TEXT,
  sentiment TEXT, -- positive, negative, neutral
  discovered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brand_profiles_user ON brand_profiles(user_id);
CREATE INDEX idx_brand_mentions_profile ON brand_mentions(brand_profile_id);

-- ============================================
-- BRAND EXTRACTION MODULE
-- ============================================

CREATE TABLE brand_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  brand_data JSONB NOT NULL, -- full BrandProfile
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brand_extractions_user ON brand_extractions(user_id);

-- ============================================
-- BILLING / USAGE TRACKING
-- ============================================

CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- 'enrich', 'scout', 'observe', 'research', 'geo', 'brand'
  units INTEGER NOT NULL DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_events_user ON usage_events(user_id);
CREATE INDEX idx_usage_events_feature ON usage_events(feature);
CREATE INDEX idx_usage_events_date ON usage_events(created_at);
```

### 4.3 Project Structure

```
firecrawl-intelligence-suite/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── callback/route.ts
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Dashboard shell with sidebar
│   │   ├── page.tsx                      # Dashboard home / overview
│   │   │
│   │   ├── enrich/
│   │   │   ├── page.tsx                  # CSV upload, enrichment UI
│   │   │   ├── [jobId]/page.tsx          # Job details & results
│   │   │   └── loading.tsx
│   │   │
│   │   ├── scouts/
│   │   │   ├── page.tsx                  # Scout list & creation
│   │   │   ├── [scoutId]/page.tsx        # Scout details & results
│   │   │   └── new/page.tsx              # Create new scout
│   │   │
│   │   ├── observe/
│   │   │   ├── page.tsx                  # Monitor list
│   │   │   ├── [monitorId]/page.tsx      # Monitor details & diff view
│   │   │   └── new/page.tsx              # Create new monitor
│   │   │
│   │   ├── research/
│   │   │   ├── page.tsx                  # Research interface
│   │   │   └── [sessionId]/page.tsx      # Past research session
│   │   │
│   │   ├── geo/
│   │   │   ├── page.tsx                  # Brand monitoring dashboard
│   │   │   ├── chat/page.tsx             # AI chat interface
│   │   │   └── [brandId]/page.tsx        # Brand profile details
│   │   │
│   │   ├── brand/
│   │   │   ├── page.tsx                  # Brand extractor tool
│   │   │   └── [extractionId]/page.tsx   # Extraction results
│   │   │
│   │   ├── settings/
│   │   │   ├── page.tsx                  # General settings
│   │   │   ├── api-keys/page.tsx         # API key management
│   │   │   ├── billing/page.tsx          # Subscription & usage
│   │   │   └── notifications/page.tsx    # Notification preferences
│   │   │
│   │   └── pricing/page.tsx              # Pricing plans
│   │
│   ├── api/
│   │   ├── auth/[...all]/route.ts        # Better Auth handler
│   │   │
│   │   ├── enrich/
│   │   │   ├── route.ts                  # POST: Start enrichment
│   │   │   └── [jobId]/route.ts          # GET: Job status
│   │   │
│   │   ├── scouts/
│   │   │   ├── route.ts                  # GET: List, POST: Create
│   │   │   ├── [scoutId]/route.ts        # GET/PUT/DELETE scout
│   │   │   └── [scoutId]/run/route.ts    # POST: Manual run
│   │   │
│   │   ├── observe/
│   │   │   ├── route.ts                  # GET: List, POST: Create
│   │   │   ├── [monitorId]/route.ts      # GET/PUT/DELETE monitor
│   │   │   └── [monitorId]/check/route.ts # POST: Manual check
│   │   │
│   │   ├── research/
│   │   │   └── route.ts                  # POST: Start research (streaming)
│   │   │
│   │   ├── geo/
│   │   │   ├── brands/route.ts           # GET: List, POST: Create brand
│   │   │   ├── brands/[brandId]/route.ts # GET/PUT/DELETE brand
│   │   │   ├── mentions/route.ts         # GET: Search mentions
│   │   │   └── chat/route.ts             # POST: AI chat (streaming)
│   │   │
│   │   ├── brand/
│   │   │   └── route.ts                  # POST: Extract brand
│   │   │
│   │   ├── webhooks/
│   │   │   ├── stripe/route.ts           # Stripe webhook
│   │   │   └── firecrawl/route.ts        # Firecrawl webhook
│   │   │
│   │   ├── autumn/[...all]/route.ts      # Autumn billing handler
│   │   │
│   │   └── cron/
│   │       ├── scouts/route.ts           # Scout dispatcher (Vercel cron)
│   │       └── monitors/route.ts         # Monitor checker (Vercel cron)
│   │
│   ├── layout.tsx                        # Root layout
│   └── globals.css                       # Global styles
│
├── components/
│   ├── ui/                               # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── user-menu.tsx
│   │   └── mobile-nav.tsx
│   │
│   ├── shared/
│   │   ├── api-key-input.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── error-boundary.tsx
│   │   ├── empty-state.tsx
│   │   ├── data-table.tsx
│   │   └── status-badge.tsx
│   │
│   ├── enrich/
│   │   ├── csv-uploader.tsx
│   │   ├── enrichment-table.tsx
│   │   ├── agent-progress.tsx
│   │   ├── field-selector.tsx
│   │   └── export-button.tsx
│   │
│   ├── scouts/
│   │   ├── scout-card.tsx
│   │   ├── scout-form.tsx
│   │   ├── results-feed.tsx
│   │   ├── location-selector.tsx
│   │   └── schedule-picker.tsx
│   │
│   ├── observe/
│   │   ├── monitor-card.tsx
│   │   ├── monitor-form.tsx
│   │   ├── diff-viewer.tsx
│   │   ├── change-history.tsx
│   │   └── notification-settings.tsx
│   │
│   ├── research/
│   │   ├── research-input.tsx
│   │   ├── thinking-panel.tsx
│   │   ├── results-panel.tsx
│   │   ├── citations-list.tsx
│   │   └── split-view.tsx
│   │
│   ├── geo/
│   │   ├── brand-form.tsx
│   │   ├── mention-card.tsx
│   │   ├── sentiment-chart.tsx
│   │   ├── brand-timeline.tsx
│   │   └── chat-interface.tsx
│   │
│   └── brand/
│       ├── brand-card.tsx
│       ├── color-palette.tsx
│       ├── typography-display.tsx
│       └── logo-preview.tsx
│
├── lib/
│   ├── firecrawl/
│   │   ├── client.ts                     # Unified Firecrawl client
│   │   ├── scrape.ts                     # Scrape utilities
│   │   ├── search.ts                     # Search utilities
│   │   ├── crawl.ts                      # Crawl utilities
│   │   └── types.ts                      # Firecrawl types
│   │
│   ├── ai/
│   │   ├── providers/
│   │   │   ├── openai.ts
│   │   │   ├── anthropic.ts
│   │   │   ├── google.ts
│   │   │   └── groq.ts
│   │   ├── model-selector.ts             # Priority-based model selection
│   │   └── streaming.ts                  # Streaming utilities
│   │
│   ├── agents/
│   │   ├── orchestrator.ts               # Multi-agent coordinator
│   │   ├── base-agent.ts                 # Base agent class
│   │   ├── discovery-agent.ts
│   │   ├── company-profile-agent.ts
│   │   ├── financial-intel-agent.ts
│   │   ├── tech-stack-agent.ts
│   │   └── general-purpose-agent.ts
│   │
│   ├── db/
│   │   ├── schema.ts                     # Drizzle schema
│   │   ├── client.ts                     # Database client
│   │   └── migrations/                   # Migration files
│   │
│   ├── auth/
│   │   ├── config.ts                     # Better Auth configuration
│   │   ├── client.ts                     # Auth client
│   │   └── middleware.ts                 # Auth middleware
│   │
│   ├── billing/
│   │   ├── autumn.ts                     # Autumn SDK wrapper
│   │   ├── usage.ts                      # Usage tracking
│   │   └── plans.ts                      # Plan definitions
│   │
│   ├── notifications/
│   │   ├── email.ts                      # Resend integration
│   │   └── webhook.ts                    # Webhook dispatcher
│   │
│   ├── encryption.ts                     # AES-256-GCM utilities
│   ├── utils.ts                          # General utilities
│   └── constants.ts                      # App constants
│
├── hooks/
│   ├── use-firecrawl.ts
│   ├── use-enrichment.ts
│   ├── use-scouts.ts
│   ├── use-monitors.ts
│   ├── use-research.ts
│   ├── use-brand-monitor.ts
│   ├── use-ai-stream.ts
│   └── use-credits.ts
│
├── schemas/                              # Zod validation schemas
│   ├── enrichment.schema.ts
│   ├── scout.schema.ts
│   ├── monitor.schema.ts
│   ├── research.schema.ts
│   ├── brand.schema.ts
│   └── user.schema.ts
│
├── types/
│   ├── index.ts                          # Re-exports
│   ├── enrichment.ts
│   ├── scout.ts
│   ├── monitor.ts
│   ├── research.ts
│   ├── brand.ts
│   └── api.ts
│
├── config/
│   ├── app.config.ts                     # App configuration
│   ├── modules.config.ts                 # Feature flags
│   └── providers.config.ts               # AI provider config
│
├── supabase/
│   ├── functions/
│   │   ├── scout-dispatcher/index.ts
│   │   ├── scout-executor/index.ts
│   │   ├── monitor-checker/index.ts
│   │   └── send-notification/index.ts
│   └── migrations/
│
├── convex/                               # For real-time (Observer)
│   ├── schema.ts
│   ├── monitors.ts
│   └── changes.ts
│
├── public/
│   ├── logo.svg
│   └── favicon.ico
│
├── .env.example
├── package.json
├── tailwind.config.ts
├── drizzle.config.ts
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

## 5. Development Implementation Plan

### 5.1 Phase Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                    14-Week Development Timeline                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Phase 1 (Weeks 1-3)     Foundation & Core Infrastructure            │
│  ════════════════════════════════════════════════════                │
│                                                                       │
│  Phase 2 (Weeks 4-6)     Enrich & Brand Modules                      │
│  ════════════════════════════════════════════════════                │
│                                                                       │
│  Phase 3 (Weeks 7-9)     Scouts & Observe Modules                    │
│  ════════════════════════════════════════════════════                │
│                                                                       │
│  Phase 4 (Weeks 10-12)   Research & GEO Modules                      │
│  ════════════════════════════════════════════════════                │
│                                                                       │
│  Phase 5 (Weeks 13-14)   Integration, Testing & Launch               │
│  ════════════════════════════════════════════════════                │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 5.2 Phase 1: Foundation & Core Infrastructure (Weeks 1-3)

#### Week 1: Project Setup & Authentication

**Day 1-2: Initialize Project**

```bash
# Create Next.js 15 project
bunx create-next-app@latest firecrawl-intelligence-suite \
  --typescript --tailwind --app --src-dir=false

cd firecrawl-intelligence-suite

# Install core dependencies
bun add @firecrawl/firecrawl-js better-auth drizzle-orm @neondatabase/serverless
bun add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs
bun add class-variance-authority clsx tailwind-merge lucide-react
bun add zod @tanstack/react-query resend

# Dev dependencies
bun add -d drizzle-kit @types/node
```

**Day 3-4: Better Auth Setup**

```typescript
// lib/auth/config.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db/client";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  
  emailAndPassword: {
    enabled: true,
    sendResetPasswordEmail: async ({ email, url }) => {
      await sendEmail({
        to: email,
        subject: "Reset your password",
        template: "reset-password",
        data: { url },
      });
    },
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

// lib/auth/client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
});

export const { signIn, signOut, signUp, useSession } = authClient;
```

**Day 5: shadcn/ui Setup**

```bash
# Initialize shadcn/ui
bunx shadcn@latest init

# Add essential components
bunx shadcn@latest add button card dialog dropdown-menu input label 
bunx shadcn@latest add table tabs toast avatar badge separator
bunx shadcn@latest add form select textarea checkbox radio-group
bunx shadcn@latest add sheet skeleton progress alert
```

**Deliverables Week 1:**
* [x] Next.js 15 project initialized
* [x] TypeScript configuration
* [x] Tailwind CSS v4 + shadcn/ui
* [x] Better Auth with email/password + Google + GitHub
* [x] PostgreSQL + Drizzle ORM setup
* [x] Core user tables and authentication flow

---

#### Week 2: Firecrawl Core & AI Provider Layer

**Day 1-2: Unified Firecrawl Client**

```typescript
// lib/firecrawl/client.ts
import FirecrawlApp from "@firecrawl/firecrawl-js";

export interface ScrapeOptions {
  formats?: ("markdown" | "html" | "branding")[];
  includeBranding?: boolean;
  waitFor?: number;
  timeout?: number;
}

export interface SearchOptions {
  limit?: number;
  location?: {
    country: string;
    state?: string;
    city?: string;
  };
}

export class FirecrawlClient {
  private client: FirecrawlApp;

  constructor(apiKey?: string) {
    this.client = new FirecrawlApp({
      apiKey: apiKey || process.env.FIRECRAWL_API_KEY!,
    });
  }

  async scrape(url: string, options: ScrapeOptions = {}) {
    const result = await this.client.scrapeUrl(url, {
      formats: options.formats ?? ["markdown"],
      ...options,
    });

    if (!result.success) {
      throw new Error(`Scrape failed: ${result.error}`);
    }

    return result;
  }

  async search(query: string, options: SearchOptions = {}) {
    const result = await this.client.search(query, {
      limit: options.limit ?? 10,
      ...options,
    });

    if (!result.success) {
      throw new Error(`Search failed: ${result.error}`);
    }

    return result.data;
  }

  async crawl(url: string, options: { limit?: number } = {}) {
    const result = await this.client.crawlUrl(url, {
      limit: options.limit ?? 50,
      scrapeOptions: { formats: ["markdown"] },
    });

    if (!result.success) {
      throw new Error(`Crawl failed: ${result.error}`);
    }

    return result;
  }

  async extractBrandIdentity(url: string) {
    const result = await this.scrape(url, {
      formats: ["branding"],
    });

    return result.branding;
  }
}

// Singleton instance for server-side usage
let firecrawlInstance: FirecrawlClient | null = null;

export function getFirecrawl(apiKey?: string): FirecrawlClient {
  if (!firecrawlInstance || apiKey) {
    firecrawlInstance = new FirecrawlClient(apiKey);
  }
  return firecrawlInstance;
}
```

**Day 3-4: AI Provider Abstraction**

```typescript
// lib/ai/model-selector.ts
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export type AIProvider = "openai" | "anthropic" | "google" | "groq";

interface ProviderConfig {
  provider: AIProvider;
  model: string;
  priority: number;
}

const defaultProviders: ProviderConfig[] = [
  { provider: "openai", model: "gpt-4o", priority: 1 },
  { provider: "anthropic", model: "claude-sonnet-4-20250514", priority: 2 },
  { provider: "google", model: "gemini-1.5-pro", priority: 3 },
  { provider: "groq", model: "llama-3.1-70b-versatile", priority: 4 },
];

function getProviderApiKey(provider: AIProvider): string | undefined {
  const keyMap: Record<AIProvider, string> = {
    openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    google: "GOOGLE_AI_API_KEY",
    groq: "GROQ_API_KEY",
  };
  return process.env[keyMap[provider]];
}

export function getAIModel(preferredProvider?: AIProvider) {
  const providers = preferredProvider
    ? [
        defaultProviders.find((p) => p.provider === preferredProvider)!,
        ...defaultProviders.filter((p) => p.provider !== preferredProvider),
      ]
    : defaultProviders;

  for (const config of providers) {
    const apiKey = getProviderApiKey(config.provider);
    if (!apiKey) continue;

    switch (config.provider) {
      case "openai":
        return createOpenAI({ apiKey })(config.model);
      case "anthropic":
        return createAnthropic({ apiKey })(config.model);
      case "google":
        return createGoogleGenerativeAI({ apiKey })(config.model);
      case "groq":
        return createOpenAI({
          apiKey,
          baseURL: "https://api.groq.com/openai/v1",
        })(config.model);
    }
  }

  throw new Error("No AI provider configured. Please set an API key.");
}

// lib/ai/streaming.ts
import { StreamingTextResponse, experimental_StreamData } from "ai";

export function createStreamingResponse(
  stream: ReadableStream,
  data?: Record<string, unknown>
) {
  const streamData = new experimental_StreamData();

  if (data) {
    streamData.append(data);
  }

  return new StreamingTextResponse(stream, {}, streamData);
}
```

**Day 5: API Key Encryption**

```typescript
// lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  return Buffer.from(key, "base64");
}

export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  // Format: iv:tag:encrypted
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const [ivHex, tagHex, encrypted] = encryptedText.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
```

**Deliverables Week 2:**
* [x] Unified Firecrawl client with all methods
* [x] AI provider abstraction with fallback chain
* [x] AES-256-GCM encryption for API keys
* [x] Environment variable configuration

---

#### Week 3: Dashboard Shell & Shared Components

**Day 1-2: Dashboard Layout**

```typescript
// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const modules = [
  {
    name: "Dashboard",
    href: "/",
    icon: "LayoutDashboard",
    description: "Overview",
  },
  {
    name: "Enrich",
    href: "/enrich",
    icon: "Sparkles",
    description: "Data enrichment",
  },
  {
    name: "Scouts",
    href: "/scouts",
    icon: "Radar",
    description: "Automated monitoring",
  },
  {
    name: "Observe",
    href: "/observe",
    icon: "Eye",
    description: "Change detection",
  },
  {
    name: "Research",
    href: "/research",
    icon: "Search",
    description: "AI research",
  },
  {
    name: "GEO",
    href: "/geo",
    icon: "Globe",
    description: "Brand monitoring",
  },
  {
    name: "Brand",
    href: "/brand",
    icon: "Palette",
    description: "Brand extraction",
  },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar modules={modules} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={session.user} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

// components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

interface Module {
  name: string;
  href: string;
  icon: string;
  description: string;
}

export function Sidebar({ modules }: { modules: Module[] }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Icons.Flame className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">FireCrawl Suite</span>
        </Link>
      </div>

      <nav className="px-3 py-2">
        {modules.map((module) => {
          const Icon = Icons[module.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
          const isActive = pathname === module.href || pathname.startsWith(`${module.href}/`);

          return (
            <Link
              key={module.href}
              href={module.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{module.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 w-64 p-4 border-t">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent"
        >
          <Icons.Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
```

**Day 3-4: Shared Components**

```typescript
// components/shared/api-key-input.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Check } from "lucide-react";

interface ApiKeyInputProps {
  provider: string;
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export function ApiKeyInput({
  provider,
  value,
  onChange,
  onSave,
  isSaving,
}: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          type={showKey ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter your ${provider} API key`}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {onSave && (
        <Button onClick={onSave} disabled={isSaving || !value}>
          {isSaving ? "Saving..." : <Check className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}

// components/shared/status-badge.tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "pending" | "processing" | "completed" | "failed" | "active" | "paused";

const statusConfig: Record<Status, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  processing: { label: "Processing", variant: "default" },
  completed: { label: "Completed", variant: "outline" },
  failed: { label: "Failed", variant: "destructive" },
  active: { label: "Active", variant: "default" },
  paused: { label: "Paused", variant: "secondary" },
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// components/shared/empty-state.tsx
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
```

**Day 5: Notification System Setup**

```typescript
// lib/notifications/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  const { to, subject, html } = options;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "FireCrawl <notifications@firecrawl.dev>",
    to,
    subject,
    html,
  });
}

// Email templates
export function scoutAlertEmail(params: {
  scoutName: string;
  results: Array<{ title: string; url: string; snippet: string }>;
}) {
  return `
    <h2>🔍 Scout Alert: ${params.scoutName}</h2>
    <p>Your scout found ${params.results.length} new result(s):</p>
    <ul>
      ${params.results
        .map(
          (r) => `
        <li>
          <a href="${r.url}">${r.title}</a>
          <p>${r.snippet}</p>
        </li>
      `
        )
        .join("")}
    </ul>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/scouts">View in Dashboard</a></p>
  `;
}

export function changeDetectedEmail(params: {
  monitorName: string;
  url: string;
  summary: string;
}) {
  return `
    <h2>🔔 Change Detected: ${params.monitorName}</h2>
    <p>We detected changes on <a href="${params.url}">${params.url}</a></p>
    <h3>Summary</h3>
    <p>${params.summary}</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/observe">View Details</a></p>
  `;
}

// lib/notifications/webhook.ts
export async function sendWebhook(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status}`);
  }

  return response.json();
}
```

**Deliverables Week 3:**
* [x] Complete dashboard layout with sidebar
* [x] All shared UI components
* [x] Notification system (email + webhook)
* [x] Settings pages structure

---

### 5.3 Phase 2: Enrich & Brand Modules (Weeks 4-6)

#### Week 4: Multi-Agent System

**Agent Base Class & Orchestrator:**

```typescript
// lib/agents/base-agent.ts
import { z } from "zod";
import { getAIModel } from "@/lib/ai/model-selector";
import { getFirecrawl } from "@/lib/firecrawl/client";
import { generateObject } from "ai";

export interface AgentContext {
  email: string;
  domain: string;
  companyName?: string;
  industry?: string;
  [key: string]: unknown;
}

export abstract class BaseAgent<TOutput extends z.ZodTypeAny> {
  abstract name: string;
  abstract description: string;
  abstract outputSchema: TOutput;

  protected firecrawl = getFirecrawl();
  protected model = getAIModel();

  abstract getSearchQueries(context: AgentContext): string[];

  async run(context: AgentContext): Promise<z.infer<TOutput>> {
    // Execute parallel searches
    const queries = this.getSearchQueries(context);
    const searchResults = await Promise.all(
      queries.map((q) => this.firecrawl.search(q, { limit: 5 }))
    );

    // Flatten and deduplicate results
    const allResults = searchResults.flat();
    const uniqueResults = this.deduplicateResults(allResults);

    // Extract structured data using AI
    const { object } = await generateObject({
      model: this.model,
      schema: this.outputSchema,
      prompt: this.buildPrompt(context, uniqueResults),
    });

    return object;
  }

  protected abstract buildPrompt(
    context: AgentContext,
    searchResults: SearchResult[]
  ): string;

  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter((r) => {
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });
  }
}

// lib/agents/orchestrator.ts
import { BaseAgent, AgentContext } from "./base-agent";
import { DiscoveryAgent } from "./discovery-agent";
import { CompanyProfileAgent } from "./company-profile-agent";
import { FinancialIntelAgent } from "./financial-intel-agent";
import { TechStackAgent } from "./tech-stack-agent";
import { GeneralPurposeAgent } from "./general-purpose-agent";

export interface EnrichmentInput {
  email: string;
  customFields?: string[];
}

export interface EnrichmentOutput {
  email: string;
  company: {
    name: string;
    website: string;
    domain: string;
    type?: string;
  };
  profile?: {
    industry: string;
    subCategory?: string;
    headquarters?: string;
    yearFounded?: number;
    employeeRange?: string;
  };
  funding?: {
    stage: string;
    totalRaised?: string;
    lastRoundAmount?: string;
    investors?: string[];
  };
  techStack?: {
    languages: string[];
    frameworks: string[];
    infrastructure: string[];
  };
  customFields?: Record<string, string>;
  sources: Array<{ field: string; url: string }>;
}

export class AgentOrchestrator {
  private agents: BaseAgent<any>[];

  constructor() {
    this.agents = [
      new DiscoveryAgent(),
      new CompanyProfileAgent(),
      new FinancialIntelAgent(),
      new TechStackAgent(),
    ];
  }

  async enrich(input: EnrichmentInput): Promise<EnrichmentOutput> {
    const domain = this.extractDomain(input.email);
    let context: AgentContext = {
      email: input.email,
      domain,
    };

    const sources: Array<{ field: string; url: string }> = [];

    // Phase 1: Discovery
    const discovery = await this.agents[0].run(context);
    context = { ...context, ...discovery };
    sources.push({ field: "company", url: discovery.source });

    // Phase 2: Company Profile
    const profile = await this.agents[1].run(context);
    context = { ...context, industry: profile.industry };
    sources.push({ field: "profile", url: profile.source });

    // Phase 3: Financial Intel
    const funding = await this.agents[2].run(context);
    sources.push({ field: "funding", url: funding.source });

    // Phase 4: Tech Stack
    const techStack = await this.agents[3].run(context);
    sources.push({ field: "techStack", url: techStack.source });

    // Phase 5: Custom Fields (if any)
    let customFields: Record<string, string> | undefined;
    if (input.customFields?.length) {
      const generalAgent = new GeneralPurposeAgent(input.customFields);
      const customResult = await generalAgent.run(context);
      customFields = customResult.fields;
      customResult.sources.forEach((s: { field: string; url: string }) => sources.push(s));
    }

    return {
      email: input.email,
      company: {
        name: discovery.companyName,
        website: discovery.website,
        domain: discovery.domain,
        type: discovery.businessType,
      },
      profile: {
        industry: profile.industry,
        subCategory: profile.subCategory,
        headquarters: profile.headquarters,
        yearFounded: profile.yearFounded,
        employeeRange: profile.employeeRange,
      },
      funding: {
        stage: funding.fundingStage,
        totalRaised: funding.totalRaised,
        lastRoundAmount: funding.lastRoundAmount,
        investors: funding.investors,
      },
      techStack: {
        languages: techStack.languages,
        frameworks: techStack.frameworks,
        infrastructure: techStack.infrastructure,
      },
      customFields,
      sources,
    };
  }

  private extractDomain(email: string): string {
    return email.split("@")[1];
  }
}
```

**Individual Agent Implementations:**

```typescript
// lib/agents/discovery-agent.ts
import { z } from "zod";
import { BaseAgent, AgentContext } from "./base-agent";

const DiscoverySchema = z.object({
  companyName: z.string(),
  website: z.string().url(),
  domain: z.string(),
  businessType: z.enum(["B2B", "B2C", "B2B2C", "Marketplace", "Unknown"]),
  source: z.string().url(),
});

export class DiscoveryAgent extends BaseAgent<typeof DiscoverySchema> {
  name = "discovery";
  description = "Discovers basic company information from email domain";
  outputSchema = DiscoverySchema;

  getSearchQueries(context: AgentContext): string[] {
    return [
      `${context.domain} company`,
      `site:${context.domain}`,
      `"${context.domain}" about company`,
    ];
  }

  protected buildPrompt(context: AgentContext, results: SearchResult[]): string {
    return `
      Based on the following search results about the domain "${context.domain}",
      extract the company information.

      Search Results:
      ${results.map((r) => `- ${r.title}: ${r.snippet} (${r.url})`).join("\n")}

      Extract:
      1. Company name
      2. Main website URL
      3. Domain
      4. Business type (B2B, B2C, B2B2C, Marketplace, or Unknown)
      5. Source URL for the information
    `;
  }
}

// lib/agents/company-profile-agent.ts
import { z } from "zod";
import { BaseAgent, AgentContext } from "./base-agent";

const ProfileSchema = z.object({
  industry: z.string(),
  subCategory: z.string().optional(),
  headquarters: z.string().optional(),
  yearFounded: z.number().optional(),
  employeeRange: z.string().optional(),
  source: z.string().url(),
});

export class CompanyProfileAgent extends BaseAgent<typeof ProfileSchema> {
  name = "companyProfile";
  description = "Extracts detailed company profile and industry information";
  outputSchema = ProfileSchema;

  getSearchQueries(context: AgentContext): string[] {
    const company = context.companyName || context.domain;
    return [
      `${company} industry`,
      `${company} company profile`,
      `${company} headquarters founded`,
    ];
  }

  protected buildPrompt(context: AgentContext, results: SearchResult[]): string {
    return `
      Based on the following search results about "${context.companyName || context.domain}",
      extract the company profile.

      Search Results:
      ${results.map((r) => `- ${r.title}: ${r.snippet} (${r.url})`).join("\n")}

      Extract:
      1. Industry category
      2. Sub-category (if applicable)
      3. Headquarters location
      4. Year founded
      5. Employee range (e.g., "10-50", "100-500")
      6. Source URL
    `;
  }
}

// lib/agents/financial-intel-agent.ts
import { z } from "zod";
import { BaseAgent, AgentContext } from "./base-agent";

const FundingSchema = z.object({
  fundingStage: z.enum([
    "Pre-seed",
    "Seed",
    "Series A",
    "Series B",
    "Series C+",
    "Public",
    "Bootstrapped",
    "Unknown",
  ]),
  totalRaised: z.string().optional(),
  lastRoundAmount: z.string().optional(),
  lastRoundDate: z.string().optional(),
  investors: z.array(z.string()).optional(),
  source: z.string().url(),
});

export class FinancialIntelAgent extends BaseAgent<typeof FundingSchema> {
  name = "financialIntel";
  description = "Gathers funding and financial information";
  outputSchema = FundingSchema;

  getSearchQueries(context: AgentContext): string[] {
    const company = context.companyName || context.domain;
    return [
      `${company} funding round`,
      `${company} crunchbase`,
      `${company} investors series`,
    ];
  }

  protected buildPrompt(context: AgentContext, results: SearchResult[]): string {
    return `
      Based on the following search results about "${context.companyName}" funding,
      extract financial information.

      Search Results:
      ${results.map((r) => `- ${r.title}: ${r.snippet} (${r.url})`).join("\n")}

      Extract:
      1. Current funding stage
      2. Total amount raised
      3. Last round amount
      4. Last round date
      5. Key investors (list)
      6. Source URL
    `;
  }
}

// lib/agents/tech-stack-agent.ts
import { z } from "zod";
import { BaseAgent, AgentContext } from "./base-agent";

const TechStackSchema = z.object({
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  infrastructure: z.array(z.string()),
  tools: z.array(z.string()),
  source: z.string().url(),
});

export class TechStackAgent extends BaseAgent<typeof TechStackSchema> {
  name = "techStack";
  description = "Analyzes technology stack from GitHub and technical sources";
  outputSchema = TechStackSchema;

  getSearchQueries(context: AgentContext): string[] {
    const company = context.companyName || context.domain;
    return [
      `site:github.com ${company}`,
      `${company} tech stack`,
      `${company} engineering blog technology`,
    ];
  }

  protected buildPrompt(context: AgentContext, results: SearchResult[]): string {
    return `
      Based on the following search results about "${context.companyName}" technology,
      extract their tech stack.

      Search Results:
      ${results.map((r) => `- ${r.title}: ${r.snippet} (${r.url})`).join("\n")}

      Extract:
      1. Programming languages used
      2. Frameworks (frontend, backend)
      3. Infrastructure (cloud, databases, etc.)
      4. Development tools
      5. Source URL
    `;
  }
}
```

---

#### Week 5: Enrich Module UI

```typescript
// app/(dashboard)/enrich/page.tsx
"use client";

import { useState } from "react";
import { useEnrichment } from "@/hooks/use-enrichment";
import { CSVUploader } from "@/components/enrich/csv-uploader";
import { EnrichmentTable } from "@/components/enrich/enrichment-table";
import { FieldSelector } from "@/components/enrich/field-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function EnrichPage() {
  const [emails, setEmails] = useState<string[]>([]);
  const [customFields, setCustomFields] = useState<string[]>([]);
  const { jobs, startEnrichment, isLoading } = useEnrichment();

  const handleUpload = (data: string[]) => {
    setEmails(data);
  };

  const handleStart = async () => {
    await startEnrichment({ emails, customFields });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Enrichment</h1>
          <p className="text-muted-foreground">
            Transform emails into rich company profiles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Upload Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <CSVUploader onUpload={handleUpload} />
            {emails.length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {emails.length} emails ready for enrichment
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldSelector
              selected={customFields}
              onChange={setCustomFields}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleStart}
          disabled={emails.length === 0 || isLoading}
          size="lg"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Start Enrichment
        </Button>
      </div>

      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Enrichment Results</CardTitle>
          </CardHeader>
          <CardContent>
            <EnrichmentTable jobs={jobs} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// components/enrich/enrichment-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";

interface EnrichmentJob {
  id: string;
  email: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  result?: {
    company?: { name: string };
    profile?: { industry: string };
    funding?: { stage: string };
    techStack?: { frameworks: string[] };
  };
}

export function EnrichmentTable({ jobs }: { jobs: EnrichmentJob[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Industry</TableHead>
          <TableHead>Funding</TableHead>
          <TableHead>Tech Stack</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell className="font-medium">{job.email}</TableCell>
            <TableCell>{job.result?.company?.name ?? "—"}</TableCell>
            <TableCell>{job.result?.profile?.industry ?? "—"}</TableCell>
            <TableCell>{job.result?.funding?.stage ?? "—"}</TableCell>
            <TableCell>
              <div className="flex gap-1 flex-wrap">
                {job.result?.techStack?.frameworks?.slice(0, 3).map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              {job.status === "processing" ? (
                <Progress value={job.progress} className="w-16 h-2" />
              ) : (
                <StatusBadge status={job.status} />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

#### Week 6: Brand Extraction Module

```typescript
// app/(dashboard)/brand/page.tsx
"use client";

import { useState } from "react";
import { useBrandExtraction } from "@/hooks/use-brand-extraction";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandCard } from "@/components/brand/brand-card";
import { Loader2, Palette } from "lucide-react";

export default function BrandPage() {
  const [url, setUrl] = useState("");
  const { extract, isLoading, brandData } = useBrandExtraction();

  const handleExtract = async () => {
    await extract(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Brand Extraction</h1>
        <p className="text-muted-foreground">
          Extract complete brand identity from any website
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Website URL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleExtract} disabled={!url || isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Palette className="mr-2 h-4 w-4" />
              )}
              Extract Brand
            </Button>
          </div>
        </CardContent>
      </Card>

      {brandData && <BrandCard brand={brandData} />}
    </div>
  );
}

// components/brand/brand-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorPalette } from "./color-palette";
import { TypographyDisplay } from "./typography-display";
import { LogoPreview } from "./logo-preview";

interface BrandProfile {
  logo?: { url: string };
  colors: Record<string, string>;
  fonts: { heading: string; body: string };
  voice?: { tone: string; style: string };
  metadata: { siteName: string; tagline?: string };
}

export function BrandCard({ brand }: { brand: BrandProfile }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {brand.logo && <LogoPreview url={brand.logo.url} />}
          <div>
            <h3 className="text-lg font-semibold">{brand.metadata.siteName}</h3>
            {brand.metadata.tagline && (
              <p className="text-sm text-muted-foreground">
                {brand.metadata.tagline}
              </p>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Color Palette</h4>
          <ColorPalette colors={brand.colors} />
        </div>

        <div>
          <h4 className="font-medium mb-3">Typography</h4>
          <TypographyDisplay fonts={brand.fonts} />
        </div>

        {brand.voice && (
          <div>
            <h4 className="font-medium mb-3">Brand Voice</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Tone</span>
                <p className="font-medium">{brand.voice.tone}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Style</span>
                <p className="font-medium">{brand.voice.style}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// components/brand/color-palette.tsx
export function ColorPalette({ colors }: { colors: Record<string, string> }) {
  return (
    <div className="flex gap-3 flex-wrap">
      {Object.entries(colors).map(([name, value]) => (
        <div key={name} className="text-center">
          <div
            className="w-16 h-16 rounded-lg border shadow-sm mb-2"
            style={{ backgroundColor: value }}
          />
          <p className="text-xs font-medium capitalize">{name}</p>
          <p className="text-xs text-muted-foreground">{value}</p>
        </div>
      ))}
    </div>
  );
}
```

**Deliverables Weeks 4-6:**
* [x] Complete multi-agent system with 5 agents
* [x] Agent orchestrator with context passing
* [x] Enrichment API endpoints
* [x] CSV upload and processing
* [x] Enrichment results table with real-time updates
* [x] Brand extraction API integration
* [x] Brand visualization components

---

### 5.4 Phase 3: Scouts & Observe Modules (Weeks 7-9)

#### Week 7: Scouts Module Core

```typescript
// app/api/scouts/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { scouts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const CreateScoutSchema = z.object({
  name: z.string().min(1),
  searchQuery: z.string().min(1),
  schedule: z.string(), // cron expression
  location: z
    .object({
      country: z.string(),
      state: z.string().optional(),
      city: z.string().optional(),
    })
    .optional(),
  notificationEmail: z.string().email().optional(),
});

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userScouts = await db.query.scouts.findMany({
    where: eq(scouts.userId, session.user.id),
    orderBy: (scouts, { desc }) => [desc(scouts.createdAt)],
  });

  return NextResponse.json(userScouts);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const data = CreateScoutSchema.parse(body);

  const nextRunAt = calculateNextRun(data.schedule);

  const [scout] = await db
    .insert(scouts)
    .values({
      userId: session.user.id,
      name: data.name,
      searchQuery: data.searchQuery,
      schedule: data.schedule,
      location: data.location,
      notificationEmail: data.notificationEmail,
      nextRunAt,
    })
    .returning();

  return NextResponse.json(scout);
}

// Helper to calculate next run time from cron expression
function calculateNextRun(cronExpression: string): Date {
  // Use a cron parser library like 'cron-parser'
  const parser = require("cron-parser");
  const interval = parser.parseExpression(cronExpression);
  return interval.next().toDate();
}

// supabase/functions/scout-dispatcher/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get all scouts due for execution
  const { data: dueScouts } = await supabase
    .from("scouts")
    .select("id")
    .eq("is_active", true)
    .lte("next_run_at", new Date().toISOString());

  if (!dueScouts?.length) {
    return new Response(JSON.stringify({ dispatched: 0 }));
  }

  // Dispatch each scout
  const dispatches = dueScouts.map((scout) =>
    supabase.functions.invoke("scout-executor", {
      body: { scoutId: scout.id },
    })
  );

  await Promise.allSettled(dispatches);

  return new Response(
    JSON.stringify({ dispatched: dueScouts.length }),
    { headers: { "Content-Type": "application/json" } }
  );
});

// supabase/functions/scout-executor/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import FirecrawlApp from "npm:@firecrawl/firecrawl-js";

serve(async (req) => {
  const { scoutId } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get scout details
  const { data: scout } = await supabase
    .from("scouts")
    .select("*")
    .eq("id", scoutId)
    .single();

  if (!scout) {
    return new Response(JSON.stringify({ error: "Scout not found" }), { status: 404 });
  }

  // Execute search
  const firecrawl = new FirecrawlApp({
    apiKey: Deno.env.get("FIRECRAWL_API_KEY")!,
  });

  const results = await firecrawl.search(scout.search_query, {
    limit: 10,
    ...(scout.location && { location: scout.location }),
  });

  // Filter new results (not in seen_urls)
  const seenUrls = new Set(scout.seen_urls || []);
  const newResults = results.data.filter((r: any) => !seenUrls.has(r.url));

  if (newResults.length > 0) {
    // Store new results
    await supabase.from("scout_results").insert(
      newResults.map((r: any) => ({
        scout_id: scoutId,
        url: r.url,
        title: r.title,
        snippet: r.snippet,
      }))
    );

    // Update seen_urls
    const allSeenUrls = [...seenUrls, ...newResults.map((r: any) => r.url)];
    await supabase
      .from("scouts")
      .update({ seen_urls: allSeenUrls })
      .eq("id", scoutId);

    // Send notification if configured
    if (scout.notification_email) {
      await supabase.functions.invoke("send-notification", {
        body: {
          type: "scout_alert",
          to: scout.notification_email,
          data: {
            scoutName: scout.name,
            results: newResults,
          },
        },
      });
    }
  }

  // Calculate and update next run time
  const nextRunAt = calculateNextRun(scout.schedule);
  await supabase
    .from("scouts")
    .update({
      last_run_at: new Date().toISOString(),
      next_run_at: nextRunAt.toISOString(),
    })
    .eq("id", scoutId);

  return new Response(
    JSON.stringify({
      success: true,
      newResults: newResults.length,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
```

---

#### Week 8: Observe Module (Change Detection)

```typescript
// app/api/observe/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { monitors } from "@/lib/db/schema";
import { getFirecrawl } from "@/lib/firecrawl/client";
import { createHash } from "crypto";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, name, checkInterval, notificationSettings } = await request.json();

  // Initial scrape to establish baseline
  const firecrawl = getFirecrawl();
  const scraped = await firecrawl.scrape(url, { formats: ["markdown"] });
  const contentHash = hashContent(scraped.markdown || "");

  const [monitor] = await db
    .insert(monitors)
    .values({
      userId: session.user.id,
      url,
      name,
      checkInterval: checkInterval || 3600,
      lastContentHash: contentHash,
      lastCheckedAt: new Date(),
      notificationSettings,
    })
    .returning();

  return NextResponse.json(monitor);
}

function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

// app/api/observe/[monitorId]/check/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { monitors, monitorChanges } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getFirecrawl } from "@/lib/firecrawl/client";
import { getAIModel } from "@/lib/ai/model-selector";
import { generateText } from "ai";
import { sendEmail, changeDetectedEmail } from "@/lib/notifications/email";
import { sendWebhook } from "@/lib/notifications/webhook";
import { createHash } from "crypto";

export async function POST(
  request: Request,
  { params }: { params: { monitorId: string } }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monitor = await db.query.monitors.findFirst({
    where: eq(monitors.id, params.monitorId),
  });

  if (!monitor || monitor.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Scrape current content
  const firecrawl = getFirecrawl();
  const scraped = await firecrawl.scrape(monitor.url, { formats: ["markdown"] });
  const newContent = scraped.markdown || "";
  const newHash = hashContent(newContent);

  // Check for changes
  if (newHash === monitor.lastContentHash) {
    await db
      .update(monitors)
      .set({ lastCheckedAt: new Date() })
      .where(eq(monitors.id, params.monitorId));

    return NextResponse.json({ changed: false });
  }

  // Generate diff summary with AI
  const model = getAIModel();
  const { text: summary } = await generateText({
    model,
    prompt: `Summarize the key changes between these two versions of a webpage in 2-3 sentences:

    Previous version hash: ${monitor.lastContentHash}
    New version: ${newContent.slice(0, 2000)}...`,
  });

  // Check AI filter if enabled
  let shouldNotify = true;
  let aiFilterResult = null;

  if (monitor.notificationSettings?.aiFilter) {
    const { text: filterResult } = await generateText({
      model,
      prompt: `Based on these changes: "${summary}"
      
      And this filter criteria: "${monitor.notificationSettings.aiFilterPrompt}"
      
      Should the user be notified? Respond with JSON: {"shouldNotify": true/false, "reason": "..."}`,
    });

    try {
      aiFilterResult = JSON.parse(filterResult);
      shouldNotify = aiFilterResult.shouldNotify;
    } catch {
      // If parsing fails, notify anyway
    }
  }

  // Record the change
  const [change] = await db
    .insert(monitorChanges)
    .values({
      monitorId: params.monitorId,
      previousHash: monitor.lastContentHash!,
      newHash,
      diffSummary: summary,
      aiFilterResult,
      notificationSent: shouldNotify,
    })
    .returning();

  // Update monitor
  await db
    .update(monitors)
    .set({
      lastContentHash: newHash,
      lastCheckedAt: new Date(),
    })
    .where(eq(monitors.id, params.monitorId));

  // Send notifications if applicable
  if (shouldNotify) {
    const settings = monitor.notificationSettings;

    if (settings?.email && settings?.emailAddress) {
      await sendEmail({
        to: settings.emailAddress,
        subject: `Change detected: ${monitor.name || monitor.url}`,
        html: changeDetectedEmail({
          monitorName: monitor.name || monitor.url,
          url: monitor.url,
          summary,
        }),
      });
    }

    if (settings?.webhook) {
      await sendWebhook(settings.webhook, {
        type: "change_detected",
        monitor: {
          id: monitor.id,
          name: monitor.name,
          url: monitor.url,
        },
        change: {
          summary,
          detectedAt: new Date().toISOString(),
        },
      });
    }
  }

  return NextResponse.json({
    changed: true,
    change,
    notified: shouldNotify,
  });
}

function hashContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}
```

**Observe UI Components:**

```typescript
// components/observe/diff-viewer.tsx
"use client";

import { diffLines, Change } from "diff";
import { cn } from "@/lib/utils";

interface DiffViewerProps {
  oldContent: string;
  newContent: string;
}

export function DiffViewer({ oldContent, newContent }: DiffViewerProps) {
  const diff = diffLines(oldContent, newContent);

  return (
    <div className="font-mono text-sm border rounded-lg overflow-hidden">
      <div className="bg-muted px-4 py-2 border-b flex items-center gap-4">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500/20 border border-red-500 rounded" />
          Removed
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500/20 border border-green-500 rounded" />
          Added
        </span>
      </div>
      <div className="max-h-96 overflow-auto">
        {diff.map((part, index) => (
          <div
            key={index}
            className={cn(
              "px-4 py-1 border-l-4",
              part.added && "bg-green-500/10 border-green-500 text-green-800",
              part.removed && "bg-red-500/10 border-red-500 text-red-800",
              !part.added && !part.removed && "border-transparent"
            )}
          >
            <pre className="whitespace-pre-wrap">
              {part.added ? "+ " : part.removed ? "- " : "  "}
              {part.value}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

// components/observe/monitor-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Eye, Clock, Bell, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Monitor {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  lastCheckedAt: string | null;
  checkInterval: number;
  notificationSettings: {
    email: boolean;
    webhook: string | null;
    aiFilter: boolean;
  };
}

export function MonitorCard({
  monitor,
  onCheck,
  onViewChanges,
}: {
  monitor: Monitor;
  onCheck: () => void;
  onViewChanges: () => void;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">{monitor.name || monitor.url}</CardTitle>
          <p className="text-sm text-muted-foreground truncate max-w-xs">
            {monitor.url}
          </p>
        </div>
        <StatusBadge status={monitor.isActive ? "active" : "paused"} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Every {monitor.checkInterval / 60} min
          </span>
          {monitor.lastCheckedAt && (
            <span>
              Last: {formatDistanceToNow(new Date(monitor.lastCheckedAt))} ago
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4">
          {monitor.notificationSettings.email && (
            <Badge variant="secondary">
              <Bell className="h-3 w-3 mr-1" /> Email
            </Badge>
          )}
          {monitor.notificationSettings.webhook && (
            <Badge variant="secondary">Webhook</Badge>
          )}
          {monitor.notificationSettings.aiFilter && (
            <Badge variant="secondary">AI Filter</Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCheck}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Check Now
          </Button>
          <Button variant="outline" size="sm" onClick={onViewChanges}>
            <Eye className="h-4 w-4 mr-1" />
            View Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Deliverables Weeks 7-9:**
* [x] Scout CRUD operations
* [x] Cron-based scout execution via Supabase Edge Functions
* [x] Location-aware search
* [x] Email notifications for scout alerts
* [x] Monitor CRUD operations
* [x] Change detection with content hashing
* [x] AI-powered change summarization
* [x] AI filter for notifications
* [x] Diff viewer component
* [x] Email and webhook notifications

---

### 5.5 Phase 4: Research & GEO Modules (Weeks 10-12)

#### Week 10-11: Research Module

```typescript
// app/api/research/route.ts
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getFirecrawl } from "@/lib/firecrawl/client";
import { auth } from "@/lib/auth/config";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { query } = await request.json();
  const firecrawl = getFirecrawl();

  // Step 1: Search for relevant sources
  const searchResults = await firecrawl.search(query, { limit: 10 });

  // Step 2: Scrape top results for full content
  const topUrls = searchResults.slice(0, 5);
  const scrapedContent = await Promise.all(
    topUrls.map(async (result) => {
      try {
        const scraped = await firecrawl.scrape(result.url, {
          formats: ["markdown"],
        });
        return {
          url: result.url,
          title: result.title,
          content: scraped.markdown?.slice(0, 5000) || result.snippet,
        };
      } catch {
        return {
          url: result.url,
          title: result.title,
          content: result.snippet,
        };
      }
    })
  );

  // Step 3: Stream research response with extended thinking
  const result = await streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `You are a research assistant. Analyze the provided sources and answer the user's question thoroughly.

Rules:
1. Always cite your sources using [1], [2], etc. format
2. Be comprehensive but concise
3. If information conflicts between sources, note the discrepancy
4. If you can't find information, say so clearly
5. Structure your response with clear sections when appropriate`,
    messages: [
      {
        role: "user",
        content: `Research Question: ${query}

Sources:
${scrapedContent
  .map(
    (s, i) => `
[${i + 1}] ${s.title}
URL: ${s.url}
Content:
${s.content}
---`
  )
  .join("\n")}

Please analyze these sources and provide a comprehensive answer to the research question.`,
      },
    ],
    experimental_thinking: {
      enabled: true,
    },
  });

  return result.toDataStreamResponse();
}

// components/research/split-view.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThinkingPanel } from "./thinking-panel";
import { ResultsPanel } from "./results-panel";
import { CitationsList } from "./citations-list";
import { Search, Loader2 } from "lucide-react";

export function ResearchSplitView() {
  const [query, setQuery] = useState("");
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/research",
  });

  const lastMessage = messages[messages.length - 1];
  const thinking = lastMessage?.experimental_thinking || "";
  const answer = lastMessage?.content || "";
  const citations = extractCitations(answer);

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col gap-4">
      {/* Query Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="What would you like to research?"
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </form>

      {/* Three-Column Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Thinking Panel */}
        <Card className="col-span-3 p-4 overflow-auto">
          <h3 className="font-semibold mb-3 text-sm">AI Thinking</h3>
          <ThinkingPanel content={thinking} isActive={isLoading} />
        </Card>

        {/* Main Results */}
        <Card className="col-span-6 p-4 overflow-auto">
          <h3 className="font-semibold mb-3 text-sm">Research Results</h3>
          <ResultsPanel content={answer} />
        </Card>

        {/* Citations */}
        <Card className="col-span-3 p-4 overflow-auto">
          <h3 className="font-semibold mb-3 text-sm">Sources</h3>
          <CitationsList citations={citations} />
        </Card>
      </div>
    </div>
  );
}

function extractCitations(content: string): Array<{ number: number; url: string }> {
  const citations: Array<{ number: number; url: string }> = [];
  const regex = /\[(\d+)\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const num = parseInt(match[1]);
    if (!citations.find((c) => c.number === num)) {
      citations.push({ number: num, url: "" }); // URL would be filled from sources
    }
  }
  return citations.sort((a, b) => a.number - b.number);
}

// components/research/thinking-panel.tsx
export function ThinkingPanel({
  content,
  isActive,
}: {
  content: string;
  isActive: boolean;
}) {
  if (!content && !isActive) {
    return (
      <p className="text-sm text-muted-foreground">
        AI thinking process will appear here...
      </p>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      {isActive && !content && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Analyzing sources...
        </div>
      )}
      {content && (
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-xs bg-muted p-3 rounded-lg">
            {content}
          </pre>
        </div>
      )}
    </div>
  );
}
```

---

#### Week 12: GEO Module (Brand Monitoring)

```typescript
// app/api/geo/mentions/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getFirecrawl } from "@/lib/firecrawl/client";
import { getAIModel } from "@/lib/ai/model-selector";
import { generateObject } from "ai";
import { z } from "zod";

const MentionSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  snippet: z.string(),
  sentiment: z.enum(["positive", "negative", "neutral"]),
  relevance: z.number().min(0).max(1),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { brandName, keywords = [] } = await request.json();
  const firecrawl = getFirecrawl();
  const model = getAIModel();

  // Build search queries
  const queries = [
    brandName,
    ...keywords.map((k: string) => `${brandName} ${k}`),
  ];

  // Execute searches
  const allResults: any[] = [];
  for (const query of queries) {
    const results = await firecrawl.search(query, { limit: 10 });
    allResults.push(...results);
  }

  // Deduplicate by URL
  const uniqueResults = Array.from(
    new Map(allResults.map((r) => [r.url, r])).values()
  );

  // Analyze sentiment for each mention
  const analyzedMentions = await Promise.all(
    uniqueResults.slice(0, 20).map(async (result) => {
      const { object } = await generateObject({
        model,
        schema: MentionSchema,
        prompt: `Analyze this search result for the brand "${brandName}":

Title: ${result.title}
URL: ${result.url}
Snippet: ${result.snippet}

Determine:
1. The sentiment (positive, negative, or neutral)
2. The relevance score (0-1) to the brand`,
      });

      return object;
    })
  );

  // Calculate overall sentiment
  const sentimentCounts = analyzedMentions.reduce(
    (acc, m) => {
      acc[m.sentiment]++;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 }
  );

  return NextResponse.json({
    mentions: analyzedMentions,
    summary: {
      total: analyzedMentions.length,
      sentiment: sentimentCounts,
      topSources: [...new Set(analyzedMentions.map((m) => new URL(m.url).hostname))].slice(0, 5),
    },
  });
}

// app/api/geo/chat/route.ts
import { streamText } from "ai";
import { getAIModel } from "@/lib/ai/model-selector";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { brandMentions, brandProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { brandId, message } = await request.json();

  // Get brand profile and recent mentions
  const brand = await db.query.brandProfiles.findFirst({
    where: eq(brandProfiles.id, brandId),
  });

  const mentions = await db.query.brandMentions.findMany({
    where: eq(brandMentions.brandProfileId, brandId),
    orderBy: (mentions, { desc }) => [desc(mentions.discoveredAt)],
    limit: 20,
  });

  const model = getAIModel();

  const result = await streamText({
    model,
    system: `You are a brand monitoring assistant for "${brand?.brandName}".

You have access to recent brand mentions:
${mentions.map((m) => `- ${m.title} (${m.sentiment}): ${m.snippet}`).join("\n")}

Help the user understand their brand's online presence, sentiment trends, and provide actionable insights.`,
    messages: [{ role: "user", content: message }],
  });

  return result.toDataStreamResponse();
}

// components/geo/sentiment-chart.tsx
"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
}

const COLORS = {
  positive: "#22c55e",
  negative: "#ef4444",
  neutral: "#6b7280",
};

export function SentimentChart({ data }: { data: SentimentData }) {
  const chartData = [
    { name: "Positive", value: data.positive },
    { name: "Negative", value: data.negative },
    { name: "Neutral", value: data.neutral },
  ];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Deliverables Weeks 10-12:**
* [x] Research API with Firecrawl search + scrape
* [x] Claude extended thinking integration
* [x] Split-view research interface
* [x] Citation extraction and display
* [x] Brand mention search and tracking
* [x] Sentiment analysis for mentions
* [x] AI chat interface for brand insights
* [x] Sentiment visualization charts

---

### 5.6 Phase 5: Integration, Testing & Launch (Weeks 13-14)

#### Week 13: Cross-Module Integration

```typescript
// lib/integrations/cross-module.ts

import { AgentOrchestrator } from "@/lib/agents/orchestrator";
import { getFirecrawl } from "@/lib/firecrawl/client";
import { db } from "@/lib/db/client";

export class ModuleIntegration {
  /**
   * Enrich data, then automatically create a scout for the company
   */
  static async enrichAndTrack(email: string) {
    const orchestrator = new AgentOrchestrator();
    const enriched = await orchestrator.enrich({ email });

    if (enriched.company.name) {
      // Auto-create a scout to track the company
      await db.insert(scouts).values({
        userId: "system",
        name: `Track ${enriched.company.name}`,
        searchQuery: `"${enriched.company.name}" news OR announcement`,
        schedule: "0 9 * * *", // Daily at 9am
        isActive: false, // User can activate
      });
    }

    return enriched;
  }

  /**
   * Research a topic, then create a monitor for key sources
   */
  static async researchAndMonitor(query: string, userId: string) {
    const firecrawl = getFirecrawl();
    const results = await firecrawl.search(query, { limit: 5 });

    // Create monitors for top sources
    const monitors = await Promise.all(
      results.slice(0, 3).map((r) =>
        db.insert(monitors).values({
          userId,
          url: r.url,
          name: `Monitor: ${r.title.slice(0, 50)}`,
          checkInterval: 86400, // Daily
          isActive: false,
        })
      )
    );

    return { results, monitors };
  }

  /**
   * Extract brand from URL, then set up brand monitoring
   */
  static async brandToGeo(url: string, userId: string) {
    const firecrawl = getFirecrawl();
    const brand = await firecrawl.extractBrandIdentity(url);

    if (brand?.metadata?.siteName) {
      const profile = await db.insert(brandProfiles).values({
        userId,
        brandName: brand.metadata.siteName,
        keywords: [],
      });

      return { brand, profile };
    }

    return { brand };
  }
}
```

#### Week 14: Testing, Documentation & Launch

**Testing Strategy:**

```typescript
// __tests__/integration/enrich.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { AgentOrchestrator } from "@/lib/agents/orchestrator";

describe("Enrichment Pipeline", () => {
  let orchestrator: AgentOrchestrator;

  beforeAll(() => {
    orchestrator = new AgentOrchestrator();
  });

  it("should enrich a corporate email", async () => {
    const result = await orchestrator.enrich({
      email: "test@firecrawl.dev",
    });

    expect(result.company).toBeDefined();
    expect(result.company.name).toBeTruthy();
    expect(result.profile?.industry).toBeTruthy();
  }, 60000);

  it("should handle unknown domains gracefully", async () => {
    const result = await orchestrator.enrich({
      email: "test@unknown-domain-12345.com",
    });

    expect(result.email).toBe("test@unknown-domain-12345.com");
    // Should not throw, may have partial data
  }, 60000);
});

// __tests__/e2e/scouts.test.ts
import { test, expect } from "@playwright/test";

test.describe("Scouts Module", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password");
    await page.click('button[type="submit"]');
    await page.waitForURL("/");
  });

  test("should create a new scout", async ({ page }) => {
    await page.goto("/scouts/new");

    await page.fill('[name="name"]', "Test Scout");
    await page.fill('[name="searchQuery"]', "AI news");
    await page.selectOption('[name="schedule"]', "0 */6 * * *");

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/scouts\/[\w-]+/);
    await expect(page.locator("h1")).toContainText("Test Scout");
  });

  test("should run scout manually", async ({ page }) => {
    await page.goto("/scouts");
    await page.click('[data-testid="scout-card"]');
    await page.click('button:has-text("Run Now")');

    await expect(page.locator('[data-testid="results-feed"]')).toBeVisible();
  });
});
```

---

## 6. Environment Configuration

```bash
# .env.example

# ===== Application =====
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# ===== Database =====
DATABASE_URL="postgresql://user:password@host:5432/firecrawl_suite"

# ===== Authentication (Better Auth) =====
BETTER_AUTH_SECRET="generate-with: openssl rand -base64 32"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# ===== Firecrawl =====
FIRECRAWL_API_KEY=""

# ===== AI Providers (at least one required) =====
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
GOOGLE_AI_API_KEY=""
GROQ_API_KEY=""

# ===== Notifications =====
RESEND_API_KEY=""
RESEND_FROM_EMAIL="FireCrawl <notifications@yourdomain.com>"

# ===== Billing (Autumn) =====
AUTUMN_API_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# ===== Security =====
ENCRYPTION_KEY="generate-with: openssl rand -base64 32"

# ===== Supabase (for Edge Functions) =====
SUPABASE_URL=""
SUPABASE_SERVICE_ROLE_KEY=""
SUPABASE_ANON_KEY=""

# ===== Convex (for real-time) =====
CONVEX_DEPLOYMENT=""
NEXT_PUBLIC_CONVEX_URL=""

# ===== Analytics (Optional) =====
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST=""
```

---

## 7. API Reference

### 7.1 Endpoints Summary

| Module | Endpoint | Method | Description |
|---|---|---|---|
| **Auth** | `/api/auth/[...all]` | * | Better Auth handler |
| **Enrich** | `/api/enrich` | POST | Start enrichment job |
| **Enrich** | `/api/enrich/[jobId]` | GET | Get job status/results |
| **Scouts** | `/api/scouts` | GET, POST | List/create scouts |
| **Scouts** | `/api/scouts/[scoutId]` | GET, PUT, DELETE | Manage scout |
| **Scouts** | `/api/scouts/[scoutId]/run` | POST | Manual execution |
| **Observe** | `/api/observe` | GET, POST | List/create monitors |
| **Observe** | `/api/observe/[monitorId]` | GET, PUT, DELETE | Manage monitor |
| **Observe** | `/api/observe/[monitorId]/check` | POST | Manual check |
| **Research** | `/api/research` | POST | Start research (streaming) |
| **GEO** | `/api/geo/brands` | GET, POST | List/create brand profiles |
| **GEO** | `/api/geo/mentions` | POST | Search brand mentions |
| **GEO** | `/api/geo/chat` | POST | AI chat (streaming) |
| **Brand** | `/api/brand` | POST | Extract brand identity |

---

## 8. Success Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| Time to First Value | < 3 minutes | User creates first resource |
| Module Adoption | > 50% use 2+ modules | Analytics tracking |
| Enrichment Accuracy | > 80% fields populated | Sampling audit |
| Scout Alert Relevance | > 70% actionable | User feedback |
| Monitor False Positives | < 20% | AI filter effectiveness |
| User Retention (Weekly) | > 35% | Auth analytics |
| API Response Time | < 3s (non-streaming) | Monitoring |

---

## 9. Risk Mitigation

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| Firecrawl rate limits | High | Queue system, user-level limits, caching |
| AI provider costs | Medium | Token budgets, model fallbacks, caching |
| Data accuracy | Medium | Multi-source validation, confidence scores |
| Notification spam | Low | AI filtering, user-configurable thresholds |
| Security (API keys) | High | AES-256-GCM encryption, key rotation |

---

## 10. Future Roadmap

### Post-Launch (Months 4-6)

* **Chrome Extension**: Quick access from any webpage
* **Slack/Discord Integration**: Alerts and commands
* **Team Workspaces**: Shared scouts, monitors, and research
* **Export/Import**: Bulk data operations
* **Custom Webhooks**: Advanced integration options

### Long-term (Months 7-12)

* **White-label Solution**: Resellable platform
* **API Access**: Public API for developers
* **Mobile App**: iOS/Android companion
* **Advanced Analytics**: Trend analysis, predictions
* **Custom AI Agents**: User-defined enrichment agents

---

## 11. Conclusion

The **FireCrawl Intelligence Suite** consolidates six powerful Firecrawl applications into a unified platform delivering:

| Benefit | Description |
|---|---|
| **Unified Experience** | Single login, consistent UI, shared settings |
| **Cross-Module Synergy** | Enrich → Scout → Research workflows |
| **Operational Efficiency** | One codebase, one deployment, one billing |
| **Scalable Architecture** | Edge functions, cron jobs, real-time updates |
| **Enterprise Ready** | Auth, billing, encryption, audit trails |

The 14-week implementation plan provides a clear path from foundation to launch with:
* **Weeks 1-3**: Core infrastructure
* **Weeks 4-6**: Enrich & Brand (data acquisition)
* **Weeks 7-9**: Scouts & Observe (monitoring)
* **Weeks 10-12**: Research & GEO (analysis)
* **Weeks 13-14**: Integration & launch

Each module builds on shared infrastructure while maintaining focused functionality, resulting in a platform that is greater than the sum of its parts.
