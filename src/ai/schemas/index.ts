import { z } from "zod"

// Source attribution - URLs where data was found
const SourcesSchema = z.record(z.string(), z.array(z.string()))

// Discovery Agent Output
export const DiscoveryResultSchema = z.object({
  company_name: z.string(),
  domain: z.string(),
  website: z.string().url(),
  confidence: z.number().min(0).max(1),
  sources: z.array(z.string()),
  alternatives: z
    .array(
      z.object({
        name: z.string(),
        domain: z.string(),
        confidence: z.number(),
      })
    )
    .optional(),
})

// Company Profile Agent Output
export const CompanyProfileResultSchema = z.object({
  industry: z.string().nullable(),
  segment: z.enum(["SMB", "Mid-Market", "Enterprise", "Unknown"]).default("Unknown"),
  headquarters: z.string().nullable(),
  employee_count: z.number().nullable(),
  employee_range: z.string().nullable(),
  year_founded: z.number().nullable(),
  business_type: z.string().nullable(),
  description: z.string().nullable(),
  sources: SourcesSchema,
})

// Funding Agent Output
export const FundingResultSchema = z.object({
  funding_stage: z.string().nullable(),
  total_funding: z.string().nullable(),
  last_round_date: z.string().nullable(),
  last_round_amount: z.string().nullable(),
  investors: z.array(z.string()),
  valuation: z.string().nullable(),
  is_public: z.boolean().default(false),
  sources: SourcesSchema,
})

// Tech Stack Agent Output
export const TechStackResultSchema = z.object({
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  infrastructure: z.array(z.string()),
  tools: z.array(z.string()),
  signals: z.object({
    ai_adoption: z.boolean().default(false),
    modern_stack: z.boolean().default(false),
    cloud_native: z.boolean().default(false),
  }),
  sources: z.array(z.string()),
})

// Custom Fields Agent Output
export const CustomFieldsResultSchema = z.object({
  ceo_name: z.string().nullable(),
  key_executives: z.array(
    z.object({
      name: z.string(),
      title: z.string(),
      linkedin: z.string().nullable(),
    })
  ),
  icp_fit_score: z.number().min(-1).max(100), // -1 indicates personal/portfolio site
  icp_fit_reasons: z.array(z.string()),
  is_personal_site: z.boolean().default(false),
  pain_points: z.array(z.string()),
  buying_signals: z.array(
    z.object({
      signal: z.string(),
      confidence: z.number().min(0).max(1),
    })
  ),
  competitive_landscape: z.array(z.string()),
  sources: SourcesSchema,
})

// Firecrawl extraction schemas (JSON Schema format for API)
export const DISCOVERY_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    company_name: { type: "string", description: "Official company name" },
    domain: { type: "string", description: "Primary domain (e.g., example.com)" },
    website: { type: "string", description: "Full website URL" },
    description: { type: "string", description: "Brief company description" },
  },
  required: ["company_name"],
}

export const COMPANY_PROFILE_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    industry: { type: "string", description: "Primary industry or sector" },
    headquarters: { type: "string", description: "HQ location (city, state/country)" },
    employee_count: { type: "number", description: "Approximate number of employees" },
    employee_range: { type: "string", description: "Employee range like '50-200'" },
    year_founded: { type: "number", description: "Year the company was founded" },
    business_type: { type: "string", description: "B2B, B2C, B2B2C, etc." },
    description: { type: "string", description: "Company description or mission" },
  },
}

export const FUNDING_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    funding_stage: { type: "string", description: "Current stage: Seed, Series A, B, C, etc." },
    total_funding: { type: "string", description: "Total raised, e.g., '$50M'" },
    last_round_date: { type: "string", description: "Date of most recent round" },
    last_round_amount: { type: "string", description: "Amount of last round" },
    investors: {
      type: "array",
      items: { type: "string" },
      description: "List of investors",
    },
    valuation: { type: "string", description: "Company valuation if known" },
    is_public: { type: "boolean", description: "Whether company is publicly traded" },
  },
}

export const TECH_STACK_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    technologies: {
      type: "array",
      items: { type: "string" },
      description: "All technologies, frameworks, tools mentioned",
    },
    infrastructure: {
      type: "array",
      items: { type: "string" },
      description: "Cloud providers, hosting, CDN",
    },
    engineering_blog: { type: "string", description: "URL to engineering/tech blog if exists" },
  },
}

export const LEADERSHIP_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    executives: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          title: { type: "string" },
          linkedin: { type: "string" },
        },
      },
      description: "Key executives and leadership team",
    },
    ceo_name: { type: "string", description: "CEO or founder name" },
  },
}
