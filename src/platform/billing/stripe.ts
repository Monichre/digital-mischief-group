
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  // Warn only in dev, but error in production if needed
  console.warn("STRIPE_SECRET_KEY is missing from environment variables.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});
