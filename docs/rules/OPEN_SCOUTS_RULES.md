# Open Scouts - Cursor Rules

## Overview
This document defines patterns and best practices for implementing scheduled web monitoring features based on the canonical **Open Scouts** repository patterns. Open Scouts creates AI-powered "scouts" that continuously search the web and notify users when they find relevant information.

**Source Repository**: https://github.com/Monichre/open-scouts (forked from https://github.com/firecrawl/open-scouts)

## Core Concept
Open Scouts enables users to create automated "scouts" that:
- **Run on schedules** (hourly, daily, weekly, custom)
- **Search multiple engines** (Serper, Exa, Firecrawl) in parallel
- **Deduplicate results** using `seen_urls` tracking
- **Generate AI summaries** with vector embeddings for semantic search
- **Send email notifications** when new results are found
- **Track execution history** with detailed step-by-step logs

## Architecture Pattern

### Dispatcher-Based Scheduling

```
pg_cron (every minute)
    ↓
dispatch_due_scouts() SQL function
    ↓
Find scouts where next_run_at <= NOW()
    ↓
For each scout → pg_net HTTP POST to Edge Function
    ↓
Edge Function executes scout (isolated)
    ↓
Save results, update seen_urls, schedule next run
```

### Current Implementation: In-Process Scheduling

```
User creates scout → Save to `scouts` table
    ↓
Manual execution OR scheduled check (Next.js API route)
    ↓
Parallel search (Serper + Exa + Firecrawl)
    ↓
Deduplicate via `seen_urls` column
    ↓
Insert new results → Update seen_urls → Save execution log
```

## Database Schema Pattern

### Scouts Table

```sql
CREATE TABLE scouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  search_query TEXT NOT NULL,
  schedule TEXT DEFAULT 'manual', -- 'hourly', 'daily', 'weekly', 'manual'
  next_run_at TIMESTAMP WITH TIME ZONE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  seen_urls TEXT[] DEFAULT '{}', -- Array of URLs already processed
  notification_email TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE scouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own scouts"
  ON scouts FOR ALL
  USING (auth.uid() = user_id);
```

### Scout Results Table

```sql
CREATE TABLE scout_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  url TEXT NOT NULL,
  title TEXT,
  snippet TEXT,
  source TEXT, -- 'serper', 'exa', 'firecrawl'
  metadata JSONB,
  ai_summary TEXT, -- One-sentence summary
  summary_embedding VECTOR(1536), -- OpenAI embedding for semantic search
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scout_id, url) -- Prevent duplicate URLs per scout
);

-- RLS Policy
CREATE POLICY "Users can only see their own scout results"
  ON scout_results FOR ALL
  USING (auth.uid() = user_id);
```

### Execution Tracking

```sql
CREATE TABLE scout_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id UUID NOT NULL REFERENCES scouts(id),
  user_id UUID NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  results_found INTEGER DEFAULT 0,
  new_results_count INTEGER DEFAULT 0,
  error_message TEXT
);

CREATE TABLE scout_execution_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES scout_executions(id) ON DELETE CASCADE,
  step_type TEXT, -- 'search', 'deduplication', 'scraping', 'summarization'
  step_data JSONB,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Deduplication Pattern

### URL-Based Deduplication

```typescript
// Key pattern: Store seen URLs in scouts.seen_urls array
interface Scout {
  id: string;
  search_query: string;
  seen_urls: string[]; // Array of URLs already processed
  last_run_at: Date | null;
}

// Deduplication logic
async function executeScout(scout: Scout) {
  // 1. Parallel search across multiple engines
  const [serperResults, exaResults, firecrawlResults] = await Promise.all([
    searchSerper(scout.search_query),
    searchExa(scout.search_query),
    searchFirecrawl(scout.search_query)
  ]);
  
  // 2. Combine results
  const allResults = [...serperResults, ...exaResults, ...firecrawlResults];
  
  // 3. Deduplicate using seen_urls
  const seenUrls = new Set(scout.seen_urls || []);
  const newResults = allResults.filter(result => !seenUrls.has(result.url));
  
  // 4. Insert new results
  for (const result of newResults) {
    await sql`
      INSERT INTO scout_results (scout_id, url, title, snippet, source, user_id)
      VALUES (${scout.id}, ${result.url}, ${result.title}, ${result.snippet}, ${result.source}, ${scout.user_id})
      ON CONFLICT (scout_id, url) DO NOTHING
    `;
  }
  
  // 5. Update seen_urls with new URLs
  const updatedSeenUrls = [...seenUrls, ...newResults.map(r => r.url)];
  await sql`
    UPDATE scouts
    SET seen_urls = ${updatedSeenUrls},
        last_run_at = NOW(),
        next_run_at = calculateNextRun(schedule)
    WHERE id = ${scout.id}
  `;
  
  // 6. Generate AI summaries for new results (optional)
  if (newResults.length > 0) {
    await generateSummaries(newResults);
  }
  
  return {
    total_searched: allResults.length,
    duplicates_removed: allResults.length - newResults.length,
    new_results: newResults.length
  };
}
```

### Implementation Example

```typescript
// app/api/scouts/[id]/run/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [scout] = await sql`
    SELECT * FROM scouts WHERE id = ${id} AND user_id = ${userId}
  `;
  
  if (!scout) {
    return NextResponse.json({ error: "Scout not found" }, { status: 404 });
  }
  
  // Parallel search
  const [serperResults, exaResults, firecrawlResults] = await Promise.all([
    searchSerper(scout.search_query),
    searchExa(scout.search_query),
    searchFirecrawl(scout.search_query)
  ]);
  
  // Combine and deduplicate
  const allResults = [...serperResults, ...exaResults, ...firecrawlResults];
  const seenUrls = new Set(scout.seen_urls || []);
  const newResults = allResults.filter((r: { url: string }) => !seenUrls.has(r.url));
  
  // Insert new results
  let insertedCount = 0;
  for (const result of newResults) {
    await sql`
      INSERT INTO scout_results (scout_id, url, title, snippet, source, metadata, user_id)
      VALUES (${id}, ${result.url}, ${result.title}, ${result.snippet}, ${result.source}, ${JSON.stringify(result)}, ${userId})
      ON CONFLICT (scout_id, url) DO NOTHING
    `;
    insertedCount++;
  }
  
  // Update scout with new seen URLs
  const newSeenUrls = [...seenUrls, ...newResults.map((r: { url: string }) => r.url)];
  await sql`
    UPDATE scouts 
    SET seen_urls = ${newSeenUrls}, 
        last_run_at = NOW(), 
        next_run_at = calculateNextRun(schedule),
        updated_at = NOW()
    WHERE id = ${id}
  `;
  
  return NextResponse.json({
    success: true,
    new_results: insertedCount,
    total_searched: allResults.length,
    duplicates_removed: allResults.length - newResults.length
  });
}
```

## Multi-Engine Search Pattern

### Parallel Search Implementation

```typescript
// lib/scouts/search-engines.ts

async function searchSerper(query: string): Promise<SearchResult[]> {
  if (!process.env.SERPER_API_KEY) return [];
  
  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: 20 }),
  });
  
  if (!response.ok) return [];
  
  const data = await response.json();
  return (data.organic || []).map((r: { link: string; title: string; snippet: string }) => ({
    url: r.link,
    title: r.title,
    snippet: r.snippet,
    source: "serper",
  }));
}

async function searchExa(query: string): Promise<SearchResult[]> {
  if (!process.env.EXA_API_KEY) return [];
  
  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "x-api-key": process.env.EXA_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      num_results: 10,
      type: "neural",
    }),
  });
  
  if (!response.ok) return [];
  
  const data = await response.json();
  return (data.results || []).map((r: { url: string; title: string; text: string }) => ({
    url: r.url,
    title: r.title,
    snippet: r.text,
    source: "exa",
  }));
}

async function searchFirecrawl(query: string): Promise<SearchResult[]> {
  if (!process.env.FIRECRAWL_API_KEY) return [];
  
  try {
    const firecrawl = getFirecrawlClient();
    const results = await firecrawl.search(query, { limit: 20 });
    
    return results.map((r: any) => ({
      url: r.url,
      title: r.title || r.url,
      snippet: r.description || r.snippet || "",
      source: "firecrawl",
    }));
  } catch {
    return [];
  }
}

// Combined search
export async function searchAllEngines(query: string): Promise<SearchResult[]> {
  const [serper, exa, firecrawl] = await Promise.all([
    searchSerper(query),
    searchExa(query),
    searchFirecrawl(query)
  ]);
  
  return [...serper, ...exa, ...firecrawl];
}
```

## AI Summary Generation Pattern

### Summary with Vector Embeddings

```typescript
// Generate one-sentence summary with embedding for semantic search
async function generateSummaries(results: SearchResult[]): Promise<void> {
  for (const result of results) {
    try {
      // Generate summary using LLM
      const { text: summary } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: `Summarize this search result in one sentence: ${result.title} - ${result.snippet}`,
        maxTokens: 100
      });
      
      // Generate embedding for semantic search
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: summary
      });
      
      // Update result with summary and embedding
      await sql`
        UPDATE scout_results
        SET ai_summary = ${summary},
            summary_embedding = ${JSON.stringify(embedding.data[0].embedding)}::vector
        WHERE url = ${result.url}
      `;
    } catch (error) {
      console.error(`Failed to generate summary for ${result.url}:`, error);
    }
  }
}
```

### Semantic Search Pattern

```typescript
// Search scout results using semantic similarity
async function searchScoutResults(
  scoutId: string,
  query: string,
  limit: number = 10
): Promise<ScoutResult[]> {
  // Generate query embedding
  const queryEmbedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query
  });
  
  // Semantic search using pgvector
  const results = await sql`
    SELECT *, 
           1 - (summary_embedding <=> ${JSON.stringify(queryEmbedding.data[0].embedding)}::vector) as similarity
    FROM scout_results
    WHERE scout_id = ${scoutId}
      AND summary_embedding IS NOT NULL
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;
  
  return results;
}
```

## Scheduling Pattern

### Next Run Calculation

```typescript
function calculateNextRun(schedule: string): Date {
  const now = new Date();
  
  switch (schedule) {
    case "hourly":
      return new Date(now.getTime() + 60 * 60 * 1000);
    case "daily":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "manual":
      return null; // No automatic scheduling
    default:
      // Custom interval parsing: "every 3 days", "every 12 hours"
      const match = schedule.match(/every (\d+) (hour|day|week)s?/i);
      if (match) {
        const amount = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        const multiplier = unit === "hour" ? 60 * 60 * 1000 :
                          unit === "day" ? 24 * 60 * 60 * 1000 :
                          7 * 24 * 60 * 60 * 1000;
        return new Date(now.getTime() + amount * multiplier);
      }
      return null;
  }
}
```

### Cron-Based Dispatcher (Production Pattern)

```sql
-- PostgreSQL function to dispatch due scouts
CREATE OR REPLACE FUNCTION dispatch_due_scouts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  scout_record RECORD;
  edge_function_url TEXT;
  supabase_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Get Supabase credentials from vault
  SELECT decrypted_secret INTO supabase_url
  FROM vault.decrypted_secrets
  WHERE name = 'SUPABASE_URL';
  
  SELECT decrypted_secret INTO service_role_key
  FROM vault.decrypted_secrets
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';
  
  edge_function_url := supabase_url || '/functions/v1/scout-cron';
  
  -- Find due scouts
  FOR scout_record IN
    SELECT id, user_id
    FROM scouts
    WHERE status = 'active'
      AND (next_run_at IS NULL OR next_run_at <= NOW())
    LIMIT 10 -- Process in batches
  LOOP
    -- Dispatch to edge function via pg_net
    PERFORM net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'scout_id', scout_record.id,
        'user_id', scout_record.user_id
      )
    );
  END LOOP;
END;
$$;

-- Schedule dispatcher to run every minute
SELECT cron.schedule(
  'dispatch-due-scouts',
  '* * * * *', -- Every minute
  $$SELECT dispatch_due_scouts()$$
);
```

## Email Notification Pattern

### Resend Integration

```typescript
// lib/scouts/notifications.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendScoutNotification(
  scout: Scout,
  newResults: ScoutResult[]
): Promise<void> {
  if (!scout.notification_email || newResults.length === 0) {
    return;
  }
  
  const html = `
    <h2>New Results for Scout: ${scout.name}</h2>
    <p>Query: "${scout.search_query}"</p>
    <p>Found ${newResults.length} new result(s):</p>
    <ul>
      ${newResults.map(result => `
        <li>
          <strong><a href="${result.url}">${result.title || result.url}</a></strong><br/>
          ${result.snippet || ""}<br/>
          <small>Source: ${result.source} | ${new Date(result.created_at).toLocaleString()}</small>
        </li>
      `).join("")}
    </ul>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/scouts/${scout.id}">View all results</a></p>
  `;
  
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "noreply@example.com",
    to: scout.notification_email,
    subject: `New Results: ${scout.name} (${newResults.length} found)`,
    html,
  });
}
```

## Streaming Execution Pattern

### Server-Sent Events for Real-Time Progress

```typescript
// app/api/scouts/[id]/run/stream/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: { type: string; data: any }) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      };
      
      try {
        send({ type: "init", data: { message: "Starting scout execution..." } });
        
        // Get scout
        const [scout] = await sql`SELECT * FROM scouts WHERE id = ${id}`;
        if (!scout) {
          send({ type: "error", data: { message: "Scout not found" } });
          controller.close();
          return;
        }
        
        // Phase 1: Parallel searches
        send({ type: "search_start", data: { message: "Searching across engines..." } });
        
        const [serper, exa, firecrawl] = await Promise.all([
          searchSerper(scout.search_query).then(results => {
            send({ type: "search_complete", data: { engine: "serper", count: results.length } });
            return results;
          }),
          searchExa(scout.search_query).then(results => {
            send({ type: "search_complete", data: { engine: "exa", count: results.length } });
            return results;
          }),
          searchFirecrawl(scout.search_query).then(results => {
            send({ type: "search_complete", data: { engine: "firecrawl", count: results.length } });
            return results;
          })
        ]);
        
        // Phase 2: Deduplication
        const allResults = [...serper, ...exa, ...firecrawl];
        const seenUrls = new Set(scout.seen_urls || []);
        const newResults = allResults.filter(r => !seenUrls.has(r.url));
        
        send({
          type: "deduplication",
          data: {
            total: allResults.length,
            duplicates: allResults.length - newResults.length,
            new: newResults.length
          }
        });
        
        if (newResults.length === 0) {
          send({ type: "complete", data: { message: "No new results found" } });
          controller.close();
          return;
        }
        
        // Phase 3: Save results
        send({ type: "saving", data: { message: `Saving ${newResults.length} new results...` } });
        // ... save logic ...
        
        // Phase 4: Generate summaries
        send({ type: "summarizing", data: { message: "Generating AI summaries..." } });
        // ... summary generation ...
        
        send({ type: "complete", data: { new_results: newResults.length } });
        controller.close();
      } catch (error) {
        send({ type: "error", data: { message: error.message } });
        controller.close();
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

## Best Practices

### Performance Optimization
1. **Parallel searches**: Always use `Promise.all()` for multi-engine searches
2. **Batch processing**: Process scouts in batches to avoid overwhelming API rate limits
3. **Deduplication**: Use array-based `seen_urls` for O(1) lookup performance
4. **Indexing**: Create indexes on `scouts.next_run_at` and `scout_results(scout_id, url)`
5. **Caching**: Cache search results for identical queries within short time windows

### Error Handling
1. **Graceful degradation**: If one search engine fails, continue with others
2. **Retry logic**: Implement retry with exponential backoff for transient failures
3. **Timeout protection**: Set timeouts for all external API calls
4. **Error logging**: Log all errors to `scout_executions` table for debugging

### Security
1. **RLS policies**: Ensure all tables have Row Level Security enabled
2. **User isolation**: All queries must filter by `user_id`
3. **API key storage**: Store sensitive API keys in environment variables or vault
4. **Input validation**: Validate search queries and schedule formats

## Integration with Unified Suite

### Current Implementation
- **Location**: `app/api/scouts/`, `lib/scouts/`
- **Status**: Basic multi-engine search and deduplication implemented
- **Missing**: Scheduled execution, AI summaries, email notifications

### Suite-Level Enhancements Needed
1. **Scheduler**: Implement cron-based dispatcher or use pg_cron
2. **Edge Functions**: Move scout execution to isolated edge functions for scalability
3. **Vector embeddings**: Add pgvector extension and embedding generation
4. **Email notifications**: Integrate Resend for email alerts
5. **Execution tracking**: Add detailed step-by-step execution logs

## File Structure
```
app/
  api/
    scouts/
      route.ts                    # List/create scouts
      [id]/
        route.ts                  # Get/update/delete scout
        run/
          route.ts                # Execute scout (synchronous)
          stream/
            route.ts              # Execute scout with SSE streaming
lib/
  scouts/
    search-engines.ts             # Multi-engine search functions
    notifications.ts              # Email notification logic
    scheduling.ts                 # Next run calculation
    summaries.ts                  # AI summary generation
components/
  scouts/
    ScoutList.tsx                 # List of user's scouts
    ScoutCard.tsx                 # Individual scout display
    ScoutResults.tsx              # Display scout results
    CreateScoutForm.tsx           # Create new scout form
```

## Environment Variables
```bash
SERPER_API_KEY=your-serper-key
EXA_API_KEY=your-exa-key
FIRECRAWL_API_KEY=fc-your-firecrawl-key
OPENAI_API_KEY=sk-your-openai-key  # For summaries and embeddings
RESEND_API_KEY=re_your-resend-key  # For email notifications
EMAIL_FROM=noreply@yourdomain.com
```

## References
- [Open Scouts Repository](https://github.com/Monichre/open-scouts)
- [Original Open Scouts Repository](https://github.com/firecrawl/open-scouts)
- [Open Scouts README](https://github.com/Monichre/open-scouts/blob/main/README.md)
