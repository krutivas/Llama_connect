import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICE_IDS } from '@/lib/stripe';
import { getCurrentUser } from '@/lib/auth';

/**
 * POST /api/checkout/session
 * Creates a Stripe Checkout session for subscription purchase
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in first' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan } = body;

    // Validate plan and get price ID
    let priceId: string;
    if (plan === 'monthly') {
      priceId = PRICE_IDS.monthly;
    } else if (plan === 'annual') {
      priceId = PRICE_IDS.annual;
    } else {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "monthly" or "annual"' },
        { status: 400 }
      );
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this plan' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Create Checkout session parameters
    const sessionParams: any = {
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      client_reference_id: user.id, // Store user ID for webhook
      metadata: {
        userId: user.id,
      },
    };

    // If user has existing Stripe customer ID, use it
    if (user.stripeCustomerId) {
      sessionParams.customer = user.stripeCustomerId;
    } else {
      // Otherwise, create new customer
      sessionParams.customer_creation = 'always';
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
