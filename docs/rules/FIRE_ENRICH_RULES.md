# Fire Enrich - Cursor Rules

## Overview
This document defines patterns and best practices for implementing lead enrichment features based on the canonical **Fire Enrich** repository patterns. Fire Enrich uses a multi-phase agent orchestration system that sequentially builds context for increasingly accurate results.

**Source Repository**: https://github.com/firecrawl/fire-enrich

## Core Concept
Fire Enrich transforms simple email/domain inputs into rich company datasets using:
- **Multi-phase agent orchestration** (sequential execution with shared context)
- **Parallel searches within phases** (3 concurrent Firecrawl API calls per agent)
- **Source attribution** (every field linked to source URLs)
- **Real-time streaming** (Server-Sent Events for progress updates)
- **Type-safe schemas** (Zod validation for each phase)

## Architecture Pattern

### Multi-Phase Pipeline

```
CSV Row/Email → Discovery Agent → Company Profile Agent → Funding Agent
                     ↓                    ↓                     ↓
                Tech Stack Agent → Custom Fields Agent → Final Assembly
                     ↓                    ↓                     ↓
                Source Attribution → Quality Scoring → Save to DB
```

### Why Sequential Execution?
- **Context Building**: Each agent adds context that makes subsequent searches more accurate
- **Data Validation**: Later agents can validate and refine data from earlier phases
- **Efficiency**: Prevents redundant searches by sharing discovered information
- **Parallel Within Phases**: Each agent performs 3 concurrent searches, maximizing speed

## Agent Implementation Patterns

### 1. Discovery Agent (Phase 1) - Required

**Purpose**: Establishes company basics (name, website, business type)

**Input Schema**:
```typescript
interface DiscoveryInput {
  email?: string;
  domain?: string;
  company_name?: string;
}
```

**Output Schema**:
```typescript
interface DiscoveryResult {
  company_name: string;
  domain: string;
  website: string;
  business_type: string; // e.g., "B2B SaaS"
  confidence: number; // 0-1
  sources: string[]; // URLs used
  alternatives?: Array<{
    name: string;
    domain: string;
    confidence: number;
  }>;
}
```

**Implementation Pattern**:
```typescript
// lib/agents/discovery.ts
export async function runDiscoveryAgent(
  input: DiscoveryInput,
  context: EnrichmentContext
): Promise<DiscoveryResult> {
  // 1. Normalize input to domain
  const domain = extractDomain(input);
  
  // 2. Parallel searches (3 concurrent)
  const [search1, search2, search3] = await Promise.all([
    firecrawl.search(`${domain} company`),
    firecrawl.search(`What is ${domain}`),
    firecrawl.scrape(`https://${domain}`)
  ]);
  
  // 3. LLM synthesis with schema
  const result = await llmProvider.generateStructured({
    prompt: `Extract company identity from: ${searchResults}`,
    schema: DiscoverySchema,
    sources: [search1.urls, search2.urls, search3.urls]
  });
  
  // 4. Return with sources
  return {
    ...result,
    sources: [...search1.urls, ...search2.urls, ...search3.urls]
  };
}
```

**Key Features**:
- Email → domain extraction
- Fuzzy company name matching
- Domain verification
- Source URL collection

### 2. Company Profile Agent (Phase 2)

**Purpose**: Uses verified company name to find industry and market positioning

**Input**: Discovery result (company name, website)

**Output Schema**:
```typescript
interface ProfileResult {
  industry: string;
  segment: "SMB" | "Mid-Market" | "Enterprise";
  headquarters: string;
  employee_count: number | null;
  employee_range: string | null;
  year_founded: number | null;
  business_type: string;
  description: string;
  sources: Record<string, string[]>; // field → URLs
}
```

**Implementation Pattern**:
```typescript
// lib/agents/company-profile.ts
export async function runCompanyProfileAgent(
  discovery: DiscoveryResult,
  context: EnrichmentContext
): Promise<ProfileResult> {
  // Parallel searches using discovery data
  const searches = await Promise.all([
    firecrawl.search(`${discovery.company_name} industry classification`),
    firecrawl.search(`${discovery.company_name} web scraping API`),
    firecrawl.search(`Developer tools ${discovery.company_name}`)
  ]);
  
  // Synthesis with context from discovery
  const result = await llmProvider.generateStructured({
    prompt: `Extract firmographics. Company: ${discovery.company_name}, Website: ${discovery.website}`,
    schema: ProfileSchema,
    sources: mapFieldsToSources(searches)
  });
  
  return result;
}
```

**Data Sources**:
- Company homepage (About, Team pages)
- LinkedIn company page
- Crunchbase/PitchBook
- News articles

### 3. Funding Agent (Phase 3)

**Purpose**: Searches for funding using company and industry context

**Output Schema**:
```typescript
interface FundingResult {
  funding_stage: string | null; // "Seed", "Series A", etc.
  total_funding: string | null; // "$10M"
  last_round_date: string | null;
  last_round_amount: string | null;
  investors: string[];
  valuation: string | null;
  is_public: boolean;
  sources: Record<string, string[]>; // field → URLs
}
```

**Implementation Pattern**:
```typescript
// lib/agents/funding.ts
export async function runFundingAgent(
  discovery: DiscoveryResult,
  context: EnrichmentContext
): Promise<FundingResult> {
  // Use industry context from profile (if available)
  const industryContext = context.profile?.industry || "";
  
  // Parallel searches targeting funding sources
  const searches = await Promise.all([
    firecrawl.search(`${discovery.company_name} funding rounds`),
    firecrawl.search(`Mendable AI acquisition ${discovery.company_name}`),
    firecrawl.search(`${discovery.company_name} investors crunchbase`)
  ]);
  
  // Synthesis
  const result = await llmProvider.generateStructured({
    prompt: `Extract funding data. Industry: ${industryContext}`,
    schema: FundingSchema,
    sources: mapFieldsToSources(searches)
  });
  
  return result;
}
```

**Data Sources**:
- Crunchbase
- TechCrunch
- VentureBeat
- Company press releases

### 4. Tech Stack Agent (Phase 4)

**Purpose**: Analyzes technology with context of company type and funding stage

**Output Schema**:
```typescript
interface TechStackResult {
  languages: string[]; // JavaScript, Python, Go
  frameworks: string[]; // React, Next.js, FastAPI
  infrastructure: string[]; // AWS, Vercel, Cloudflare
  tools: string[]; // Stripe, Intercom, Segment
  signals: {
    ai_adoption: boolean;
    modern_stack: boolean;
    cloud_native: boolean;
  };
  sources: string[];
}
```

**Implementation Pattern**:
```typescript
// lib/agents/tech-stack.ts
export async function runTechStackAgent(
  discovery: DiscoveryResult,
  context: EnrichmentContext
): Promise<TechStackResult> {
  // Parallel searches
  const searches = await Promise.all([
    firecrawl.scrape(`${discovery.website}/careers`),
    firecrawl.search(`github.com ${discovery.company_name}`),
    firecrawl.scrape(`${discovery.website}`, { formats: ['html'] })
  ]);
  
  // HTML analysis + LLM synthesis
  const result = await llmProvider.generateStructured({
    prompt: `Detect tech stack. HTML: ${htmlContent}, Jobs: ${jobsContent}`,
    schema: TechStackSchema,
    sources: extractTechSources(searches)
  });
  
  return result;
}
```

**Detection Methods**:
- HTML/JavaScript analysis (Firecrawl)
- Job posting scraping
- Engineering blog analysis
- GitHub repository scanning

### 5. Custom Fields Agent (Phase 5)

**Purpose**: Handles custom fields (CEO, competitors, etc.) with full context

**Output Schema**:
```typescript
interface CustomFieldsResult {
  ceo_name: string | null;
  key_executives: Array<{
    name: string;
    title: string;
    linkedin?: string;
  }>;
  icp_fit_score: number; // 0-100
  icp_fit_reasons: string[];
  is_personal_site: boolean;
  pain_points: string[];
  buying_signals: Array<{
    signal: string;
    confidence: number;
  }>;
  competitive_landscape: string[];
  sources: Record<string, string[]>; // field → URLs
}
```

**Implementation Pattern**:
```typescript
// lib/agents/custom-fields.ts
export async function runCustomFieldsAgent(
  context: EnrichmentContext
): Promise<CustomFieldsResult> {
  // Uses ALL previous context
  const { discovery, profile, funding, techStack } = context;
  
  // Targeted searches with full context
  const searches = await Promise.all([
    firecrawl.search(`${discovery.company_name} CEO founder`),
    firecrawl.search(`Eric Ciarla ${discovery.company_name}`),
    firecrawl.search(`LinkedIn ${discovery.company_name} company`)
  ]);
  
  // ICP fit calculation
  const icpScore = calculateICPFit({ profile, funding, techStack });
  
  // Synthesis with all context
  const result = await llmProvider.generateStructured({
    prompt: `Extract leadership and signals. Context: ${JSON.stringify(context)}`,
    schema: CustomFieldsSchema,
    sources: mapFieldsToSources(searches)
  });
  
  return { ...result, icp_fit_score: icpScore.score, icp_fit_reasons: icpScore.reasons };
}
```

**ICP Fit Scoring Pattern**:
```typescript
function calculateICPFit(context: EnrichmentContext): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  // Industry match (0-30 points)
  if (PREFERRED_INDUSTRIES.includes(context.profile?.industry || "")) {
    score += 30;
    reasons.push(`Target industry: ${context.profile.industry}`);
  }
  
  // Company size (0-25 points)
  if (context.profile?.employee_count && 
      context.profile.employee_count >= 50 && 
      context.profile.employee_count <= 500) {
    score += 25;
    reasons.push(`Growth stage: ${context.profile.employee_count} employees`);
  }
  
  // Tech stack signals (0-25 points)
  if (context.techStack?.signals.ai_adoption) {
    score += 15;
    reasons.push("AI adoption detected");
  }
  
  // Funding signals (0-20 points)
  if (context.funding?.funding_stage?.includes("Series")) {
    score += 20;
    reasons.push(`Funded: ${context.funding.funding_stage}`);
  }
  
  return { score, reasons };
}
```

## Orchestrator Pattern

### Sequential Execution with Progress Tracking

```typescript
// lib/agents/orchestrator.ts
export async function orchestrateEnrichment(
  input: EnrichmentInput,
  options: OrchestratorOptions = {}
): Promise<EnrichmentResult> {
  const startTime = Date.now();
  const { onProgress, abortSignal, config } = options;
  const context: EnrichmentContext = { input };
  const errors: AgentError[] = [];
  
  // Phase 1: Discovery (0-20%) - REQUIRED
  emitProgress({ phase: "discovery", status: "running", progress: 0 });
  context.discovery = await runDiscoveryAgent(input, context);
  emitProgress({ phase: "discovery", status: "completed", progress: 20 });
  
  // Phase 2: Company Profile (20-40%)
  if (config.company_profile.enabled) {
    emitProgress({ phase: "company_profile", status: "running", progress: 20 });
    context.profile = await runCompanyProfileAgent(context.discovery, context);
    emitProgress({ phase: "company_profile", status: "completed", progress: 40 });
  }
  
  // Phase 3 & 4: Parallel (40-70%)
  emitProgress({ phase: "parallel", status: "running", progress: 40 });
  const [funding, techStack] = await Promise.all([
    config.funding.enabled 
      ? runFundingAgent(context.discovery, context)
      : Promise.resolve(null),
    config.tech_stack.enabled
      ? runTechStackAgent(context.discovery, context)
      : Promise.resolve(null)
  ]);
  context.funding = funding;
  context.techStack = techStack;
  emitProgress({ phase: "parallel", status: "completed", progress: 70 });
  
  // Phase 5: Custom Fields (70-100%)
  if (config.custom_fields.enabled) {
    emitProgress({ phase: "custom_fields", status: "running", progress: 70 });
    context.customFields = await runCustomFieldsAgent(context);
    emitProgress({ phase: "custom_fields", status: "completed", progress: 100 });
  }
  
  // Collect all sources
  const allSources = collectSources(context);
  
  return {
    success: errors.length === 0,
    data: {
      discovery: context.discovery,
      profile: context.profile || getDefaultProfile(),
      funding: context.funding || getDefaultFunding(),
      techStack: context.techStack || getDefaultTechStack(),
      customFields: context.customFields || getDefaultCustomFields(),
      sources: Array.from(allSources)
    },
    errors: errors.length > 0 ? errors : undefined,
    duration_ms: Date.now() - startTime
  };
}
```

## Configuration Pattern

### Agent Configuration

```typescript
interface AgentConfig {
  enabled: boolean;
  timeout: number; // milliseconds
  retries: number;
  required: boolean; // fail fast if required agent fails
}

interface OrchestratorConfig {
  discovery: AgentConfig;
  company_profile: AgentConfig;
  funding: AgentConfig;
  tech_stack: AgentConfig;
  custom_fields: AgentConfig;
}

const DEFAULT_CONFIG: OrchestratorConfig = {
  discovery: { enabled: true, timeout: 15000, retries: 2, required: true },
  company_profile: { enabled: true, timeout: 15000, retries: 1, required: false },
  funding: { enabled: true, timeout: 10000, retries: 1, required: false },
  tech_stack: { enabled: true, timeout: 10000, retries: 1, required: false },
  custom_fields: { enabled: true, timeout: 10000, retries: 0, required: false },
};
```

## Error Handling Pattern

### Retry Logic with Exponential Backoff

```typescript
async function runWithRetry<T>(
  fn: () => Promise<T>,
  retries: number,
  phase: AgentPhase
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < retries) {
        // Exponential backoff: 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError || new Error(`${phase} failed after ${retries + 1} attempts`);
}
```

### Timeout Pattern

```typescript
async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  phase: AgentPhase
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${phase} agent timed out after ${ms}ms`));
    }, ms);
  });
  
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}
```

### Graceful Degradation

```typescript
// Non-required agents can fail without breaking the pipeline
if (config.company_profile.enabled) {
  try {
    context.profile = await runCompanyProfileAgent(...);
  } catch (error) {
    errors.push({ phase: "company_profile", error: error.message, recoverable: true });
    // Continue with defaults
    context.profile = getDefaultProfile();
  }
}
```

## Source Attribution Pattern

### Per-Field Source Mapping

```typescript
// Each agent returns sources mapped to fields
interface ProfileResult {
  industry: string;
  sources: {
    industry: ["https://crunchbase.com/...", "https://linkedin.com/..."],
    headquarters: ["https://company.com/about"],
    employee_count: ["https://linkedin.com/company/..."]
  };
}

// Collect all sources at the end
function collectSources(context: EnrichmentContext): Set<string> {
  const allSources = new Set<string>();
  
  if (context.discovery?.sources) {
    context.discovery.sources.forEach(s => allSources.add(s));
  }
  if (context.profile?.sources) {
    Object.values(context.profile.sources).flat().forEach(s => allSources.add(s));
  }
  // ... repeat for all phases
  
  return allSources;
}
```

## API Route Pattern

### Streaming Progress with SSE

```typescript
// app/api/enrich/stream/route.ts
export async function POST(req: NextRequest) {
  const { input } = await req.json();
  
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      const result = await orchestrateEnrichment(input, {
        onProgress: (progress) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(progress)}\n\n`)
          );
        }
      });
      
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "complete", result })}\n\n`)
      );
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}
```

### Database Storage Pattern

```typescript
// Save full agent results to database
await sql`
  INSERT INTO enrichment_jobs (
    input_value,
    discovery_data,
    profile_data,
    funding_data,
    tech_stack_data,
    custom_fields_data,
    sources,
    status,
    user_id
  ) VALUES (
    ${input},
    ${JSON.stringify(result.data.discovery)},
    ${JSON.stringify(result.data.profile)},
    ${JSON.stringify(result.data.funding)},
    ${JSON.stringify(result.data.tech_stack)},
    ${JSON.stringify(result.data.custom_fields)},
    ${JSON.stringify(result.data.sources)},
    'completed',
    ${userId}
  )
`;
```

## Extensibility Pattern

### Adding New Agents

1. **Create Agent File**: `lib/agents/new-agent.ts`
2. **Define Schema**: Use Zod for type safety
3. **Implement Agent Function**: Follow existing pattern
4. **Update Orchestrator**: Add to pipeline with config
5. **Update Types**: Add to `EnrichmentContext` and `EnrichmentResult`

```typescript
// Example: Adding a Social Media Agent
// 1. Create lib/agents/social-media.ts
export const SocialMediaSchema = z.object({
  twitter_handle: z.string().optional(),
  linkedin_url: z.string().url().optional(),
  github_url: z.string().url().optional(),
  sources: z.array(z.string().url())
});

export async function runSocialMediaAgent(
  discovery: DiscoveryResult,
  context: EnrichmentContext
): Promise<z.infer<typeof SocialMediaSchema>> {
  // Implementation
}

// 2. Update orchestrator.ts
if (config.social_media.enabled) {
  context.socialMedia = await runSocialMediaAgent(context.discovery, context);
}

// 3. Update types.ts
interface EnrichmentContext {
  // ... existing
  socialMedia?: SocialMediaResult;
}
```

### Field Routing System

```typescript
// Automatic field categorization for agent selection
function routeFieldToAgent(field: string): AgentPhase {
  const fieldLower = field.toLowerCase();
  
  if (fieldLower.includes("industry") || fieldLower.includes("headquarter")) {
    return "company_profile";
  }
  if (fieldLower.includes("fund") || fieldLower.includes("invest")) {
    return "funding";
  }
  if (fieldLower.includes("tech") && fieldLower.includes("stack")) {
    return "tech_stack";
  }
  if (fieldLower.includes("employee") || fieldLower.includes("revenue")) {
    return "company_profile";
  }
  // Default to general purpose agent
  return "custom_fields";
}
```

## Best Practices

### Performance Optimization
1. **Parallel searches within phases**: Use `Promise.all()` for 3 concurrent searches
2. **Parallel phases where possible**: Funding and Tech Stack can run in parallel
3. **Timeout configuration**: Set reasonable timeouts (10-15s per agent)
4. **Caching**: Cache discovery results to avoid re-scraping same domains
5. **Rate limiting**: Implement exponential backoff for API rate limits

### Error Handling
1. **Required vs optional agents**: Discovery must succeed, others can fail gracefully
2. **Retry logic**: Use exponential backoff for transient failures
3. **Timeout protection**: Always wrap agent calls in timeout
4. **Default values**: Provide sensible defaults for failed agents
5. **Error aggregation**: Collect all errors and return in result

### Source Attribution
1. **Per-field sources**: Map sources to specific fields, not just overall result
2. **Source deduplication**: Remove duplicate URLs across phases
3. **Source validation**: Verify URLs are accessible before storing
4. **Source display**: Show sources in UI with clickable links

### Type Safety
1. **Zod schemas**: Define schemas for all agent outputs
2. **Type inference**: Use `z.infer<typeof Schema>` for TypeScript types
3. **Validation**: Always validate agent outputs against schemas
4. **Error types**: Define specific error types for each phase

## Integration with Unified Suite

### Current Implementation
- **Location**: `lib/agents/orchestrator.ts`, `app/api/enrich/route.ts`
- **Status**: Multi-phase orchestration implemented
- **Patterns**: Sequential execution, parallel searches, source attribution

### Suite-Level Enhancements
1. **Multi-tenant support**: All agents respect `user_id` isolation
2. **Usage tracking**: Log enrichment events to `usage_events` table
3. **Job management**: Store jobs in `enrichment_jobs` table with status tracking
4. **CSV batch processing**: Process multiple rows with progress tracking
5. **Export functionality**: Generate enriched CSV with all fields + sources

## File Structure
```
lib/
  agents/
    orchestrator.ts      # Main orchestration logic
    discovery.ts         # Discovery agent (required)
    company-profile.ts   # Company profile agent
    funding.ts           # Funding agent
    tech-stack.ts        # Tech stack agent
    custom-fields.ts     # Custom fields agent
    schemas.ts           # Zod schemas for all agents
    types.ts             # TypeScript interfaces
    utils.ts             # Shared utilities (logging, retry, timeout)
app/
  api/
    enrich/
      route.ts           # Main enrichment endpoint
      stream/
        route.ts         # Streaming progress endpoint
      batch/
        route.ts         # Batch CSV processing
```

## Environment Variables
```bash
FIRECRAWL_API_KEY=fc-your-firecrawl-key
OPENAI_API_KEY=sk-your-openai-key
# Or other LLM providers:
ANTHROPIC_API_KEY=sk-ant-your-key
GROQ_API_KEY=gsk_your-key
```

## References
- [Fire Enrich Repository](https://github.com/firecrawl/fire-enrich)
- [Fire Enrich README](https://github.com/firecrawl/fire-enrich/blob/main/README.md)
- [Current Implementation](../ENRICH_AGENT_ORCHESTRATION.md)
