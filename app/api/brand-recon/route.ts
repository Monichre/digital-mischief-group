import { type NextRequest, NextResponse } from "next/server"
import type { BrandReconResponse } from "@/lib/brand-recon/types"

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY
const FIRECRAWL_API_URL = "https://api.firecrawl.dev/v1/scrape"

function extractDomainFromEmail(email: string): string | null {
  const match = email.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
  return match ? match[1] : null
}

function normalizeUrl(input: string): string {
  // Check if it's an email
  if (input.includes("@") && !input.includes("://")) {
    const domain = extractDomainFromEmail(input)
    if (domain) {
      return `https://${domain}`
    }
    throw new Error("Invalid email format")
  }

  // Check if it's a URL without protocol
  if (!input.startsWith("http://") && !input.startsWith("https://")) {
    return `https://${input}`
  }

  return input
}

export async function POST(request: NextRequest): Promise<NextResponse<BrandReconResponse>> {
  try {
    const { input } = await request.json()

    if (!input || typeof input !== "string") {
      return NextResponse.json({ success: false, error: "Invalid input: URL or email required" }, { status: 400 })
    }

    if (!FIRECRAWL_API_KEY) {
      return NextResponse.json({ success: false, error: "Firecrawl API key not configured" }, { status: 500 })
    }

    const url = normalizeUrl(input.trim())

    // Call Firecrawl API with branding format
    const firecrawlResponse = await fetch(FIRECRAWL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        formats: ["branding"],
      }),
    })

    if (!firecrawlResponse.ok) {
      const errorData = await firecrawlResponse.json().catch(() => ({}))
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || `Firecrawl API error: ${firecrawlResponse.status}`,
        },
        { status: firecrawlResponse.status },
      )
    }

    const data = await firecrawlResponse.json()

    if (!data.success || !data.data?.branding) {
      return NextResponse.json({ success: false, error: "Failed to extract brand identity" }, { status: 422 })
    }

    return NextResponse.json({
      success: true,
      data: {
        branding: data.data.branding,
        metadata: data.data.metadata,
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
