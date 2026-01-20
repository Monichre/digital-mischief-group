# Fire Enrich - Complete Implementation Guide

**Source Repository**: [firecrawl/fire-enrich](https://github.com/firecrawl/fire-enrich)  
**Last Updated**: January 2025  
**Status**: Production-ready reference implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Directory Structure](#directory-structure)
4. [Core Source Code Outline](#core-source-code-outline)
5. [Key Implementation Patterns](#key-implementation-patterns)
6. [Notable Solutions & Nuances](#notable-solutions--nuances)
7. [Development Guide](#development-guide)
8. [Integration with Digital Mischief Group](#integration-with-digital-mischief-group)

---

## Overview

Fire Enrich is an AI-powered data enrichment tool that transforms simple email lists into rich company datasets. It uses a sophisticated multi-phase agent orchestration system that sequentially builds context for increasingly accurate results.

### Core Value Proposition

- **Real-time Research**: Unlike static databases, Fire Enrich researches each company fresh when needed
- **Source Attribution**: Every data point includes source URLs for transparency and compliance
- **Multi-Agent System**: Specialized agents work sequentially, each building on previous discoveries
- **Type-Safe**: Full Zod schema validation for all agent outputs
- **Extensible**: Easy to add new agents or fields through schema extensions

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Web Scraping**: Firecrawl API
- **AI Extraction**: OpenAI GPT-4o (upgraded to GPT-5 in v2)
- **Validation**: Zod schemas
- **Streaming**: Server-Sent Events (SSE)

---

## Architecture

### High-Level Flow

```
CSV Upload → Domain Extraction → Multi-Phase Agent Pipeline → Enriched Data + Sources
```

### Multi-Phase Agent Pipeline

```
Input (Email/Domain/Company)
    ↓
[Phase 1] Discovery Agent (REQUIRED)
    ├─ Normalizes input to domain
    ├─ Scrapes company website
    ├─ Extracts company name, website, business type
    └─ Output: { company_name, domain, website, confidence, sources }
    ↓
[Phase 2] Company Profile Agent
    ├─ Uses verified company name
    ├─ Searches for industry classification
    ├─ Extracts firmographics
    └─ Output: { industry, headquarters, employee_count, year_founded, ... }
    ↓
[Phase 3] Funding Agent (Parallel with Phase 4)
    ├─ Uses company + industry context
    ├─ Searches Crunchbase, TechCrunch, venture news
    └─ Output: { funding_stage, total_raised, investors, valuation, ... }
    ↓
[Phase 4] Tech Stack Agent (Parallel with Phase 3)
    ├─ Analyzes GitHub repos
    ├─ HTML meta tag inspection
    ├─ Job posting analysis
    └─ Output: { languages, frameworks, infrastructure, tools, ... }
    ↓
[Phase 5] Custom Fields Agent
    ├─ Uses ALL previous context
    ├─ Handles user-defined fields (CEO, competitors, etc.)
    └─ Output: { ceo_name, key_executives, icp_fit_score, ... }
    ↓
Final Synthesis
    ├─ Combines all agent findings
    ├─ Resolves conflicts
    ├─ Validates data
    └─ Output: Complete enriched profile with sources
```

### Why Sequential Execution?

1. **Context Building**: Each agent adds context that makes subsequent searches more accurate
   - Example: Knowing industry helps funding agent search in the right databases
2. **Data Validation**: Later agents can validate and refine earlier discoveries
3. **Efficiency**: Prevents redundant searches by sharing discovered information
4. **Parallel Within Phases**: While agents run sequentially, each agent performs 3 concurrent Firecrawl searches

---

## Directory Structure

### Fire Enrich Repository Structure

```
fire-enrich/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   └── enrich/               # Enrichment endpoints
│   │       ├── route.ts          # Main enrichment endpoint
│   │       └── stream/            # SSE streaming endpoint
│   ├── fire-enrich/              # Feature UI pages
│   │   ├── page.tsx              # Main dashboard
│   │   ├── config.ts             # Feature configuration (limits, modes)
│   │   └── components/           # Feature-specific components
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── lib/                          # Core business logic
│   ├── agent-architecture/       # Agent system implementation
│   │   ├── agents/               # Individual agent implementations
│   │   │   ├── discovery.ts      # Phase 1: Company discovery
│   │   │   ├── company-profile.ts # Phase 2: Firmographics
│   │   │   ├── funding.ts        # Phase 3: Financial intelligence
│   │   │   ├── tech-stack.ts     # Phase 4: Technology analysis
│   │   │   └── custom-fields.ts  # Phase 5: Custom field extraction
│   │   ├── orchestrator.ts       # Main orchestration logic
│   │   ├── schemas.ts            # Zod schemas for all agents
│   │   └── types.ts              # TypeScript interfaces
│   │
│   ├── services/                 # Service layer
│   │   └── enrichment/           # Enrichment service abstractions
│   │
│   ├── strategies/               # Search strategies
│   │   └── search-strategies.ts  # Firecrawl search patterns
│   │
│   ├── config/                   # Configuration management
│   ├── types/                    # Shared type definitions
│   ├── utils/                    # Utility functions
│   └── rate-limit.ts             # Rate limiting utilities
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui primitives
│   └── fire-enrich/              # Feature-specific components
│       ├── CSVUpload.tsx         # CSV upload interface
│       ├── EnrichmentTable.tsx   # Results table
│       └── FieldSelector.tsx     # Field selection UI
│
├── hooks/                        # React hooks
│   └── useEnrichStream.ts        # SSE streaming hook
│
├── public/                       # Static assets
├── styles/                       # Additional styles
├── utils/                        # Shared utilities
│
├── .env.example                  # Environment variable template
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project documentation
```

### Digital Mischief Group Integration Structure

```
src/
├── app/
│   └── api/
│       └── enrich/               # Enrich API routes
│           ├── route.ts          # Main enrichment endpoint
│           ├── stream/           # SSE streaming
│           │   └── route.ts
│           └── batch/            # Batch CSV processing
│               ├── route.ts
│               └── stream/
│                   └── route.ts
│
├── lib/
│   └── agents/                   # Agent implementations
│       ├── orchestrator.ts       # Main orchestration
│       ├── discovery.ts          # Discovery agent
│       ├── company-profile.ts    # Profile agent
│       ├── funding.ts            # Funding agent
│       ├── tech-stack.ts         # Tech stack agent
│       ├── custom-fields.ts      # Custom fields agent
│       ├── schemas.ts            # Zod schemas
│       ├── types.ts              # TypeScript types
│       ├── llm-provider.ts       # LLM abstraction
│       └── utils.ts              # Agent utilities
│
└── features/
    └── enrich/                   # Feature UI (future migration)
```

---

## Core Source Code Outline

### 1. Orchestrator (`lib/agents/orchestrator.ts`)

**Purpose**: Coordinates sequential execution of all agents with progress tracking

**Key Functions**:
```typescript
export async function orchestrateEnrichment(
  input: EnrichmentInput,
  options?: OrchestratorOptions
): Promise<EnrichmentResult>
```

**Responsibilities**:
- Sequential agent execution (Discovery → Profile → Funding/Tech → Custom)
- Progress tracking via callbacks
- Error aggregation and graceful degradation
- Timeout management per agent
- Retry logic with exponential backoff
- Source collection across all phases

**Key Patterns**:
- **Sequential Execution**: Agents run in order, each building on previous context
- **Parallel Phases**: Funding and Tech Stack run in parallel (Phase 3 & 4)
- **Graceful Degradation**: Non-required agents can fail without breaking pipeline
- **Progress Callbacks**: Real-time updates via `onProgress` callback

### 2. Discovery Agent (`lib/agents/discovery.ts`)

**Purpose**: Establishes company identity (name, website, domain)

**Input**: `EnrichmentInput` (email, domain, url, or company_name)  
**Output**: `DiscoveryResult` (company_name, domain, website, confidence, sources)

**Key Logic**:
1. **Input Normalization**: Converts email/domain/url/company_name → domain
2. **Website Scraping**: Uses Firecrawl `extract()` with `DISCOVERY_EXTRACTION_SCHEMA`
3. **Company Name Extraction**: Extracts from website header/footer/meta tags
4. **Confidence Scoring**: Validates domain matches extracted website
5. **Source Attribution**: Tracks all URLs used

**Notable Features**:
- Email domain extraction with validation
- Company name search fallback for name-only inputs
- Confidence scoring (0-1) based on extraction quality
- Source URL collection for transparency

### 3. Company Profile Agent (`lib/agents/company-profile.ts`)

**Purpose**: Extracts firmographics (industry, location, size, founding year)

**Input**: `DiscoveryResult` from Phase 1  
**Output**: `CompanyProfileResult` (industry, headquarters, employee_count, year_founded, ...)

**Key Logic**:
1. **Parallel Searches**: 3 concurrent Firecrawl searches
   - Industry classification search
   - Company-specific search
   - Market positioning search
2. **LLM Extraction**: Uses structured extraction with `COMPANY_PROFILE_SCHEMA`
3. **Field-to-Source Mapping**: Maps each field to its source URLs
4. **Data Validation**: Validates against Zod schema

**Search Strategies**:
- `"{company_name} industry classification"`
- `"{company_name} headquarters location"`
- `"{company_name} employee count size"`

### 4. Funding Agent (`lib/agents/funding.ts`)

**Purpose**: Discovers funding information (stage, amount, investors)

**Input**: `DiscoveryResult` + `CompanyProfileResult` (for industry context)  
**Output**: `FundingResult` (funding_stage, total_raised, investors, valuation, ...)

**Key Logic**:
1. **Industry-Aware Searches**: Uses industry context to target relevant databases
2. **Parallel Searches**: 3 concurrent searches
   - `"{company} funding rounds"`
   - `"{company} investors crunchbase"`
   - `"{company} acquisition news"`
3. **LLM Synthesis**: Extracts structured funding data
4. **Source Attribution**: Maps funding fields to source URLs

**Data Sources**:
- Crunchbase
- TechCrunch
- VentureBeat
- Company press releases

### 5. Tech Stack Agent (`lib/agents/tech-stack.ts`)

**Purpose**: Analyzes technology stack (languages, frameworks, infrastructure)

**Input**: `DiscoveryResult` (website URL)  
**Output**: `TechStackResult` (languages, frameworks, infrastructure, tools, signals)

**Key Logic**:
1. **Multi-Source Analysis**:
   - Website HTML scraping (meta tags, scripts)
   - GitHub repository search
   - Job posting analysis
2. **Parallel Searches**: 3 concurrent searches
   - `"github.com {company}"`
   - `"{website}/careers"` scraping
   - Direct HTML analysis
3. **Signal Detection**: AI adoption, modern stack, cloud-native indicators
4. **Source Attribution**: Maps tech stack fields to sources

**Detection Methods**:
- HTML/JavaScript analysis (Firecrawl)
- GitHub repository scanning
- Engineering blog analysis
- Job posting scraping

### 6. Custom Fields Agent (`lib/agents/custom-fields.ts`)

**Purpose**: Handles user-defined fields (CEO, competitors, ICP fit, etc.)

**Input**: Full `EnrichmentContext` (all previous agent results)  
**Output**: `CustomFieldsResult` (ceo_name, key_executives, icp_fit_score, ...)

**Key Logic**:
1. **Context-Aware Searches**: Uses all previous data for targeted searches
2. **ICP Fit Calculation**: Scores company fit based on profile, funding, tech
3. **Custom Field Extraction**: Handles any user-defined field
4. **Source Attribution**: Maps custom fields to sources

**ICP Fit Scoring** (example):
- Industry match: 0-30 points
- Company size: 0-25 points
- Tech stack signals: 0-25 points
- Funding stage: 0-20 points

### 7. Schemas (`lib/agents/schemas.ts`)

**Purpose**: Type-safe validation for all agent outputs

**Key Schemas**:
```typescript
// Discovery Agent
export const DiscoveryResultSchema = z.object({
  company_name: z.string(),
  domain: z.string(),
  website: z.string().url(),
  confidence: z.number().min(0).max(1),
  sources: z.array(z.string().url())
})

// Company Profile Agent
export const CompanyProfileResultSchema = z.object({
  industry: z.string().optional(),
  headquarters: z.string().optional(),
  employee_count: z.number().nullable().optional(),
  employee_range: z.string().nullable().optional(),
  year_founded: z.number().nullable().optional(),
  business_type: z.string().optional(),
  description: z.string().optional(),
  sources: z.record(z.string(), z.array(z.string().url()))
})

// Funding Agent
export const FundingResultSchema = z.object({
  funding_stage: z.string().nullable().optional(),
  total_raised: z.string().nullable().optional(),
  last_round_date: z.string().nullable().optional(),
  last_round_amount: z.string().nullable().optional(),
  investors: z.array(z.string()).optional(),
  valuation: z.string().nullable().optional(),
  is_public: z.boolean().optional(),
  sources: z.record(z.string(), z.array(z.string().url()))
})

// Tech Stack Agent
export const TechStackResultSchema = z.object({
  languages: z.array(z.string()).optional(),
  frameworks: z.array(z.string()).optional(),
  infrastructure: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  signals: z.object({
    ai_adoption: z.boolean().optional(),
    modern_stack: z.boolean().optional(),
    cloud_native: z.boolean().optional()
  }).optional(),
  sources: z.array(z.string().url())
})

// Custom Fields Agent
export const CustomFieldsResultSchema = z.object({
  ceo_name: z.string().nullable().optional(),
  key_executives: z.array(z.object({
    name: z.string(),
    title: z.string(),
    linkedin: z.string().url().optional()
  })).optional(),
  icp_fit_score: z.number().min(0).max(100).optional(),
  icp_fit_reasons: z.array(z.string()).optional(),
  is_personal_site: z.boolean().optional(),
  pain_points: z.array(z.string()).optional(),
  buying_signals: z.array(z.object({
    signal: z.string(),
    confidence: z.number()
  })).optional(),
  competitive_landscape: z.array(z.string()).optional(),
  sources: z.record(z.string(), z.array(z.string().url()))
})
```

**Extraction Schemas** (for Firecrawl `extract()`):
```typescript
export const DISCOVERY_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    company_name: { type: "string" },
    website: { type: "string" },
    business_type: { type: "string" }
  }
}

export const COMPANY_PROFILE_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    industry: { type: "string" },
    headquarters: { type: "string" },
    employee_count: { type: "number" },
    year_founded: { type: "number" },
    description: { type: "string" }
  }
}
```

### 8. API Routes

#### Main Enrichment Endpoint (`app/api/enrich/route.ts`)

**Purpose**: Single enrichment request handler

**Flow**:
1. Authenticate user
2. Validate input (email/domain/url/company_name)
3. Run orchestration with progress tracking
4. Save to database (`enrichment_jobs` table)
5. Return enriched result

**Response Format**:
```typescript
{
  success: boolean,
  data: {
    discovery: DiscoveryResult,
    profile: CompanyProfileResult,
    funding: FundingResult,
    techStack: TechStackResult,
    customFields: CustomFieldsResult,
    sources: string[]
  },
  errors?: AgentError[],
  duration_ms: number
}
```

#### Streaming Endpoint (`app/api/enrich/stream/route.ts`)

**Purpose**: Real-time progress updates via Server-Sent Events

**Flow**:
1. Create ReadableStream
2. Run orchestration with `onProgress` callback
3. Emit SSE events for each phase
4. Stream final result

**Event Types**:
- `phase_start`: Agent phase begins
- `phase_progress`: Progress update (0-100%)
- `phase_complete`: Agent phase completes
- `complete`: Full enrichment complete

#### Batch Processing (`app/api/enrich/batch/route.ts`)

**Purpose**: CSV upload and row-by-row processing

**Flow**:
1. Parse CSV file
2. Create batch record in database
3. Process rows sequentially or in parallel
4. Track progress per row
5. Return batch summary

**Features**:
- 7-day caching per domain
- Row-level error handling
- Progress tracking per row
- Export enriched CSV

---

## Key Implementation Patterns

### 1. Sequential Agent Execution with Context Passing

```typescript
// Context accumulates as agents execute
const context: EnrichmentContext = { input }

// Phase 1: Discovery (required)
context.discovery = await runDiscoveryAgent(input, context)

// Phase 2: Profile (uses discovery)
context.profile = await runCompanyProfileAgent(context.discovery, context)

// Phase 3 & 4: Parallel (both use discovery)
const [funding, techStack] = await Promise.all([
  runFundingAgent(context.discovery, context),
  runTechStackAgent(context.discovery, context)
])
context.funding = funding
context.techStack = techStack

// Phase 5: Custom Fields (uses all context)
context.customFields = await runCustomFieldsAgent(context)
```

### 2. Parallel Searches Within Phases

Each agent performs 3 concurrent Firecrawl searches:

```typescript
const [search1, search2, search3] = await Promise.all([
  firecrawl.search(`${company} industry classification`),
  firecrawl.search(`${company} headquarters location`),
  firecrawl.search(`${company} employee count`)
])

// Combine results for LLM extraction
const allContent = [search1, search2, search3]
  .map(s => s.data?.map(r => r.content).join('\n'))
  .join('\n\n')
```

### 3. Source Attribution Pattern

Every field maps to its source URLs:

```typescript
interface ProfileResult {
  industry: string
  sources: {
    industry: ["https://crunchbase.com/...", "https://linkedin.com/..."],
    headquarters: ["https://company.com/about"],
    employee_count: ["https://linkedin.com/company/..."]
  }
}

// Collect all sources at end
function collectSources(context: EnrichmentContext): Set<string> {
  const allSources = new Set<string>()
  if (context.discovery?.sources) {
    context.discovery.sources.forEach(s => allSources.add(s))
  }
  if (context.profile?.sources) {
    Object.values(context.profile.sources).flat().forEach(s => allSources.add(s))
  }
  // ... repeat for all phases
  return allSources
}
```

### 4. Error Handling with Graceful Degradation

```typescript
// Required agents fail fast
if (config.discovery.required) {
  try {
    context.discovery = await runDiscoveryAgent(input, context)
  } catch (error) {
    return { success: false, error: "Discovery failed" }
  }
}

// Optional agents can fail gracefully
if (config.funding.enabled) {
  try {
    context.funding = await runFundingAgent(context.discovery, context)
  } catch (error) {
    errors.push({ phase: "funding", error: error.message, recoverable: true })
    context.funding = getDefaultFunding() // Continue with defaults
  }
}
```

### 5. Retry Logic with Exponential Backoff

```typescript
async function runWithRetry<T>(
  fn: () => Promise<T>,
  retries: number,
  phase: AgentPhase
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (attempt < retries) {
        // Exponential backoff: 1s, 2s, 4s...
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * Math.pow(2, attempt))
        )
      }
    }
  }
  
  throw lastError || new Error(`${phase} failed after ${retries + 1} attempts`)
}
```

### 6. Timeout Protection

```typescript
async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  phase: AgentPhase
): Promise<T> {
  let timeoutId: NodeJS.Timeout
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${phase} agent timed out after ${ms}ms`))
    }, ms)
  })
  
  try {
    const result = await Promise.race([promise, timeoutPromise])
    clearTimeout(timeoutId!)
    return result
  } catch (error) {
    clearTimeout(timeoutId!)
    throw error
  }
}
```

### 7. Progress Tracking Pattern

```typescript
const emitProgress = (progress: AgentProgress) => {
  if (onProgress) {
    try {
      onProgress(progress)
    } catch {
      // Ignore progress callback errors
    }
  }
}

// Usage in orchestrator
emitProgress({ 
  phase: "discovery", 
  status: "running", 
  progress: 0, 
  message: "Identifying company..." 
})

context.discovery = await runDiscoveryAgent(input, context)

emitProgress({ 
  phase: "discovery", 
  status: "completed", 
  progress: 20, 
  message: "Company identified",
  completedAt: Date.now()
})
```

---

## Notable Solutions & Nuances

### 1. Input Normalization Strategy

**Problem**: Users provide various input types (email, domain, URL, company name)

**Solution**: Discovery agent normalizes all inputs to domain + URL:

```typescript
// Email → Domain
if (input.email) {
  domain = extractDomainFromEmail(input.email)
  url = `https://${domain}`
}

// URL → Domain
else if (input.url) {
  url = normalizeUrl(input.url)
  domain = extractDomain(url)
}

// Domain → URL
else if (input.domain) {
  domain = input.domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0]
  url = `https://${domain}`
}

// Company Name → Search → Domain
else if (input.company_name) {
  const searchResult = await firecrawl.search({
    query: `${input.company_name} official website company`,
    limit: 3
  })
  // Find most likely official website
  url = findOfficialSite(searchResult.data)
  domain = extractDomain(url)
}
```

**Nuance**: Company name search uses heuristics to find official website (domain name matching, title matching)

### 2. Confidence Scoring

**Problem**: Need to indicate data quality/reliability

**Solution**: Confidence scores (0-1) based on extraction quality:

```typescript
let confidence = 0.5 // Default

// Increase confidence if company name extracted
if (extracted.company_name) {
  confidence = 0.9
}

// Increase confidence if website matches domain
if (extractedDomain === domain) {
  confidence = Math.min(confidence + 0.1, 1)
}
```

**Nuance**: Confidence helps downstream agents prioritize data sources

### 3. Field-to-Source Mapping

**Problem**: Need to attribute each field to its source URLs

**Solution**: Nested source mapping in agent results:

```typescript
interface ProfileResult {
  industry: string
  sources: {
    industry: string[]      // URLs where industry was found
    headquarters: string[]  // URLs where headquarters was found
    employee_count: string[] // URLs where employee count was found
  }
}
```

**Nuance**: Allows per-field source attribution, not just overall result sources

### 4. Parallel Phase Execution

**Problem**: Funding and Tech Stack agents don't depend on each other

**Solution**: Run them in parallel after Profile phase:

```typescript
// Phase 3 & 4: Parallel (40-70%)
const [funding, techStack] = await Promise.all([
  config.funding.enabled 
    ? runFundingAgent(context.discovery, context)
    : Promise.resolve(null),
  config.tech_stack.enabled
    ? runTechStackAgent(context.discovery, context)
    : Promise.resolve(null)
])
```

**Nuance**: Both still use discovery context, but can run simultaneously

### 5. ICP Fit Scoring Algorithm

**Problem**: Need to score how well a company fits Ideal Customer Profile

**Solution**: Weighted scoring based on multiple factors:

```typescript
function calculateICPFit(context: EnrichmentContext): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []
  
  // Industry match (0-30 points)
  if (PREFERRED_INDUSTRIES.includes(context.profile?.industry || "")) {
    score += 30
    reasons.push(`Target industry: ${context.profile.industry}`)
  }
  
  // Company size (0-25 points)
  if (context.profile?.employee_count && 
      context.profile.employee_count >= 50 && 
      context.profile.employee_count <= 500) {
    score += 25
    reasons.push(`Growth stage: ${context.profile.employee_count} employees`)
  }
  
  // Tech stack signals (0-25 points)
  if (context.techStack?.signals.ai_adoption) {
    score += 15
    reasons.push("AI adoption detected")
  }
  
  // Funding signals (0-20 points)
  if (context.funding?.funding_stage?.includes("Series")) {
    score += 20
    reasons.push(`Funded: ${context.funding.funding_stage}`)
  }
  
  return { score, reasons }
}
```

**Nuance**: Configurable weights allow customization per use case

### 6. Caching Strategy

**Problem**: Re-enriching same domains wastes API calls

**Solution**: 7-day cache per domain:

```typescript
// Check cache before enrichment
const cacheKey = extractDomain(input)
const cached = await sql`
  SELECT * FROM enrichment_jobs 
  WHERE domain = ${cacheKey} 
  AND status = 'completed'
  AND created_at > NOW() - INTERVAL '7 days'
  ORDER BY created_at DESC
  LIMIT 1
`

if (cached.length > 0) {
  return mapToEnrichedResult(cached[0], 'cache')
}
```

**Nuance**: Cache key is domain-based, so same company emails share cache

### 7. Personal Email Filtering

**Problem**: Personal emails (Gmail, Yahoo) don't have company data

**Solution**: Skip common email providers:

```typescript
const PERSONAL_EMAIL_PROVIDERS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 
  'outlook.com', 'icloud.com', 'aol.com'
]

if (PERSONAL_EMAIL_PROVIDERS.includes(domain)) {
  return {
    success: false,
    error: "Personal email provider detected - skipping enrichment"
  }
}
```

**Nuance**: Saves API costs and improves data quality

### 8. Streaming Progress Updates

**Problem**: Long-running enrichments need real-time feedback

**Solution**: Server-Sent Events (SSE) for progress streaming:

```typescript
const stream = new ReadableStream({
  async start(controller) {
    const encoder = new TextEncoder()
    
    const result = await orchestrateEnrichment(input, {
      onProgress: (progress) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(progress)}\n\n`)
        )
      }
    })
    
    controller.enqueue(
      encoder.encode(`data: ${JSON.stringify({ type: "complete", result })}\n\n`)
    )
    controller.close()
  }
})

return new Response(stream, {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  }
})
```

**Nuance**: Allows UI to show real-time progress per phase

### 9. Schema Extensibility

**Problem**: Need to add new fields without breaking existing code

**Solution**: Zod schemas with optional fields:

```typescript
// Easy to extend
export const FundingResultSchema = z.object({
  funding_stage: z.string().nullable().optional(),
  total_raised: z.string().nullable().optional(),
  // Add new field:
  debt_financing: z.string().nullable().optional(), // NEW
  sources: z.record(z.string(), z.array(z.string().url()))
})
```

**Nuance**: Optional fields allow gradual schema evolution

### 10. LLM Provider Abstraction

**Problem**: Need to support multiple LLM providers (OpenAI, Anthropic, etc.)

**Solution**: Unified LLM provider interface:

```typescript
interface LLMProvider {
  generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    sources?: string[]
  ): Promise<T>
}

// Implementation for OpenAI
export function createOpenAIProvider(apiKey: string): LLMProvider {
  return {
    async generateStructured(prompt, schema, sources) {
      // OpenAI structured output implementation
    }
  }
}

// Implementation for Anthropic
export function createAnthropicProvider(apiKey: string): LLMProvider {
  return {
    async generateStructured(prompt, schema, sources) {
      // Anthropic structured output implementation
    }
  }
}
```

**Nuance**: Allows switching providers without changing agent code

---

## Development Guide

### Setting Up Fire Enrich Locally

1. **Clone Repository**:
```bash
git clone https://github.com/firecrawl/fire-enrich.git
cd fire-enrich
```

2. **Install Dependencies**:
```bash
npm install
# or
yarn install
```

3. **Configure Environment**:
```bash
cp .env.example .env.local
```

Add your API keys:
```env
FIRECRAWL_API_KEY=fc-your-key
OPENAI_API_KEY=sk-your-key
```

4. **Run Development Server**:
```bash
npm run dev
# or
yarn dev
```

5. **Access Application**:
Open [http://localhost:3000](http://localhost:3000)

### Adding a New Agent

1. **Create Agent File** (`lib/agent-architecture/agents/new-agent.ts`):

```typescript
import { z } from "zod"
import type { Agent, EnrichmentContext, DiscoveryResult } from "../types"
import { getFirecrawlClient } from "@/lib/firecrawl/client"

// Define output schema
export const NewAgentResultSchema = z.object({
  field1: z.string().optional(),
  field2: z.number().optional(),
  sources: z.array(z.string().url())
})

export type NewAgentResult = z.infer<typeof NewAgentResultSchema>

// Implement agent
export const newAgent: Agent<DiscoveryResult, NewAgentResult> = {
  name: "new_agent",
  timeout: 10000,
  
  async execute(discovery: DiscoveryResult, context: EnrichmentContext) {
    const firecrawl = getFirecrawlClient()
    const sources: string[] = []
    
    // Parallel searches
    const [search1, search2, search3] = await Promise.all([
      firecrawl.search(`${discovery.company_name} field1`),
      firecrawl.search(`${discovery.company_name} field2`),
      firecrawl.scrape(discovery.website)
    ])
    
    // Collect sources
    sources.push(...search1.data?.map(r => r.url) || [])
    sources.push(...search2.data?.map(r => r.url) || [])
    sources.push(discovery.website)
    
    // LLM extraction
    const llmProvider = createLLMProvider()
    const result = await llmProvider.generateStructured(
      `Extract field1 and field2 from: ${allContent}`,
      NewAgentResultSchema,
      sources
    )
    
    return {
      ...result,
      sources
    }
  }
}

export async function runNewAgent(
  discovery: DiscoveryResult,
  context: EnrichmentContext
): Promise<NewAgentResult> {
  return newAgent.execute(discovery, context)
}
```

2. **Add Schema to `schemas.ts`**:
```typescript
export { NewAgentResultSchema } from "./agents/new-agent"
export type { NewAgentResult } from "./agents/new-agent"
```

3. **Update Types** (`types.ts`):
```typescript
export interface EnrichmentContext {
  // ... existing
  newAgent?: NewAgentResult
}

export interface EnrichmentResult {
  data: {
    // ... existing
    newAgent: NewAgentResult
  }
}
```

4. **Add to Orchestrator** (`orchestrator.ts`):
```typescript
// Add config
const config = {
  // ... existing
  new_agent: { enabled: true, timeout: 10000, retries: 1, required: false }
}

// Add phase execution
if (config.new_agent.enabled) {
  emitProgress({ phase: "new_agent", status: "running", progress: 60 })
  try {
    context.newAgent = await runNewAgent(context.discovery, context)
    emitProgress({ phase: "new_agent", status: "completed", progress: 70 })
  } catch (error) {
    errors.push({ phase: "new_agent", error: error.message, recoverable: true })
    context.newAgent = getDefaultNewAgent()
  }
}
```

### Extending Existing Agent

To add a new field to an existing agent:

1. **Update Schema**:
```typescript
export const FundingResultSchema = z.object({
  // ... existing fields
  debt_financing: z.string().nullable().optional(), // NEW
  sources: z.record(z.string(), z.array(z.string().url()))
})
```

2. **Update Agent Logic**:
```typescript
// Add search for new field
const debtSearch = await firecrawl.search(`${company} debt financing`)

// Include in LLM prompt
const prompt = `Extract funding data including debt financing. Content: ${allContent}`

// Map source
result.sources.debt_financing = debtSearch.data?.map(r => r.url) || []
```

### Testing Agents

```typescript
// Test individual agent
import { runDiscoveryAgent } from "./discovery"

const result = await runDiscoveryAgent(
  { email: "test@example.com" },
  { input: { email: "test@example.com" } }
)

console.log(result)
// { company_name: "...", domain: "...", website: "...", confidence: 0.9, sources: [...] }
```

### Debugging Tips

1. **Enable Verbose Logging**:
```typescript
// In orchestrator.ts
const emitProgress = (progress: AgentProgress) => {
  console.log(`[${progress.phase}] ${progress.status}: ${progress.message}`)
  if (onProgress) onProgress(progress)
}
```

2. **Inspect Firecrawl Responses**:
```typescript
const searchResult = await firecrawl.search(query)
console.log("Search results:", JSON.stringify(searchResult, null, 2))
```

3. **Validate Schemas**:
```typescript
try {
  const result = DiscoveryResultSchema.parse(data)
} catch (error) {
  console.error("Schema validation failed:", error)
}
```

---

## Integration with Digital Mischief Group

### Current Implementation Status

✅ **Completed**:
- Multi-phase agent orchestration (`lib/agents/orchestrator.ts`)
- All 5 core agents (Discovery, Profile, Funding, Tech Stack, Custom Fields)
- Zod schema validation
- API routes (`app/api/enrich/route.ts`)
- Streaming endpoint (`app/api/enrich/stream/route.ts`)
- Batch CSV processing (`app/api/enrich/batch/route.ts`)
- Database integration (`enrichment_jobs` table)
- Source attribution

🔄 **In Progress**:
- UI components migration to `features/enrich/`
- Enhanced error handling
- Rate limiting per user

📋 **Planned**:
- Advanced caching strategies
- Multi-tenant isolation improvements
- Usage tracking integration
- Export functionality enhancements

### Key Differences from Source Repository

1. **Database Integration**: DMG version stores results in PostgreSQL with full job tracking
2. **Multi-Tenant**: All operations respect `user_id` isolation
3. **Unified Auth**: Uses Better Auth instead of standalone auth
4. **Unified Billing**: Integrated with Stripe + Autumn billing system
5. **Enhanced Streaming**: More granular progress events for UI

### Migration Path

When migrating features from Fire Enrich to DMG:

1. **Copy Agent Logic**: Copy agent implementations from `lib/agent-architecture/agents/` to `lib/agents/`
2. **Adapt Schemas**: Ensure Zod schemas match DMG patterns
3. **Update Types**: Align TypeScript types with DMG conventions
4. **Integrate Auth**: Add `user_id` checks to all operations
5. **Add Database**: Store results in `enrichment_jobs` table
6. **Add Usage Tracking**: Log to `usage_events` table
7. **Test Multi-Tenant**: Verify user isolation works correctly

### Best Practices for DMG Integration

1. **Always Check Auth**:
```typescript
const session = await auth.api.getSession({ headers: await headers() })
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
```

2. **Track Usage**:
```typescript
await sql`
  INSERT INTO usage_events (user_id, event_type, metadata)
  VALUES (${userId}, 'enrichment_completed', ${JSON.stringify({ domain })})
`
```

3. **Respect Plan Limits**:
```typescript
const plan = await getUserPlan(userId)
if (plan.limits.enrichments_per_month < currentUsage) {
  return NextResponse.json({ error: "Plan limit exceeded" }, { status: 403 })
}
```

4. **Isolate Data**:
```typescript
// Always filter by user_id
const jobs = await sql`
  SELECT * FROM enrichment_jobs 
  WHERE user_id = ${userId}
  ORDER BY created_at DESC
`
```

---

## References

- **Source Repository**: [github.com/firecrawl/fire-enrich](https://github.com/firecrawl/fire-enrich)
- **Blog Post**: [How Fire Enrich Works](https://www.firecrawl.dev/blog/fire-enrich)
- **Firecrawl Docs**: [docs.firecrawl.dev](https://docs.firecrawl.dev)
- **Current DMG Implementation**: `src/lib/agents/`, `src/app/api/enrich/`
- **DMG Rules**: `docs/product/firecrawl/FIRE_ENRICH_RULES.md`

---

## Appendix: Directory Structure Diagram

```
fire-enrich/
│
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── enrich/
│   │       ├── route.ts          # POST /api/enrich
│   │       └── stream/
│   │           └── route.ts      # POST /api/enrich/stream (SSE)
│   │
│   └── fire-enrich/              # Feature pages
│       ├── page.tsx              # Main dashboard
│       ├── config.ts             # Feature config (limits, modes)
│       └── components/           # Feature components
│           ├── CSVUpload.tsx
│           ├── EnrichmentTable.tsx
│           └── FieldSelector.tsx
│
├── lib/
│   ├── agent-architecture/       # Core agent system
│   │   ├── agents/               # Individual agents
│   │   │   ├── discovery.ts      # Phase 1
│   │   │   ├── company-profile.ts # Phase 2
│   │   │   ├── funding.ts        # Phase 3
│   │   │   ├── tech-stack.ts     # Phase 4
│   │   │   └── custom-fields.ts  # Phase 5
│   │   ├── orchestrator.ts       # Main orchestration
│   │   ├── schemas.ts            # Zod schemas
│   │   └── types.ts              # TypeScript types
│   │
│   ├── services/                 # Service abstractions
│   ├── strategies/               # Search strategies
│   ├── config/                   # Configuration
│   └── utils/                    # Utilities
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui primitives
│   └── fire-enrich/              # Feature components
│
├── hooks/                        # React hooks
│   └── useEnrichStream.ts        # SSE hook
│
└── public/                       # Static assets
```

---

**Document Version**: 1.0  
**Last Reviewed**: January 2025  
**Maintainer**: Digital Mischief Group Engineering Team
