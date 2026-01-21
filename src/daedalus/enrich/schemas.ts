import { z } from "zod"

// ============================================
// Input Validation Schemas
// ============================================

// Profile enrichment - for individual person lookup
export const ProfileEnrichInputSchema = z.object({
  email: z.string().email().optional(),
  linkedin_url: z.string().url().optional(),
  name: z.string().min(1).optional(),
  // Company context (optional, helps disambiguation)
  company_domain: z.string().optional(),
  company_name: z.string().optional(),
}).refine(
  (data) => data.email || data.linkedin_url || data.name,
  { message: "At least one of email, linkedin_url, or name is required" }
)

// Company enrichment - for company/organization lookup  
export const CompanyEnrichInputSchema = z.object({
  domain: z.string().optional(),
  company_name: z.string().optional(),
  url: z.string().url().optional(),
  // Optional flags
  includeCompetitive: z.boolean().default(false),
  includeFunding: z.boolean().default(true),
  includeTechStack: z.boolean().default(true),
}).refine(
  (data) => data.domain || data.company_name || data.url,
  { message: "At least one of domain, company_name, or url is required" }
)

// Generic enrichment input (backward compatible)
export const EnrichInputSchema = z.object({
  email: z.string().email().optional(),
  domain: z.string().optional(),
  company_name: z.string().optional(),
  url: z.string().url().optional(),
}).refine(
  (data) => data.email || data.domain || data.company_name || data.url,
  { message: "At least one of email, domain, company_name, or url is required" }
)

// Batch enrichment row schema
export const BatchRowSchema = z.object({
  domain: z.string().optional(),
  email: z.string().email().optional(),
  company_name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  title: z.string().optional(),
}).refine(
  (data) => data.domain || data.email || data.company_name,
  { message: "Row must have at least domain, email, or company_name" }
)

export const BatchEnrichInputSchema = z.object({
  rows: z.array(z.record(z.string())).min(1).max(100),
  mapping: z.object({
    domain: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    company_name: z.string().nullable().optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
  }),
})

// ============================================
// Output Validation Schemas
// ============================================

export const DiscoveryOutputSchema = z.object({
  company_name: z.string(),
  domain: z.string(),
  website: z.string().url(),
  confidence: z.number().min(0).max(1),
  sources: z.array(z.string()),
  alternatives: z.array(z.object({
    name: z.string(),
    domain: z.string(),
    confidence: z.number(),
  })).optional(),
})

export const ProfileOutputSchema = z.object({
  industry: z.string().nullable(),
  segment: z.enum(["SMB", "Mid-Market", "Enterprise", "Unknown"]).default("Unknown"),
  headquarters: z.string().nullable(),
  employee_count: z.number().nullable(),
  employee_range: z.string().nullable(),
  year_founded: z.number().nullable(),
  business_type: z.string().nullable(),
  description: z.string().nullable(),
  sources: z.record(z.array(z.string())),
})

export const FundingOutputSchema = z.object({
  funding_stage: z.string().nullable(),
  total_funding: z.string().nullable(),
  last_round_date: z.string().nullable(),
  last_round_amount: z.string().nullable(),
  investors: z.array(z.string()),
  valuation: z.string().nullable(),
  is_public: z.boolean().default(false),
  sources: z.record(z.array(z.string())),
})

export const TechStackOutputSchema = z.object({
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

export const CustomFieldsOutputSchema = z.object({
  ceo_name: z.string().nullable(),
  key_executives: z.array(z.object({
    name: z.string(),
    title: z.string(),
    linkedin: z.string().nullable(),
  })),
  icp_fit_score: z.number().min(-1).max(100),
  icp_fit_reasons: z.array(z.string()),
  is_personal_site: z.boolean().default(false),
  pain_points: z.array(z.string()),
  buying_signals: z.array(z.object({
    signal: z.string(),
    confidence: z.number().min(0).max(1),
  })),
  competitive_landscape: z.array(z.string()),
  sources: z.record(z.array(z.string())),
})

// Full enrichment result schema for DB validation
export const EnrichmentResultSchema = z.object({
  discovery: DiscoveryOutputSchema,
  profile: ProfileOutputSchema,
  funding: FundingOutputSchema,
  techStack: TechStackOutputSchema,
  customFields: CustomFieldsOutputSchema,
  sources: z.array(z.string()),
})

// ============================================
// Type Exports
// ============================================

export type ProfileEnrichInput = z.infer<typeof ProfileEnrichInputSchema>
export type CompanyEnrichInput = z.infer<typeof CompanyEnrichInputSchema>
export type EnrichInput = z.infer<typeof EnrichInputSchema>
export type BatchEnrichInput = z.infer<typeof BatchEnrichInputSchema>
export type EnrichmentResultData = z.infer<typeof EnrichmentResultSchema>

// ============================================
// Validation Helpers
// ============================================

export function validateEnrichInput(input: unknown): { 
  success: true; data: EnrichInput 
} | { 
  success: false; error: string 
} {
  const result = EnrichInputSchema.safeParse(input)
  if (!result.success) {
    return { 
      success: false, 
      error: result.error.issues.map(i => i.message).join(", ") 
    }
  }
  return { success: true, data: result.data }
}

export function validateCompanyEnrichInput(input: unknown): {
  success: true; data: CompanyEnrichInput
} | {
  success: false; error: string
} {
  const result = CompanyEnrichInputSchema.safeParse(input)
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map(i => i.message).join(", ")
    }
  }
  return { success: true, data: result.data }
}

export function validateProfileEnrichInput(input: unknown): {
  success: true; data: ProfileEnrichInput
} | {
  success: false; error: string
} {
  const result = ProfileEnrichInputSchema.safeParse(input)
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map(i => i.message).join(", ")
    }
  }
  return { success: true, data: result.data }
}

export function validateEnrichmentResult(data: unknown): {
  success: true; data: EnrichmentResultData
} | {
  success: false; error: string; data: unknown
} {
  const result = EnrichmentResultSchema.safeParse(data)
  if (!result.success) {
    console.warn("[Enrich] Result validation failed:", result.error.issues)
    return {
      success: false,
      error: result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join("; "),
      data, // Return original for Safe Mode degradation
    }
  }
  return { success: true, data: result.data }
}
