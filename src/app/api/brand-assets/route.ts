import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/platform/auth/server'
import { headers } from 'next/headers'
import { sql } from '@/platform/db/neon'
import {
  generateBrandAssets,
  type AssetGenerationInput,
  type AssetGenerationOutput,
} from '@/daedalus/extract/brand/asset-generation'

const ToneSchema = z.preprocess(
  (value) => {
    if (Array.isArray(value)) return value
    if (typeof value === 'string' && value.trim()) return [value.trim()]
    return undefined
  },
  z.array(z.string()).optional()
)

// Input validation schema
const BrandAssetInputSchema = z.object({
  brandContext: z.object({
    companyName: z.string().min(1, 'Company name is required'),
    description: z.string().optional(),
    colors: z.object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      accent: z.string().optional(),
      background: z.string().optional(),
      textPrimary: z.string().optional(),
    }),
    typography: z
      .object({
        fontFamilies: z
          .object({
            primary: z.string().optional(),
            heading: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    personality: z
      .object({
        tone: ToneSchema,
        targetAudience: z.string().optional(),
      })
      .optional(),
    logo: z.string().optional(),
    website: z.string().optional(),
  }),
  assetTypes: z.array(z.enum(['email', 'landing', 'social'])).min(1, 'At least one asset type is required'),
  customInstructions: z.string().optional(),
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
    const parseResult = BrandAssetInputSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const input: AssetGenerationInput = parseResult.data

    // 3. Generate assets
    const result: AssetGenerationOutput = await generateBrandAssets(input)

    // 4. Log usage event
    const duration = Date.now() - startTime
    try {
      await sql`
        INSERT INTO usage_events (event_type, module, input_value, status, duration_ms, metadata)
        VALUES (
          'brand_asset_generation',
          'extract',
          ${input.brandContext.companyName},
          'success',
          ${duration},
          ${JSON.stringify({
            assetTypes: input.assetTypes,
            companyName: input.brandContext.companyName,
            domain: input.brandContext.website,
          })}
        )
      `
    } catch (usageError) {
      console.error('[BrandAssets] Usage logging error:', usageError)
    }

    // 5. Return response
    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('[BrandAssets] Error:', error)

    // Log failed attempt
    const duration = Date.now() - startTime
    try {
      await sql`
        INSERT INTO usage_events (event_type, module, input_value, status, duration_ms, metadata)
        VALUES (
          'brand_asset_generation',
          'extract',
          'unknown',
          'failed',
          ${duration},
          ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}
        )
      `
    } catch {
      // Ignore logging errors
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
