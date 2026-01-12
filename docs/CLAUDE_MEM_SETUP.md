# Claude-Mem Setup Guide for Cursor IDE

## What is claude-mem?

**claude-mem** is an MCP (Model Context Protocol) server that gives Claude persistent memory across sessions. It allows Claude to:

- **Remember** important project details, decisions, and context
- **Search** past conversations and observations
- **Track** project evolution over time
- **Maintain** context across multiple sessions

## Installation

### 1. Install the MCP Server

```bash
# Install globally with npm
npm install -g @anthropic-ai/claude-mem

# Or with pnpm
pnpm add -g @anthropic-ai/claude-mem

# Or with yarn
yarn global add @anthropic-ai/claude-mem
```

### 2. Verify Installation

```bash
# Check if installed
which claude-mem

# Should output something like:
# /usr/local/bin/claude-mem
```

## Cursor Configuration

### 3. Configure MCP Settings

1. Open Cursor Settings (`Cmd+,` on Mac, `Ctrl+,` on Windows/Linux)
2. Search for "MCP" or navigate to Extensions → MCP
3. Click "Edit MCP Settings" or create `~/.cursor/mcp.json`

### 4. Add claude-mem to MCP Config

Create or edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "claude-mem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/claude-mem"],
      "env": {
        "CLAUDE_MEM_PROJECT": "digital-mischief-group"
      }
    }
  }
}
```

**Alternative using global installation:**

```json
{
  "mcpServers": {
    "claude-mem": {
      "command": "claude-mem",
      "args": [],
      "env": {
        "CLAUDE_MEM_PROJECT": "digital-mischief-group"
      }
    }
  }
}
```

### 5. Restart Cursor

After editing the config:
1. Quit Cursor completely (`Cmd+Q` on Mac)
2. Reopen Cursor
3. Open your project

## How to Use claude-mem

### 3-Layer Workflow (Token-Efficient)

**ALWAYS follow this pattern to save tokens:**

#### Layer 1: Search (Index with IDs)
```
Search for relevant memories without fetching full details
→ Returns ~50-100 tokens per result
```

#### Layer 2: Timeline (Context Around Results)
```
Get surrounding context for interesting results
→ Provides chronological context
```

#### Layer 3: Get Observations (Full Details)
```
Fetch full details ONLY for filtered IDs
→ 10x token savings vs fetching everything
```

### Common Commands

#### Save Important Information
```
Claude, remember that we're using:
- Next.js 16 App Router
- PostgreSQL with Kysely ORM
- Firecrawl API for web scraping
- Multi-LLM provider architecture
```

#### Search Past Conversations
```
Search for discussions about authentication implementation
```

#### Track Decisions
```
Remember: We decided to use Better Auth instead of NextAuth because
it has better TypeScript support and modern patterns.
```

#### Project Context
```
Save to memory: The Enrich module uses multi-phase agent orchestration
with discovery → profile → funding → tech stack agents.
```

### Best Practices

**DO:**
- ✅ Store architectural decisions and reasoning
- ✅ Save key implementation patterns
- ✅ Record bugs and their solutions
- ✅ Track API endpoints and their purposes
- ✅ Note environment variable requirements

**DON'T:**
- ❌ Store secrets or API keys
- ❌ Save large code blocks (use file references instead)
- ❌ Duplicate information already in code/docs
- ❌ Fetch all observations without filtering first

## Verification

### Check if claude-mem is Working

Ask Claude:
```
Search memory for "digital-mischief-group"
```

If configured correctly, Claude will use the search tool and return results.

## Troubleshooting

### Issue: "MCP server not found"

**Solution:**
1. Verify installation: `which claude-mem`
2. Check MCP config path: `~/.cursor/mcp.json`
3. Restart Cursor completely

### Issue: "Permission denied"

**Solution:**
```bash
# Make executable
chmod +x $(which claude-mem)
```

### Issue: "No memories found"

**Solution:**
- First session has no memories yet
- Start by asking Claude to remember key project details
- Memories persist across sessions automatically

### Issue: "High token usage"

**Solution:**
- Use the 3-layer workflow (search → timeline → get_observations)
- Don't fetch full details without filtering first
- Ask Claude to use the efficient search pattern

## Project-Specific Setup

For this Digital Mischief Group project, I recommend saving:

1. **Architecture Overview**
   - Module structure (Enrich, Brand Recon, Scouts, Observe, Research)
   - Tech stack and key dependencies
   - Database schema patterns

2. **Key Patterns**
   - Multi-phase agent orchestration
   - LLM provider abstraction
   - Firecrawl integration patterns

3. **Important Decisions**
   - Why certain libraries were chosen
   - Authentication/billing setup reasoning
   - API design patterns

4. **Common Tasks**
   - How to add new agents
   - How to add new API endpoints
   - How to run migrations

## Integration with This Project

The project already has extensive documentation:
- `CLAUDE.md` - Project configuration (this file you're reading)
- `PRD.md` - Product requirements
- `PLAN.md` - Implementation plan

**Use claude-mem for:**
- Session-to-session continuity
- Quick recall of past discussions
- Tracking implementation progress
- Recording issues and solutions

**Use project docs for:**
- Canonical source of truth
- Detailed specifications
- Code conventions and patterns

## Next Steps

1. ✅ Install claude-mem globally
2. ✅ Configure `~/.cursor/mcp.json`
3. ✅ Restart Cursor
4. ✅ Ask Claude to search memory (verify it works)
5. ✅ Start saving important project context

---

**Questions?** Ask Claude to search this guide or the project documentation!
