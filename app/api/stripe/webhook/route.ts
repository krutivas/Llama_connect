import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events to update subscription status
 * 
 * Features:
 * - Webhook signature verification for security
 * - Idempotency: prevents duplicate event processing
 * - Records all processed events in database
 * 
 * Handled events:
 * - checkout.session.completed: Create subscription record
 * - customer.subscription.updated: Update subscription status
 * - customer.subscription.deleted: Mark subscription as canceled
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    // ? IDEMPOTENCY: Check if we've already processed this event
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { stripeEventId: event.id }
    });

    if (existingEvent) {
      console.log(`[Webhook] Event ${event.id} already processed at ${existingEvent.createdAt}`);
      return NextResponse.json({ 
        received: true, 
        message: 'Event already processed (idempotency)' 
      });
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    // ? IDEMPOTENCY: Record that we've processed this event
    await prisma.webhookEvent.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
      }
    });

    console.log(`[Webhook] Successfully processed ${event.type} - ${event.id}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Handler error:', error);
    // Don't record event if processing failed - Stripe will retry
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 * Creates subscription record and associates Stripe customer with user
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId || session.client_reference_id;
  
  if (!userId) {
    console.error('No userId found in checkout session');
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!subscriptionId) {
    console.error('No subscription ID in checkout session');
    return;
  }

  // Fetch full subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update user with Stripe customer ID
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customerId },
  });

  // Create or update subscription record
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
    update: {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`Subscription created for user ${userId}`);
}

/**
 * Handle customer.subscription.updated event
 * Updates subscription status and period end date
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id;

  await prisma.subscription.update({
    where: { stripeSubscriptionId },
    data: {
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`Subscription ${stripeSubscriptionId} updated to ${subscription.status}`);
}

/**
 * Handle customer.subscription.deleted event
 * Marks subscription as canceled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id;

  await prisma.subscription.update({
    where: { stripeSubscriptionId },
    data: {
      status: 'canceled',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`Subscription ${stripeSubscriptionId} deleted/canceled`);
}

/**
 * Handle invoice.payment_succeeded event
 * Fires when recurring payment succeeds (e.g., monthly renewal)
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  
  if (!subscriptionId) {
    console.log('[Webhook] Invoice has no subscription, skipping');
    return;
  }

  // Fetch latest subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update subscription with latest info
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`[Webhook] Recurring payment succeeded for subscription ${subscriptionId}`);
  
  // Optional: Send confirmation email to user
  // const user = await prisma.user.findUnique({ 
  //   where: { stripeCustomerId: invoice.customer as string } 
  // });
  // await sendEmail(user.email, 'Payment Received', 'Thank you!');
}

/**
 * Handle invoice.payment_failed event
 * Fires when recurring payment fails
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  
  if (!subscriptionId) {
    console.log('[Webhook] Invoice has no subscription, skipping');
    return;
  }

  // Fetch latest subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Update subscription status (might be 'past_due')
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`[Webhook] Payment failed for subscription ${subscriptionId} - status: ${subscription.status}`);
  
  // Optional: Send notification to user
  // const user = await prisma.user.findUnique({ 
  //   where: { stripeCustomerId: invoice.customer as string } 
  // });
  // await sendEmail(user.email, 'Payment Failed', 'Please update payment method');
}
