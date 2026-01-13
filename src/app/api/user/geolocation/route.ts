import { type NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db/neon'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { z } from 'zod'

const geolocationSchema = z.object({
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  countryCode: z.string().max(2).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timezone: z.string().optional(),
})

export type GeolocationData = z.infer<typeof geolocationSchema>

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const users = await sql`
      SELECT 
        city, region, country, country_code,
        latitude, longitude, timezone,
        geolocation_updated_at
      FROM "user"
      WHERE id = ${session.user.id}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = users[0]

    return NextResponse.json({
      geolocation: {
        city: user.city,
        region: user.region,
        country: user.country,
        countryCode: user.country_code,
        latitude: user.latitude ? parseFloat(user.latitude) : null,
        longitude: user.longitude ? parseFloat(user.longitude) : null,
        timezone: user.timezone,
        updatedAt: user.geolocation_updated_at,
      },
    })
  } catch (error) {
    console.error('[Geolocation GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch geolocation' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const result = geolocationSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid geolocation data', details: result.error.issues },
        { status: 400 }
      )
    }

    const { city, region, country, countryCode, latitude, longitude, timezone } = result.data

    await sql`
      UPDATE "user"
      SET 
        city = COALESCE(${city ?? null}, city),
        region = COALESCE(${region ?? null}, region),
        country = COALESCE(${country ?? null}, country),
        country_code = COALESCE(${countryCode ?? null}, country_code),
        latitude = COALESCE(${latitude ?? null}, latitude),
        longitude = COALESCE(${longitude ?? null}, longitude),
        timezone = COALESCE(${timezone ?? null}, timezone),
        geolocation_updated_at = NOW(),
        updated_at = NOW()
      WHERE id = ${session.user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Geolocation POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update geolocation' },
      { status: 500 }
    )
  }
}

