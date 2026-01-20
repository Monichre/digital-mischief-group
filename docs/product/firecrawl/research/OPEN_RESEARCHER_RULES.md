# Open Researcher - Cursor Rules

## Overview
This document defines patterns and best practices for implementing visual AI research assistant features based on the canonical **Open Researcher** repository patterns. Open Researcher combines Firecrawl's web scraping with AI reasoning to provide split-view analysis with real-time thinking and automatic citations.

**Source Repository**: https://github.com/firecrawl/open-researcher

## Core Concept
Open Researcher provides:
- **Split-view UI** with three panels: Thinking, Sources, Synthesis
- **Real-time thinking display** showing AI reasoning process
- **Streaming reasoning** with Server-Sent Events (SSE)
- **Automatic citations** with source tracking
- **Multi-engine search** (Perplexity, Exa, Serper, Firecrawl)
- **Live web data** via Firecrawl scraping

## Architecture Pattern

### Split-View Layout

```
┌─────────────────────────────────────────────────────────┐
│  Research Query Input                                    │
├──────────────┬──────────────────────┬───────────────────┤
│              │                      │                   │
│  THINKING    │   SYNTHESIS          │   SOURCES         │
│  PANEL       │   PANEL              │   PANEL           │
│              │                      │                   │
│  Real-time   │   Streaming Answer   │   Citation List   │
│  Reasoning   │   with Citations     │   with Links      │
│              │                      │                   │
└──────────────┴──────────────────────┴───────────────────┘
```

### Streaming Flow

```
User Query → Search Engines (parallel) → Scrape Sources (parallel)
    ↓                                              ↓
Firecrawl Scraping → Content Extraction → AI Reasoning (streaming)
    ↓                                              ↓
Thinking Events → Synthesis Chunks → Source Citations
    ↓                                              ↓
Update UI (real-time) → Complete → Save Mission
```

## UI Components Pattern

### Split-View Layout Component

```typescript
// app/research/live/page.tsx
'use client';
import { ThinkingPanel } from '@/components/research/ThinkingPanel';
import { SynthesisPanel } from '@/components/research/SynthesisPanel';
import { SourcePanel } from '@/components/research/SourcePanel';

export default function LiveResearchPage() {
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<ResearchStreamEvent[]>([]);
  const [sources, setSources] = useState<SourceFoundEvent['data'][]>([]);
  const [synthesis, setSynthesis] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  
  return (
    <div className="h-screen flex flex-col">
      {/* Query Input */}
      <div className="p-4 border-b">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
          placeholder="Enter your research query..."
          className="w-full"
        />
      </div>
      
      {/* Split View */}
      <div className="flex-1 grid grid-cols-3 gap-0 overflow-hidden">
        <ThinkingPanel events={events} isComplete={!isResearching} />
        <SynthesisPanel content={synthesis} isStreaming={isResearching} isComplete={!isResearching} />
        <SourcePanel sources={sources} />
      </div>
    </div>
  );
}
```

### Thinking Panel Component

```typescript
// components/research/ThinkingPanel.tsx
interface ThinkingPanelProps {
  events: ResearchStreamEvent[];
  isComplete: boolean;
}

export function ThinkingPanel({ events, isComplete }: ThinkingPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);
  
  const renderEvent = (event: ResearchStreamEvent, index: number) => {
    switch (event.type) {
      case 'thinking':
        return (
          <div key={index} className="flex items-start gap-3 p-3 bg-zinc-900/50 rounded border border-zinc-800">
            <Brain className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-zinc-300 font-mono text-sm whitespace-pre-wrap">
                {event.data.thought}
              </p>
              {event.data.action && (
                <div className="mt-2 text-xs text-zinc-500">
                  → {event.data.action}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'source_found':
        return (
          <div key={index} className="flex items-center gap-3 p-3 bg-blue-500/10 rounded border border-blue-500/30">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="text-blue-400 font-mono text-sm">{event.data.title}</span>
          </div>
        );
      
      case 'error':
        return (
          <div key={index} className="flex items-center gap-3 p-3 bg-red-500/10 rounded border border-red-500/30">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-500 font-mono text-sm">{event.data.message}</span>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-zinc-950 border-r border-zinc-800">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="font-mono text-sm text-orange-500 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          // THINKING LOG
        </h3>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {events.map((event, i) => renderEvent(event, i))}
        {!isComplete && events.length > 0 && (
          <div className="flex items-center gap-2 p-2 text-zinc-500">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-xs font-mono">Researching...</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Synthesis Panel Component

```typescript
// components/research/SynthesisPanel.tsx
interface SynthesisPanelProps {
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
}

export function SynthesisPanel({ content, isStreaming, isComplete }: SynthesisPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current && isStreaming) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content, isStreaming]);
  
  return (
    <div className="h-full flex flex-col bg-zinc-950 border-r border-zinc-800">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="font-mono text-sm text-green-500 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          // SYNTHESIS
        </h3>
        {content && (
          <div className="flex gap-2">
            <button onClick={handleCopy}>
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
            <button onClick={handleDownload}>
              <FileDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        {content ? (
          <ReactMarkdown className="prose prose-invert max-w-none">
            {content}
          </ReactMarkdown>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600">
            {isStreaming ? (
              <>
                <Loader2 className="w-8 h-8 mb-2 animate-spin text-green-500" />
                <p className="font-mono text-sm">Generating synthesis...</p>
              </>
            ) : (
              <>
                <FileText className="w-8 h-8 mb-2 opacity-50" />
                <p className="font-mono text-sm">Answer will appear here</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Source Panel Component

```typescript
// components/research/SourcePanel.tsx
interface SourcePanelProps {
  sources: Array<{
    title: string;
    url: string;
    snippet?: string;
    relevance?: number;
  }>;
}

export function SourcePanel({ sources }: SourcePanelProps) {
  return (
    <div className="h-full flex flex-col bg-zinc-950">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="font-mono text-sm text-blue-500 flex items-center gap-2">
          <Link className="w-4 h-4" />
          // SOURCES ({sources.length})
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-zinc-900/50 rounded border border-zinc-800 hover:border-blue-500/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-zinc-200 truncate">
                  {source.title}
                </h4>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                  {source.snippet}
                </p>
                <p className="text-xs text-zinc-600 mt-2 truncate">
                  {source.url}
                </p>
              </div>
              {source.relevance && (
                <span className="text-xs text-zinc-500 flex-shrink-0">
                  {Math.round(source.relevance * 100)}%
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
```

## Streaming Pattern

### Server-Sent Events (SSE) Implementation

```typescript
// app/api/research/stream/route.ts
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ResearchStreamEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      
      try {
        // Phase 1: Search
        send({ type: 'thinking', data: { thought: 'Searching for relevant sources...', action: 'search' } });
        
        const [perplexity, exa, serper] = await Promise.all([
          searchPerplexity(query),
          searchExa(query),
          searchSerper(query)
        ]);
        
        // Phase 2: Scrape sources
        const sourcesToScrape = [
          ...perplexity.citations.map(url => ({ url, title: url })),
          ...exa.map(r => ({ url: r.url, title: r.title })),
          ...serper.map(r => ({ url: r.link, title: r.title }))
        ].slice(0, 10); // Limit to 10 sources
        
        send({ type: 'thinking', data: { thought: `Found ${sourcesToScrape.length} sources. Scraping content...`, action: 'scrape' } });
        
        const scrapedSources = await Promise.all(
          sourcesToScrape.map(async (source) => {
            send({ type: 'source_found', data: { title: source.title, url: source.url } });
            try {
              const firecrawl = getFirecrawlClient();
              const result = await firecrawl.scrape(source.url, { formats: ['markdown'] });
              return {
                url: source.url,
                title: source.title,
                content: result.data?.markdown || '',
                snippet: result.data?.markdown?.substring(0, 200) || ''
              };
            } catch {
              return { url: source.url, title: source.title, content: '', snippet: '' };
            }
          })
        );
        
        // Phase 3: AI Synthesis with streaming
        send({ type: 'synthesis_start', data: {} });
        
        const combinedContent = scrapedSources
          .map(s => `## ${s.title}\n\n${s.content.substring(0, 2000)}`)
          .join('\n\n---\n\n');
        
        const result = streamText({
          model: anthropic('claude-3-5-sonnet-20241022'),
          prompt: `Based on the following sources, provide a comprehensive answer to: "${query}"\n\nSources:\n${combinedContent}`,
          system: 'You are a research assistant. Provide detailed, well-structured answers with inline citations [Source: title].'
        });
        
        // Stream synthesis chunks
        for await (const chunk of result.textStream) {
          send({ type: 'synthesis_chunk', data: { content: chunk } });
        }
        
        send({ type: 'complete', data: { sources: scrapedSources.length } });
        controller.close();
      } catch (error) {
        send({ type: 'error', data: { message: error.message } });
        controller.close();
      }
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

### Client-Side SSE Consumption

```typescript
// app/research/live/page.tsx
const handleResearch = useCallback(async () => {
  setIsResearching(true);
  setEvents([]);
  setSources([]);
  setSynthesis('');
  
  const response = await fetch('/api/research/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  
  const reader = response.body?.getReader();
  if (!reader) return;
  
  const decoder = new TextDecoder();
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const event = JSON.parse(line.slice(6)) as ResearchStreamEvent;
          setEvents(prev => [...prev, event]);
          
          if (event.type === 'source_found') {
            setSources(prev => [...prev, event.data]);
          } else if (event.type === 'synthesis_chunk') {
            setSynthesis(prev => prev + event.data.content);
          } else if (event.type === 'complete') {
            setIsResearching(false);
          }
        } catch {
          // Skip malformed events
        }
      }
    }
  }
}, [query]);
```

## Event Types Pattern

### Stream Event Types

```typescript
// lib/research/stream-types.ts
export type ResearchStreamEvent =
  | { type: 'thinking'; data: { thought: string; action?: string } }
  | { type: 'source_found'; data: { title: string; url: string; snippet?: string } }
  | { type: 'synthesis_start'; data: {} }
  | { type: 'synthesis_chunk'; data: { content: string } }
  | { type: 'complete'; data: { sources: number } }
  | { type: 'error'; data: { message: string } };

export interface SourceFoundEvent {
  type: 'source_found';
  data: {
    title: string;
    url: string;
    snippet?: string;
    relevance?: number;
  };
}
```

## Multi-Engine Search Pattern

### Parallel Search Implementation

```typescript
// lib/research/search-engines.ts
export async function searchAllEngines(query: string): Promise<{
  perplexity: { content: string; citations: string[] };
  exa: Array<{ title: string; url: string; text: string }>;
  serper: Array<{ title: string; link: string; snippet: string }>;
  firecrawl: Array<{ title: string; url: string; content: string }>;
}> {
  const [perplexity, exa, serper] = await Promise.all([
    searchPerplexity(query),
    searchExa(query),
    searchSerper(query)
  ]);
  
  // Firecrawl search
  const firecrawlResults = await searchFirecrawl(query);
  
  return { perplexity, exa, serper, firecrawl: firecrawlResults };
}
```

## Citation Pattern

### Inline Citations in Synthesis

```typescript
// Generate citations during synthesis
const result = streamText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  prompt: `Answer: "${query}"\n\nSources:\n${combinedSources}\n\nInclude inline citations like [Source: Title] when referencing specific information.`,
  system: 'You are a research assistant. Always cite sources inline using [Source: Title] format.'
});
```

### Citation Extraction from Response

```typescript
// Extract citations from AI response
function extractCitations(text: string, sources: Source[]): Array<{
  text: string;
  citation: { title: string; url: string };
}> {
  const citationRegex = /\[Source: ([^\]]+)\]/g;
  const citations: Array<{ text: string; citation: { title: string; url: string } }> = [];
  
  let match;
  while ((match = citationRegex.exec(text)) !== null) {
    const sourceTitle = match[1];
    const source = sources.find(s => s.title === sourceTitle);
    if (source) {
      citations.push({
        text: match[0],
        citation: { title: source.title, url: source.url }
      });
    }
  }
  
  return citations;
}
```

## Best Practices

### Performance
1. **Parallel searches**: Use `Promise.all()` for multi-engine searches
2. **Batch scraping**: Limit concurrent scrapes to avoid rate limits
3. **Content truncation**: Limit scraped content length (first 2000 chars) for LLM context
4. **Streaming**: Always use streaming for long-form synthesis
5. **Debouncing**: Debounce user input in search queries

### UX
1. **Real-time feedback**: Show thinking events immediately
2. **Auto-scroll**: Auto-scroll panels during streaming
3. **Loading states**: Clear loading indicators for each phase
4. **Error handling**: Graceful error messages in thinking panel
5. **Progress indication**: Show progress percentage when possible

### Security
1. **Input validation**: Sanitize user queries
2. **URL validation**: Validate URLs before scraping
3. **Rate limiting**: Implement rate limits per user
4. **Content filtering**: Filter malicious content from scraped sources

## Integration with Unified Suite

### Current Implementation
- **Location**: `app/research/`, `components/research/`, `app/api/research/`
- **Status**: Split-view UI and streaming implemented
- **Enhancements Needed**: Source relevance scoring, citation highlighting, research history

## File Structure
```
app/
  research/
    page.tsx                      # Research missions list
    live/
      page.tsx                    # Live research interface
  api/
    research/
      route.ts                    # Create/list missions
      stream/
        route.ts                  # Streaming research endpoint
components/
  research/
    ThinkingPanel.tsx             # Real-time thinking display
    SynthesisPanel.tsx            # Streaming answer display
    SourcePanel.tsx               # Source list with links
lib/
  research/
    stream-types.ts               # Event type definitions
    search-engines.ts             # Multi-engine search functions
```

## Environment Variables
```bash
ANTHROPIC_API_KEY=sk-ant-your-key  # For AI synthesis
PERPLEXITY_API_KEY=pplx-your-key   # For search
EXA_API_KEY=your-exa-key           # For search
SERPER_API_KEY=your-serper-key     # For Google search
FIRECRAWL_API_KEY=fc-your-key      # For web scraping
```

## References
- [Open Researcher Repository](https://github.com/firecrawl/open-researcher)
- [Open Researcher README](https://github.com/firecrawl/open-researcher/blob/main/README.md)
