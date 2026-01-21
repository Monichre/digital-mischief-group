/**
 * Enrich Workflow Guardrails
 * 
 * Implements T-003 acceptance criteria:
 * - Enforce distinct entry points for profile vs company enrichment
 * - Safe Mode plan (discovery + profile only) on planning failure
 * - Schema validation before DB writes
 * - CSV path checks for job state, row-level errors, export parity
 */

import type { EnrichmentInput, EnrichmentContext, AgentPhase } from "@/ai/types"
import type { ConductorDecision } from "@/ai/orchestrators/enrich.orchestrator"

// ============================================
// Entry Point Type Detection
// ============================================

export type EnrichmentType = "profile" | "company"

/**
 * Determines if input is for profile (person) or company enrichment.
 * Profile: email, linkedin URL, or personal name
 * Company: domain, company URL, or company name
 */
export function detectEnrichmentType(input: EnrichmentInput): EnrichmentType {
  // Email indicates person lookup
  if (input.email) {
    return "profile"
  }
  
  // URL with linkedin indicates person
  if (input.url?.includes("linkedin.com/in/")) {
    return "profile"
  }
  
  // Domain or company URL indicates company
  if (input.domain || input.url) {
    return "company"
  }
  
  // Company name - could be either, default to company
  if (input.company_name) {
    return "company"
  }
  
  // Fallback to company
  return "company"
}

// ============================================
// Safe Mode Planning
// ============================================

/**
 * Safe Mode plan - used when LLM planning fails or on errors.
 * Runs only essential phases: discovery + profile.
 * Skips funding, tech_stack to reduce failure surface.
 */
export function getSafeModePlan(
  discovery: EnrichmentContext["discovery"]
): ConductorDecision[] {
  const isLowConfidence = discovery && discovery.confidence < 0.5
  const reason = isLowConfidence 
    ? "Safe Mode: Low confidence discovery, minimal enrichment" 
    : "Safe Mode: Running essential phases only"

  return [
    { 
      phase: "company_profile", 
      action: "run", 
      reason: "Safe Mode: Essential firmographic data" 
    },
    { 
      phase: "funding", 
      action: "skip", 
      reason 
    },
    { 
      phase: "tech_stack", 
      action: "skip", 
      reason 
    },
    { 
      phase: "custom_fields", 
      action: "run", 
      reason: "Safe Mode: ICP scoring still valuable" 
    },
  ]
}

/**
 * Checks if we should fall back to Safe Mode based on error conditions
 */
export function shouldUseSafeMode(
  planningError: Error | null,
  discovery: EnrichmentContext["discovery"]
): boolean {
  // Planning failed entirely
  if (planningError) {
    console.warn("[Guardrails] Using Safe Mode due to planning error:", planningError.message)
    return true
  }
  
  // Very low confidence discovery
  if (discovery && discovery.confidence < 0.3) {
    console.warn("[Guardrails] Using Safe Mode due to very low discovery confidence:", discovery.confidence)
    return true
  }
  
  return false
}

// ============================================
// Competitive Analysis Guardrails
// ============================================

/**
 * Ensures competitive analysis is only run when explicitly requested.
 * Default company enrichment EXCLUDES competitive analysis.
 */
export function shouldIncludeCompetitive(options: {
  includeCompetitive?: boolean
  enrichmentType: EnrichmentType
}): boolean {
  // Must be explicitly toggled on
  if (options.includeCompetitive !== true) {
    return false
  }
  
  // Only makes sense for company enrichment
  if (options.enrichmentType !== "company") {
    console.warn("[Guardrails] Competitive analysis only available for company enrichment")
    return false
  }
  
  return true
}

// ============================================
// Result Sanitization
// ============================================

/**
 * Sanitizes enrichment results before DB write.
 * Ensures all fields are safe, removes nullish arrays, etc.
 */
export function sanitizeEnrichmentData<T extends Record<string, unknown>>(data: T): T {
  const sanitized = { ...data }
  
  for (const [key, value] of Object.entries(sanitized)) {
    // Convert undefined to null for DB consistency
    if (value === undefined) {
      (sanitized as Record<string, unknown>)[key] = null
    }
    
    // Empty arrays to empty arrays (not null)
    if (Array.isArray(value) && value.length === 0) {
      (sanitized as Record<string, unknown>)[key] = []
    }
    
    // Nested objects
    if (value && typeof value === "object" && !Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = sanitizeEnrichmentData(value as Record<string, unknown>)
    }
  }
  
  return sanitized
}

// ============================================
// CSV/Batch Guardrails
// ============================================

export interface RowValidationResult {
  valid: boolean
  rowIndex: number
  error?: string
  warnings?: string[]
}

/**
 * Validates a batch row before processing
 */
export function validateBatchRow(
  row: Record<string, string>,
  mapping: Record<string, string | null>,
  rowIndex: number
): RowValidationResult {
  const warnings: string[] = []
  
  // Check if we have at least one usable identifier
  const domain = mapping.domain ? row[mapping.domain] : undefined
  const email = mapping.email ? row[mapping.email] : undefined
  const companyName = mapping.company_name ? row[mapping.company_name] : undefined
  
  if (!domain && !email && !companyName) {
    return {
      valid: false,
      rowIndex,
      error: "No domain, email, or company name found in row",
    }
  }
  
  // Validate email format if present
  if (email && !email.includes("@")) {
    return {
      valid: false,
      rowIndex,
      error: `Invalid email format: ${email}`,
    }
  }
  
  // Warn about suspicious domains
  if (domain) {
    const lowerDomain = domain.toLowerCase()
    if (
      lowerDomain.includes("example.com") ||
      lowerDomain.includes("test.com") ||
      lowerDomain.includes("localhost")
    ) {
      warnings.push(`Suspicious domain: ${domain}`)
    }
  }
  
  return {
    valid: true,
    rowIndex,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

/**
 * Tracks batch job state for consistency checking
 */
export interface BatchJobState {
  batchId: string
  totalRows: number
  processedRows: number
  successfulRows: number
  failedRows: number
  errors: Array<{ rowIndex: number; error: string }>
}

export function createBatchJobState(batchId: string, totalRows: number): BatchJobState {
  return {
    batchId,
    totalRows,
    processedRows: 0,
    successfulRows: 0,
    failedRows: 0,
    errors: [],
  }
}

export function updateBatchJobState(
  state: BatchJobState,
  rowIndex: number,
  success: boolean,
  error?: string
): BatchJobState {
  return {
    ...state,
    processedRows: state.processedRows + 1,
    successfulRows: success ? state.successfulRows + 1 : state.successfulRows,
    failedRows: success ? state.failedRows : state.failedRows + 1,
    errors: error 
      ? [...state.errors, { rowIndex, error }]
      : state.errors,
  }
}

/**
 * Validates that export data matches stored enrichment results
 */
export function validateExportParity(
  storedData: Record<string, unknown>,
  exportedData: Record<string, unknown>,
  criticalFields: string[]
): { valid: boolean; mismatches: string[] } {
  const mismatches: string[] = []
  
  for (const field of criticalFields) {
    const stored = JSON.stringify(storedData[field])
    const exported = JSON.stringify(exportedData[field])
    
    if (stored !== exported) {
      mismatches.push(field)
    }
  }
  
  return {
    valid: mismatches.length === 0,
    mismatches,
  }
}

// ============================================
// Logging Helpers
// ============================================

export function logSafeModeActivation(
  reason: string,
  input: EnrichmentInput
): void {
  console.warn("[Guardrails] Safe Mode activated", {
    reason,
    input: {
      email: input.email ? "***" : undefined,
      domain: input.domain,
      company_name: input.company_name,
      url: input.url,
    },
    timestamp: new Date().toISOString(),
  })
}

export function logEnrichmentGuardrailViolation(
  violation: string,
  context: Record<string, unknown>
): void {
  console.error("[Guardrails] Violation detected", {
    violation,
    ...context,
    timestamp: new Date().toISOString(),
  })
}
