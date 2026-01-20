### Fire Enrich: Open Source Data Enrichment

Fire Enrich is an open-source data enrichment tool built by Mendable AI (the team behind Firecrawl) that transforms raw data (like email lists or company names) into rich, structured datasets. It leverages the Firecrawl API for web scraping and OpenAI's language models to find, verify, and structure information.

Unlike a single endpoint, Fire Enrich is a **complete application** and template you can deploy or run locally. It orchestrates multiple AI agents to research specific domains (e.g., funding, leadership, products) in parallel.

### Key Features

* **Multi-Agent Architecture**: Dedicated agents handle specific research tasks (e.g., "Fundraising Agent," "Leadership Agent") rather than a single prompt doing everything [^1].
* **Transparent Sources**: Every enriched data point includes the source URL where the information was found, allowing for verification [^2].
* **Real-Time Processing**: Data is researched live from the web rather than pulled from a static, potentially outdated database [^1].
* **Schema Flexibility**: Users can define exactly what fields they want to populate (e.g., company description, employee count, latest funding round) [^2].

### How to Use It

Fire Enrich is not just a single API call but a system you can set up. However, the core logic relies on Firecrawl's `/extract` endpoint and batch scraping capabilities.

#### 1. Deployment / Setup

You can run the Fire Enrich application locally or deploy it. It requires:

* **Firecrawl API Key**: For crawling and extracting data from the web.
* **OpenAI API Key**: For the reasoning agents that interpret the crawled data.
* **Node.js 18+**: The application is built in TypeScript/JavaScript [^1].

#### 2. Core Logic (Underlying API)

While Fire Enrich is the high-level tool, you can build similar enrichment workflows manually using the Firecrawl `/extract` endpoint. This endpoint allows you to pass a schema and prompt to extract specific structured data from a URL.

```bash
# Example of the underlying extraction logic used by enrichment agents
curl -X POST https://api.firecrawl.dev/v1/extract \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer YOUR_API_KEY' \
    -d '{
      "urls": ["https://company-website.com"],
      "prompt": "Extract the company description and latest funding round.",
      "schema": {
        "type": "object",
        "properties": {
          "company_description": {"type": "string"},
          "latest_funding": {"type": "string"}
        }
      }
    }'
``` [Source](https://github.com/mendableai/firecrawl/blob/main/apps/test-site/src/content/blog/launch-week-iii-day-3-extract-v2.md)

### Use Cases
*   **Lead Enrichment**: Upload a CSV of emails to get full company profiles, tech stacks, and decision-maker details [^3].
*   **Market Research**: Automatically gather funding data, competitor analysis, and industry trends.
*   **CRM Updates**: Keep CRM data fresh by periodically re-running enrichment to catch leadership changes or new product launches [^3].
 
 ---

 **How Each Agent Works**

Behind the scenes, each agent is a specialized module with its own expertise, search strategies, and type-safe output schema:
1. **Discovery Agent** (Phase 1)
   - Establishes company basics: official name, website, type of business
   - Essential first step that provides the foundation for all other agents
   - **Returns**: Company name, website URL, business type
   - **Schema**: `DiscoveryResult` with fields like `companyName`, `website`, `domain`
2. **Company Profile Agent** (Phase 2)
   - Uses verified company name to search for industry and market positioning
   - Builds on Discovery data to ensure accurate industry classification
   - **Returns**: Industry, sub-category, business model, market segment
   - **Schema**: `ProfileResult` with `industry`, `headquarters`, `yearFounded`, `companyType`
3. **Financial Intel Agent** (Phase 3)
   - Leverages company name + industry context for targeted funding searches
   - Knowing the industry helps identify relevant investor databases
   - **Returns**: Funding stage, total raised, key investors, valuation
   - **Schema**: `FundingResult` with `fundingStage`, `totalRaised`, `lastRoundAmount`, `investors`
4. **Tech Stack Agent** (Phase 4)
   - Analyzes technology with context of company type and funding stage
   - HTML analysis, GitHub repos, and technical documentation
   - **Returns**: Programming languages, frameworks, infrastructure, tools
   - **Uses**: Direct `EnrichmentResult` schema for flexible tech stack extraction
5. **General Purpose Agent** (Phase 5)
   - Handles custom fields (like CEO, competitors, etc.) with full context
   - Benefits from all previous data to make targeted searches
   - **Returns**: Any custom field requested by the user
   - **Uses**: Dynamic `EnrichmentResult` schema based on user-defined fields

### **Why Sequential Execution?**

The agents execute in a carefully designed sequence where each phase builds upon the previous one:
- **Context Building**: Each agent adds context that makes subsequent searches more accurate. For example, knowing a company's industry helps the funding agent search in the right venture databases.
- **Data Validation**: Later agents can validate and refine data from earlier phases.
- **Efficiency**: Prevents redundant searches by sharing discovered information across phases.
- **Parallel Searches Within Phases**: While agents run sequentially, each agent performs multiple searches in parallel, maximizing speed.

This architecture balances accuracy with performance - we could run all agents in parallel, but the sequential approach with shared context produces significantly better results.
