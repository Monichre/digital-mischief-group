```typescript
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { syncStripeDataToKV } from "../../../../lib/stripe-sync";

const allowedEvents = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.pending_update_applied",
  "customer.subscription.pending_update_expired",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
  "invoice.upcoming",
  "invoice.marked_uncollectible",
  "invoice.payment_succeeded",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
] as const;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature");

  if (!signature) {
    return new NextResponse("No signature", { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_BLOK_WEBHOOK_SECRET!
    );

    if (!allowedEvents.includes(event.type as any)) {
      return new NextResponse(`Unhandled event type: ${event.type}`, {
        status: 400,
      });
    }

    const { customer: customerId } = event.data.object as {
      customer: string;
    };

    if (typeof customerId !== "string") {
      throw new Error(
        `[STRIPE HOOK] Customer ID isn't string.\nEvent type: ${event.type}`
      );
    }

    await syncStripeDataToKV(customerId);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse("Webhook error: " + (error as Error).message, {
      status: 400,
    });
  }
}
```
