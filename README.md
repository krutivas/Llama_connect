# ?? Llama Connect

A production-ready subscription web app built with Next.js 14, TypeScript, Prisma, and Stripe. Llama Connect helps parents and children strengthen their bonds through curated activities.

## Features

- **Email-based Authentication**: Simple mock authentication system with session management
- **Subscription Plans**: Monthly ($9.99) and Annual ($99) plans powered by Stripe
- **Stripe Checkout Integration**: Secure payment processing in test mode
- **Webhook Handling**: Automated subscription status updates via Stripe webhooks
- **Webhook Idempotency**: Prevents duplicate event processing (production-ready)
- **Gated Content**: Activities area accessible only to active subscribers
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript support throughout the application

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Payments**: Stripe Checkout & Webhooks
- **Styling**: Tailwind CSS
- **Authentication**: Cookie-based sessions

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ and npm
- [Stripe CLI](https://stripe.com/docs/stripe-cli) for webhook testing

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Stripe keys:

#### Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Make sure you're in **TEST MODE** (toggle in top-right corner)
3. Copy your keys:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)

#### Create Stripe Products & Prices

1. Go to [Stripe Products](https://dashboard.stripe.com/test/products)
2. Click **"+ Add product"**
3. Create **Monthly Plan**:
   - Name: "Llama Connect Monthly"
   - Description: "Monthly subscription"
   - Price: $9.99 USD
   - Billing period: Monthly
   - Click "Save product"
   - Copy the **Price ID** (starts with `price_`)
4. Create **Annual Plan**:
   - Name: "Llama Connect Annual"
   - Description: "Annual subscription"
   - Price: $99 USD
   - Billing period: Yearly
   - Click "Save product"
   - Copy the **Price ID** (starts with `price_`)

Add these to your `.env.local`:

```env
STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY"
STRIPE_PRICE_MONTHLY="price_YOUR_MONTHLY_PRICE_ID"
STRIPE_PRICE_ANNUAL="price_YOUR_ANNUAL_PRICE_ID"
```

### 3. Initialize Database

Run Prisma migrations to create your SQLite database:

```bash
npx prisma migrate dev --name init
```

This creates a `prisma/dev.db` file with the User, Session, and Subscription tables.

### 4. Start Stripe Webhook Listener

In a **separate terminal**, start the Stripe CLI to forward webhook events:

```bash
stripe listen --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted --forward-to localhost:3000/api/stripe/webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

Copy the `whsec_` secret and add it to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"
```

**Keep this terminal running** while testing the app.

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Testing the Application

### Complete User Flow Test

1. **Sign In**
   - Go to [http://localhost:3000](http://localhost:3000)
   - Click "Sign In" or go to `/signin`
   - Enter any email (e.g., `test@example.com`)
   - You'll be automatically signed in and redirected to pricing

2. **Subscribe**
   - Choose either Monthly or Annual plan
   - Click "Subscribe"
   - You'll be redirected to Stripe Checkout (test mode)
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - Complete the payment

3. **Verify Webhook**
   - Check your Stripe CLI terminal for webhook events
   - You should see `checkout.session.completed` event received
   - The webhook updates your database with subscription details

4. **Access Activities**
   - After payment, you'll be redirected to `/success`
   - Click "Start Your First Activity"
   - You should now see the Activities page with 8 bonding activities

5. **Check Account**
   - Go to `/account` to view your subscription details
   - See your subscription status, next billing date, etc.

### Test Subscription Cancellation

1. Go to [Stripe Dashboard > Customers](https://dashboard.stripe.com/test/customers)
2. Find your customer (by email)
3. Click on the subscription
4. Click "Cancel subscription"
5. Confirm cancellation
6. Check your webhook terminal - you should see `customer.subscription.deleted`
7. Refresh `/app/activities` - you should now see the "Subscription Required" lock screen

## Project Structure

```
llama-connect/
??? app/
?   ??? api/
?   ?   ??? auth/start/          # Sign-in endpoint
?   ?   ??? checkout/session/    # Create Stripe checkout
?   ?   ??? stripe/webhook/      # Handle Stripe events
?   ??? app/
?   ?   ??? activities/          # Gated activities page
?   ??? account/                 # Account management
?   ??? pricing/                 # Subscription plans
?   ??? signin/                  # Authentication page
?   ??? success/                 # Post-checkout success
?   ??? cancel/                  # Checkout canceled
?   ??? layout.tsx
?   ??? page.tsx                 # Home page
?   ??? globals.css
??? lib/
?   ??? auth.ts                  # Auth utilities
?   ??? prisma.ts                # Prisma client
?   ??? stripe.ts                # Stripe client
??? prisma/
?   ??? schema.prisma            # Database schema
??? middleware.ts                # Route protection
??? .env.local.example           # Environment template
??? package.json
```

## Database Schema

### User
- `id`: Unique identifier
- `email`: User email (unique)
- `stripeCustomerId`: Stripe customer ID
- `createdAt`: Account creation date

### Session
- `id`: Unique identifier
- `userId`: Reference to User
- `token`: Session token (stored in cookie)
- `expiresAt`: Session expiration date

### Subscription
- `id`: Unique identifier
- `userId`: Reference to User (unique - one subscription per user)
- `stripeSubscriptionId`: Stripe subscription ID
- `status`: Subscription status (active, canceled, etc.)
- `currentPeriodEnd`: Current billing period end date

## API Endpoints

### POST `/api/auth/start`
Creates or finds user, generates session, sets cookie.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "clxxxxx"
}
```

### POST `/api/checkout/session`
Creates Stripe Checkout session.

**Request:**
```json
{
  "plan": "monthly" | "annual"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### POST `/api/stripe/webhook`
Handles Stripe webhook events. Must include valid Stripe signature header.

**Handled Events:**
- `checkout.session.completed` - Create subscription record
- `customer.subscription.updated` - Update subscription status
- `customer.subscription.deleted` - Mark as canceled

## Webhook Events Flow

### checkout.session.completed
1. Extract user ID from session metadata
2. Fetch full subscription details from Stripe
3. Store Stripe customer ID on user
4. Create/update subscription record in database

### customer.subscription.updated
1. Find subscription by Stripe subscription ID
2. Update status and current period end

### customer.subscription.deleted
1. Find subscription by Stripe subscription ID
2. Set status to "canceled"

## Security Features

- **httpOnly Cookies**: Session tokens stored in httpOnly cookies
- **Webhook Signature Verification**: All webhooks verified with Stripe signature
- **Route Protection**: Middleware protects `/app/*` routes
- **Subscription Validation**: Server-side checks for active subscriptions

## Development Tips

### View Database Contents

```bash
npx prisma studio
```

Opens a GUI at [http://localhost:5555](http://localhost:5555) to browse your database.

### Reset Database

```bash
rm prisma/dev.db
npx prisma migrate dev --name init
```

### Check Stripe Logs

View all webhook events and API calls in your [Stripe Dashboard > Developers > Events](https://dashboard.stripe.com/test/events)

### Debugging Webhooks

If webhooks aren't working:
1. Ensure Stripe CLI is running
2. Check webhook secret matches in `.env.local`
3. Check terminal output for errors
4. Verify events in Stripe Dashboard

## Production Deployment

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
STRIPE_SECRET_KEY="sk_live_YOUR_LIVE_KEY"  # Use live keys!
STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_LIVE_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_PRODUCTION_SECRET"
STRIPE_PRICE_MONTHLY="price_YOUR_LIVE_MONTHLY_PRICE_ID"
STRIPE_PRICE_ANNUAL="price_YOUR_LIVE_ANNUAL_PRICE_ID"
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

### Webhook Setup in Production

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your production webhook URL: `https://your-domain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret to your production environment

### Database Migration

For production, consider using:
- PostgreSQL instead of SQLite
- Proper database hosting (Vercel Postgres, Supabase, PlanetScale, etc.)

Update `DATABASE_URL` in your production environment and run migrations.

## Optional Enhancements

The following features are mentioned as "nice-to-haves" and can be added:

1. **Stripe Customer Portal**: Allow users to manage billing directly
2. **Payment Retry Handling**: Handle `invoice.payment_failed` events
3. **Email Notifications**: Send confirmation emails for subscriptions
4. **Activity Progress Tracking**: Store user progress on activities
5. **Real Magic Link Auth**: Implement actual email-based authentication

## Troubleshooting

### "Invalid signature" webhook error
- Ensure webhook secret matches the one from `stripe listen`
- Restart the Stripe CLI and update `.env.local`

### Activities page shows "Subscription Required"
- Check webhook was received (Stripe CLI terminal)
- Verify subscription in database: `npx prisma studio`
- Check subscription status is "active" or "trialing"
- Ensure `currentPeriodEnd` is in the future

### Cannot create checkout session
- Verify Price IDs in `.env.local` match your Stripe products
- Check Stripe keys are correct and in test mode
- Ensure user is signed in (session cookie exists)

## Support

For questions or issues:
- Check [Stripe Documentation](https://stripe.com/docs)
- Review [Next.js Documentation](https://nextjs.org/docs)
- Email: support@llamaconnect.com (demo)

## License

MIT License - feel free to use this as a template for your own projects!

---

Built with ?? for stronger parent-child connections
