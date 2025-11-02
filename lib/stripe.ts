import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

/**
 * Stripe client instance
 * Configured with API version for consistency
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

/**
 * Get price IDs from environment
 */
export const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || '',
  annual: process.env.STRIPE_PRICE_ANNUAL || '',
} as const;
