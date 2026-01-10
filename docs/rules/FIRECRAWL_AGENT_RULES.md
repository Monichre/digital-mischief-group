# Firecrawl Agent - Cursor Rules

## Overview

This document defines patterns and best practices for using Firecrawl's `/agent` API, an autonomous data gathering system that searches, navigates, and extracts data from websites without requiring URLs.

## Core Concept

Firecrawl `/agent` is an autonomous API that:

- **Searches and navigates** deep into websites to find data
- **Requires no URLs** - just describe what you need via `prompt`
- **Processes in parallel** for faster results
- **Handles complex queries** across multiple domains
- **Provides structured output** with optional JSON schemas

**Think of `/agent` as deep research for data, wherever it is!**

## Status

Agent is in **Research Preview** (early access). Expect rough edges. It will get significantly better over time.

## Agent vs Extract Comparison

| Feature | Agent (New) | Extract |
|---------|-------------|---------|
| URLs Required | No | Yes |
| Speed | Faster | Standard |
| Cost | Lower | Standard |
| Reliability | Higher | Standard |
| Query Flexibility | High | Moderate |

## Basic Usage Pattern

### Required Parameter

- **`prompt`**: Natural language description of data to extract (max 10,000 characters) - **REQUIRED**

### Optional Parameters

- **`urls`**: Array of URLs to focus extraction on specific pages
- **`schema`**: JSON schema for structured output (supports Pydantic/Python and Zod/Node)

### Standard Implementation

```typescript
import FirecrawlApp from "@mendable/firecrawl-js";
import { z } from "zod";

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

// With schema (TypeScript/Node)
const FounderSchema = z.object({
  name: z.string().describe("Full name of the founder"),
  role: z.string().optional().describe("Role or position"),
  background: z.string().optional().describe("Professional background"),
});

const FoundersSchema = z.object({
  founders: z.array(FounderSchema).describe("List of founders"),
});

const result = await app.agent({
  prompt: "Find the founders of Firecrawl",
  schema: FoundersSchema,
});

console.log(result.data);
```

### Response Structure

```typescript
{
  success: boolean;
  status: "processing" | "completed" | "failed";
  data?: any; // Extracted data (when completed)
  expiresAt: string; // ISO 8601 timestamp (24 hours after completion)
  creditsUsed: number;
}
```

## Execution Patterns

### Pattern 1: Synchronous (Default)

The `agent()` method waits and returns final results:

```typescript
const result = await app.agent({
  prompt: "Find the top 5 AI startups and their funding amounts",
  schema: StartupSchema,
});

// Result is complete when this returns
if (result.status === "completed") {
  console.log(result.data);
}
```

### Pattern 2: Asynchronous (Start then Poll)

Use `startAgent()` to get a Job ID immediately, then poll for status:

```typescript
// Start the agent job
const agentJob = await app.startAgent({
  prompt: "Find the founders of Firecrawl",
});

// Poll for status
const checkStatus = async () => {
  const status = await app.getAgentStatus(agentJob.id);
  
  if (status.status === "processing") {
    // Still working - poll again after delay
    setTimeout(checkStatus, 2000);
  } else if (status.status === "completed") {
    // Done - use the data
    console.log(status.data);
  } else if (status.status === "failed") {
    // Handle error
    console.error("Agent job failed");
  }
};

checkStatus();
```

## Job States

| Status | Description |
|-------|-------------|
| `processing` | Agent is still working on the request |
| `completed` | Extraction finished successfully |
| `failed` | An error occurred during extraction |

### Processing State Example

```json
{
  "success": true,
  "status": "processing",
  "expiresAt": "2024-12-15T00:00:00.000Z"
}
```

### Completed State Example

```json
{
  "success": true,
  "status": "completed",
  "data": {
    "founders": [
      {
        "name": "Eric Ciarla",
        "role": "Co-founder"
      }
    ]
  },
  "expiresAt": "2024-12-15T00:00:00.000Z",
  "creditsUsed": 15
}
```

## Use Cases

### Research

```typescript
await app.agent({
  prompt: "Find the top 5 AI startups and their funding amounts",
  schema: StartupResearchSchema,
});
```

### Competitive Analysis

```typescript
await app.agent({
  prompt: "Compare pricing plans between Slack and Microsoft Teams",
  schema: PricingComparisonSchema,
});
```

### Data Gathering

```typescript
await app.agent({
  prompt: "Extract contact information from company websites",
  schema: ContactInfoSchema,
});
```

### Content Summarization

```typescript
await app.agent({
  prompt: "Summarize the latest blog posts about web scraping",
  schema: BlogSummarySchema,
});
```

### Focused Extraction (with URLs)

```typescript
await app.agent({
  urls: ["https://docs.firecrawl.dev", "https://firecrawl.dev/pricing"],
  prompt: "Compare the features and pricing information from these pages",
  schema: ComparisonSchema,
});
```

## Schema Definition Patterns

### TypeScript/Zod Pattern

```typescript
import { z } from "zod";

// Define nested schemas
const PersonSchema = z.object({
  name: z.string().describe("Full name"),
  role: z.string().optional().describe("Job title or role"),
  background: z.string().optional().describe("Professional background"),
});

// Main schema
const FoundersSchema = z.object({
  founders: z.array(PersonSchema).describe("List of founders"),
});
```

### Best Practices for Schemas

1. **Use descriptive field descriptions**: Help the agent understand what to extract
2. **Mark optional fields**: Use `.optional()` for fields that may not exist
3. **Provide examples in descriptions**: Guide the agent on expected format
4. **Nest complex structures**: Break down complex data into manageable schemas

## Result Management

### Expiration

- Results are available for **24 hours** after completion
- Store `expiresAt` timestamp to track availability
- Cache results locally if you need them longer

### Error Handling

```typescript
try {
  const result = await app.agent({ prompt: "..." });
  
  if (result.status === "failed") {
    // Handle failure
    console.error("Agent job failed");
  } else if (result.status === "completed") {
    // Process data
    processData(result.data);
  }
} catch (error) {
  // Handle API errors
  console.error("Agent API error:", error);
}
```

## Pricing and Cost Management

### Pricing Model

- **Dynamic billing**: Scales with complexity of extraction
- **Credit-based**: Usage shown in `creditsUsed` field
- **Free tier**: 5 free daily runs for all users

### Cost Optimization Strategies

1. **Start with free runs**: Use 5 daily free requests to understand pricing
2. **Set `maxCredits` parameter**: Limit spending by setting maximum credits

   ```typescript
   await app.agent({
     prompt: "...",
     maxCredits: 10, // Limit to 10 credits
   });
   ```

3. **Optimize prompts**: More specific prompts often use fewer credits
4. **Monitor usage**: Track consumption through dashboard
5. **Set expectations**: Complex multi-domain research uses more credits than simple single-page extractions

### Credit Usage Factors

- Complexity of prompt
- Amount of data processed
- Structure of output requested
- Number of sources accessed

## Best Practices

### Prompt Writing

1. **Be specific**: Clear, specific prompts extract better data
2. **Include context**: Mention what type of data you're looking for
3. **Specify format**: If you need structured data, provide a schema
4. **Set boundaries**: Mention limits (e.g., "top 5", "latest 3")

### When to Use Agent vs Extract

- **Use Agent when**:
  - You don't know the exact URLs
  - You need to search across multiple sites
  - You want autonomous data discovery
  - You need complex multi-step research
  
- **Use Extract when**:
  - You have specific URLs
  - You need fast, single-page extraction
  - You want predictable, immediate results

### Performance Optimization

1. **Use URLs when possible**: Providing URLs focuses the agent and reduces credits
2. **Cache results**: Store completed extractions to avoid re-running
3. **Batch similar requests**: Group related queries when possible
4. **Monitor status efficiently**: Use appropriate polling intervals (2-5 seconds)

### Error Handling

1. **Check status**: Always verify `status === "completed"` before using data
2. **Handle failures**: Implement retry logic for failed jobs
3. **Validate data**: Verify extracted data matches expected schema
4. **Log credits**: Track credit usage for cost monitoring

## Integration Patterns

### Next.js API Route

```typescript
// app/api/agent/route.ts
import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

export async function POST(req: NextRequest) {
  const { prompt, urls, schema } = await req.json();
  
  try {
    const result = await app.agent({
      prompt,
      ...(urls && { urls }),
      ...(schema && { schema }),
    });
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Agent request failed" },
      { status: 500 }
    );
  }
}
```

### Polling Service

```typescript
async function pollAgentStatus(jobId: string, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await app.getAgentStatus(jobId);
    
    if (status.status === "completed") {
      return status.data;
    } else if (status.status === "failed") {
      throw new Error("Agent job failed");
    }
    
    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error("Agent job timeout");
}
```

## File Structure

```
lib/
  firecrawl/
    agent.ts          # Agent wrapper functions
    schemas.ts        # Zod schema definitions
app/
  api/
    agent/
      route.ts        # API route for agent requests
```

## Environment Variables

```bash
FIRECRAWL_API_KEY=fc-your-firecrawl-api-key
```

## References

- [Agent API Reference](https://docs.firecrawl.dev/api-reference/endpoint/agent)
- [Original Documentation](https://docs.firecrawl.dev/features/agent)
- [Firecrawl SDK Documentation](https://docs.firecrawl.dev/sdks/overview)
