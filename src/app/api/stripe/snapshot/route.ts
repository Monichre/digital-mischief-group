import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { sql } from "@/platform/db/neon"
import Stripe from "stripe"

// Snapshot webhooks contain full object data - no API calls needed
export async function POST( req: Request ) {
  const body = await req.text()
  const signature = ( await headers() ).get( "Stripe-Signature" ) as string

  if ( !process.env.STRIPE_WEBHOOK_SECRET_SNAPSHOT ) {
    console.error( "[STRIPE_SNAPSHOT] Missing STRIPE_WEBHOOK_SECRET_SNAPSHOT" )
    return new NextResponse( "Webhook secret not configured", { status: 500 } )
  }

  let event: Stripe.Event

  try {
    // Manually construct event without using stripe client (snapshot has full data)
    const stripe = new Stripe( process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
    } )
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET_SNAPSHOT
    )
  } catch ( error: unknown ) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error( "[STRIPE_SNAPSHOT] Signature verification failed:", message )
    return new NextResponse( `Webhook Error: ${message}`, { status: 400 } )
  }

  console.log( `[STRIPE_SNAPSHOT] Received event: ${event.type}` )

  try {
    switch ( event.type ) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if ( !session?.metadata?.userId ) {
          console.error( "[STRIPE_SNAPSHOT] No userId in session metadata" )
          return new NextResponse( "User ID is required", { status: 400 } )
        }

        await sql`
          UPDATE "user"
          SET 
            stripe_customer_id = ${session.customer as string},
            subscription_status = 'active',
            updated_at = NOW()
          WHERE id = ${session.metadata.userId}
        `

        console.log( `[STRIPE_SNAPSHOT] User ${session.metadata.userId} subscription activated` )
        break
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await sql`
          UPDATE "user"
          SET 
            subscription_status = 'active',
            updated_at = NOW()
          WHERE stripe_customer_id = ${customerId}
        `

        console.log( `[STRIPE_SNAPSHOT] Subscription created for customer ${customerId}` )
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        let status: string
        switch ( subscription.status ) {
          case "active":
          case "trialing":
            status = "active"
            break
          case "past_due":
            status = "past_due"
            break
          case "canceled":
          case "unpaid":
          case "incomplete":
          case "incomplete_expired":
          case "paused":
            status = "inactive"
            break
          default:
            status = "inactive"
        }

        await sql`
          UPDATE "user"
          SET 
            subscription_status = ${status},
            updated_at = NOW()
          WHERE stripe_customer_id = ${customerId}
        `

        console.log( `[STRIPE_SNAPSHOT] Subscription updated for customer ${customerId}: ${status}` )
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await sql`
          UPDATE "user"
          SET 
            subscription_status = 'inactive',
            updated_at = NOW()
          WHERE stripe_customer_id = ${customerId}
        `

        console.log( `[STRIPE_SNAPSHOT] Subscription deleted for customer ${customerId}` )
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Ensure subscription stays active on successful payment
        await sql`
          UPDATE "user"
          SET 
            subscription_status = 'active',
            updated_at = NOW()
          WHERE stripe_customer_id = ${customerId}
        `

        console.log( `[STRIPE_SNAPSHOT] Payment succeeded for customer ${customerId}` )
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await sql`
          UPDATE "user"
          SET 
            subscription_status = 'past_due',
            updated_at = NOW()
          WHERE stripe_customer_id = ${customerId}
        `

        console.log( `[STRIPE_SNAPSHOT] Payment failed for customer ${customerId}` )
        break
      }

      case "customer.created": {
        const customer = event.data.object as Stripe.Customer
        console.log( `[STRIPE_SNAPSHOT] Customer created: ${customer.id} (${customer.email})` )
        break
      }

      default:
        console.log( `[STRIPE_SNAPSHOT] Unhandled event type: ${event.type}` )
    }
  } catch ( error ) {
    console.error( "[STRIPE_SNAPSHOT] Error processing event:", error )
    return new NextResponse( "Webhook handler failed", { status: 500 } )
  }

  return new NextResponse( null, { status: 200 } )
}
