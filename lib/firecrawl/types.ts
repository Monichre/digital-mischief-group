// Firecrawl Types for DMG Intelligence Suite

// Company enrichment schema for extraction
export const COMPANY_ENRICHMENT_SCHEMA = {
  type: "object",
  properties: {
    company: {
      type: "object",
      properties: {
        name: { type: "string", description: "Official company name" },
        description: { type: "string", description: "Company description or tagline" },
        industry: { type: "string", description: "Primary industry or sector" },
        founded: { type: "string", description: "Year founded" },
        headquarters: { type: "string", description: "Headquarters location" },
        size: { type: "string", description: "Company size (e.g., '50-200 employees')" },
        website: { type: "string", description: "Official website URL" },
      },
    },
    social: {
      type: "object",
      properties: {
        linkedin: { type: "string", description: "LinkedIn company page URL" },
        twitter: { type: "string", description: "Twitter/X profile URL" },
        facebook: { type: "string", description: "Facebook page URL" },
        crunchbase: { type: "string", description: "Crunchbase profile URL" },
      },
    },
    contact: {
      type: "object",
      properties: {
        emails: { type: "array", items: { type: "string" }, description: "Contact email addresses" },
        phones: { type: "array", items: { type: "string" }, description: "Contact phone numbers" },
      },
    },
    leadership: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          title: { type: "string" },
          linkedin: { type: "string" },
        },
      },
      description: "Key leadership/executives",
    },
    technology: {
      type: "array",
      items: { type: "string" },
      description: "Technologies and tools used",
    },
    funding: {
      type: "object",
      properties: {
        total: { type: "string", description: "Total funding raised" },
        lastRound: { type: "string", description: "Most recent funding round" },
        investors: { type: "array", items: { type: "string" }, description: "Notable investors" },
      },
    },
  },
  required: ["company"],
}

export interface CompanyEnrichmentData {
  company: {
    name?: string
    description?: string
    industry?: string
    founded?: string
    headquarters?: string
    size?: string
    website?: string
  }
  social?: {
    linkedin?: string
    twitter?: string
    facebook?: string
    crunchbase?: string
  }
  contact?: {
    emails?: string[]
    phones?: string[]
  }
  leadership?: Array<{
    name?: string
    title?: string
    linkedin?: string
  }>
  technology?: string[]
  funding?: {
    total?: string
    lastRound?: string
    investors?: string[]
  }
}

export interface EnrichmentJob {
  id: string
  input_type: "url" | "email" | "domain" | "company_name"
  input_value: string
  normalized_url?: string
  domain?: string
  company_name?: string
  company_description?: string
  company_logo?: string
  company_industry?: string
  company_size?: string
  company_founded?: string
  company_headquarters?: string
  company_website?: string
  linkedin_url?: string
  twitter_url?: string
  facebook_url?: string
  crunchbase_url?: string
  contact_emails?: string[]
  contact_phones?: string[]
  tech_stack?: string[]
  funding_total?: string
  funding_rounds?: unknown[]
  investors?: string[]
  key_people?: Array<{ name?: string; title?: string; linkedin?: string }>
  raw_response?: unknown
  status: "pending" | "processing" | "completed" | "failed"
  error_message?: string
  created_at: string
  updated_at: string
}

export interface BrandExtraction {
  id: string
  input_url: string
  normalized_url: string
  domain: string
  color_scheme?: string
  logo_url?: string
  colors?: Record<string, string>
  fonts?: Array<{ family: string }>
  typography?: Record<string, unknown>
  spacing?: Record<string, unknown>
  components?: Record<string, unknown>
  images?: Record<string, string>
  animations?: Record<string, unknown>
  layout?: Record<string, unknown>
  personality?: Record<string, unknown>
  site_title?: string
  site_description?: string
  screenshot_url?: string
  status: "pending" | "processing" | "completed" | "failed"
  error_message?: string
  created_at: string
  updated_at: string
}
