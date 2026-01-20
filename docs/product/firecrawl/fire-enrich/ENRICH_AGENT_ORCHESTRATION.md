# Enrich Multi-Phase Agent Orchestration - Implementation Breakdown

**Task:** Complete Enrich multi-phase agent orchestration
**Priority:** High
**Complexity:** High
**Estimated Effort:** 3-5 days

---

## Current State Analysis

### What We Have Now ✅

**Single-Phase Extraction** (`app/api/enrich/route.ts`):
- Uses Firecrawl's `extract()` with `COMPANY_ENRICHMENT_SCHEMA`
- Gets all data in one API call
- Basic structure: company info, social, contact, tech, funding, leadership
- Works but lacks depth and source attribution

**Batch Processing** (`app/api/enrich/batch/route.ts`):
- CSV upload support
- Row-level processing
- Basic caching (7-day)
- Missing progress tracking for individual agent phases

**Database Schema**:
- `enrichment_jobs` table with basic fields
- `enrichment_batches` for CSV processing
- No agent action tracking
- No source attribution per field

### What's Missing ❌

1. **Multi-Phase Agent Pipeline**: No sequential agent orchestration
2. **Specialized Agents**: No dedicated Discovery, Funding, Tech Stack agents
3. **Source Attribution**: No URLs/citations per enriched field
4. **Progress Tracking**: No visibility into which phase is running
5. **Agent State Management**: No way to resume failed phases
6. **Rich Output Schemas**: Limited to basic Firecrawl extraction format

---

## Target Architecture

### Multi-Phase Pipeline

```
CSV Row/Email → Discovery Agent → Company Profile Agent → Funding Agent
                     ↓                    ↓                     ↓
                Tech Stack Agent → Custom Fields Agent → Final Assembly
                     ↓                    ↓                     ↓
                Source Attribution → Quality Scoring → Save to DB
```

### Agent Responsibilities

#### 1. Discovery Agent
**Input:** Email, domain, or company name
**Output:** Normalized company identity
**Tools:** Firecrawl search, domain lookup
**Schema:**
```typescript
{
  company_name: string
  domain: string
  website: string
  confidence: number // 0-1
  sources: string[] // URLs used
}
```

#### 2. Company Profile Agent
**Input:** Discovery result
**Output:** Firmographic data
**Tools:** Firecrawl scrape, web search
**Schema:**
```typescript
{
  industry: string
  segment: string // SMB, Mid-Market, Enterprise
  headquarters: string
  employee_count: number
  year_founded: number
  business_type: string
  description: string
  sources: Record<string, string[]> // field → URLs
}
```

#### 3. Funding Agent
**Input:** Company domain + name
**Output:** Investment data
**Tools:** Firecrawl search (Crunchbase, TechCrunch), web scrape
**Schema:**
```typescript
{
  funding_stage: string // Seed, Series A, B, C, etc.
  total_funding: string // "$10M"
  last_round_date: string
  last_round_amount: string
  investors: string[]
  valuation: string | null
  sources: Record<string, string[]>
}
```

#### 4. Tech Stack Agent
**Input:** Company website
**Output:** Technology intelligence
**Tools:** Firecrawl scrape + tech detection, BuiltWith-style analysis
**Schema:**
```typescript
{
  languages: string[] // JavaScript, Python, Go
  frameworks: string[] // React, Next.js, FastAPI
  infrastructure: string[] // AWS, Vercel, Cloudflare
  tools: string[] // Stripe, Intercom, Segment
  signals: {
    ai_adoption: boolean
    modern_stack: boolean
    cloud_native: boolean
  }
  sources: string[]
}
```

#### 5. Custom Fields Agent
**Input:** All previous agent results
**Output:** Business intelligence
**Tools:** LLM synthesis, pattern matching
**Schema:**
```typescript
{
  ceo_name: string
  key_executives: Array<{name: string, title: string, linkedin?: string}>
  icp_fit_score: number // 0-100
  icp_fit_reasons: string[]
  pain_points: string[]
  buying_signals: Array<{signal: string, confidence: number}>
  competitive_landscape: string[]
  sources: Record<string, string[]>
}
```

---

## Implementation Plan

### Phase 1: Architecture Setup (Day 1)

**Tasks:**
1. Create `lib/agents/` directory structure
   ```
   lib/agents/
   ├── orchestrator.ts      # Main agent pipeline
   ├── discovery.ts         # Discovery agent
   ├── company-profile.ts   # Company profile agent
   ├── funding.ts           # Funding agent
   ├── tech-stack.ts        # Tech stack agent
   ├── custom-fields.ts     # Custom fields agent
   ├── schemas.ts           # Zod schemas for each phase
   ├── types.ts             # TypeScript interfaces
   └── utils.ts             # Shared utilities
   ```

2. Define Zod schemas for each agent output
   - Use strict validation
   - Include source attribution fields
   - Add confidence scores where applicable

3. Create agent orchestrator framework
   - Sequential execution with error handling
   - State management for resume capability
   - Progress callbacks for UI updates

**Files to Create:**
- `lib/agents/schemas.ts`
- `lib/agents/types.ts`
- `lib/agents/orchestrator.ts`

### Phase 2: Discovery Agent (Day 1-2)

**Implementation:**
```typescript
// lib/agents/discovery.ts
import { z } from 'zod'
import { getFirecrawlClient } from '@/lib/firecrawl/client'

export const DiscoverySchema = z.object({
  company_name: z.string(),
  domain: z.string(),
  website: z.string().url(),
  confidence: z.number().min(0).max(1),
  sources: z.array(z.string().url()),
  alternatives: z.array(z.object({
    name: z.string(),
    domain: z.string(),
    confidence: z.number()
  })).optional()
})

export async function discoverCompany(input: {
  email?: string
  domain?: string
  company_name?: string
}): Promise<z.infer<typeof DiscoverySchema>> {
  // 1. Normalize input to domain
  // 2. Search for company via Firecrawl
  // 3. Verify domain ownership
  // 4. Return normalized identity with sources
}
```

**Key Features:**
- Handle email → domain extraction
- Fuzzy company name matching
- Domain verification
- Source URL collection

### Phase 3: Company Profile Agent (Day 2)

**Implementation:**
```typescript
// lib/agents/company-profile.ts
import { z } from 'zod'
import { DiscoveryResult } from './types'

export const CompanyProfileSchema = z.object({
  industry: z.string(),
  segment: z.enum(['SMB', 'Mid-Market', 'Enterprise']),
  headquarters: z.string(),
  employee_count: z.number().optional(),
  year_founded: z.number().optional(),
  business_type: z.string(),
  description: z.string(),
  sources: z.record(z.array(z.string().url()))
})

export async function enrichCompanyProfile(
  discovery: DiscoveryResult
): Promise<z.infer<typeof CompanyProfileSchema>> {
  // 1. Scrape homepage with Firecrawl
  // 2. Search for "about" page
  // 3. Extract firmographic data
  // 4. Classify segment based on employee count
  // 5. Return with source attribution
}
```

**Data Sources:**
- Company homepage (About, Team pages)
- LinkedIn company page
- Crunchbase/PitchBook
- News articles

### Phase 4: Funding Agent (Day 2-3)

**Implementation:**
```typescript
// lib/agents/funding.ts
export const FundingSchema = z.object({
  funding_stage: z.string().nullable(),
  total_funding: z.string().nullable(),
  last_round_date: z.string().nullable(),
  last_round_amount: z.string().nullable(),
  investors: z.array(z.string()),
  valuation: z.string().nullable(),
  sources: z.record(z.array(z.string().url()))
})

export async function enrichFunding(
  discovery: DiscoveryResult
): Promise<z.infer<typeof FundingSchema>> {
  // 1. Search Crunchbase via Firecrawl
  // 2. Search TechCrunch/VentureBeat for funding news
  // 3. Parse funding announcements
  // 4. Normalize funding amounts
  // 5. Return with sources
}
```

**Data Sources:**
- Crunchbase
- TechCrunch
- VentureBeat
- Company press releases

### Phase 5: Tech Stack Agent (Day 3)

**Implementation:**
```typescript
// lib/agents/tech-stack.ts
export const TechStackSchema = z.object({
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  infrastructure: z.array(z.string()),
  tools: z.array(z.string()),
  signals: z.object({
    ai_adoption: z.boolean(),
    modern_stack: z.boolean(),
    cloud_native: z.boolean()
  }),
  sources: z.array(z.string().url())
})

export async function detectTechStack(
  discovery: DiscoveryResult
): Promise<z.infer<typeof TechStackSchema>> {
  // 1. Scrape website HTML/JS with Firecrawl
  // 2. Detect client-side technologies
  // 3. Search for tech blog/engineering posts
  // 4. Search job postings for tech requirements
  // 5. Analyze signals (AI keywords, modern patterns)
  // 6. Return with sources
}
```

**Detection Methods:**
- HTML/JavaScript analysis (Firecrawl)
- Job posting scraping (mentions of tech)
- Engineering blog analysis
- DNS/SSL certificate analysis

### Phase 6: Custom Fields Agent (Day 3-4)

**Implementation:**
```typescript
// lib/agents/custom-fields.ts
export const CustomFieldsSchema = z.object({
  ceo_name: z.string().optional(),
  key_executives: z.array(z.object({
    name: z.string(),
    title: z.string(),
    linkedin: z.string().url().optional()
  })),
  icp_fit_score: z.number().min(0).max(100),
  icp_fit_reasons: z.array(z.string()),
  pain_points: z.array(z.string()),
  buying_signals: z.array(z.object({
    signal: z.string(),
    confidence: z.number().min(0).max(1)
  })),
  competitive_landscape: z.array(z.string()),
  sources: z.record(z.array(z.string().url()))
})

export async function enrichCustomFields(
  context: EnrichmentContext
): Promise<z.infer<typeof CustomFieldsSchema>> {
  // 1. Extract leadership from About/Team pages
  // 2. Calculate ICP fit based on:
  //    - Industry match
  //    - Company size
  //    - Tech stack signals
  //    - Funding stage
  // 3. Infer pain points from industry + tech stack
  // 4. Detect buying signals (hiring, funding, migrations)
  // 5. Find competitors via search
  // 6. Return with sources
}
```

**ICP Fit Scoring:**
```typescript
function calculateICPFit(profile: AllAgentResults): number {
  let score = 0
  const reasons: string[] = []

  // Industry match (0-30 points)
  if (PREFERRED_INDUSTRIES.includes(profile.industry)) {
    score += 30
    reasons.push(`Target industry: ${profile.industry}`)
  }

  // Company size (0-25 points)
  if (profile.employee_count >= 50 && profile.employee_count <= 500) {
    score += 25
    reasons.push(`Growth stage company (${profile.employee_count} employees)`)
  }

  // Tech stack signals (0-25 points)
  if (profile.tech_stack.signals.ai_adoption) {
    score += 15
    reasons.push('AI adoption detected')
  }
  if (profile.tech_stack.signals.modern_stack) {
    score += 10
    reasons.push('Modern technology stack')
  }

  // Funding signals (0-20 points)
  if (profile.funding.funding_stage?.includes('Series')) {
    score += 20
    reasons.push(`Funded: ${profile.funding.funding_stage}`)
  }

  return { score, reasons }
}
```

### Phase 7: Orchestrator Integration (Day 4-5)

**Implementation:**
```typescript
// lib/agents/orchestrator.ts
import { discoverCompany } from './discovery'
import { enrichCompanyProfile } from './company-profile'
import { enrichFunding } from './funding'
import { detectTechStack } from './tech-stack'
import { enrichCustomFields } from './custom-fields'

export interface EnrichmentProgress {
  phase: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number // 0-100
  message: string
  result?: unknown
}

export async function orchestrateEnrichment(
  input: {
    email?: string
    domain?: string
    company_name?: string
  },
  onProgress?: (progress: EnrichmentProgress) => void
): Promise<EnrichmentResult> {

  const results = {}

  try {
    // Phase 1: Discovery (0-20%)
    onProgress?.({ phase: 'discovery', status: 'running', progress: 0, message: 'Identifying company...' })
    const discovery = await discoverCompany(input)
    results.discovery = discovery
    onProgress?.({ phase: 'discovery', status: 'completed', progress: 20, message: 'Company identified', result: discovery })

    // Phase 2: Company Profile (20-40%)
    onProgress?.({ phase: 'company_profile', status: 'running', progress: 20, message: 'Gathering firmographics...' })
    const profile = await enrichCompanyProfile(discovery)
    results.profile = profile
    onProgress?.({ phase: 'company_profile', status: 'completed', progress: 40, message: 'Profile complete', result: profile })

    // Phase 3 & 4: Parallel execution (40-70%)
    onProgress?.({ phase: 'parallel', status: 'running', progress: 40, message: 'Enriching funding & tech data...' })
    const [funding, techStack] = await Promise.all([
      enrichFunding(discovery),
      detectTechStack(discovery)
    ])
    results.funding = funding
    results.tech_stack = techStack
    onProgress?.({ phase: 'parallel', status: 'completed', progress: 70, message: 'Funding & tech data complete' })

    // Phase 5: Custom Fields (70-100%)
    onProgress?.({ phase: 'custom_fields', status: 'running', progress: 70, message: 'Calculating ICP fit & signals...' })
    const customFields = await enrichCustomFields({
      discovery,
      profile,
      funding,
      tech_stack: techStack
    })
    results.custom_fields = customFields
    onProgress?.({ phase: 'custom_fields', status: 'completed', progress: 100, message: 'Enrichment complete', result: customFields })

    return {
      success: true,
      data: assembleEnrichmentResult(results)
    }

  } catch (error) {
    onProgress?.({
      phase: 'error',
      status: 'failed',
      progress: 0,
      message: error.message
    })
    throw error
  }
}
```

### Phase 8: API Integration (Day 5)

**Update Routes:**

```typescript
// app/api/enrich/route.ts
import { orchestrateEnrichment } from '@/lib/agents/orchestrator'

export async function POST(request: NextRequest) {
  // ... auth check ...

  const { input } = await request.json()

  // Use agent orchestrator instead of single Firecrawl call
  const result = await orchestrateEnrichment(
    { email: input },
    (progress) => {
      // Could send SSE updates here for real-time progress
      console.log(`[${progress.phase}] ${progress.progress}% - ${progress.message}`)
    }
  )

  // Save to database with full agent results
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
  `

  return NextResponse.json(result)
}
```

### Phase 9: UI Progress Tracking (Day 5)

**Add Real-Time Progress:**

```typescript
// app/enrich/page.tsx
'use client'

function EnrichmentProgress({ jobId }: { jobId: string }) {
  const [progress, setProgress] = useState<EnrichmentProgress[]>([])

  useEffect(() => {
    // Poll for progress updates or use SSE
    const interval = setInterval(async () => {
      const res = await fetch(`/api/enrich/${jobId}/progress`)
      const data = await res.json()
      setProgress(data.phases)
    }, 1000)

    return () => clearInterval(interval)
  }, [jobId])

  return (
    <div className="space-y-2">
      {progress.map((phase) => (
        <div key={phase.phase} className="flex items-center gap-3">
          {phase.status === 'completed' && <CheckCircle className="text-green-500" />}
          {phase.status === 'running' && <Loader2 className="animate-spin text-orange-500" />}
          {phase.status === 'pending' && <Circle className="text-zinc-600" />}

          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-mono">{phase.phase}</span>
              <span className="text-xs text-zinc-500">{phase.progress}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all"
                style={{ width: `${phase.progress}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## Testing Strategy

### Unit Tests
- Each agent function independently
- Schema validation
- Error handling

### Integration Tests
- Full orchestration pipeline
- Database persistence
- API endpoint responses

### End-to-End Tests
- CSV upload → enrichment → export
- Progress tracking accuracy
- Source attribution verification

---

## Success Criteria

- ✅ All 5 agents implemented and tested
- ✅ Source URLs attributed to every enriched field
- ✅ Progress tracking works in UI
- ✅ Enrichment completes in <30 seconds for single lead
- ✅ ICP fit scoring accuracy >80% vs manual review
- ✅ Zero data loss on partial failures (resume capability)
- ✅ Batch processing maintains <5min/100 leads

---

## Dependencies

### External APIs
- Firecrawl (search, scrape, extract)
- OpenAI/Anthropic (LLM synthesis for custom fields)
- Possible: Clearbit/ZoomInfo for firmographic fallback

### Internal
- Existing Firecrawl client (`lib/firecrawl/client.ts`)
- Database schema updates (add agent_results columns)
- UI components for progress tracking

---

## Risks & Mitigation

**Risk 1: API Rate Limits**
- Mitigation: Implement exponential backoff, caching, parallel request limits

**Risk 2: Unreliable Data Sources**
- Mitigation: Multiple fallback sources, confidence scoring

**Risk 3: Performance Degradation**
- Mitigation: Parallel agent execution where possible, caching, queue system for batch

**Risk 4: Complex State Management**
- Mitigation: Simple orchestrator pattern, database state persistence

---

## Next Steps

1. Get approval on architecture
2. Start with Discovery Agent (simplest)
3. Build orchestrator framework in parallel
4. Test with real company data
5. Iterate based on results

Ready to start implementation?
