# ?? Llama Connect - Quick Setup Guide

This guide will walk you through setting up and testing the Llama Connect subscription app in **under 10 minutes**.

## Prerequisites

- ? Node.js 18+ installed
- ? npm installed
- ? [Stripe CLI](https://stripe.com/docs/stripe-cli) installed

## Step 1: Install Dependencies (2 minutes)

```bash
npm install
```

This will install all dependencies and generate the Prisma client automatically.

## Step 2: Set Up Stripe (3 minutes)

### 2.1 Get Your Stripe Test Keys

1. Sign up/login to [Stripe Dashboard](https://dashboard.stripe.com)
2. **Toggle to TEST MODE** (top-right corner - should show "Test mode")
3. Go to **Developers > API keys**
4. Copy your keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### 2.2 Create Subscription Products

1. Go to **Products** in Stripe Dashboard
2. Click **"+ Add product"**

**Create Monthly Plan:**
- Product name: `Llama Connect Monthly`
- Price: `$9.99 USD`
- Billing period: `Monthly`
- Click **Save product**
- Copy the **Price ID** (starts with `price_`)

**Create Annual Plan:**
- Product name: `Llama Connect Annual`
- Price: `$99 USD`
- Billing period: `Yearly`
- Click **Save product**
- Copy the **Price ID** (starts with `price_`)

### 2.3 Update Environment Variables

Edit `.env.local` (or create it by copying `.env.local.example`):

```env
DATABASE_URL="file:./dev.db"

# Paste your Stripe keys here
STRIPE_SECRET_KEY="sk_test_YOUR_ACTUAL_KEY"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_ACTUAL_KEY"
STRIPE_PRICE_MONTHLY="price_YOUR_MONTHLY_PRICE_ID"
STRIPE_PRICE_ANNUAL="price_YOUR_ANNUAL_PRICE_ID"

# Leave these for now (set in step 4)
STRIPE_WEBHOOK_SECRET="whsec_placeholder"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

Also update `.env` file with the same values (Prisma uses .env by default).

## Step 3: Initialize Database (1 minute)

```bash
npx prisma migrate dev --name init
```

This creates the SQLite database with User, Session, and Subscription tables.

## Step 4: Start Stripe Webhook Listener (Ongoing)

Open a **NEW terminal window** and run:

```bash
stripe listen --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted --forward-to localhost:3000/api/stripe/webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy the `whsec_` secret** and update it in **both** `.env.local` AND `.env`:

```env
STRIPE_WEBHOOK_SECRET="whsec_YOUR_ACTUAL_SECRET"
```

**Keep this terminal running!** It needs to stay open to receive webhooks.

## Step 5: Start Development Server (1 minute)

In your **original terminal**, run:

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

---

## ?? Test the Complete Flow (2 minutes)

### Test 1: Sign In
1. Open http://localhost:3000
2. Click **"Sign In"**
3. Enter any email (e.g., `test@example.com`)
4. You'll be redirected to the pricing page

### Test 2: Subscribe
1. Choose either **Monthly** or **Annual** plan
2. Click the subscribe button
3. You'll be redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
5. Expiry: `12/34` (any future date)
6. CVC: `123` (any 3 digits)
7. Complete payment

### Test 3: Verify Webhook
1. Check your **Stripe CLI terminal** - you should see:
   ```
   --> checkout.session.completed [evt_xxx]
   ```
2. You'll be redirected to the success page

### Test 4: Access Activities
1. From success page, click **"Start Your First Activity"**
2. You should see 8 bonding activities
3. Browse through them - you have full access! ??

### Test 5: Check Account
1. Click **"Account"** in the navigation
2. See your subscription details:
   - Status: Active
   - Next billing date
   - Subscription ID

---

## ?? Test Subscription Cancellation

### Cancel the Subscription
1. Go to [Stripe Dashboard > Customers](https://dashboard.stripe.com/test/customers)
2. Click on your customer (by email)
3. Find the subscription and click on it
4. Click **"Cancel subscription"** > Confirm

### Verify Access Revoked
1. Check your **Stripe CLI terminal** - you should see:
   ```
   --> customer.subscription.deleted [evt_xxx]
   ```
2. Go back to http://localhost:3000/app/activities
3. Refresh the page
4. You should now see: **"Subscription Required" ??**

### Re-subscribe
1. Click **"View Pricing Plans"**
2. Subscribe again to regain access

---

## ?? Troubleshooting

### Webhook not working?
- ? Ensure Stripe CLI is running
- ? Check webhook secret is correct in `.env.local` AND `.env`
- ? Restart dev server after changing environment variables

### Activities still locked after payment?
- ? Check Stripe CLI terminal for webhook events
- ? Run `npx prisma studio` to view database
- ? Verify subscription status is "active" or "trialing"
- ? Check currentPeriodEnd is in the future

### Cannot create checkout session?
- ? Verify Price IDs match your Stripe products
- ? Ensure you're using TEST mode keys
- ? Check you're signed in (session cookie exists)

### Database issues?
```bash
# Reset database
rm prisma/dev.db
npx prisma migrate dev --name init
```

---

## ?? View Database Contents

```bash
npx prisma studio
```

Opens GUI at http://localhost:5555 to browse:
- Users
- Sessions
- Subscriptions

---

## ?? Additional Resources

- **README.md** - Comprehensive documentation
- **Stripe Dashboard** - View all transactions and events
- **Stripe CLI** - Test webhook events locally

---

## ? Success Checklist

- [ ] Dependencies installed
- [ ] Stripe test keys configured
- [ ] Products created in Stripe Dashboard
- [ ] Database initialized
- [ ] Stripe webhook listener running
- [ ] Dev server running
- [ ] Can sign in
- [ ] Can subscribe
- [ ] Webhook received
- [ ] Activities accessible
- [ ] Can view account
- [ ] Can cancel and lose access

If all checkboxes are checked, congratulations! ?? Your Llama Connect app is fully functional!

---

**Questions?** Check the main README.md or Stripe documentation.

**Happy bonding!** ????
