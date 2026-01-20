import { stripe } from "@/platform/billing/stripe"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { sql } from "@/platform/db/neon"

export async function POST() {
  try {
    const session = await auth.api.getSession( { headers: await headers() } )

    if ( !session?.user?.id ) {
      return NextResponse.json( { error: "Unauthorized" }, { status: 401 } )
    }

    // Get user's Stripe customer ID
    const users = await sql`
      SELECT stripe_customer_id FROM "user" WHERE id = ${session.user.id}
    `

    if ( users.length === 0 || !users[0].stripe_customer_id ) {
      return NextResponse.json(
        { error: "No billing account found. Please subscribe first." },
        { status: 400 }
      )
    }

    const portalSession = await stripe.billingPortal.sessions.create( {
      customer: users[0].stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
    } )

    return NextResponse.json( { url: portalSession.url } )
  } catch ( error ) {
    console.error( "[STRIPE_PORTAL]", error )
    return NextResponse.json( { error: "Internal Error" }, { status: 500 } )
  }
}
