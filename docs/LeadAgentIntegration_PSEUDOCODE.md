# Lead Agent Integration - Pseudocode
## Digital Mischief Group

---

## CORE AGENT ORCHESTRATOR

\`\`\`
FUNCTION processLead(lead, action):
  SET context = buildLeadContext(lead)
  
  SWITCH action:
    CASE 'research':
      result = AWAIT researchPipeline(lead)
      UPDATE lead.status = 'researching'
      LOG agentAction('research_company', result)
      
    CASE 'enrich':
      companyData = AWAIT enrichCompany(lead.company.domain)
      personData = AWAIT enrichPerson(lead.email, lead.linkedin)
      MERGE lead.enrichment = { companyData, personData }
      UPDATE lead.status = 'enriched'
      LOG agentAction('enrich_data', { companyData, personData })
      
    CASE 'score':
      score = calculateLeadScore(lead)
      UPDATE lead.score = score.value
      LOG agentAction('score_lead', score)
      IF score.value >= 70:
        UPDATE lead.status = 'qualified'
      
    CASE 'outreach':
      message = AWAIT generateOutreach(lead, channel)
      LOG agentAction('generate_outreach', message)
      UPDATE lead.status = 'outreach_pending'
      
  RETURN { lead, result }
\`\`\`

---

## RESEARCH PIPELINE

\`\`\`
FUNCTION researchPipeline(lead):
  // Parallel research queries
  PARALLEL:
    exaResults = semanticSearch(
      query: "{lead.company.name} company overview technology stack",
      options: { numResults: 10 }
    )
    
    newsResults = searchNews(
      query: "{lead.company.name} funding announcement partnership"
    )
    
    linkedinData = IF lead.linkedin:
      scrapeWebpage(lead.linkedin)
    
    companyPage = IF lead.company.domain:
      scrapeWebpage("https://{lead.company.domain}")
  
  // Synthesize with LLM
  synthesis = AWAIT generateText(
    model: "openai/gpt-5",
    system: RESEARCH_SYNTHESIS_PROMPT,
    prompt: buildResearchPrompt(exaResults, newsResults, linkedinData, companyPage)
  )
  
  RETURN {
    raw: { exaResults, newsResults, linkedinData, companyPage },
    synthesis: synthesis.text,
    buyingSignals: extractBuyingSignals(synthesis),
    painPoints: extractPainPoints(synthesis)
  }
\`\`\`

---

## ENRICHMENT PIPELINE

\`\`\`
FUNCTION enrichCompany(domain):
  // Multi-source enrichment
  PARALLEL:
    // Clearbit-style firmographics via scraping
    companyInfo = scrapeWebpage("https://{domain}")
    aboutPage = scrapeWebpage("https://{domain}/about")
    
    // Technology detection
    techStack = detectTechnologies(domain)
    
    // Social profiles
    linkedinCompany = searchGoogle("{domain} site:linkedin.com/company")
    twitterHandle = searchGoogle("{domain} site:twitter.com")
    
    // Funding/news
    crunchbase = semanticSearch("{domain} crunchbase funding")
    
  // Structure the data
  RETURN {
    domain,
    description: extractDescription(companyInfo),
    industry: classifyIndustry(companyInfo),
    size: estimateCompanySize(linkedinCompany),
    technologies: techStack,
    funding: extractFunding(crunchbase),
    socialProfiles: {
      linkedin: linkedinCompany.url,
      twitter: twitterHandle.url
    }
  }

FUNCTION enrichPerson(email, linkedinUrl):
  // Email-based enrichment
  domain = extractDomain(email)
  name = emailToName(email) // infer from email pattern
  
  PARALLEL:
    IF linkedinUrl:
      linkedinProfile = scrapeWebpage(linkedinUrl)
    ELSE:
      linkedinSearch = searchGoogle("{name} {domain} site:linkedin.com")
      linkedinProfile = scrapeWebpage(linkedinSearch.firstResult)
    
    // Look for public mentions
    mentions = semanticSearch("{name} {domain}")
    
  RETURN {
    name: extractFullName(linkedinProfile),
    title: extractTitle(linkedinProfile),
    seniority: classifySeniority(linkedinProfile.title),
    experience: extractExperience(linkedinProfile),
    recentActivity: extractActivity(mentions)
  }
\`\`\`

---

## LEAD SCORING ALGORITHM

\`\`\`
FUNCTION calculateLeadScore(lead):
  score = 0
  factors = []
  
  // ICP Fit (40 points max)
  IF lead.company.industry IN ['SaaS', 'Technology', 'Software']:
    score += 15
    factors.push({ name: 'Industry Fit', impact: 15, reason: 'Tech/SaaS company' })
    
  IF lead.company.size BETWEEN 50 AND 500:
    score += 15
    factors.push({ name: 'Company Size', impact: 15, reason: 'Growth stage (50-500)' })
    
  IF lead.company.technologies CONTAINS_ANY ['AI', 'ML', 'Data']:
    score += 10
    factors.push({ name: 'Tech Stack', impact: 10, reason: 'AI/ML adoption signals' })
  
  // Contact Quality (30 points max)
  IF lead.title MATCHES /VP|Director|Head|Chief|C-Level/:
    score += 20
    factors.push({ name: 'Seniority', impact: 20, reason: 'Decision maker role' })
    
  IF lead.linkedin IS NOT NULL:
    score += 5
    factors.push({ name: 'LinkedIn', impact: 5, reason: 'Verified profile' })
    
  IF lead.phone IS NOT NULL:
    score += 5
    factors.push({ name: 'Phone', impact: 5, reason: 'Direct contact available' })
  
  // Buying Signals (30 points max)
  IF lead.enrichment.buyingSignals.length > 0:
    signalScore = MIN(lead.enrichment.buyingSignals.length * 10, 30)
    score += signalScore
    factors.push({ 
      name: 'Buying Signals', 
      impact: signalScore, 
      reason: lead.enrichment.buyingSignals.join(', ')
    })
  
  RETURN { 
    value: MIN(score, 100), 
    factors,
    tier: scoreTier(score)
  }

FUNCTION scoreTier(score):
  IF score >= 80: RETURN 'hot'
  IF score >= 60: RETURN 'warm'
  IF score >= 40: RETURN 'cold'
  RETURN 'ice'
\`\`\`

---

## OUTREACH GENERATION

\`\`\`
FUNCTION generateOutreach(lead, channel, tone):
  context = {
    lead,
    company: lead.company,
    enrichment: lead.enrichment,
    dmgServices: DMG_SERVICE_DESCRIPTIONS,
    channel,
    tone
  }
  
  prompt = buildOutreachPrompt(context)
  
  result = AWAIT generateText(
    model: "openai/gpt-5",
    system: OUTREACH_SYSTEM_PROMPT,
    prompt: prompt,
    maxOutputTokens: 500
  )
  
  // Parse into structured format
  RETURN {
    subject: extractSubject(result.text),
    body: extractBody(result.text),
    callToAction: extractCTA(result.text),
    personalizationPoints: extractPersonalization(result.text),
    channel,
    generatedAt: NOW()
  }
\`\`\`

---

## UI STATE MANAGEMENT

\`\`\`
HOOK useLeadAgent():
  state = {
    isProcessing: false,
    currentAction: null,
    activityFeed: [],
    error: null
  }
  
  FUNCTION invokeAgent(leadId, action):
    SET state.isProcessing = true
    SET state.currentAction = action
    
    TRY:
      stream = streamText(
        endpoint: '/api/leads/agent',
        body: { leadId, action }
      )
      
      FOR EACH chunk IN stream:
        // Update activity feed in real-time
        IF chunk.type === 'tool_call':
          APPEND state.activityFeed = {
            type: 'tool_start',
            tool: chunk.toolName,
            input: chunk.input,
            timestamp: NOW()
          }
        IF chunk.type === 'tool_result':
          APPEND state.activityFeed = {
            type: 'tool_complete',
            tool: chunk.toolName,
            result: chunk.result,
            timestamp: NOW()
          }
        IF chunk.type === 'text':
          // Agent thinking/reasoning
          APPEND state.activityFeed = {
            type: 'reasoning',
            text: chunk.text,
            timestamp: NOW()
          }
          
    CATCH error:
      SET state.error = error
    FINALLY:
      SET state.isProcessing = false
      SET state.currentAction = null
  
  RETURN { state, invokeAgent }

HOOK useLeadPipeline():
  leads = useSWR('/api/leads')
  
  // Group by status
  pipeline = GROUP leads.data BY status
  
  FUNCTION moveToStage(leadId, newStatus):
    OPTIMISTIC_UPDATE leads.data
    AWAIT fetch('/api/leads/{leadId}', { 
      method: 'PATCH', 
      body: { status: newStatus } 
    })
    REVALIDATE leads
  
  RETURN { pipeline, moveToStage, isLoading: leads.isLoading }
\`\`\`

---

## API ROUTE: AGENT ENDPOINT

\`\`\`
ROUTE POST /api/leads/agent:
  body = AWAIT request.json()
  { leadId, action, options } = body
  
  // Fetch lead from database
  lead = AWAIT getLeadById(leadId)
  IF NOT lead:
    RETURN error(404, 'Lead not found')
  
  // Build context for agent
  messages = [
    { role: 'system', content: LEAD_AGENT_SYSTEM_PROMPT },
    { role: 'user', content: buildActionPrompt(lead, action, options) }
  ]
  
  // Stream agent response
  result = streamText(
    model: 'openai/gpt-5',
    messages: messages,
    tools: leadAgentTools,
    stopWhen: stepCountIs(10)
  )
  
  RETURN result.toUIMessageStreamResponse()
\`\`\`

---

## COMPONENT: LEAD CARD

\`\`\`
COMPONENT LeadCard({ lead }):
  { invokeAgent, state } = useLeadAgent()
  
  RENDER:
    <div className="border border-zinc-800 p-4 hover:border-orange-500/50">
      // Header with score gauge
      <div className="flex justify-between">
        <div>
          <h3 className="font-bold">{lead.firstName} {lead.lastName}</h3>
          <p className="text-zinc-500 text-sm">{lead.title} @ {lead.company.name}</p>
        </div>
        <LeadScoreGauge score={lead.score} />
      </div>
      
      // Status badge
      <StatusBadge status={lead.status} />
      
      // Quick actions
      <div className="flex gap-2 mt-4">
        <Button 
          onClick={() => invokeAgent(lead.id, 'research')}
          disabled={state.isProcessing}
        >
          Research
        </Button>
        <Button 
          onClick={() => invokeAgent(lead.id, 'enrich')}
          disabled={state.isProcessing}
        >
          Enrich
        </Button>
        <Button 
          onClick={() => invokeAgent(lead.id, 'outreach')}
          disabled={state.isProcessing}
        >
          Outreach
        </Button>
      </div>
      
      // Enrichment preview
      IF lead.enrichment:
        <EnrichmentPreview data={lead.enrichment} />
    </div>
\`\`\`

---

## COMPONENT: AGENT ACTIVITY FEED

\`\`\`
COMPONENT AgentActivityFeed({ activities }):
  RENDER:
    <div className="border border-zinc-800 p-4 max-h-96 overflow-y-auto">
      <h3 className="text-orange-500 font-mono text-sm mb-4">
        // AGENT ACTIVITY
      </h3>
      
      FOR EACH activity IN activities:
        <div className="flex items-start gap-3 mb-3">
          // Activity icon
          <ActivityIcon type={activity.type} />
          
          // Activity content
          <div>
            <p className="text-sm">
              {formatActivityMessage(activity)}
            </p>
            <p className="text-zinc-600 text-xs">
              {formatTimestamp(activity.timestamp)}
            </p>
            
            // Tool result preview
            IF activity.type === 'tool_complete':
              <ToolResultPreview result={activity.result} />
          </div>
        </div>
