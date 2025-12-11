import { type NextRequest, NextResponse } from "next/server"
import type { BrandReconResponse } from "@/lib/brand-recon/types"
import { sql } from "@/lib/db/neon"
import { getFirecrawlClient, normalizeUrl, extractDomain } from "@/lib/firecrawl/client"

export async function POST(request: NextRequest): Promise<NextResponse<BrandReconResponse>> {
  const startTime = Date.now()

  try {
    const { input } = await request.json()

    if (!input || typeof input !== "string") {
      return NextResponse.json({ success: false, error: "Invalid input: URL or email required" }, { status: 400 })
    }

    const inputTrimmed = input.trim()

    // Normalize URL
    let normalizedUrl: string
    let domain: string

    try {
      normalizedUrl = normalizeUrl(inputTrimmed)
      domain = extractDomain(normalizedUrl)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Could not parse input as valid URL or email" },
        { status: 400 },
      )
    }

    // Get Firecrawl client
    const firecrawl = getFirecrawlClient()

    // Extract brand identity
    const result = await firecrawl.extractBrand(normalizedUrl)

    if (!result.success || !result.data?.branding) {
      // Try to save failed extraction
      try {
        await sql`
          INSERT INTO brand_extractions (input_url, normalized_url, domain, status, error_message)
          VALUES (${inputTrimmed}, ${normalizedUrl}, ${domain}, 'failed', ${result.error || "Extraction failed"})
        `
      } catch (dbError) {
        console.error("[Brand Recon] DB error saving failed extraction:", dbError)
      }

      return NextResponse.json(
        { success: false, error: result.error || "Failed to extract brand identity" },
        { status: 422 },
      )
    }

    const branding = result.data.branding
    const metadata = result.data.metadata
    const screenshot = result.data.screenshot

    // Save to database
    try {
      await sql`
        INSERT INTO brand_extractions (
          input_url, normalized_url, domain,
          color_scheme, logo_url, colors, fonts, typography, spacing,
          components, images, animations, layout, personality,
          site_title, site_description, screenshot_url, status
        ) VALUES (
          ${inputTrimmed}, ${normalizedUrl}, ${domain},
          ${branding.colorScheme || null}, ${branding.logo || null},
          ${JSON.stringify(branding.colors)}, ${JSON.stringify(branding.fonts)},
          ${JSON.stringify(branding.typography)}, ${JSON.stringify(branding.spacing)},
          ${JSON.stringify(branding.components)}, ${JSON.stringify(branding.images)},
          ${JSON.stringify(branding.animations)}, ${JSON.stringify(branding.layout)},
          ${JSON.stringify(branding.personality)},
          ${metadata?.title || null}, ${metadata?.description || null},
          ${screenshot || null}, 'completed'
        )
      `
    } catch (dbError) {
      console.error("[Brand Recon] DB error saving extraction:", dbError)
      // Continue - still return data to user even if DB save fails
    }

    // Log usage event
    const duration = Date.now() - startTime
    try {
      await sql`
        INSERT INTO usage_events (event_type, module, input_value, status, duration_ms, metadata)
        VALUES ('brand_extraction', 'brand', ${inputTrimmed}, 'success', ${duration}, ${JSON.stringify({ domain })})
      `
    } catch (usageError) {
      console.error("[Brand Recon] Usage logging error:", usageError)
    }

    return NextResponse.json({
      success: true,
      data: {
        branding,
        metadata,
        screenshot,
      },
    })
  } catch (error) {
    console.error("[Brand Recon] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

// GET - Fetch brand extraction history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const domain = searchParams.get("domain")

    let extractions
    if (domain) {
      extractions = await sql`
        SELECT * FROM brand_extractions 
        WHERE domain = ${domain}
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      extractions = await sql`
        SELECT * FROM brand_extractions 
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    return NextResponse.json({ success: true, data: extractions })
  } catch (error) {
    console.error("[Brand Recon] GET error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
