# Firecrawl AI Research Assistant - Cursor Rules

## Overview
This document defines patterns and best practices for building AI research assistants using Firecrawl and the AI SDK, based on the official Firecrawl cookbook.

## Architecture Pattern

### Core Components
1. **Frontend Chat Interface**: Uses AI Elements components for conversation UI
2. **API Route**: Handles streaming responses with tool calling
3. **Tools Module**: Defines Firecrawl scraping and search tools
4. **Environment Configuration**: API keys for OpenAI and Firecrawl

## Tool Creation Pattern

### Standard Tool Structure
All tools should follow this pattern:

```typescript
import { tool } from "ai";
import { z } from "zod";
import FirecrawlApp from "@mendable/firecrawl-js";

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

export const toolName = tool({
  description: 'Clear description of what the tool does',
  inputSchema: z.object({
    // Zod schema for input validation
    param: z.string().describe('Parameter description'),
  }),
  execute: async ({ param }) => {
    // Implementation with error handling
    console.log('Tool execution:', param);
    const result = await firecrawl.method(param, options);
    return { result: result.data };
  }
});
```

### Required Firecrawl Tools

#### Scrape Website Tool
- **Purpose**: Scrape content from any website URL
- **Input**: URL (validated as URL string)
- **Output**: Markdown content
- **Configuration**:
  - Use `formats: ['markdown']` for LLM-ready content
  - Set `onlyMainContent: true` to reduce token usage
  - Set `timeout: 30000` for reasonable timeout

#### Search Web Tool
- **Purpose**: Search the web using Firecrawl
- **Input**: Query string with optional filters (limit, location, tbs, sources, categories)
- **Output**: Structured results with titles, URLs, descriptions
- **Configuration**:
  - Support time filters: `qdr:h`, `qdr:d`, `qdr:w`, `qdr:m`, `qdr:y`
  - Support source types: `web`, `news`, `images`
  - Support categories: `github`, `research`, `pdf`

## API Route Pattern

### Standard API Route Structure
```typescript
import { streamText, UIMessage, stepCountIs, convertToModelMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { scrapeWebsiteTool, searchWebTool } from "@/lib/tools";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const maxDuration = 300; // 5 minutes for streaming

export async function POST(req: Request) {
  const { messages, model, webSearch } = await req.json();

  const result = streamText({
    model: openai(model),
    messages: convertToModelMessages(messages),
    system: "You are a helpful assistant that can answer questions and help with tasks.",
    tools: {
      scrapeWebsite: scrapeWebsiteTool,
      searchWeb: searchWebTool,
    },
    stopWhen: stepCountIs(5), // Prevent excessive tool calls
    toolChoice: webSearch ? "auto" : "none", // Conditional tool usage
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
```

### Key Configuration Points
- **maxDuration**: Set to 300 seconds (5 minutes) for streaming responses
- **stopWhen**: Use `stepCountIs(5)` to limit execution steps and prevent runaway costs
- **toolChoice**: Conditionally enable tools based on user preference (e.g., web search toggle)
- **sendSources**: Enable to show source URLs in UI
- **sendReasoning**: Enable to show model reasoning in UI

## Frontend Integration Pattern

### Required Dependencies
```json
{
  "ai": "latest",
  "@ai-sdk/react": "latest",
  "@ai-sdk/openai": "latest",
  "@mendable/firecrawl-js": "latest",
  "zod": "latest"
}
```

### AI Elements Setup
Run `npx ai-elements@latest` to scaffold UI components:
- Conversation components
- Message displays
- Prompt inputs
- Tool call visualizations

### Message Flow
1. User sends message via `useChat` hook
2. Frontend sends request to `/api/chat` with model and web search settings
3. Backend processes and streams response
4. UI displays tool calls and responses in real-time

## Best Practices

### Tool Usage
1. **Use searchWeb first**: When finding relevant pages, use `searchWeb` to discover URLs before scraping
2. **Scrape selectively**: Use `scrapeWebsite` for single pages or when you have a specific URL
3. **Let AI decide**: When `toolChoice: "auto"`, let the model determine which tools to use

### Performance Optimization
1. **Stream responses**: Always use streaming for immediate user feedback
2. **Limit content**: Use `onlyMainContent: true` to reduce token usage
3. **Set timeouts**: Configure reasonable timeouts (30 seconds default)
4. **Cache frequently accessed content**: Consider caching for repeated queries

### Cost Management
1. **Monitor API usage**: Track Firecrawl and OpenAI API usage
2. **Set step limits**: Use `stopWhen: stepCountIs(5)` to prevent excessive tool calls
3. **Conditional tool usage**: Only enable tools when needed (web search toggle)

### Error Handling
1. **Tool-level errors**: Include try-catch in tool execute functions
2. **User-facing errors**: Consider adding user-friendly error messages
3. **Graceful degradation**: Handle API failures without breaking the UI

### Security
1. **Environment variables**: Never commit API keys; use `.env.local`
2. **Input validation**: Always validate tool inputs with Zod schemas
3. **URL validation**: Validate URLs before scraping

## Customization Patterns

### Adding New Tools
Follow the standard tool structure:
1. Define Zod schema for inputs
2. Implement execute function with Firecrawl or other APIs
3. Register in API route `tools` object
4. Tool will be automatically available to the model

### Changing AI Models
The AI SDK supports 20+ providers. Example:
```typescript
import { anthropic } from "@ai-sdk/anthropic";

const result = streamText({
  model: anthropic("claude-4.5-sonnet"),
  // ... rest of config
});
```

### UI Customization
- AI Elements components are built on shadcn/ui
- Modify component styles in component files
- Add new variants to existing components
- Create custom components matching the design system

## File Structure
```
app/
  api/
    chat/
      route.ts          # API route with streamText and tools
  page.tsx              # Frontend chat interface
lib/
  tools.ts              # Firecrawl tool definitions
.env.local             # API keys (OPENAI_API_KEY, FIRECRAWL_API_KEY)
```

## Environment Variables
```bash
OPENAI_API_KEY=sk-your-openai-api-key
FIRECRAWL_API_KEY=fc-your-firecrawl-api-key
```

## References
- [AI SDK Documentation](https://ai-sdk.dev/docs)
- [AI Elements Components](https://ai-sdk.dev/elements/overview)
- [Firecrawl Documentation](https://docs.firecrawl.dev)
- [Original Cookbook](https://docs.firecrawl.dev/developer-guides/cookbooks/ai-research-assistant-cookbook)
