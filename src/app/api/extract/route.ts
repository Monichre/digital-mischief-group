import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/platform/auth/server'
import { headers } from 'next/headers'
import { sql } from '@/platform/db/neon'
import { extractBrandIdentity } from '@/daedalus/extract/brand/workflow'

// Input validation schema
const ExtractInputSchema = z.object({
  url: z.string().min(1, 'URL is required'),
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // 1. Authenticate
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Validate input
    const body = await request.json()
    const parseResult = ExtractInputSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { url } = parseResult.data
    const inputTrimmed = url.trim()

    // 3. Dispatch to workflow
    const result = await extractBrandIdentity({ url: inputTrimmed })

    if (!result.success || !result.data) {
      // Log failed extraction
      try {
        await sql`
          INSERT INTO brand_extractions (url, input_url, status, error_message)
          VALUES (${inputTrimmed}, ${inputTrimmed}, 'failed', ${result.error || 'Extraction failed'})
        `
      } catch (dbError) {
        console.error('[Extract] DB error saving failed extraction:', dbError)
      }

      return NextResponse.json(
        { success: false, error: result.error || 'Failed to extract brand identity' },
        { status: 422 }
      )
    }

    const { branding, metadata, screenshot } = result.data

    // 4. Save to database
    try {
      await sql`
        INSERT INTO brand_extractions (
          url, input_url, normalized_url, domain,
          color_scheme, logo_url, colors, fonts, typography, spacing,
          components, images, animations, layout, personality,
          site_title, site_description, screenshot_url, status
        ) VALUES (
          ${metadata.sourceUrl}, ${inputTrimmed}, ${metadata.sourceUrl}, ${metadata.domain},
          ${branding.colorScheme || null}, ${branding.images?.logo || null},
          ${JSON.stringify(branding.colors)}, ${JSON.stringify(branding.fonts)},
          ${JSON.stringify(branding.typography)}, ${JSON.stringify(branding.spacing)},
          ${JSON.stringify(branding.components)}, ${JSON.stringify(branding.images)},
          ${JSON.stringify(branding.animations)}, ${JSON.stringify(branding.layout)},
          ${JSON.stringify(branding.personality)},
          ${metadata.title}, ${metadata.description},
          ${screenshot}, 'completed'
        )
      `
    } catch (dbError) {
      console.error('[Extract] DB error saving extraction:', dbError)
      // Continue - still return data to user even if DB save fails
    }

    // 5. Log usage event
    const duration = Date.now() - startTime
    try {
      await sql`
        INSERT INTO usage_events (event_type, module, input_value, status, duration_ms, metadata)
        VALUES ('brand_extraction', 'extract', ${inputTrimmed}, 'success', ${duration}, ${JSON.stringify({ domain: metadata.domain })})
      `
    } catch (usageError) {
      console.error('[Extract] Usage logging error:', usageError)
    }

    // 6. Return response
    return NextResponse.json({
      success: true,
      data: {
        branding,
        metadata: {
          title: metadata.title,
          description: metadata.description,
          sourceURL: metadata.sourceUrl,
        },
        screenshot,
      },
    })
  } catch (error) {
    console.error('[Extract] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
