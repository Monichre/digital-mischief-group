import { stripe } from "@/platform/billing/stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { sql } from "@/platform/db/neon"
import Stripe from "stripe"

export async function POST( req: Request ) {
  const body = await req.text()
  const signature = ( await headers() ).get( "Stripe-Signature" ) as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch ( error: any ) {
    console.error( "[STRIPE_WEBHOOK] Signature verification failed:", error.message )
    return new NextResponse( `Webhook Error: ${error.message}`, { status: 400 } )
  }

  try {
    switch ( event.type ) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if ( !session?.metadata?.userId ) {
          console.error( "[STRIPE_WEBHOOK] No userId in session metadata" )
          return new NextResponse( "User ID is required", { status: 400 } )
        }

        // Retrieve the subscription details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        // Update user subscription status
        await sql`
          UPDATE public."user"
          SET 
            stripe_customer_id = ${session.customer as string},
            subscription_status = 'active',
            updated_at = NOW()
          WHERE id = ${session.metadata.userId}
        `

        console.log( `[STRIPE_WEBHOOK] User ${session.metadata.userId} subscription activated` )
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Map Stripe subscription status to our status
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
          UPDATE public."user"
          SET 
            subscription_status = ${status},
            updated_at = NOW()
          WHERE stripe_customer_id = ${customerId}
        `

        console.log( `[STRIPE_WEBHOOK] Subscription updated for customer ${customerId}: ${status}` )
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await sql`
          UPDATE public."user"
          SET 
            subscription_status = 'inactive',
            updated_at = NOW()
          WHERE stripe_customer_id = ${customerId}
        `

        console.log( `[STRIPE_WEBHOOK] Subscription deleted for customer ${customerId}` )
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await sql`
          UPDATE public."user"
          SET 
            subscription_status = 'past_due',
            updated_at = NOW()
          WHERE stripe_customer_id = ${customerId}
        `

        console.log( `[STRIPE_WEBHOOK] Payment failed for customer ${customerId}` )
        break
      }

      default:
        console.log( `[STRIPE_WEBHOOK] Unhandled event type: ${event.type}` )
    }
  } catch ( error ) {
    console.error( "[STRIPE_WEBHOOK] Error processing event:", error )
    return new NextResponse( "Webhook handler failed", { status: 500 } )
  }

  return new NextResponse( null, { status: 200 } )
}
