import { generateObjectWithFallback } from "./llm-provider"
import type { Scout, ScoutResult } from "../scouts/types"
import type {
  SentinelAnalysis,
  ConductorThought,
  AIInsight,
  CompetitiveIntel,
  TrendSignal,
  OpportunityScore,
} from "../scouts/stream-types"
import { z } from "zod"

const ExtractedItemSchema = z.object({
  url: z.string(),
  title: z.string(),
  summary: z.string(),
  entities: z.array(z.string()).default([]),
  details: z.array(z.string()).default([]),
  relevance_score: z.number().min(0).max(100),
})

type ExtractedItem = z.infer<typeof ExtractedItemSchema>

const CompetitiveIntelSchema = z.array(
  z.object({
    competitor_name: z.string().optional(),
    action_type: z.enum([
      "product_launch",
      "pricing_change",
      "feature_release",
      "partnership",
      "funding",
      "other",
    ]),
    summary: z.string(),
    impact: z.enum(["high", "medium", "low"]),
    url: z.string(),
  })
)

const TrendSignalSchema = z.array(
  z.object({
    trend_name: z.string(),
    strength: z.number().min(0).max(100),
    evidence: z.array(z.string()),
    emerging: z.boolean(),
  })
)

const SynthesisSchema = z.object({
  insights: z.array(
    z.object({
      type: z.enum(["competitive", "trend", "opportunity", "threat"]),
      title: z.string(),
      description: z.string(),
      confidence: z.number().min(0).max(100),
      priority: z.enum(["high", "medium", "low"]),
      actionable: z.boolean(),
    })
  ),
  synthesis: z.string(),
})

export interface SentinelAgentOptions {
  onThought?: (thought: ConductorThought) => void
  onInsight?: (insight: AIInsight) => void
  onCompetitiveIntel?: (intel: CompetitiveIntel) => void
  onTrend?: (trend: TrendSignal) => void
  abortSignal?: AbortSignal
}

// Helper to emit thoughts
function emitThought(
  type: ConductorThought['type'],
  content: string,
  onThought?: (thought: ConductorThought) => void,
  relatedPhase?: string
) {
  if (onThought) {
    onThought({
      type,
      content,
      timestamp: Date.now(),
      relatedPhase,
    })
  }
}

// Phase 1: Extract relevant content from search results
async function extractRelevantContent(
  results: ScoutResult[],
  scoutContext: Scout,
  onThought?: (thought: ConductorThought) => void
): Promise<ExtractedItem[]> {
  emitThought('action', `Analyzing ${results.length} search results...`, onThought, 'extraction')

  const prompt = `You are analyzing search results for competitive intelligence. Extract the most relevant and important information from these results.

SCOUT CONTEXT:
Name: ${scoutContext.name}
Query: ${scoutContext.search_query}
Purpose: Monitor competitors, track market trends, discover opportunities

SEARCH RESULTS:
${results
  .slice(0, 20)
  .map(
    (r, i) => `
${i + 1}. ${r.title || 'Untitled'}
   URL: ${r.url}
   Snippet: ${r.snippet || 'No snippet'}
`
  )
  .join('\n')}

For each result, extract:
1. Main topic/announcement
2. Key entities (companies, products, people)
3. Important details (dates, numbers, features)
4. Relevance to the scout's purpose

Return JSON array of extracted content:
[
  {
    "url": "...",
    "title": "...",
    "summary": "1-2 sentence summary",
    "entities": ["company", "product", ...],
    "details": ["detail1", "detail2"],
    "relevance_score": 0-100
  }
]

Only include results with relevance_score > 30.`

  try {
    const { object } = await generateObjectWithFallback({
      schema: z.array(ExtractedItemSchema),
      prompt,
      maxTokens: 2000,
      temperature: 0.3,
    })

    emitThought(
      'observation',
      `Extracted ${object.length} relevant items from search results`,
      onThought,
      'extraction'
    )
    return object
  } catch (error) {
    emitThought('observation', `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`, onThought, 'extraction')
  }

  return []
}

// Phase 2: Analyze competitive signals
async function analyzeCompetitiveSignals(
  extracted: ExtractedItem[],
  scoutContext: Scout,
  onThought?: (thought: ConductorThought) => void,
  onCompetitiveIntel?: (intel: CompetitiveIntel) => void
): Promise<CompetitiveIntel[]> {
  emitThought('action', 'Analyzing competitive landscape...', onThought, 'competitive')

  const prompt = `You are a competitive intelligence analyst. Analyze these search results for competitor activity.

SCOUT PURPOSE: ${scoutContext.search_query}

EXTRACTED CONTENT:
${JSON.stringify(extracted, null, 2)}

Identify competitor actions such as:
- Product launches or updates
- Pricing changes
- New features
- Partnerships or integrations
- Funding announcements
- Executive changes
- Market positioning shifts

Return JSON array:
[
  {
    "competitor_name": "Company Name",
    "action_type": "product_launch|pricing_change|feature_release|partnership|funding|other",
    "summary": "Brief description of what happened",
    "impact": "high|medium|low",
    "url": "source URL",
    "reasoning": "Why this matters"
  }
]

Only include significant, actionable competitive intelligence.`

  try {
    const { object: intel } = await generateObjectWithFallback({
      schema: CompetitiveIntelSchema,
      prompt,
      maxTokens: 1500,
      temperature: 0.3,
    })

    emitThought('reasoning', `Found ${intel.length} competitive signals`, onThought, 'competitive')

    // Emit each intel finding
    intel.forEach(item => {
      if (onCompetitiveIntel) onCompetitiveIntel(item)
      emitThought('insight', `${item.competitor_name}: ${item.summary}`, onThought, 'competitive')
    })

    return intel
  } catch (error) {
    emitThought('observation', `Competitive analysis failed: ${error instanceof Error ? error.message : 'Unknown'}`, onThought, 'competitive')
  }

  return []
}

// Phase 3: Detect trends
async function detectTrends(
  extracted: ExtractedItem[],
  onThought?: (thought: ConductorThought) => void,
  onTrend?: (trend: TrendSignal) => void
): Promise<TrendSignal[]> {
  emitThought('action', 'Detecting market trends...', onThought, 'trends')

  const prompt = `You are a market trend analyst. Identify emerging trends and patterns from these search results.

EXTRACTED CONTENT:
${JSON.stringify(extracted, null, 2)}

Look for:
- Recurring themes or topics
- Emerging technologies or approaches
- Market shifts or changes
- Customer sentiment patterns
- Industry movements

Return JSON array:
[
  {
    "trend_name": "Descriptive trend name",
    "strength": 0-100,
    "evidence": ["evidence point 1", "evidence point 2"],
    "emerging": true/false (is this a new trend?)
  }
]

Only include trends with strength > 40.`

  try {
    const { object: trends } = await generateObjectWithFallback({
      schema: TrendSignalSchema,
      prompt,
      maxTokens: 1200,
      temperature: 0.3,
    })

    emitThought('reasoning', `Detected ${trends.length} market trends`, onThought, 'trends')

    trends.forEach(trend => {
      if (onTrend) onTrend(trend)
      emitThought('insight', `Trend: ${trend.trend_name} (strength: ${trend.strength})`, onThought, 'trends')
    })

    return trends
  } catch (error) {
    emitThought('observation', `Trend detection failed: ${error instanceof Error ? error.message : 'Unknown'}`, onThought, 'trends')
  }

  return []
}

// Phase 4: Score opportunities
async function scoreOpportunities(
  extracted: ExtractedItem[],
  scoutContext: Scout,
  onThought?: (thought: ConductorThought) => void
): Promise<OpportunityScore[]> {
  emitThought('action', 'Scoring opportunities...', onThought, 'scoring')

  const opportunities = extracted.map(item => ({
    url: item.url,
    title: item.title,
    relevance_score: item.relevance_score || 50,
    opportunity_type: determineOpportunityType(item),
    reasoning: `Relevance: ${item.relevance_score}%, Entities: ${item.entities?.join(', ')}`,
  }))

  // Sort by relevance
  opportunities.sort((a, b) => b.relevance_score - a.relevance_score)

  emitThought('reasoning', `Ranked ${opportunities.length} opportunities by relevance`, onThought, 'scoring')

  return opportunities.slice(0, 10) // Top 10
}

function determineOpportunityType(item: ExtractedItem): string {
  const summary = (item.summary || '').toLowerCase()

  if (summary.includes('partnership') || summary.includes('integration')) return 'partnership'
  if (summary.includes('product') || summary.includes('launch')) return 'product_intel'
  if (summary.includes('funding') || summary.includes('investment')) return 'funding'
  if (summary.includes('pricing') || summary.includes('plan')) return 'pricing_intel'
  if (summary.includes('feature') || summary.includes('update')) return 'feature_update'

  return 'market_intelligence'
}

// Phase 5: Synthesize insights
async function synthesizeInsights(
  competitive: CompetitiveIntel[],
  trends: TrendSignal[],
  opportunities: OpportunityScore[],
  scoutContext: Scout,
  onThought?: (thought: ConductorThought) => void,
  onInsight?: (insight: AIInsight) => void
): Promise<{ insights: AIInsight[]; synthesis: string }> {
  emitThought('action', 'Synthesizing final insights...', onThought, 'synthesis')

  const prompt = `You are a strategic analyst. Create actionable insights from this intelligence data.

SCOUT CONTEXT:
Name: ${scoutContext.name}
Query: ${scoutContext.search_query}

COMPETITIVE INTEL:
${JSON.stringify(competitive, null, 2)}

TRENDS:
${JSON.stringify(trends, null, 2)}

TOP OPPORTUNITIES:
${JSON.stringify(opportunities.slice(0, 5), null, 2)}

Generate:
1. 3-5 actionable insights (things the user should do/know)
2. Executive summary (2-3 sentences)

Return JSON:
{
  "insights": [
    {
      "type": "competitive|trend|opportunity|threat",
      "title": "Brief title",
      "description": "What this means and why it matters",
      "confidence": 0-100,
      "priority": "high|medium|low",
      "actionable": true/false
    }
  ],
  "synthesis": "Executive summary of all findings"
}`

  try {
    const { object: result } = await generateObjectWithFallback({
      schema: SynthesisSchema,
      prompt,
      maxTokens: 1200,
      temperature: 0.4,
    })

    emitThought('insight', `Generated ${result.insights.length} actionable insights`, onThought, 'synthesis')

    // Emit each insight
    result.insights.forEach((insight: AIInsight) => {
      if (onInsight) onInsight(insight)
      emitThought('insight', `${insight.title}: ${insight.description}`, onThought, 'synthesis')
    })

    return result
  } catch (error) {
    emitThought('observation', `Synthesis failed: ${error instanceof Error ? error.message : 'Unknown'}`, onThought, 'synthesis')
  }

  return { insights: [], synthesis: 'Analysis completed with limited results.' }
}

// Main agent orchestrator
export async function runSentinelAgent(
  searchResults: ScoutResult[],
  scoutContext: Scout,
  options: SentinelAgentOptions = {}
): Promise<SentinelAnalysis> {
  const { onThought, onInsight, onCompetitiveIntel, onTrend } = options
  const thoughts: ConductorThought[] = []

  // Capture all thoughts
  const thoughtCapture = (thought: ConductorThought) => {
    thoughts.push(thought)
    if (onThought) onThought(thought)
  }

  try {
    // Phase 1: Extract content
    const extracted = await extractRelevantContent(searchResults, scoutContext, thoughtCapture)

    if (extracted.length === 0) {
      return {
        competitive_intel: [],
        trends: [],
        opportunities: [],
        insights: [],
        synthesis: 'No relevant content found in search results.',
        confidence_score: 0,
        thoughts,
      }
    }

    // Phase 2: Competitive analysis
    const competitive_intel = await analyzeCompetitiveSignals(
      extracted,
      scoutContext,
      thoughtCapture,
      onCompetitiveIntel
    )

    // Phase 3: Trend detection
    const trends = await detectTrends(extracted, thoughtCapture, onTrend)

    // Phase 4: Opportunity scoring
    const opportunities = await scoreOpportunities(extracted, scoutContext, thoughtCapture)

    // Phase 5: Synthesis
    const { insights, synthesis } = await synthesizeInsights(
      competitive_intel,
      trends,
      opportunities,
      scoutContext,
      thoughtCapture,
      onInsight
    )

    // Calculate overall confidence
    const confidence_score = calculateConfidence(
      searchResults.length,
      extracted.length,
      competitive_intel.length + trends.length + insights.length
    )

    return {
      competitive_intel,
      trends,
      opportunities,
      insights,
      synthesis,
      confidence_score,
      thoughts,
    }
  } catch (error) {
    emitThought('observation', `Agent failed: ${error instanceof Error ? error.message : 'Unknown'}`, thoughtCapture)

    return {
      competitive_intel: [],
      trends: [],
      opportunities: [],
      insights: [],
      synthesis: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      confidence_score: 0,
      thoughts,
    }
  }
}

function calculateConfidence(totalResults: number, extractedCount: number, insightsCount: number): number {
  // Confidence based on data quality
  let score = 0

  // More results = higher confidence (up to 40 points)
  score += Math.min(40, totalResults * 2)

  // Extraction success (up to 30 points)
  if (extractedCount > 0) {
    score += Math.min(30, (extractedCount / totalResults) * 100 * 0.3)
  }

  // Insights generated (up to 30 points)
  score += Math.min(30, insightsCount * 10)

  return Math.min(100, Math.round(score))
}
