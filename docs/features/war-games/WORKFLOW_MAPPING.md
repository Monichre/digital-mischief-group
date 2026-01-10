# Workflow to Cult UI Component Mapping

**Feature**: War Games AI Sandbox
**Updated**: 2026-01-10
**Status**: Ready for Implementation

---

## 🎯 Selected Workflows (4-5 Total)

Based on user decision, we're implementing these core workflows:

---

## 1. Agent Sandbox
**Purpose**: Agent routing and orchestration patterns

### Cult UI Component
```bash
pnpx shadcn@beta add @cult-ui-pro/ai-agents-sandbox
pnpx shadcn@beta add @cult-ui-pro/ai-chat-agent-routing-pattern
```

### What It Does
- **Agent Routing**: Route customer support requests to specialized agents
- **Agent Orchestration**: Demonstrate orchestrator-worker patterns
- **Multi-agent Systems**: Show parallel and sequential agent workflows

### Use Cases
- Customer support routing (general, product, technical, billing)
- Task decomposition with orchestrator pattern
- Complex multi-step AI workflows

### Implementation Notes
- Primary workflow for demonstrating agent patterns
- Uses `generateObject` for classification
- Uses `streamText` for agent responses
- Shows different agent specializations

---

## 2. Prompt Sandbox
**Purpose**: Few-shot prompt evaluation and testing

### Cult UI Component
```bash
pnpx shadcn@beta add @cult-ui-pro/ai-sdk-prompt-few-shot
```

### What It Does
- **Few-Shot Learning**: Test prompts with example input/output pairs
- **Prompt Templates**: Pre-built templates for extraction, classification, summarization
- **Evaluation**: Compare prompt variations and results

### Use Cases
- Prompt engineering and optimization
- Testing different prompting strategies
- Building custom AI workflows

### Implementation Notes
- Great for technical users
- Shows prompt engineering best practices
- Demonstrates few-shot learning
- Educational value for AI implementation

---

## 3. PDF Analysis
**Purpose**: Chat with and analyze PDF documents

### Cult UI Component
```bash
pnpx shadcn@beta add @cult-ui-pro/ai-pdf-ingest
```

### What It Does
- **PDF Upload**: Accept PDF files (max 1MB for free tier)
- **Document Chat**: Ask questions about PDF content
- **Analysis**: Extract insights, summaries, key points

### Use Cases
- Research paper analysis
- Contract review
- Report summarization
- Document Q&A

### Implementation Notes
- Uses OpenAI GPT-4 (native PDF support)
- File upload with drag-and-drop
- Streaming responses
- Useful for business use cases

---

## 4. Document Pipeline
**Purpose**: Document processing workflows

### Cult UI Component
```bash
pnpx shadcn@beta add @cult-ui-pro/ai-document-processor
```

### What It Does
- **Document Processing**: Extract, transform, analyze documents
- **Multi-format Support**: Handle various document types
- **Structured Output**: Generate structured data from unstructured documents

### Use Cases
- Invoice processing
- Form extraction
- Data entry automation
- Document classification

### Implementation Notes
- Shows practical business automation
- Demonstrates structured extraction
- Can integrate with existing workflows
- High-value use case

---

## 5. Enrich Profile (Optional)
**Purpose**: AI-powered profile enhancement

### Cult UI Component
```bash
pnpx shadcn@beta add @cult-ui-pro/ai-sdk-enrich-form
```

### What It Does
- **Profile Analysis**: Analyze professional profiles
- **AI Enhancement**: Generate tags, categories, suggestions
- **Career Recommendations**: Suggest career paths and skill development

### Use Cases
- Professional profile optimization
- Resume enhancement
- Skill gap analysis
- Career planning

### Implementation Notes
- Great for B2C/recruiting use cases
- Shows practical AI for users
- Can tie into existing Enrich feature
- Optional - include if time permits

---

## 📊 Workflow Comparison

| Workflow | Complexity | Business Value | User Appeal | Technical Demo |
|----------|-----------|----------------|-------------|----------------|
| Agent Sandbox | High | Medium | High | Excellent |
| Prompt Sandbox | Medium | Medium | Medium | Excellent |
| PDF Analysis | Medium | High | High | Good |
| Document Pipeline | High | High | Medium | Good |
| Enrich Profile | Low | Medium | High | Medium |

---

## 🎨 UI Layout in Situation Room

### Mission Selector Grid (2x3 or 2x2+1)

```
┌─────────────────┬─────────────────┐
│  Agent Sandbox  │ Prompt Sandbox  │
│  [TACTICAL]     │ [EXPERIMENTAL]  │
└─────────────────┴─────────────────┘
┌─────────────────┬─────────────────┐
│  PDF Analysis   │ Document Pipeline│
│  [INTELLIGENCE] │ [OPERATIONS]    │
└─────────────────┴─────────────────┘
┌─────────────────┐
│ Enrich Profile  │  (Optional)
│ [AUGMENTATION]  │
└─────────────────┘
```

---

## 🔧 Implementation Order

### Phase 1 (Week 1)
1. **Agent Sandbox** - Most complex, demonstrates core AI orchestration
2. Database + rate limiting + sessions

### Phase 2 (Week 2)
3. **Prompt Sandbox** - Educational, shows prompt engineering
4. **PDF Analysis** - High-value business use case

### Phase 3 (Week 2-3)
5. **Document Pipeline** - Business automation showcase
6. **Enrich Profile** (optional) - If time permits

---

## 📦 Installation Commands

### All at Once
```bash
# Core 4 workflows
pnpx shadcn@beta add @cult-ui-pro/ai-agents-sandbox
pnpx shadcn@beta add @cult-ui-pro/ai-chat-agent-routing-pattern
pnpx shadcn@beta add @cult-ui-pro/ai-sdk-prompt-few-shot
pnpx shadcn@beta add @cult-ui-pro/ai-pdf-ingest
pnpx shadcn@beta add @cult-ui-pro/ai-document-processor

# Optional 5th
pnpx shadcn@beta add @cult-ui-pro/ai-sdk-enrich-form
```

### One at a Time (Recommended)
Install as you implement each workflow to avoid overwhelming the codebase.

---

## 🚀 Technical Requirements

### LLM Providers Needed
- **Anthropic (Claude)**: Agent sandbox, prompt sandbox, document pipeline
- **OpenAI (GPT-4)**: PDF analysis (native PDF support)
- **Optional Groq**: For faster/cheaper alternatives

### External Services
- **Firecrawl**: Not needed for core 4-5 workflows (removed web search)
- **File Upload**: PDF analysis requires file handling
- **Streaming**: All workflows use streaming responses

### API Routes Required
```
/api/sandbox/session             # Session management
/api/sandbox/agent-sandbox       # Agent routing + orchestration
/api/sandbox/prompt-sandbox      # Few-shot prompt testing
/api/sandbox/pdf-analysis        # PDF chat
/api/sandbox/document-pipeline   # Document processing
/api/sandbox/enrich-profile      # Profile enhancement (optional)
```

---

## ✅ Benefits of This Selection

### Speed to Market
- Reduced from 6 → 4-5 workflows
- Saves ~1 week of development
- Simpler UI and testing

### Focused Value
- Each workflow demonstrates different capability
- No overlap or redundancy
- Clear use cases for each

### Cost Efficiency
- Removed web search (Firecrawl costs)
- Removed parallel processing (complex to demo)
- Core workflows are more cost-effective

### User Experience
- Less overwhelming (5 vs 6 choices)
- Clearer categories
- Better for first-time users

---

## 🔄 Future Additions (Post-Launch)

If the sandbox proves successful, we can add:

**Wave 2 Workflows**:
- Web search + AI synthesis (requires Firecrawl)
- Parallel processing (multi-perspective analysis)
- Audio generation (creative use cases)
- Image analysis (computer vision)

**Wave 3 Workflows**:
- Custom workflow builder
- API playground
- Integration examples
- Advanced orchestration patterns

---

**Mapping Created**: 2026-01-10
**Ready for**: Implementation
**Next Step**: Install first Cult UI component (agent sandbox)
