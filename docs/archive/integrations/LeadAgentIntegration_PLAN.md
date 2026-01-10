# Lead Processing Agent Integration Plan
## Digital Mischief Group Production

---

## 1. RESTATEMENT OF REQUEST

Integrate the lead-processing-agent repository (https://github.com/Monichre/lead-processing-agent) into the DMG Production project with:
- Complete lead generation, processing, and fulfillment functionality
- Custom Digital Mischief Group branding aligned with existing FUI aesthetic
- Full AI agent capabilities for autonomous lead workflows

---

## 2. CURRENT PROJECT ANALYSIS

### 2.1 Existing Architecture
\`\`\`
dmg-production/
├── app/
│   ├── page.tsx           # Main landing page with DMG branding
│   ├── lab/page.tsx       # Lab experience page
│   ├── landing/page.tsx   # Alternative landing
│   └── layout.tsx         # Root layout with fonts/theme
├── components/
│   ├── MeetTheTeam.tsx    # Team section with particle face
│   ├── particle-face.tsx  # Interactive particle visualization
│   ├── fui-decorations.tsx # FUI styling components
│   ├── radar.tsx          # Radar visualization
│   ├── monitor-graph.tsx  # Graph components
│   └── ui/                # shadcn components
└── lib/
    └── utils.ts           # Utility functions
\`\`\`

### 2.2 Design System
- **Primary Color**: Orange (`#f97316`, `text-orange-500`)
- **Background**: Zinc-950 (`#09090b`)
- **Accents**: Copper (`#c48a58`), Void (`#050507`)
- **Typography**: Share Tech Mono (monospace)
- **Effects**: Glitch animations, scan lines, grid backgrounds
- **Components**: FUI borders, corner accents, technical overlays

### 2.3 Available Environment Variables
\`\`\`
OPENAI_API_KEY        # Primary LLM
XAI_API_KEY           # Grok models
GROQ_API_KEY          # Fast inference
GEMINI_API_KEY        # Google models
PERPLEXITY_API_KEY    # Research/search
EXA_API_KEY           # Semantic search
SERPER_API_KEY        # Google search API
FIRECRAWL_API_KEY     # Web scraping
SCRAPEGRAPH_API_KEY   # Graph-based scraping
E2B_API_KEY           # Code execution
COMPOSIO_API_KEY      # Tool integrations
\`\`\`

---

## 3. PROPOSED INTEGRATION ARCHITECTURE

### 3.1 Directory Structure
\`\`\`
dmg-production/
├── app/
│   ├── (main)/                    # Existing pages grouped
│   │   └── ...existing pages
│   ├── leads/                     # Lead Agent Dashboard
│   │   ├── page.tsx               # Lead command center
│   │   ├── layout.tsx             # Dashboard layout with sidebar
│   │   ├── pipeline/
│   │   │   └── page.tsx           # Pipeline view
│   │   ├── prospects/
│   │   │   ├── page.tsx           # Prospect list
│   │   │   └── [id]/page.tsx      # Individual prospect detail
│   │   ├── campaigns/
│   │   │   └── page.tsx           # Campaign management
│   │   ├── enrichment/
│   │   │   └── page.tsx           # Data enrichment hub
│   │   └── settings/
│   │       └── page.tsx           # Agent configuration
│   └── api/
│       └── leads/
│           ├── agent/
│           │   └── route.ts       # Main agent orchestrator
│           ├── enrich/
│           │   └── route.ts       # Lead enrichment endpoint
│           ├── research/
│           │   └── route.ts       # Company/person research
│           ├── score/
│           │   └── route.ts       # Lead scoring
│           ├── outreach/
│           │   └── route.ts       # Outreach generation
│           └── webhook/
│               └── route.ts       # External integrations
├── components/
│   └── leads/
│       ├── LeadCommandCenter.tsx  # Main dashboard component
│       ├── LeadCard.tsx           # Individual lead display
│       ├── PipelineBoard.tsx      # Kanban-style pipeline
│       ├── EnrichmentPanel.tsx    # Data enrichment UI
│       ├── AgentActivityFeed.tsx  # Real-time agent actions
│       ├── LeadScoreGauge.tsx     # Visual score indicator
│       ├── ResearchReport.tsx     # Company/person intel
│       ├── OutreachComposer.tsx   # AI-assisted messaging
│       └── ProspectRadar.tsx      # Radar visualization for leads
├── lib/
│   └── leads/
│       ├── agent/
│       │   ├── orchestrator.ts    # Main agent logic
│       │   ├── tools.ts           # Agent tool definitions
│       │   └── prompts.ts         # System prompts
│       ├── enrichment/
│       │   ├── company.ts         # Company data enrichment
│       │   ├── person.ts          # Person data enrichment
│       │   └── social.ts          # Social profile enrichment
│       ├── research/
│       │   ├── exa.ts             # Exa semantic search
│       │   ├── serper.ts          # Google search integration
│       │   ├── firecrawl.ts       # Web scraping
│       │   └── perplexity.ts      # AI-powered research
│       ├── scoring/
│       │   └── model.ts           # Lead scoring algorithm
│       ├── outreach/
│       │   └── generator.ts       # Outreach content generation
│       ├── types.ts               # TypeScript interfaces
│       └── schemas.ts             # Zod validation schemas
└── hooks/
    └── leads/
        ├── useLeadAgent.ts        # Agent interaction hook
        ├── useLeadPipeline.ts     # Pipeline state management
        └── useEnrichment.ts       # Enrichment operations
\`\`\`

### 3.2 Core Data Types

\`\`\`typescript
// lib/leads/types.ts

export interface Lead {
  id: string;
  status: LeadStatus;
  score: number;
  
  // Contact Info
  email: string;
  firstName: string;
  lastName: string;
  title?: string;
  phone?: string;
  linkedin?: string;
  
  // Company Info
  company: Company;
  
  // Enrichment Data
  enrichment?: EnrichmentData;
  
  // Agent Metadata
  source: LeadSource;
  createdAt: Date;
  updatedAt: Date;
  agentActions: AgentAction[];
}

export interface Company {
  name: string;
  domain: string;
  industry?: string;
  size?: CompanySize;
  revenue?: string;
  location?: string;
  description?: string;
  technologies?: string[];
  fundingStage?: string;
  socialProfiles?: SocialProfiles;
}

export interface EnrichmentData {
  companyIntel?: CompanyIntelligence;
  personIntel?: PersonIntelligence;
  newsArticles?: NewsArticle[];
  competitors?: string[];
  painPoints?: string[];
  buyingSignals?: BuyingSignal[];
  enrichedAt: Date;
}

export type LeadStatus = 
  | 'new'
  | 'researching'
  | 'enriched'
  | 'qualified'
  | 'outreach_pending'
  | 'contacted'
  | 'engaged'
  | 'converted'
  | 'disqualified';

export type LeadSource =
  | 'manual'
  | 'csv_import'
  | 'website_form'
  | 'linkedin_scrape'
  | 'referral'
  | 'agent_discovery';

export interface AgentAction {
  id: string;
  type: AgentActionType;
  description: string;
  result?: unknown;
  timestamp: Date;
}

export type AgentActionType =
  | 'research_company'
  | 'research_person'
  | 'enrich_data'
  | 'score_lead'
  | 'generate_outreach'
  | 'schedule_followup'
  | 'update_status';
\`\`\`

---

## 4. AGENT ARCHITECTURE

### 4.1 Lead Agent Orchestrator

\`\`\`typescript
// lib/leads/agent/orchestrator.ts

import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { researchCompany, researchPerson } from './tools';
import { enrichLead, scoreLead, generateOutreach } from './tools';

export const LEAD_AGENT_SYSTEM_PROMPT = `
You are the DMG Lead Intelligence Agent - an autonomous AI system that 
researches, enriches, scores, and qualifies business leads for Digital 
Mischief Group.

Your capabilities:
1. RESEARCH - Deep company and person research using web search, news, 
   and social data
2. ENRICH - Augment lead data with firmographics, technographics, and 
   intent signals
3. SCORE - Calculate lead quality scores based on ICP fit and buying signals
4. QUALIFY - Determine if a lead is worth pursuing
5. OUTREACH - Generate personalized outreach messaging

You operate autonomously but transparently. Always explain your reasoning 
and cite your sources. Prioritize accuracy over speed.

DMG focuses on AI systems for B2B SaaS companies, so prioritize leads that:
- Are in tech/SaaS industries
- Have 50-500 employees (growth stage)
- Show AI adoption signals
- Have budget indicators
`;

export const leadAgentTools = {
  researchCompany: tool({
    description: 'Research a company to gather intelligence',
    inputSchema: z.object({
      companyName: z.string(),
      domain: z.string().optional(),
    }),
    execute: async ({ companyName, domain }) => {
      // Uses EXA_API_KEY, SERPER_API_KEY, FIRECRAWL_API_KEY
      return researchCompany(companyName, domain);
    },
  }),

  researchPerson: tool({
    description: 'Research a person to understand their role and background',
    inputSchema: z.object({
      name: z.string(),
      company: z.string(),
      linkedinUrl: z.string().optional(),
    }),
    execute: async ({ name, company, linkedinUrl }) => {
      return researchPerson(name, company, linkedinUrl);
    },
  }),

  enrichLead: tool({
    description: 'Enrich a lead with additional data points',
    inputSchema: z.object({
      leadId: z.string(),
      email: z.string().optional(),
      domain: z.string().optional(),
    }),
    execute: async ({ leadId, email, domain }) => {
      return enrichLead(leadId, email, domain);
    },
  }),

  scoreLead: tool({
    description: 'Calculate a lead score based on ICP fit',
    inputSchema: z.object({
      leadId: z.string(),
    }),
    outputSchema: z.object({
      score: z.number().min(0).max(100),
      factors: z.array(z.object({
        name: z.string(),
        impact: z.number(),
        reason: z.string(),
      })),
    }),
    execute: async ({ leadId }) => {
      return scoreLead(leadId);
    },
  }),

  generateOutreach: tool({
    description: 'Generate personalized outreach for a lead',
    inputSchema: z.object({
      leadId: z.string(),
      channel: z.enum(['email', 'linkedin', 'cold_call']),
      tone: z.enum(['formal', 'casual', 'technical']).default('technical'),
    }),
    execute: async ({ leadId, channel, tone }) => {
      return generateOutreach(leadId, channel, tone);
    },
  }),

  updateLeadStatus: tool({
    description: 'Update the status of a lead in the pipeline',
    inputSchema: z.object({
      leadId: z.string(),
      status: z.enum([
        'new', 'researching', 'enriched', 'qualified',
        'outreach_pending', 'contacted', 'engaged', 
        'converted', 'disqualified'
      ]),
      reason: z.string().optional(),
    }),
    execute: async ({ leadId, status, reason }) => {
      // Update lead status in database
      return { leadId, status, updatedAt: new Date() };
    },
  }),
};
\`\`\`

### 4.2 Research Integration Layer

\`\`\`typescript
// lib/leads/research/exa.ts
import Exa from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY);

export async function semanticSearch(query: string, options?: {
  numResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
}) {
  const results = await exa.searchAndContents(query, {
    type: 'neural',
    numResults: options?.numResults ?? 10,
    includeDomains: options?.includeDomains,
    excludeDomains: options?.excludeDomains,
    text: { maxCharacters: 2000 },
    highlights: true,
  });
  
  return results;
}

export async function findSimilarCompanies(domain: string) {
  const results = await exa.findSimilar(domain, {
    numResults: 5,
    excludeSourceDomain: true,
  });
  
  return results;
}

// lib/leads/research/serper.ts
export async function googleSearch(query: string) {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 10 }),
  });
  
  return response.json();
}

export async function searchNews(query: string) {
  const response = await fetch('https://google.serper.dev/news', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 10 }),
  });
  
  return response.json();
}

// lib/leads/research/firecrawl.ts
export async function scrapeWebpage(url: string) {
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown', 'html'],
    }),
  });
  
  return response.json();
}

// lib/leads/research/perplexity.ts
export async function deepResearch(query: string) {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [
        { role: 'user', content: query }
      ],
    }),
  });
  
  return response.json();
}
\`\`\`

---

## 5. UI COMPONENT SPECIFICATIONS

### 5.1 Lead Command Center (Main Dashboard)

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│ ┌─[ DMG ]────────────────────────────────────────────────────┐ │
│ │ LEAD COMMAND CENTER                    [Agent: ACTIVE ●]   │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│ │  NEW        │ │ QUALIFIED   │ │ CONTACTED   │ │ CONVERTED   ││
│ │    47       │ │    23       │ │    12       │ │     8       ││
│ │ ▲ +12 today │ │ ▲ +5 today  │ │ → 3 pending │ │ $124K ARR   ││
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
│                                                                 │
│ ┌─────────────────────────────┐ ┌─────────────────────────────┐│
│ │  AGENT ACTIVITY FEED        │ │  PROSPECT RADAR             ││
│ │  ─────────────────────────  │ │        ╭──────────╮         ││
│ │  ● Researching Acme Corp    │ │       ╱   ◉ 94    ╲        ││
│ │    └─ Found 3 buying signals│ │      │  ◉ 87      │        ││
│ │  ● Enriched John Smith      │ │      │     ◉ 76   │        ││
│ │    └─ LinkedIn + company    │ │      │  ◉ 71     │         ││
│ │  ● Scored lead: 87/100      │ │       ╲   ◉ 68  ╱          ││
│ │    └─ ICP fit: Strong       │ │        ╰──────────╯         ││
│ │  ● Generated email draft    │ │   [Top 5 Leads by Score]   ││
│ └─────────────────────────────┘ └─────────────────────────────┘│
│                                                                 │
│ ┌───────────────────────────────────────────────────────────┐  │
│ │  PIPELINE                                     [Grid] [List] │
│ │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│ │  │NEW (47) │→│RESEARCH │→│QUALIFIED│→│OUTREACH │→ ...      │
│ │  │ ▪ Lead  │ │ ▪ Lead  │ │ ▪ Lead  │ │ ▪ Lead  │           │
│ │  │ ▪ Lead  │ │ ▪ Lead  │ │ ▪ Lead  │ │ ▪ Lead  │           │
│ │  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│ └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

### 5.2 Component Design Tokens (DMG-Branded)

\`\`\`tsx
// FUI-styled components for lead agent

// Lead status badges with DMG colors
const STATUS_COLORS = {
  new: 'border-zinc-600 text-zinc-400',
  researching: 'border-blue-500 text-blue-400 animate-pulse',
  enriched: 'border-cyan-500 text-cyan-400',
  qualified: 'border-orange-500 text-orange-400',
  outreach_pending: 'border-yellow-500 text-yellow-400',
  contacted: 'border-purple-500 text-purple-400',
  engaged: 'border-green-500 text-green-400',
  converted: 'border-orange-500 text-orange-400 bg-orange-500/10',
  disqualified: 'border-red-500/50 text-red-400/50',
};

// Score gauge with FUI styling
const SCORE_THRESHOLDS = {
  hot: { min: 80, color: 'text-orange-500', label: 'HOT' },
  warm: { min: 60, color: 'text-yellow-500', label: 'WARM' },
  cold: { min: 40, color: 'text-blue-400', label: 'COLD' },
  ice: { min: 0, color: 'text-zinc-500', label: 'ICE' },
};
\`\`\`

---

## 6. IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1)
- [ ] Create `/lib/leads/` directory structure
- [ ] Define TypeScript types and Zod schemas
- [ ] Set up API routes skeleton
- [ ] Create base UI components with DMG styling
- [ ] Implement research integrations (Exa, Serper, Firecrawl)

### Phase 2: Agent Core (Week 2)
- [ ] Build lead agent orchestrator with AI SDK v5
- [ ] Implement tool definitions
- [ ] Create streaming agent response handling
- [ ] Build agent activity feed component
- [ ] Add real-time status updates

### Phase 3: Dashboard UI (Week 3)
- [ ] Build Lead Command Center layout
- [ ] Create Pipeline Board (Kanban)
- [ ] Implement Lead Cards with enrichment display
- [ ] Build Prospect Radar visualization
- [ ] Add lead detail modal/page

### Phase 4: Enrichment & Scoring (Week 4)
- [ ] Implement company enrichment pipeline
- [ ] Build person enrichment with LinkedIn data
- [ ] Create lead scoring algorithm
- [ ] Add buying signal detection
- [ ] Build enrichment panel UI

### Phase 5: Outreach & Polish (Week 5)
- [ ] Implement outreach message generation
- [ ] Add email/LinkedIn message templates
- [ ] Create settings/configuration page
- [ ] Add CSV import functionality
- [ ] Performance optimization and testing

---

## 7. DATABASE CONSIDERATIONS

### Option A: Supabase (Recommended)
\`\`\`sql
-- leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  phone TEXT,
  linkedin_url TEXT,
  status TEXT DEFAULT 'new',
  score INTEGER DEFAULT 0,
  source TEXT DEFAULT 'manual',
  company_id UUID REFERENCES companies(id),
  enrichment_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  industry TEXT,
  size TEXT,
  revenue TEXT,
  location TEXT,
  description TEXT,
  technologies TEXT[],
  social_profiles JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- agent_actions table
CREATE TABLE agent_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  action_type TEXT NOT NULL,
  description TEXT,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### Option B: Upstash Redis (Lightweight)
- Use for caching research results
- Store lead pipeline state
- Queue agent tasks

---

## 8. API ROUTES SPECIFICATION

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/leads` | GET | List all leads with pagination |
| `/api/leads` | POST | Create new lead |
| `/api/leads/[id]` | GET | Get lead details |
| `/api/leads/[id]` | PATCH | Update lead |
| `/api/leads/agent` | POST | Invoke lead agent |
| `/api/leads/enrich` | POST | Enrich lead data |
| `/api/leads/research` | POST | Research company/person |
| `/api/leads/score` | POST | Score a lead |
| `/api/leads/outreach` | POST | Generate outreach |
| `/api/leads/import` | POST | CSV import |
| `/api/leads/webhook` | POST | External integrations |

---

## 9. SUCCESS METRICS

- **Agent Accuracy**: >85% accuracy on lead scoring vs manual review
- **Enrichment Rate**: >90% of leads enriched within 5 minutes
- **Research Depth**: Average 10+ data points per enriched lead
- **UI Performance**: <100ms response time for dashboard
- **Conversion Tracking**: Full attribution from lead to conversion

---

## 10. NEXT STEPS

**Awaiting Approval:** Please confirm this plan or request modifications before implementation begins.

**Questions for Clarification:**
1. Do you have access to the lead-processing-agent repository to share key files?
2. Preferred database solution (Supabase recommended)?
3. Priority features for Phase 1 MVP?
4. Any existing lead data to migrate?
