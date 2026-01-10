# Exa TypeScript SDK - Cursor Rules

## Overview
This document defines patterns and best practices for using the Exa TypeScript SDK (`exa-js`) for semantic web search, content retrieval, and research tasks.

## Installation and Setup

### Installation
```bash
npm install exa-js
# or
pnpm install exa-js
```

### Client Initialization
```typescript
import Exa from 'exa-js';

const exa = new Exa(process.env.EXA_API_KEY);
```

## Core Search Methods

### `search` Method

Performs a semantic search and returns a list of relevant result links.

#### Basic Usage
```typescript
const result = await exa.search("hottest AI startups", {
  numResults: 2
});
```

#### Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | The input query string |
| `numResults` | number | No | 10 | Number of results (max 100 with "neural") |
| `includeDomains` | string[] | No | undefined | Domains to include |
| `excludeDomains` | string[] | No | undefined | Domains to exclude |
| `startCrawlDate` | string | No | undefined | Links crawled after this date |
| `endCrawlDate` | string | No | undefined | Links crawled before this date |
| `startPublishedDate` | string | No | undefined | Links published after this date |
| `endPublishedDate` | string | No | undefined | Links published before this date |
| `type` | string | No | "auto" | Search type: "auto", "neural", "fast", "deep" |
| `category` | string | No | undefined | Category filter (see categories below) |
| `includeText` | string[] | No | undefined | Text that must be present (1 string, max 5 words) |
| `excludeText` | string[] | No | undefined | Text that must not be present (1 string, max 5 words) |

#### Response Structure
```typescript
interface SearchResponse {
  autopromptString?: string;
  results: Result[];
}

interface Result {
  url: string;
  id: string;
  title: string | null;
  publishedDate?: string;
  author?: string;
}
```

#### Search Types
- **"auto"**: Automatically selects best search type
- **"neural"**: Most accurate semantic search (max 100 results)
- **"fast"**: Quick search with good results
- **"deep"**: Comprehensive search with query variations

#### Categories
Available categories: `"company"`, `"research paper"`, `"news"`, `"github"`, `"tweet"`, `"personal site"`, `"pdf"`, `"financial report"`, `"people"`

### `searchAndContents` Method

Performs a search and optionally retrieves full text content, highlights, context strings, or structured summaries.

#### Basic Usage
```typescript
// Search with full text content
const resultWithText = await exa.searchAndContents(
  "AI in healthcare",
  {
    text: true,
    numResults: 2
  }
);

// Search with highlights
const resultWithHighlights = await exa.searchAndContents(
  "AI in healthcare",
  {
    highlights: true,
    numResults: 2
  }
);

// Search with context (for RAG)
const resultWithContext = await exa.searchAndContents(
  "AI in healthcare",
  {
    context: true,
    numResults: 5
  }
);

// Deep search with query variations
const deepSearchResult = await exa.searchAndContents(
  "blog post about AI",
  {
    type: "deep",
    additionalQueries: ["AI blogpost", "machine learning blogs"],
    text: true,
    context: true,
  }
);
```

#### Key Parameters
- **`text`**: Boolean - Include full text content of results
- **`highlights`**: Boolean - Include highlighted relevant passages
- **`context`**: Boolean or Object - Include context strings for RAG
  - Can be `true` or `{ maxCharacters: number }`
- **`summary`**: Object - Generate structured summaries
  - Schema: `{ fields: string[], query: string }`
  - Or use a JSON schema for structured output
- **`additionalQueries`**: string[] - Additional query variations (deep search only)

#### Response Structure
```typescript
interface SearchResponse {
  results: SearchResult[];
}

interface SearchResult {
  url: string;
  id: string;
  title: string | null;
  publishedDate?: string;
  author?: string;
  text?: string;              // Full text (if text: true)
  highlights?: string[];      // Highlighted passages (if highlights: true)
  context?: string;           // Context string (if context: true)
  summary?: object;           // Structured summary (if summary provided)
}
```

#### Structured Summary Example
```typescript
const resultWithSummary = await exa.searchAndContents(
  "AI startups",
  {
    summary: {
      fields: ["company_name", "valuation", "founded_date"],
      query: "What are the key details about each AI startup?"
    },
    numResults: 5
  }
);

// Or with JSON schema
const resultWithSchema = await exa.searchAndContents(
  "AI startups",
  {
    summary: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "valuation": { "type": "string" },
        "founded": { "type": "string" }
      }
    },
    numResults: 5
  }
);
```

## Similarity Search Methods

### `findSimilar` Method

Finds similar URLs to a given URL or content.

#### Basic Usage
```typescript
// Find similar to a URL
const similar = await exa.findSimilar("https://example.com/article", {
  numResults: 5
});

// Find similar to content
const similarByContent = await exa.findSimilar(
  {
    text: "Article content here...",
    url: "https://example.com/article"
  },
  {
    numResults: 5
  }
);
```

#### Parameters
- **`url`** or **`{ text, url }`**: URL string or object with text and optional URL
- **`numResults`**: Number of similar results to return
- **`excludeOriginalUrl`**: Boolean - Exclude the original URL from results

#### Response
Returns `SearchResponse` with `Result[]` (same structure as `search`)

### `findSimilarAndContents` Method

Finds similar URLs and optionally includes full content, highlights, or context.

#### Usage
```typescript
const similarWithContent = await exa.findSimilarAndContents(
  "https://example.com/article",
  {
    text: true,
    highlights: true,
    numResults: 5
  }
);
```

#### Parameters
Same as `findSimilar`, plus content options (`text`, `highlights`, `context`, `summary`)

## Content Retrieval Methods

### `getContents` Method

Retrieves full content, highlights, or context for specific URLs.

#### Usage
```typescript
// Get full text
const contents = await exa.getContents(
  ["https://example.com/page1", "https://example.com/page2"],
  {
    text: true
  }
);

// Get highlights
const highlights = await exa.getContents(
  ["https://example.com/article"],
  {
    highlights: {
      numSentences: 5,
      highlightsPerUrl: 3
    }
  }
);

// Get context for RAG
const context = await exa.getContents(
  ["https://example.com/article"],
  {
    context: { maxCharacters: 5000 }
  }
);

// Get structured summaries
const summaries = await exa.getContents(
  ["https://example.com/article"],
  {
    summary: {
      fields: ["title", "main_points", "author"],
      query: "Summarize the key points of this article"
    }
  }
);
```

#### Parameters
- **`ids` or `urls`**: string[] - Array of document IDs or URLs
- **`text`**: Boolean - Include full text
- **`highlights`**: Boolean or Object - Include highlights
  - Object form: `{ numSentences: number, highlightsPerUrl: number }`
- **`context`**: Boolean or Object - Include context strings
  - Object form: `{ maxCharacters: number }`
- **`summary`**: Object - Generate structured summaries

#### Response
Returns `SearchResponse` with `SearchResult[]` containing requested content

## Answer Methods

### `answer` Method

Generates an answer to a question with citations from web search.

#### Usage
```typescript
const answer = await exa.answer(
  "What are the latest developments in quantum computing?",
  {
    text: true,  // Include full text in citations
    numResults: 5
  }
);

console.log(answer.answer);  // The generated answer
console.log(answer.citations);  // Array of cited sources
```

#### Parameters
- **`query`**: string - The question to answer
- **`text`**: Boolean - Include full text in citation chunks
- **`numResults`**: number - Number of sources to use

#### Response Structure
```typescript
interface AnswerResponse {
  answer: string;
  citations: Array<{
    id: string;
    url: string;
    title?: string;
    publishedDate?: string;
    author?: string;
    text?: string;  // If text: true
  }>;
}
```

### `streamAnswer` Method

Streams an answer with citations as it's generated.

#### Usage
```typescript
for await (const chunk of exa.streamAnswer(
  "What are the latest developments in quantum computing?",
  { text: true }
)) {
  if (chunk.content) {
    process.stdout.write(chunk.content);
  }
  if (chunk.citations) {
    console.log("Citations:", chunk.citations);
  }
}
```

#### Response Type
```typescript
interface AnswerStreamChunk {
  content?: string;  // Partial text content (streamed in chunks)
  citations?: Array<{
    id: string;
    url: string;
    title?: string;
    publishedDate?: string;
    author?: string;
    text?: string;
  }>;
}
```

## Research Methods

### `research.create` Method

Creates an asynchronous research task that performs multi-step web research.

#### Usage
```typescript
import Exa, { ResearchModel } from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY);

// With schema
const task = await exa.research.create({
  instructions: "What is the latest valuation of SpaceX?",
  outputSchema: {
    type: "object",
    properties: {
      valuation: { type: "string" },
      date: { type: "string" },
      source: { type: "string" }
    }
  }
});

// Without schema (schema will be inferred)
const simpleTask = await exa.research.create({
  instructions: "What are the main benefits of meditation?",
  outputSchema: undefined
});

console.log(`Task created with ID: ${task.researchId}`);
```

#### Parameters
- **`instructions`**: string - Natural language research instructions (Required)
- **`model`**: ResearchModel - `ResearchModel.exa_research` or `ResearchModel.exa_research_pro` (default: `exa_research`)
- **`outputSchema`**: object - Optional JSON schema for structured output (if undefined, schema is inferred)

#### Response
```typescript
interface CreateTaskResponse {
  researchId: string;
}
```

### `research.get` Method

Gets the current status and results of a research task.

#### Usage
```typescript
const researchId = "your-research-id-here";
const task = await exa.research.get(researchId);

console.log(`Task status: ${task.status}`);
if (task.status === "completed") {
  console.log(`Results: ${JSON.stringify(task.data)}`);
  console.log(`Citations: ${JSON.stringify(task.citations)}`);
}
```

#### Response Structure
```typescript
interface ResearchTask {
  researchId: string;
  status: "running" | "completed" | "failed";
  instructions: string;
  schema?: object;
  data?: object;  // Results when completed
  citations?: Record<string, Citation[]>;  // Citations grouped by field
}

interface Citation {
  id: string;
  url: string;
  title?: string;
  snippet: string;
}
```

### `research.pollUntilFinished` Method

Polls a research task until it completes or fails.

#### Usage
```typescript
const task = await exa.research.create({
  instructions: "Get information about Paris, France",
  outputSchema: {
    type: "object",
    properties: {
      name: { type: "string" },
      population: { type: "string" },
      founded_date: { type: "string" }
    }
  }
});

// Poll until completion (auto-polls every 1 second, 10 minute timeout)
const result = await exa.research.pollUntilFinished(task.researchId);
console.log(`Research complete: ${JSON.stringify(result.data)}`);
```

**Note**: Automatically polls every 1 second with a 10-minute timeout.

### `research.list` Method

Lists all research tasks with optional pagination.

#### Usage
```typescript
// List all tasks
const response = await exa.research.list();
console.log(`Found ${response.data.length} tasks`);

// List with pagination
const paginatedResponse = await exa.research.list({ limit: 10 });
if (paginatedResponse.hasMore) {
  const nextPage = await exa.research.list({
    cursor: paginatedResponse.nextCursor
  });
}
```

#### Parameters
- **`cursor`**: string - Pagination cursor from previous request
- **`limit`**: number - Number of results to return (1-200, default: 25)

#### Response
```typescript
interface ListTasksResponse {
  data: ResearchTask[];
  hasMore: boolean;
  nextCursor?: string;
}
```

## Best Practices

### Search Type Selection
- **Use "auto"** for general searches (default, good balance)
- **Use "neural"** for highest accuracy (max 100 results, higher cost)
- **Use "fast"** when speed is critical
- **Use "deep"** for comprehensive research with query variations

### Content Retrieval Strategies
1. **For RAG applications**: Use `context: true` or `context: { maxCharacters: 10000 }`
2. **For highlights**: Use `highlights: { numSentences: 3, highlightsPerUrl: 5 }`
3. **For full text**: Use `text: true` only when needed (higher token usage)
4. **For summaries**: Use structured `summary` with schemas for consistent output

### Research Task Patterns
```typescript
// Pattern 1: Simple research with inferred schema
const task = await exa.research.create({
  instructions: "Find top 5 AI startups and their valuations",
  outputSchema: undefined  // Schema will be inferred
});

// Pattern 2: Structured research with explicit schema
const structuredTask = await exa.research.create({
  instructions: "Research SpaceX valuation and recent funding rounds",
  outputSchema: {
    type: "object",
    properties: {
      valuation: { type: "string" },
      fundingRounds: {
        type: "array",
        items: {
          type: "object",
          properties: {
            amount: { type: "string" },
            date: { type: "string" },
            investors: { type: "array", items: { type: "string" } }
          }
        }
      },
      sources: { type: "array", items: { type: "string" } }
    }
  }
});

// Pattern 3: Poll until completion
const result = await exa.research.pollUntilFinished(task.researchId);

// Pattern 4: Manual polling
const pollTask = async (researchId: string) => {
  while (true) {
    const task = await exa.research.get(researchId);
    if (task.status === "completed") return task;
    if (task.status === "failed") throw new Error("Research failed");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  }
};
```

### Error Handling
```typescript
try {
  const result = await exa.search("query", { numResults: 10 });
  // Process results
} catch (error) {
  if (error.status === 429) {
    // Rate limited - implement backoff
    await new Promise(resolve => setTimeout(resolve, 5000));
  } else if (error.status === 401) {
    // Invalid API key
    throw new Error("Invalid EXA_API_KEY");
  } else {
    // Other errors
    console.error("Search failed:", error);
  }
}
```

### Rate Limiting
- Monitor rate limits and implement exponential backoff
- Use appropriate `numResults` limits (10-50 for most use cases)
- Cache results when possible to reduce API calls

### Date Filtering
```typescript
// Search for recent content (last 30 days)
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const recentResults = await exa.search("AI news", {
  startPublishedDate: thirtyDaysAgo.toISOString().split('T')[0],
  numResults: 20
});
```

### Domain Filtering
```typescript
// Focus on specific domains
const techNews = await exa.search("AI developments", {
  includeDomains: ["techcrunch.com", "theverge.com", "wired.com"],
  numResults: 10
});

// Exclude domains
const filteredResults = await exa.search("AI research", {
  excludeDomains: ["spam-site.com", "low-quality-blog.com"],
  numResults: 10
});
```

### Text Filtering
```typescript
// Results must contain specific text
const specificResults = await exa.search("machine learning", {
  includeText: ["deep learning"],  // Max 1 string, 5 words
  numResults: 10
});

// Exclude results with specific text
const filteredResults = await exa.search("AI news", {
  excludeText: ["sponsored"],  // Max 1 string, 5 words
  numResults: 10
});
```

## Integration Patterns

### Next.js API Route
```typescript
// app/api/exa/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { query, options } = await req.json();
    
    const result = await exa.search(query, options || {});
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: error.status || 500 }
    );
  }
}
```

### Streaming Answer Handler
```typescript
// app/api/exa/answer/route.ts
import { NextRequest } from "next/server";
import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY!);

export async function POST(req: NextRequest) {
  const { query, options } = await req.json();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of exa.streamAnswer(query, options || {})) {
          if (chunk.content) {
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
            );
          }
          if (chunk.citations) {
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ citations: chunk.citations })}\n\n`)
            );
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
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

### Research Task Handler
```typescript
// app/api/exa/research/route.ts
import { NextRequest, NextResponse } from "next/server";
import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { instructions, outputSchema, model } = await req.json();
    
    const task = await exa.research.create({
      instructions,
      outputSchema,
      model
    });
    
    return NextResponse.json({ researchId: task.researchId });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Research task creation failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const researchId = searchParams.get("id");
  
  if (!researchId) {
    return NextResponse.json(
      { error: "Research ID required" },
      { status: 400 }
    );
  }
  
  try {
    const task = await exa.research.get(researchId);
    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get research task" },
      { status: 500 }
    );
  }
}
```

## File Structure
```
lib/
  exa/
    client.ts          # Exa client initialization
    search.ts          # Search wrapper functions
    research.ts        # Research task helpers
app/
  api/
    exa/
      search/
        route.ts       # Search API endpoint
      answer/
        route.ts       # Answer API endpoint
      research/
        route.ts       # Research API endpoints
```

## Environment Variables
```bash
EXA_API_KEY=your-exa-api-key-here
```

## Type Definitions

### Core Types
```typescript
interface SearchResponse {
  autopromptString?: string;
  results: Result[];
}

interface Result {
  url: string;
  id: string;
  title: string | null;
  publishedDate?: string;
  author?: string;
}

interface SearchResult extends Result {
  text?: string;
  highlights?: string[];
  context?: string;
  summary?: object;
}

interface AnswerResponse {
  answer: string;
  citations: Citation[];
}

interface Citation {
  id: string;
  url: string;
  title?: string;
  publishedDate?: string;
  author?: string;
  text?: string;
  snippet?: string;
}
```

## References
- [Exa TypeScript SDK Documentation](https://exa.ai/docs/sdks/typescript-sdk-specification)
- [Exa API Dashboard](https://dashboard.exa.ai/)
- [Exa Search](https://exa.ai/)
