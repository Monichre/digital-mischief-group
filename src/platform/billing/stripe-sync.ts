import type { Stripe } from "stripe"
import { redis } from "./redis"
import { stripe } from "./stripe"

export type STRIPE_SUB_CACHE =
  | {
    subscriptionId: string | null
    status: Stripe.Subscription.Status
    priceId: string | null
    currentPeriodStart: number | null
    currentPeriodEnd: number | null
    cancelAtPeriodEnd: boolean
    paymentMethod: {
      brand: string | null
      last4: string | null
    } | null
  }
  | {
    status: "none"
  }

export async function syncStripeDataToKV(
  customerId: string
): Promise<STRIPE_SUB_CACHE> {
  try {
    // Fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list( {
      customer: customerId,
      limit: 1,
      status: "all",
      expand: ["data.default_payment_method"],
    } )

    if ( subscriptions.data.length === 0 ) {
      const subData: STRIPE_SUB_CACHE = { status: "none" }
      await redis.set( `stripe:customer:${customerId}`, JSON.stringify( subData ) )
      return subData
    }

    const subscription = subscriptions.data[0]

    // Store complete subscription state
    const subData: STRIPE_SUB_CACHE = {
      subscriptionId: subscription.id,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      currentPeriodEnd: subscription.items.data[0].current_period_end,
      currentPeriodStart: subscription.items.data[0].current_period_start,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      paymentMethod:
        subscription.default_payment_method &&
          typeof subscription.default_payment_method !== "string"
          ? {
            brand: subscription.default_payment_method.card?.brand ?? null,
            last4: subscription.default_payment_method.card?.last4 ?? null,
          }
          : null,
    }

    // Store the data in Redis
    await redis.set( `stripe:customer:${customerId}`, JSON.stringify( subData ) )
    return subData
  } catch ( error ) {
    console.error( "Error syncing Stripe data to Redis:", error )
    throw error
  }
}
