# AI War Games Sandbox - Implementation Plan

**Feature**: Public-facing AI sandbox arsenal for pre-signup experimentation
**Route**: `/arsenal` (replacing current placeholder)
**Goal**: Let users experience AI capabilities before $30/month commitment
**Theme**: Military/tactical "Situation Room" interface matching screenshot

---

## 1. Executive Summary

### The Vision
Transform `/arsenal` into an interactive "AI War Games" sandbox where users can:
- Execute real AI workflows across multiple patterns (routing, parallel, orchestration, etc.)
- Experience the platform's capabilities with limited free credits
- Hit conversion points that drive them to sign up for $30/month PRO access

### Key Success Metrics
- **Conversion Rate**: 15%+ of sandbox users → paid signups
- **Engagement**: Average 3+ workflows executed per session
- **Retention**: 60%+ return to execute more workflows after hitting limits
- **Abuse Prevention**: <2% bot/spam traffic

### Strategic Fit
- **Freemium Strategy**: Low-friction entry → value demonstration → conversion
- **Brand Alignment**: "Tactical/military" theme matches DMG positioning
- **Technical Showcase**: Demonstrates multi-LLM, agent orchestration, Firecrawl integration
- **Competitive Moat**: Unique "war games" positioning vs generic AI playgrounds

---

## 2. Architecture Overview

### 2.1 High-Level Flow

```
┌─────────────────┐
│  User lands on  │
│   /arsenal      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  SITUATION ROOM Interface       │
│  ┌─────────────────────────┐   │
│  │ Mission Selection       │   │
│  │ - Agent Routing         │   │
│  │ - Parallel Processing   │   │
│  │ - Web Search            │   │
│  │ - PDF Ingest            │   │
│  │ - Form Enrichment       │   │
│  │ - Prompt Evaluation     │   │
│  └─────────────────────────┘   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Execute Workflow               │
│  - Check rate limits            │
│  - Run AI operation             │
│  - Track usage                  │
│  - Stream results               │
└────────┬────────────────────────┘
         │
         ▼
      ┌──┴──┐
      │     │
  Credits    Credits
  Remain     Exhausted
      │         │
      │         ▼
      │   ┌─────────────────┐
      │   │ Conversion Gate │
      │   │ "Unlock Full    │
      │   │  Arsenal - $30" │
      │   └─────────────────┘
      │
      ▼
  Continue
  Exploring
```

### 2.2 Component Architecture

```typescript
/app/arsenal/page.tsx              → Situation Room UI
/app/api/sandbox/[workflow]/route.ts → Individual workflow endpoints
/lib/sandbox/
  ├─ rate-limiter.ts              → IP-based + session-based limits
  ├─ usage-tracker.ts             → Track workflow executions
  ├─ workflows/
  │  ├─ agent-routing.ts          → Agent routing pattern
  │  ├─ parallel-processing.ts    → Parallel agents
  │  ├─ web-search.ts             → Web search integration
  │  ├─ pdf-ingest.ts             → PDF chat
  │  ├─ form-enrichment.ts        → Form AI enrichment
  │  └─ prompt-evaluation.ts      → Few-shot prompting
  └─ conversion.ts                → Conversion tracking logic

/components/sandbox/
  ├─ SituationRoom.tsx            → Main dashboard container
  ├─ MissionSelector.tsx          → Workflow selection grid
  ├─ WorkflowExecutor.tsx         → Execution interface
  ├─ UsageIndicator.tsx           → Credits remaining display
  └─ ConversionGate.tsx           → Paywall modal
```

---

## 3. Database Schema

### 3.1 New Tables

```sql
-- Track anonymous sandbox sessions
CREATE TABLE sandbox_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  session_token TEXT UNIQUE NOT NULL, -- Stored in cookie
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_executions INT NOT NULL DEFAULT 0,
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMPTZ
);

-- Track individual workflow executions
CREATE TABLE sandbox_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sandbox_sessions(id),
  workflow_type TEXT NOT NULL, -- 'agent-routing', 'parallel-processing', etc.
  input_data JSONB NOT NULL, -- User input
  output_data JSONB, -- AI response
  tokens_used INT,
  execution_time_ms INT,
  status TEXT NOT NULL, -- 'success', 'error', 'rate_limited'
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Track conversion funnel
CREATE TABLE sandbox_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sandbox_sessions(id),
  workflow_type TEXT, -- Which workflow triggered conversion prompt
  conversion_action TEXT NOT NULL, -- 'signup_clicked', 'trial_started', 'payment_completed'
  user_id UUID REFERENCES users(id), -- NULL until they sign up
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sandbox_sessions_token ON sandbox_sessions(session_token);
CREATE INDEX idx_sandbox_sessions_ip ON sandbox_sessions(ip_address);
CREATE INDEX idx_sandbox_executions_session ON sandbox_executions(session_id);
CREATE INDEX idx_sandbox_conversions_session ON sandbox_conversions(session_id);
```

### 3.2 Kysely Types

```typescript
// lib/db/types.ts additions

interface SandboxSession {
  id: string
  ip_address: string
  user_agent: string | null
  session_token: string
  created_at: Date
  last_activity_at: Date
  total_executions: number
  converted: boolean
  converted_at: Date | null
}

interface SandboxExecution {
  id: string
  session_id: string
  workflow_type: WorkflowType
  input_data: unknown
  output_data: unknown | null
  tokens_used: number | null
  execution_time_ms: number | null
  status: 'success' | 'error' | 'rate_limited'
  error_message: string | null
  created_at: Date
}

interface SandboxConversion {
  id: string
  session_id: string
  workflow_type: WorkflowType | null
  conversion_action: 'signup_clicked' | 'trial_started' | 'payment_completed'
  user_id: string | null
  created_at: Date
}

type WorkflowType =
  | 'agent-routing'
  | 'parallel-processing'
  | 'web-search'
  | 'pdf-ingest'
  | 'form-enrichment'
  | 'prompt-evaluation'
```

---

## 4. Rate Limiting Strategy

### 4.1 Limits

```typescript
// Free (anonymous) tier
const FREE_LIMITS = {
  daily_executions: 10,     // 10 total workflow runs per day
  concurrent_requests: 2,    // Max 2 simultaneous executions
  cooldown_seconds: 30,      // 30s between executions
  max_input_tokens: 1000,    // Limit input size
  max_output_tokens: 2000,   // Limit response size
}

// PRO tier (authenticated users with $30/mo plan)
const PRO_LIMITS = {
  daily_executions: 1000,
  concurrent_requests: 10,
  cooldown_seconds: 0,
  max_input_tokens: 10000,
  max_output_tokens: 10000,
}
```

### 4.2 Implementation

```typescript
// lib/sandbox/rate-limiter.ts

import { db } from '@/lib/db/kysely'
import { cookies } from 'next/headers'

export async function checkRateLimit(
  sessionToken: string,
  workflowType: WorkflowType
): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
  // Get session from DB
  const session = await db
    .selectFrom('sandbox_sessions')
    .where('session_token', '=', sessionToken)
    .selectAll()
    .executeTakeFirst()

  if (!session) {
    return { allowed: false, reason: 'Invalid session' }
  }

  // Check daily limit
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayExecutions = await db
    .selectFrom('sandbox_executions')
    .where('session_id', '=', session.id)
    .where('created_at', '>=', today)
    .where('status', '=', 'success')
    .select(db.fn.count('id').as('count'))
    .executeTakeFirst()

  const executionCount = Number(todayExecutions?.count || 0)

  if (executionCount >= FREE_LIMITS.daily_executions) {
    return {
      allowed: false,
      reason: 'Daily limit exceeded',
      remaining: 0
    }
  }

  // Check cooldown
  const lastExecution = await db
    .selectFrom('sandbox_executions')
    .where('session_id', '=', session.id)
    .where('status', '=', 'success')
    .orderBy('created_at', 'desc')
    .select('created_at')
    .executeTakeFirst()

  if (lastExecution) {
    const timeSinceLastExec = Date.now() - lastExecution.created_at.getTime()
    if (timeSinceLastExec < FREE_LIMITS.cooldown_seconds * 1000) {
      return {
        allowed: false,
        reason: 'Cooldown active',
        remaining: FREE_LIMITS.daily_executions - executionCount
      }
    }
  }

  return {
    allowed: true,
    remaining: FREE_LIMITS.daily_executions - executionCount
  }
}

export async function trackExecution(
  sessionId: string,
  workflowType: WorkflowType,
  input: unknown,
  output: unknown | null,
  status: 'success' | 'error' | 'rate_limited',
  error?: string
): Promise<void> {
  await db
    .insertInto('sandbox_executions')
    .values({
      session_id: sessionId,
      workflow_type: workflowType,
      input_data: JSON.stringify(input),
      output_data: output ? JSON.stringify(output) : null,
      status,
      error_message: error || null,
    })
    .execute()

  // Update session activity
  await db
    .updateTable('sandbox_sessions')
    .set({
      last_activity_at: new Date(),
      total_executions: db.fn('total_executions', '+', 1)
    })
    .where('id', '=', sessionId)
    .execute()
}
```

---

## 5. Workflow Implementations

### 5.1 Agent Routing Workflow

**Use Case**: Customer support routing to specialized agents

```typescript
// lib/sandbox/workflows/agent-routing.ts

import { streamText, generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

const AgentClassificationSchema = z.object({
  agent: z.enum([
    'general_support',
    'product_support',
    'technical_support',
    'refund_support',
    'account_support',
    'billing_support'
  ]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string()
})

export async function executeAgentRouting(userQuery: string) {
  // Step 1: Classify request
  const classification = await generateObject({
    model: anthropic('claude-3-5-sonnet-20241022'),
    schema: AgentClassificationSchema,
    prompt: `Classify this customer support request and route to appropriate agent:

Query: "${userQuery}"

Available agents:
- general_support: General questions and information
- product_support: Product features and usage
- technical_support: Technical issues and troubleshooting
- refund_support: Refunds and returns
- account_support: Account settings and access
- billing_support: Billing and subscriptions`
  })

  // Step 2: Route to specialized agent
  const agentPrompts = {
    general_support: 'You are a friendly general support agent...',
    product_support: 'You are a product expert who helps users...',
    technical_support: 'You are a technical support specialist...',
    refund_support: 'You are a refund specialist who processes...',
    account_support: 'You are an account management specialist...',
    billing_support: 'You are a billing specialist who handles...'
  }

  const stream = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    system: agentPrompts[classification.object.agent],
    prompt: userQuery,
    maxTokens: 500
  })

  return {
    classification: classification.object,
    responseStream: stream
  }
}
```

### 5.2 Parallel Processing Workflow

**Use Case**: Multi-perspective feature analysis

```typescript
// lib/sandbox/workflows/parallel-processing.ts

import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function executeParallelProcessing(featureDescription: string) {
  const perspectives = [
    {
      name: 'Marketing',
      prompt: `As a marketing strategist, analyze this feature from a market positioning and customer acquisition perspective:\n\n${featureDescription}`
    },
    {
      name: 'Product',
      prompt: `As a product manager, analyze this feature from a user value and product-market fit perspective:\n\n${featureDescription}`
    },
    {
      name: 'Technical',
      prompt: `As a technical architect, analyze this feature from a feasibility and implementation perspective:\n\n${featureDescription}`
    }
  ]

  // Execute all analyses in parallel
  const results = await Promise.all(
    perspectives.map(async ({ name, prompt }) => {
      const response = await generateText({
        model: anthropic('claude-3-5-sonnet-20241022'),
        prompt,
        maxTokens: 500
      })

      return {
        perspective: name,
        analysis: response.text
      }
    })
  )

  return results
}
```

### 5.3 Web Search Workflow

**Use Case**: Live web data + AI synthesis

```typescript
// lib/sandbox/workflows/web-search.ts

import { firecrawlClient } from '@/lib/firecrawl/client'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function executeWebSearch(query: string) {
  // Step 1: Search with Firecrawl
  const searchResults = await firecrawlClient.search(query, {
    limit: 5,
    formats: ['markdown']
  })

  // Step 2: Synthesize results with AI
  const synthesis = await generateText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    prompt: `Based on these web search results, provide a comprehensive answer:

Query: "${query}"

Results:
${searchResults.data.map((r, i) => `
[${i + 1}] ${r.title}
${r.markdown}
Source: ${r.url}
`).join('\n\n')}

Provide a clear, cited answer with source references.`,
    maxTokens: 1000
  })

  return {
    sources: searchResults.data.map(r => ({
      title: r.title,
      url: r.url,
      snippet: r.markdown?.substring(0, 200)
    })),
    answer: synthesis.text
  }
}
```

### 5.4 PDF Ingest Workflow

**Use Case**: Chat with uploaded PDF

```typescript
// lib/sandbox/workflows/pdf-ingest.ts

import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function executePDFIngest(
  pdfUrl: string,
  question: string
) {
  // OpenAI supports direct PDF URLs
  const stream = streamText({
    model: openai('gpt-4o'),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'file', file: pdfUrl },
          { type: 'text', text: question }
        ]
      }
    ],
    maxTokens: 1000
  })

  return stream
}
```

### 5.5 Form Enrichment Workflow

**Use Case**: AI-powered profile enrichment

```typescript
// lib/sandbox/workflows/form-enrichment.ts

import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

const EnrichedProfileSchema = z.object({
  tags: z.array(z.string()).describe('Relevant skill/industry tags'),
  categories: z.array(z.string()).describe('Professional categories'),
  career_suggestions: z.array(z.string()).describe('Career path recommendations'),
  skill_gaps: z.array(z.string()).describe('Potential skill gaps to address')
})

export async function executeFormEnrichment(profile: {
  name: string
  title: string
  bio: string
  skills: string[]
}) {
  const enrichment = await generateObject({
    model: anthropic('claude-3-5-sonnet-20241022'),
    schema: EnrichedProfileSchema,
    prompt: `Analyze this professional profile and provide enriched metadata:

Name: ${profile.name}
Title: ${profile.title}
Bio: ${profile.bio}
Skills: ${profile.skills.join(', ')}

Generate:
- Relevant tags for this profile
- Professional categories they fit into
- Career path suggestions based on their background
- Potential skill gaps to address`
  })

  return enrichment.object
}
```

### 5.6 Prompt Evaluation Workflow

**Use Case**: Few-shot prompt testing

```typescript
// lib/sandbox/workflows/prompt-evaluation.ts

import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export async function executePromptEvaluation(config: {
  task_type: 'extraction' | 'classification' | 'summarization'
  system_prompt: string
  examples: Array<{ input: string; output: string }>
  test_input: string
}) {
  // Build few-shot messages
  const fewShotMessages = config.examples.flatMap(ex => [
    { role: 'user' as const, content: ex.input },
    { role: 'assistant' as const, content: ex.output }
  ])

  const result = await generateText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    system: config.system_prompt,
    messages: [
      ...fewShotMessages,
      { role: 'user', content: config.test_input }
    ],
    maxTokens: 500
  })

  return {
    output: result.text,
    usage: result.usage
  }
}
```

---

## 6. API Route Structure

### 6.1 Session Management

```typescript
// app/api/sandbox/session/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/kysely'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'

  // Check if session exists in cookie
  const existingToken = req.cookies.get('sandbox_session')?.value

  if (existingToken) {
    const session = await db
      .selectFrom('sandbox_sessions')
      .where('session_token', '=', existingToken)
      .selectAll()
      .executeTakeFirst()

    if (session) {
      return NextResponse.json({ session_token: existingToken })
    }
  }

  // Create new session
  const sessionToken = nanoid(32)

  await db
    .insertInto('sandbox_sessions')
    .values({
      ip_address: ip,
      user_agent: userAgent,
      session_token: sessionToken
    })
    .execute()

  const response = NextResponse.json({ session_token: sessionToken })
  response.cookies.set('sandbox_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })

  return response
}

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get('sandbox_session')?.value

  if (!sessionToken) {
    return NextResponse.json({ error: 'No session' }, { status: 401 })
  }

  const session = await db
    .selectFrom('sandbox_sessions')
    .where('session_token', '=', sessionToken)
    .selectAll()
    .executeTakeFirst()

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  // Get usage stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayExecutions = await db
    .selectFrom('sandbox_executions')
    .where('session_id', '=', session.id)
    .where('created_at', '>=', today)
    .where('status', '=', 'success')
    .select(db.fn.count('id').as('count'))
    .executeTakeFirst()

  const remaining = FREE_LIMITS.daily_executions - Number(todayExecutions?.count || 0)

  return NextResponse.json({
    session,
    usage: {
      executions_today: Number(todayExecutions?.count || 0),
      remaining,
      limit: FREE_LIMITS.daily_executions
    }
  })
}
```

### 6.2 Workflow Execution Endpoint Template

```typescript
// app/api/sandbox/[workflow]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, trackExecution } from '@/lib/sandbox/rate-limiter'
import { db } from '@/lib/db/kysely'

export async function POST(
  req: NextRequest,
  { params }: { params: { workflow: string } }
) {
  const sessionToken = req.cookies.get('sandbox_session')?.value

  if (!sessionToken) {
    return NextResponse.json(
      { error: 'No session token' },
      { status: 401 }
    )
  }

  // Get session
  const session = await db
    .selectFrom('sandbox_sessions')
    .where('session_token', '=', sessionToken)
    .selectAll()
    .executeTakeFirst()

  if (!session) {
    return NextResponse.json(
      { error: 'Invalid session' },
      { status: 401 }
    )
  }

  // Check rate limits
  const rateCheck = await checkRateLimit(
    sessionToken,
    params.workflow as WorkflowType
  )

  if (!rateCheck.allowed) {
    await trackExecution(
      session.id,
      params.workflow as WorkflowType,
      {},
      null,
      'rate_limited',
      rateCheck.reason
    )

    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        reason: rateCheck.reason,
        remaining: rateCheck.remaining
      },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()

    // Execute workflow (workflow-specific logic here)
    // ...

    await trackExecution(
      session.id,
      params.workflow as WorkflowType,
      body,
      result,
      'success'
    )

    return NextResponse.json({
      success: true,
      data: result,
      usage: {
        remaining: rateCheck.remaining! - 1
      }
    })
  } catch (error) {
    await trackExecution(
      session.id,
      params.workflow as WorkflowType,
      {},
      null,
      'error',
      error.message
    )

    return NextResponse.json(
      { error: 'Execution failed', message: error.message },
      { status: 500 }
    )
  }
}
```

---

## 7. UI/UX Design

### 7.1 Situation Room Layout

Based on the screenshot, the interface should have:

**Left Panel (30% width)**:
- System status indicators
- Active missions count
- Threat level indicator
- Credits remaining display
- Quick action buttons

**Center Panel (50% width)**:
- Mission selector (6 workflow cards in grid)
- Active workflow execution area
- Results display with streaming

**Right Panel (20% width)**:
- Activity feed
- Global network map (decorative)
- Throughput metrics
- Region statistics

### 7.2 Component Specifications

```typescript
// components/sandbox/SituationRoom.tsx

'use client'

import { useState, useEffect } from 'react'
import { MissionSelector } from './MissionSelector'
import { WorkflowExecutor } from './WorkflowExecutor'
import { UsageIndicator } from './UsageIndicator'
import { ConversionGate } from './ConversionGate'
import { ActivityFeed } from './ActivityFeed'

export function SituationRoom() {
  const [session, setSession] = useState(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [showConversionGate, setShowConversionGate] = useState(false)

  useEffect(() => {
    // Initialize session on mount
    fetch('/api/sandbox/session', { method: 'POST' })
      .then(r => r.json())
      .then(data => setSession(data))
  }, [])

  const handleWorkflowComplete = (remaining: number) => {
    if (remaining === 0) {
      setShowConversionGate(true)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-mono">
      {/* Header */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="font-bold tracking-tighter text-lg">
              SITUATION ROOM
            </span>
          </div>

          {session && (
            <UsageIndicator
              remaining={session.usage?.remaining || 0}
              limit={session.usage?.limit || 10}
            />
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-[1800px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Status */}
          <div className="lg:col-span-3 space-y-6">
            <SystemStatus session={session} />
            <ThreatLevel />
          </div>

          {/* Center Panel - Missions */}
          <div className="lg:col-span-6">
            {selectedWorkflow ? (
              <WorkflowExecutor
                workflow={selectedWorkflow}
                onComplete={handleWorkflowComplete}
                onBack={() => setSelectedWorkflow(null)}
              />
            ) : (
              <MissionSelector
                onSelect={setSelectedWorkflow}
              />
            )}
          </div>

          {/* Right Panel - Activity */}
          <div className="lg:col-span-3 space-y-6">
            <ActivityFeed />
            <GlobalNetwork />
          </div>
        </div>
      </div>

      {/* Conversion Gate Modal */}
      {showConversionGate && (
        <ConversionGate
          onClose={() => setShowConversionGate(false)}
        />
      )}
    </div>
  )
}
```

### 7.3 Mission Selector UI

```typescript
// components/sandbox/MissionSelector.tsx

'use client'

import { Target, Users, Globe, FileText, Sparkles, Zap } from 'lucide-react'

const MISSIONS = [
  {
    id: 'agent-routing',
    icon: Target,
    title: 'Agent Routing',
    description: 'Route support requests to specialized agents',
    classification: 'TACTICAL',
    color: 'orange'
  },
  {
    id: 'parallel-processing',
    icon: Users,
    title: 'Parallel Processing',
    description: 'Multi-perspective feature analysis',
    classification: 'STRATEGIC',
    color: 'cyan'
  },
  {
    id: 'web-search',
    icon: Globe,
    title: 'Web Search',
    description: 'Live web data + AI synthesis',
    classification: 'INTELLIGENCE',
    color: 'green'
  },
  {
    id: 'pdf-ingest',
    icon: FileText,
    title: 'PDF Ingest',
    description: 'Chat with PDF documents',
    classification: 'ANALYSIS',
    color: 'yellow'
  },
  {
    id: 'form-enrichment',
    icon: Sparkles,
    title: 'Form Enrichment',
    description: 'AI-powered profile enhancement',
    classification: 'AUGMENTATION',
    color: 'purple'
  },
  {
    id: 'prompt-evaluation',
    icon: Zap,
    title: 'Prompt Evaluation',
    description: 'Few-shot prompt testing',
    classification: 'EXPERIMENTAL',
    color: 'red'
  }
]

export function MissionSelector({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <div className="w-8 h-px bg-orange-500" />
        <span>ACTIVE MISSIONS</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MISSIONS.map((mission) => {
          const Icon = mission.icon
          return (
            <button
              key={mission.id}
              onClick={() => onSelect(mission.id)}
              className="group relative p-6 border border-white/10 bg-zinc-900/50 hover:border-orange-500/50 transition-all text-left"
            >
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-orange-500/0 group-hover:border-orange-500 transition-colors" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-orange-500/0 group-hover:border-orange-500 transition-colors" />

              {/* Classification */}
              <div className="text-[10px] text-zinc-500 tracking-widest mb-4">
                {mission.classification}
              </div>

              {/* Icon */}
              <div className="w-12 h-12 border border-white/10 flex items-center justify-center mb-4 group-hover:border-orange-500/50 transition-colors">
                <Icon className="w-6 h-6 text-zinc-400 group-hover:text-orange-500 transition-colors" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold tracking-tight mb-2 group-hover:text-orange-500 transition-colors">
                {mission.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-zinc-500 leading-relaxed">
                {mission.description}
              </p>

              {/* Launch indicator */}
              <div className="mt-4 flex items-center gap-2 text-[10px] text-zinc-600 group-hover:text-orange-500 transition-colors">
                <span>LAUNCH MISSION</span>
                <div className="w-2 h-2 bg-orange-500/0 group-hover:bg-orange-500 rounded-full transition-colors" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

---

## 8. Conversion Funnel Strategy

### 8.1 Conversion Triggers

```typescript
// Trigger conversion gate when:
const CONVERSION_TRIGGERS = {
  // Hard limits
  rate_limit_hit: true,          // User hits daily execution limit
  cooldown_hit: true,            // User hits cooldown multiple times

  // Soft triggers
  high_engagement: {             // User completes 5+ workflows
    threshold: 5,
    message: "You're getting the hang of this! Unlock unlimited access."
  },
  feature_discovery: {           // User tries 4+ different workflows
    threshold: 4,
    message: "Love exploring? PRO gives you unlimited everything."
  },
  return_visitor: true,          // User returns after 24h
}
```

### 8.2 Conversion Gate UI

```typescript
// components/sandbox/ConversionGate.tsx

'use client'

import { Zap, X, Check } from 'lucide-react'

export function ConversionGate({ onClose, trigger }: {
  onClose: () => void
  trigger?: string
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-2xl w-full mx-4 border border-orange-500/50 bg-zinc-900 p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-orange-500/30 bg-orange-500/5">
            <Zap className="w-4 h-4 text-orange-500 animate-pulse" />
            <span className="text-[10px] font-mono text-orange-500 uppercase tracking-widest">
              ARSENAL LOCKED
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
            Mission Limit <span className="text-orange-500">Reached</span>
          </h2>

          <p className="text-zinc-400 text-lg">
            You've executed your daily allowance of free missions.
            <br />
            <span className="text-white font-semibold">
              Unlock unlimited access for $30/month.
            </span>
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Unlimited Missions', value: '∞' },
            { label: 'No Cooldowns', value: '0s' },
            { label: 'Priority Processing', value: '10x' },
          ].map((benefit) => (
            <div
              key={benefit.label}
              className="p-4 border border-white/10 bg-zinc-800/50 text-center"
            >
              <div className="text-3xl font-bold text-orange-500 mb-2">
                {benefit.value}
              </div>
              <div className="text-xs text-zinc-400">{benefit.label}</div>
            </div>
          ))}
        </div>

        {/* Features list */}
        <div className="mb-8 space-y-3">
          {[
            'Access to all AI workflows',
            'Unlimited daily executions',
            'Zero cooldown between operations',
            'Priority queue for faster processing',
            '10x token limits for larger operations',
            'Full Daedalus intelligence suite',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3 text-zinc-300">
              <Check className="w-5 h-5 text-orange-500" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://buy.stripe.com/9B67sM6JF2jWght0gcgMw00"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-orange-500 text-white font-bold hover:bg-orange-400 transition-all"
          >
            <Zap className="w-5 h-5" />
            <span>UNLOCK PRO — $30/mo</span>
          </a>

          <button
            onClick={onClose}
            className="px-6 py-4 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-all"
          >
            Continue Tomorrow
          </button>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-4">
          // Cancel anytime. Full refund within 7 days.
        </p>
      </div>
    </div>
  )
}
```

---

## 9. Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Basic infrastructure and first workflow

**Tasks**:
1. Database migrations
   - Create `sandbox_sessions`, `sandbox_executions`, `sandbox_conversions` tables
   - Add Kysely types
   - Test migrations locally

2. Rate limiting system
   - Implement `lib/sandbox/rate-limiter.ts`
   - Session management API (`/api/sandbox/session`)
   - Cookie-based session tracking

3. First workflow: Agent Routing
   - Implement `lib/sandbox/workflows/agent-routing.ts`
   - Create API route `/api/sandbox/agent-routing`
   - Build UI component for execution

4. Basic Situation Room UI
   - Replace `/arsenal/page.tsx` with Situation Room layout
   - Implement `MissionSelector` component
   - Implement basic `WorkflowExecutor` component

**Deliverable**: Users can execute agent routing workflow with rate limits

---

### Phase 2: Core Workflows (Week 2)
**Goal**: Implement remaining 5 workflows

**Tasks**:
1. Parallel Processing workflow
   - Implementation + API route
   - UI integration

2. Web Search workflow
   - Firecrawl integration
   - Implementation + API route
   - UI integration

3. PDF Ingest workflow
   - File upload handling
   - OpenAI integration
   - Implementation + API route
   - UI integration

4. Form Enrichment workflow
   - Implementation + API route
   - UI integration

5. Prompt Evaluation workflow
   - Implementation + API route
   - UI integration

**Deliverable**: All 6 workflows functional and accessible

---

### Phase 3: UX Polish (Week 3)
**Goal**: Complete Situation Room interface

**Tasks**:
1. Left Panel Components
   - System status indicators
   - Threat level display
   - Quick action buttons

2. Right Panel Components
   - Activity feed (real-time execution log)
   - Global network visualization
   - Throughput metrics

3. Streaming UI
   - Implement streaming responses
   - Add loading states and progress indicators
   - Error handling and retry logic

4. Mobile responsiveness
   - Responsive grid layouts
   - Touch-friendly controls
   - Mobile-optimized modals

**Deliverable**: Full Situation Room experience matching screenshot design

---

### Phase 4: Conversion & Analytics (Week 4)
**Goal**: Optimize conversion funnel

**Tasks**:
1. Conversion Gate
   - Implement `ConversionGate` component
   - Multiple trigger conditions
   - A/B test different messaging

2. Usage tracking
   - Analytics events (PostHog/Mixpanel)
   - Conversion funnel tracking
   - Cohort analysis setup

3. Admin dashboard
   - View sandbox usage metrics
   - Monitor conversion rates
   - Identify drop-off points

4. Email follow-ups
   - Welcome email with tips
   - Re-engagement for returning visitors
   - Conversion drip campaign

**Deliverable**: Data-driven conversion optimization

---

### Phase 5: Cult UI Integration (Optional Enhancement)
**Goal**: Replace custom workflows with Cult UI Pro components

**Tasks**:
1. Install Cult UI components
   ```bash
   pnpx shadcn@beta add @cult-ui-pro/ai-agents-sandbox
   pnpx shadcn@beta add @cult-ui-pro/ai-chat-agent-routing-pattern
   # ... etc
   ```

2. Integrate components into workflows
   - Replace custom UI with Cult UI components
   - Maintain API compatibility
   - Test all workflows

3. Enhanced features
   - Use Cult UI's advanced patterns
   - Leverage pre-built animations
   - Adopt their best practices

**Deliverable**: Production-grade UI with minimal custom code

---

## 10. Success Metrics

### 10.1 Engagement Metrics
- **Daily Active Users (DAU)**: Target 100+ within first month
- **Workflows per Session**: Target 3.5 average
- **Return Rate**: 60%+ users return within 7 days
- **Completion Rate**: 80%+ workflows complete successfully

### 10.2 Conversion Metrics
- **Signup Rate**: 15%+ of sandbox users create accounts
- **PRO Conversion**: 20%+ of signups → PRO within 7 days
- **Time to Conversion**: Median <3 days from first sandbox use
- **MRR from Sandbox**: $3K+ MRR attributed to sandbox within 3 months

### 10.3 Technical Metrics
- **Uptime**: 99.5%+ availability
- **Response Time**: <2s p95 for workflow execution
- **Error Rate**: <1% failed executions
- **Abuse Rate**: <2% bot/spam traffic

---

## 11. Risk Mitigation

### 11.1 Abuse Prevention

**Risk**: Bots/scrapers abuse free tier

**Mitigations**:
- Cloudflare Turnstile on session creation
- IP-based rate limiting (stricter than session-based)
- Fingerprinting for repeated offenders
- Manual review of high-volume IPs

### 11.2 Cost Control

**Risk**: Free tier costs exceed revenue

**Mitigations**:
- Hard token limits per execution
- Timeout limits (30s max per workflow)
- Queue position for free tier (PRO gets priority)
- Auto-disable workflows if costs spike

### 11.3 Quality Assurance

**Risk**: Poor results hurt conversion

**Mitigations**:
- Pre-production testing of all workflows
- Error handling with user-friendly messages
- Fallback responses if AI fails
- User feedback collection

### 11.4 Legal Compliance

**Risk**: GDPR/privacy violations

**Mitigations**:
- Anonymous sessions (no PII required)
- Clear ToS for sandbox usage
- Data retention policy (30 days max)
- User consent for cookies

---

## 12. Next Steps

### Immediate Actions (This Week)

1. **Approve Plan** ✓ (You're reading it!)
2. **Database Setup**
   - Create migration file
   - Apply to local dev database
   - Test Kysely queries

3. **Build Foundation**
   - Implement rate limiter
   - Create session API
   - Build first workflow (agent routing)

4. **Test Locally**
   - Execute workflow end-to-end
   - Verify rate limiting works
   - Check session persistence

### Week 2-3

1. **Implement Remaining Workflows**
   - Parallel processing
   - Web search
   - PDF ingest
   - Form enrichment
   - Prompt evaluation

2. **Build UI Components**
   - Situation Room layout
   - Mission selector
   - Workflow executor
   - Usage indicator

### Week 4

1. **Conversion Optimization**
   - Implement conversion gate
   - Add analytics tracking
   - Setup email campaigns

2. **Launch**
   - Deploy to production
   - Monitor metrics
   - Iterate based on data

---

## 13. Appendix

### A. Environment Variables

```bash
# Add to .env.local

# LLM Providers (need at least one)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Firecrawl (required for web search workflow)
FIRECRAWL_API_KEY=fc-...

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Email (optional, for follow-ups)
RESEND_API_KEY=re_...
```

### B. File Checklist

**New Files to Create**:
```
lib/sandbox/
  ├─ rate-limiter.ts
  ├─ usage-tracker.ts
  ├─ conversion.ts
  └─ workflows/
      ├─ agent-routing.ts
      ├─ parallel-processing.ts
      ├─ web-search.ts
      ├─ pdf-ingest.ts
      ├─ form-enrichment.ts
      └─ prompt-evaluation.ts

app/api/sandbox/
  ├─ session/route.ts
  ├─ agent-routing/route.ts
  ├─ parallel-processing/route.ts
  ├─ web-search/route.ts
  ├─ pdf-ingest/route.ts
  ├─ form-enrichment/route.ts
  └─ prompt-evaluation/route.ts

components/sandbox/
  ├─ SituationRoom.tsx
  ├─ MissionSelector.tsx
  ├─ WorkflowExecutor.tsx
  ├─ UsageIndicator.tsx
  ├─ ConversionGate.tsx
  ├─ SystemStatus.tsx
  ├─ ActivityFeed.tsx
  └─ GlobalNetwork.tsx

scripts/
  └─ 004-sandbox-tables.sql
```

**Files to Modify**:
```
app/arsenal/page.tsx        → Replace with SituationRoom
lib/db/types.ts             → Add sandbox types
```

### C. Testing Checklist

**Functionality**:
- [ ] Session creation and cookie persistence
- [ ] Rate limiting (daily limit, cooldown)
- [ ] All 6 workflows execute successfully
- [ ] Streaming responses work
- [ ] Error handling displays properly
- [ ] Conversion gate triggers correctly
- [ ] Analytics events fire

**Performance**:
- [ ] Response times <2s p95
- [ ] No memory leaks in streaming
- [ ] Database queries optimized
- [ ] Proper indexing on lookups

**Security**:
- [ ] SQL injection prevention (Kysely handles this)
- [ ] XSS prevention (Next.js handles this)
- [ ] Rate limiting can't be bypassed
- [ ] Session tokens are secure
- [ ] No exposed secrets in client code

**UX**:
- [ ] Mobile responsive
- [ ] Loading states clear
- [ ] Error messages helpful
- [ ] Conversion flow smooth
- [ ] Brand consistency

---

## Questions for Review

Before implementation, please confirm:

1. **Design Approval**: Does the Situation Room UI match your vision from the screenshot?
2. **Workflow Selection**: Are these 6 workflows the right mix? Should we add/remove any?
3. **Rate Limits**: Are 10 free executions/day appropriate? Too generous? Too restrictive?
4. **Conversion Strategy**: Should we be more aggressive with conversion gates?
5. **Cult UI Timing**: Should we integrate Cult UI components from the start (Phase 1) or later (Phase 5)?
6. **Analytics**: Which analytics platform do you prefer (PostHog, Mixpanel, Amplitude)?
7. **Email Provider**: Are you already using Resend, or should we use a different provider?

---

**Ready to build?** Let me know which phase you'd like to start with, or if you'd like to adjust the plan! 🔥
