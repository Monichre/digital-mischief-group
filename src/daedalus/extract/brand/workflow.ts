import { getFirecrawlClient, normalizeUrl, extractDomain } from '@/platform/firecrawl/service'
import type { BrandingProfile, FirecrawlResponse } from '@/platform/firecrawl/service'

export interface BrandExtractionInput {
  url: string
}

export interface BrandExtractionOutput {
  branding: BrandingProfile
  metadata: {
    title: string | null
    description: string | null
    sourceUrl: string
    domain: string
  }
  screenshot: string | null
  sources: string[]
}

export async function extractBrandIdentity(
  input: BrandExtractionInput
): Promise<FirecrawlResponse<BrandExtractionOutput>> {
  const { url } = input

  // Normalize URL (handles email domains too)
  let normalizedUrl: string
  let domain: string
  try {
    normalizedUrl = normalizeUrl(url)
    domain = extractDomain(normalizedUrl)
  } catch {
    return {
      success: false,
      error: 'Could not parse input as valid URL or email',
    }
  }

  const firecrawl = getFirecrawlClient()
  const result = await firecrawl.extractBrand(normalizedUrl)

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.error || 'Failed to extract brand identity',
      errorDetails: result.errorDetails,
      meta: result.meta,
    }
  }

  const branding = result.data

  return {
    success: true,
    data: {
      branding,
      metadata: {
        title: branding.siteTitle || null,
        description: branding.siteDescription || null,
        sourceUrl: normalizedUrl,
        domain,
      },
      screenshot: branding.screenshot || null,
      sources: [normalizedUrl],
    },
    meta: result.meta,
  }
}
