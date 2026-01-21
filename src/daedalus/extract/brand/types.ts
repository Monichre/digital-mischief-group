// Brand Recon TypeScript Types
// Based on Firecrawl's modern extract endpoint with comprehensive brand schema

import type { BrandingProfile } from '@/platform/firecrawl/service'
import { z } from 'zod'

// Re-export BrandingProfile from Firecrawl client for consistency
export type { BrandingProfile }

// Helper types for backward compatibility with existing components
export type BrandColors = z.infer<typeof import( '@/lib/firecrawl/client' ).BrandSchema>['colors']
export type BrandTypography = z.infer<typeof import( '@/lib/firecrawl/client' ).BrandSchema>['typography']
export type BrandSpacing = z.infer<typeof import( '@/lib/firecrawl/client' ).BrandSchema>['spacing']
export type BrandComponents = z.infer<typeof import( '@/lib/firecrawl/client' ).BrandSchema>['components']
export type BrandImages = z.infer<typeof import( '@/lib/firecrawl/client' ).BrandSchema>['images']
export type BrandAnimations = z.infer<typeof import( '@/lib/firecrawl/client' ).BrandSchema>['animations']
export type BrandLayout = z.infer<typeof import( '@/lib/firecrawl/client' ).BrandSchema>['layout']
export type BrandPersonality = z.infer<typeof import( '@/lib/firecrawl/client' ).BrandSchema>['personality']
export type BrandFont = NonNullable<z.infer<typeof import( '@/lib/firecrawl/client' ).BrandSchema>['fonts']>[number]

export interface BrandReconResponse {
  success: boolean
  data?: {
    branding: BrandingProfile
    metadata?: {
      title?: string | null
      description?: string | null
      sourceURL?: string
      statusCode?: number
    }
    screenshot?: string | null
  }
  error?: string
}

export type ReconStatus = "idle" | "loading" | "success" | "error"
