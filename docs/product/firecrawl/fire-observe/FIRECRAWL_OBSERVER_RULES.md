# Firecrawl Observer - Cursor Rules

## Overview
This document defines patterns and best practices for implementing website change detection and monitoring features based on the canonical **Firecrawl Observer** repository patterns. Firecrawl Observer tracks changes on websites using content hash comparison and sends intelligent notifications.

**Source Repository**: https://github.com/firecrawl/firecrawl-observer

## Core Concept
Firecrawl Observer enables users to:
- **Monitor single pages or entire websites** for changes
- **Detect changes** using content hash comparison
- **Generate diffs** showing what changed
- **AI-powered analysis** to filter out noise
- **Flexible notifications** (email, webhooks, dashboard-only)
- **Encrypted API key storage** for Firecrawl and AI providers

## Architecture Pattern

### Change Detection Flow

```
Monitor created → Initial scrape → Save content hash
    ↓
Scheduled check (cron)
    ↓
Scrape current content → Generate hash
    ↓
Compare with last_hash
    ↓
If changed → Generate diff → AI analysis → Store change → Send notifications
    ↓
Update monitor with new hash
```

### Current Implementation Pattern

```
User creates monitor → Save URL + check_interval
    ↓
Manual check OR scheduled check (API route)
    ↓
Scrape via Firecrawl → Generate content hash
    ↓
Compare with last_content_hash
    ↓
If changed → AI summary → Save change record → Update hash
```

## Database Schema Pattern

### Monitors Table

```sql
CREATE TABLE monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  check_interval INTEGER DEFAULT 60, -- minutes
  last_checked_at TIMESTAMP WITH TIME ZONE,
  last_content_hash TEXT, -- Hash of last scrape
  last_excerpt TEXT, -- First 500 chars for diff preview
  monitoring_type TEXT DEFAULT 'single_page', -- 'single_page' or 'full_site'
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'archived'
  notification_webhook TEXT,
  notification_email TEXT,
  ai_threshold INTEGER DEFAULT 50, -- 0-100, minimum relevance score
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE monitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own monitors"
  ON monitors FOR ALL
  USING (auth.uid() = user_id);

-- Index for scheduled checks
CREATE INDEX idx_monitors_next_check ON monitors(status, last_checked_at)
WHERE status = 'active';
```

### Monitor Changes Table

```sql
CREATE TABLE monitor_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  old_hash TEXT,
  new_hash TEXT,
  old_excerpt TEXT,
  new_excerpt TEXT,
  diff_text TEXT, -- Generated diff
  ai_summary TEXT, -- AI-generated change summary
  ai_score INTEGER, -- 0-100 relevance score
  change_type TEXT, -- 'content', 'structure', 'removal', 'addition'
  metadata JSONB, -- Additional change metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Users can only see their own monitor changes"
  ON monitor_changes FOR ALL
  USING (auth.uid() = user_id);

-- Index for monitor history
CREATE INDEX idx_monitor_changes_monitor_id ON monitor_changes(monitor_id, created_at DESC);
```

## Content Hash Pattern

### Hash Generation

```typescript
// lib/monitors/hash.ts
function hashContent(content: string): string {
  // Simple hash function (can use crypto.createHash for production)
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

// Production: Use SHA-256 for better collision resistance
import { createHash } from "crypto";

function hashContentSecure(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}
```

### Change Detection Implementation

```typescript
// app/api/monitors/[id]/check/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [monitor] = await sql`
    SELECT * FROM monitors WHERE id = ${id} AND user_id = ${userId}
  `;
  
  if (!monitor) {
    return NextResponse.json({ error: "Monitor not found" }, { status: 404 });
  }
  
  // 1. Scrape current content
  const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: monitor.url,
      formats: ["markdown"], // or "html" for structure comparison
    }),
  });
  
  if (!scrapeResponse.ok) {
    return NextResponse.json({ error: "Failed to scrape URL" }, { status: 500 });
  }
  
  const scrapeData = await scrapeResponse.json();
  const content = scrapeData.data?.markdown || "";
  const newHash = hashContent(content);
  const excerpt = content.substring(0, 500); // First 500 chars for preview
  
  // 2. Compare with last hash
  const hasChanged = monitor.last_content_hash && monitor.last_content_hash !== newHash;
  
  // 3. If changed, process change
  if (hasChanged) {
    // Generate diff
    const diff = generateDiff(monitor.last_excerpt || "", excerpt);
    
    // AI summary (optional)
    let aiSummary = null;
    let aiScore = null;
    try {
      const { text: summary, score } = await analyzeChange(
        monitor.last_excerpt || "",
        excerpt,
        monitor.ai_threshold || 50
      );
      aiSummary = summary;
      aiScore = score;
    } catch (error) {
      console.error("AI analysis failed:", error);
    }
    
    // Only save if AI score meets threshold (if AI enabled)
    if (!monitor.ai_threshold || aiScore === null || aiScore >= monitor.ai_threshold) {
      // 4. Save change record
      await sql`
        INSERT INTO monitor_changes (
          monitor_id,
          old_hash,
          new_hash,
          old_excerpt,
          new_excerpt,
          diff_text,
          ai_summary,
          ai_score,
          change_type,
          user_id
        ) VALUES (
          ${id},
          ${monitor.last_content_hash},
          ${newHash},
          ${monitor.last_excerpt || null},
          ${excerpt},
          ${diff},
          ${aiSummary},
          ${aiScore},
          ${detectChangeType(diff)},
          ${userId}
        )
      `;
      
      // 5. Send notifications
      if (monitor.notification_email) {
        await sendEmailNotification(monitor, { diff, aiSummary, aiScore });
      }
      if (monitor.notification_webhook) {
        await sendWebhookNotification(monitor, { diff, aiSummary, aiScore });
      }
    }
  }
  
  // 6. Update monitor with new hash
  await sql`
    UPDATE monitors
    SET last_checked_at = NOW(),
        last_content_hash = ${newHash},
        last_excerpt = ${excerpt},
        updated_at = NOW()
    WHERE id = ${id}
  `;
  
  return NextResponse.json({
    success: true,
    changed: hasChanged,
    new_hash: newHash,
    ai_summary: hasChanged ? aiSummary : null,
    ai_score: hasChanged ? aiScore : null
  });
}
```

## Diff Generation Pattern

### Simple Diff Implementation

```typescript
// lib/monitors/diff.ts
import { diffLines, diffWords, diffChars } from "diff";

export function generateDiff(oldContent: string, newContent: string): string {
  // Line-based diff for readability
  const lineDiff = diffLines(oldContent, newContent);
  
  const diffParts: string[] = [];
  lineDiff.forEach((part) => {
    if (part.added) {
      diffParts.push(`+ ${part.value}`);
    } else if (part.removed) {
      diffParts.push(`- ${part.value}`);
    } else {
      // Context lines (unchanged)
      diffParts.push(`  ${part.value}`);
    }
  });
  
  return diffParts.join("\n");
}

// Word-based diff for finer granularity
export function generateWordDiff(oldContent: string, newContent: string): string {
  const wordDiff = diffWords(oldContent, newContent);
  
  const diffParts: string[] = [];
  wordDiff.forEach((part) => {
    if (part.added) {
      diffParts.push(`<ins>${part.value}</ins>`);
    } else if (part.removed) {
      diffParts.push(`<del>${part.value}</del>`);
    } else {
      diffParts.push(part.value);
    }
  });
  
  return diffParts.join("");
}
```

### Structured Diff Pattern

```typescript
// More advanced diff with change type detection
interface DiffResult {
  type: "addition" | "removal" | "modification" | "no_change";
  oldLength: number;
  newLength: number;
  changes: Array<{
    type: "added" | "removed" | "unchanged";
    content: string;
    lineNumber?: number;
  }>;
  similarity: number; // 0-1
}

export function generateStructuredDiff(
  oldContent: string,
  newContent: string
): DiffResult {
  const lineDiff = diffLines(oldContent, newContent);
  
  const changes = lineDiff.map((part, index) => ({
    type: part.added ? "added" as const : 
          part.removed ? "removed" as const : 
          "unchanged" as const,
    content: part.value,
    lineNumber: index + 1
  }));
  
  const added = lineDiff.filter(p => p.added).length;
  const removed = lineDiff.filter(p => p.removed).length;
  const unchanged = lineDiff.filter(p => !p.added && !p.removed).length;
  const total = lineDiff.length;
  const similarity = unchanged / total;
  
  let type: DiffResult["type"];
  if (added > 0 && removed === 0) type = "addition";
  else if (removed > 0 && added === 0) type = "removal";
  else if (added > 0 || removed > 0) type = "modification";
  else type = "no_change";
  
  return {
    type,
    oldLength: oldContent.length,
    newLength: newContent.length,
    changes,
    similarity
  };
}
```

## AI Analysis Pattern

### Change Relevance Scoring

```typescript
// lib/monitors/ai-analysis.ts
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

interface ChangeAnalysis {
  summary: string;
  score: number; // 0-100 relevance score
  changeType: string;
  reasoning: string;
}

export async function analyzeChange(
  oldContent: string,
  newContent: string,
  threshold: number = 50
): Promise<ChangeAnalysis> {
  // Generate AI summary and score
  const { text: rawAnalysis } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: `Analyze this webpage change and provide:
1. A concise 2-3 sentence summary of what changed
2. A relevance score from 0-100 (0 = noise like timestamps, 100 = significant content changes)
3. The type of change (content, structure, metadata, etc.)
4. Brief reasoning for the score

Old content excerpt:
${oldContent.substring(0, 1000)}

New content excerpt:
${newContent.substring(0, 1000)}

Respond in JSON format:
{
  "summary": "...",
  "score": 85,
  "changeType": "content",
  "reasoning": "..."
}`,
    maxTokens: 300
  });
  
  try {
    const analysis = JSON.parse(rawAnalysis) as ChangeAnalysis;
    
    // Filter out noise if score below threshold
    if (analysis.score < threshold) {
      return {
        ...analysis,
        summary: `Low relevance change detected (score: ${analysis.score})`
      };
    }
    
    return analysis;
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      summary: rawAnalysis,
      score: 50, // Default score
      changeType: "unknown",
      reasoning: "AI analysis completed but could not parse structured response"
    };
  }
}

function detectChangeType(diff: string): string {
  const hasAdditions = diff.includes("+");
  const hasRemovals = diff.includes("-");
  
  if (hasAdditions && hasRemovals) return "modification";
  if (hasAdditions) return "addition";
  if (hasRemovals) return "removal";
  return "no_change";
}
```

## Notification Pattern

### Email Notifications

```typescript
// lib/monitors/notifications.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailNotification(
  monitor: Monitor,
  changeData: {
    diff: string;
    aiSummary: string | null;
    aiScore: number | null;
  }
): Promise<void> {
  if (!monitor.notification_email) return;
  
  const html = `
    <h2>Change Detected: ${monitor.name}</h2>
    <p><strong>URL:</strong> <a href="${monitor.url}">${monitor.url}</a></p>
    <p><strong>Detected at:</strong> ${new Date().toLocaleString()}</p>
    
    ${changeData.aiSummary ? `
      <h3>AI Summary</h3>
      <p>${changeData.aiSummary}</p>
      ${changeData.aiScore ? `<p><strong>Relevance Score:</strong> ${changeData.aiScore}/100</p>` : ""}
    ` : ""}
    
    <h3>Content Diff</h3>
    <pre style="background: #f5f5f5; padding: 1rem; overflow-x: auto;">${escapeHtml(changeData.diff)}</pre>
    
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/observe/${monitor.id}">View full change history</a></p>
  `;
  
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "noreply@example.com",
    to: monitor.notification_email,
    subject: `Change Detected: ${monitor.name}`,
    html
  });
}
```

### Webhook Notifications

```typescript
export async function sendWebhookNotification(
  monitor: Monitor,
  changeData: {
    diff: string;
    aiSummary: string | null;
    aiScore: number | null;
  }
): Promise<void> {
  if (!monitor.notification_webhook) return;
  
  const payload = {
    event: "monitor.change_detected",
    monitor: {
      id: monitor.id,
      name: monitor.name,
      url: monitor.url
    },
    change: {
      detected_at: new Date().toISOString(),
      ai_summary: changeData.aiSummary,
      ai_score: changeData.aiScore,
      diff: changeData.diff
    }
  };
  
  try {
    const response = await fetch(monitor.notification_webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Firecrawl-Observer/1.0"
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      console.error(`Webhook failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("Webhook notification failed:", error);
  }
}
```

## Scheduling Pattern

### Check Due Monitors

```typescript
// app/api/monitors/check-all/route.ts
export async function POST(request: NextRequest) {
  // This would typically be called by a cron job
  const dueMonitors = await sql`
    SELECT *
    FROM monitors
    WHERE status = 'active'
      AND (
        last_checked_at IS NULL
        OR last_checked_at + (check_interval || ' minutes')::INTERVAL <= NOW()
      )
    LIMIT 10 -- Process in batches
  `;
  
  const results = await Promise.allSettled(
    dueMonitors.map(monitor => checkMonitor(monitor.id))
  );
  
  return NextResponse.json({
    checked: dueMonitors.length,
    successful: results.filter(r => r.status === "fulfilled").length,
    failed: results.filter(r => r.status === "rejected").length
  });
}

async function checkMonitor(monitorId: string): Promise<void> {
  // Use internal API endpoint
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/monitors/${monitorId}/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  });
  
  if (!response.ok) {
    throw new Error(`Check failed: ${response.statusText}`);
  }
}
```

## Best Practices

### Performance Optimization
1. **Batch processing**: Check monitors in batches to avoid rate limits
2. **Hash comparison**: Use fast hash comparison before expensive diff generation
3. **Excerpt storage**: Store only excerpts (500 chars) instead of full content
4. **Indexing**: Index `monitors(status, last_checked_at)` for efficient querying
5. **Caching**: Cache scraped content for monitors with short check intervals

### Error Handling
1. **Graceful degradation**: Continue checking other monitors if one fails
2. **Retry logic**: Retry failed scrapes with exponential backoff
3. **Timeout protection**: Set timeouts for all external API calls
4. **Error logging**: Log all errors to `monitor_changes` or separate error table

### Security
1. **RLS policies**: Ensure all tables have Row Level Security enabled
2. **Webhook validation**: Validate webhook URLs before saving
3. **API key encryption**: Encrypt Firecrawl API keys if stored per-user
4. **Input validation**: Validate URLs and check intervals

## Integration with Unified Suite

### Current Implementation
- **Location**: `app/api/monitors/`, `app/observe/`
- **Status**: Basic hash-based change detection implemented
- **Missing**: Diff generation, AI analysis, notifications, scheduling

### Suite-Level Enhancements Needed
1. **Diff library**: Add `diff` npm package for structured diffs
2. **AI integration**: Add AI analysis for change relevance scoring
3. **Email/Webhook**: Integrate Resend and webhook notification system
4. **Scheduler**: Implement cron-based monitor checking
5. **Change history**: Enhance UI to display change timeline and diffs

## File Structure
```
app/
  api/
    monitors/
      route.ts                    # List/create monitors
      [id]/
        route.ts                  # Get/update/delete monitor
        check/
          route.ts                # Check monitor for changes
      check-all/
        route.ts                  # Check all due monitors (cron)
  observe/
    page.tsx                      # List monitors
    [id]/
      page.tsx                    # Monitor detail + change history
lib/
  monitors/
    hash.ts                       # Content hash generation
    diff.ts                       # Diff generation
    ai-analysis.ts                # AI change analysis
    notifications.ts              # Email/webhook notifications
    scheduling.ts                 # Check interval calculation
components/
  monitors/
    MonitorList.tsx               # List of monitors
    MonitorCard.tsx               # Individual monitor display
    ChangeHistory.tsx             # Display change history
    DiffViewer.tsx                # Visual diff display
    CreateMonitorForm.tsx         # Create new monitor form
```

## Environment Variables
```bash
FIRECRAWL_API_KEY=fc-your-firecrawl-key
OPENAI_API_KEY=sk-your-openai-key  # For AI analysis (optional)
RESEND_API_KEY=re_your-resend-key  # For email notifications (optional)
EMAIL_FROM=noreply@yourdomain.com
```

## References
- [Firecrawl Observer Repository](https://github.com/firecrawl/firecrawl-observer)
- [Firecrawl Observer README](https://github.com/firecrawl/firecrawl-observer/blob/main/README.md)
