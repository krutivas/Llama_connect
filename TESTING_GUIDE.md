# ?? Complete Testing Guide - Test Mode

## Step-by-Step Instructions to Test Everything

---

## ?? Prerequisites

Before starting, make sure you have:
- [ ] Node.js installed
- [ ] Stripe CLI installed ([Install here](https://stripe.com/docs/stripe-cli))
- [ ] A Stripe account (free test mode)

---

## ?? Part 1: Stripe Setup (5 minutes)

### Step 1.1: Get Stripe Test API Keys

1. **Go to:** https://dashboard.stripe.com
2. **Sign in** (or create free account)
3. **IMPORTANT:** Toggle to **"Test mode"** (top-right corner should show a TEST badge)
4. **Go to:** Developers ? API keys
5. **Copy these keys:**
   - Publishable key (starts with `pk_test_...`)
   - Secret key (starts with `sk_test_...`) - Click "Reveal test key"

### Step 1.2: Create Test Products

1. **Go to:** Products (in left sidebar)
2. **Click:** "+ Add product"

**Create Monthly Product:**
- Name: `Llama Connect Monthly`
- Description: `Monthly subscription`
- Pricing:
  - Model: `Standard pricing`
  - Price: `$9.99`
  - Billing period: `Monthly`
  - Currency: `USD`
- Click **"Save product"**
- **Copy the Price ID** (starts with `price_...`) - you'll see it in the pricing section

**Create Annual Product:**
- Click "+ Add product" again
- Name: `Llama Connect Annual`
- Description: `Annual subscription`
- Pricing:
  - Model: `Standard pricing`
  - Price: `$99`
  - Billing period: `Yearly`
  - Currency: `USD`
- Click **"Save product"**
- **Copy the Price ID** (starts with `price_...`)

---

## ?? Part 2: Configure Your App (2 minutes)

### Step 2.1: Update Environment Variables

Open `.env.local` in your editor and add your actual keys:

```env
# Database (already configured)
DATABASE_URL="file:./dev.db"

# Stripe Test Keys (PASTE YOUR KEYS HERE)
STRIPE_SECRET_KEY="sk_test_YOUR_ACTUAL_SECRET_KEY"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY"

# Stripe Price IDs (PASTE YOUR PRICE IDs HERE)
STRIPE_PRICE_MONTHLY="price_YOUR_MONTHLY_PRICE_ID"
STRIPE_PRICE_ANNUAL="price_YOUR_ANNUAL_PRICE_ID"

# Webhook Secret (we'll get this in next step)
STRIPE_WEBHOOK_SECRET="whsec_placeholder"

# App URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

**Also update `.env` file** (Prisma needs it):
- Copy the same values to `.env`

### Step 2.2: Verify Database

```bash
# Make sure migrations are applied
npx prisma migrate dev
```

Should show: "Your database is already in sync with your schema."

---

## ?? Part 3: Start the App (3 minutes)

### Step 3.1: Start Dev Server

**Terminal 1:**
```bash
npm run dev
```

Wait for:
```
? Ready in 2s
? Local: http://localhost:3000
```

Keep this terminal running!

### Step 3.2: Start Stripe Webhook Listener

**Terminal 2 (NEW):**
```bash
stripe listen --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted --forward-to localhost:3000/api/stripe/webhook
```

You'll see:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy the `whsec_...` secret!**

### Step 3.3: Update Webhook Secret

1. **Copy** the `whsec_...` from Terminal 2
2. **Paste** it into both `.env.local` AND `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_YOUR_ACTUAL_SECRET"
   ```
3. **Restart** the dev server (Terminal 1):
   - Press `Ctrl+C`
   - Run `npm run dev` again

**Keep both terminals running!**

---

## ?? Part 4: Test Complete Flow (10 minutes)

### Test 4.1: Homepage ?

1. **Open browser:** http://localhost:3000
2. **Verify:**
   - [ ] Llama emoji shows (??)
   - [ ] "Llama Connect" title
   - [ ] "Get Started" button
   - [ ] "View Pricing" button
   - [ ] Three feature cards

### Test 4.2: Sign In ?

1. **Click:** "Sign In" button
2. **Enter:** Any email (e.g., `test@example.com`)
3. **Click:** "Sign In"
4. **Verify:**
   - [ ] Redirects to pricing page
   - [ ] No errors in browser console (F12)

### Test 4.3: Pricing Page ?

1. **Should see:**
   - [ ] Two pricing cards (Monthly & Annual)
   - [ ] Monthly: $9.99/month
   - [ ] Annual: $99/year with "BEST VALUE" badge
   - [ ] "Subscribe" buttons

### Test 4.4: Checkout Flow ?

1. **Click:** "Subscribe Monthly" (or Annual)
2. **Wait for redirect** to Stripe Checkout
3. **Verify you're on Stripe:**
   - [ ] URL is `checkout.stripe.com`
   - [ ] Shows "Llama Connect Monthly/Annual"
   - [ ] Shows correct price

4. **Fill in test card:**
   - Email: Any email
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - Name: Any name
   - Country: United States
   - ZIP: Any 5 digits (e.g., `12345`)

5. **Click:** "Subscribe"
6. **Wait:** ~2-3 seconds

### Test 4.5: Webhook Processing ?

**Check Terminal 2 (Stripe CLI):**

You should see:
```
--> checkout.session.completed [evt_xxx]
<-- [200] POST http://localhost:3000/api/stripe/webhook [evt_xxx]
```

**Check Terminal 1 (Dev Server):**

You should see logs like:
```
[Webhook] Successfully processed checkout.session.completed - evt_xxx
Subscription created for user clxxx
```

? **If you see these logs, webhooks are working!**

### Test 4.6: Success Page ?

1. **Should auto-redirect** to success page
2. **Verify:**
   - [ ] Green checkmark icon
   - [ ] "Welcome to Llama Connect! ??"
   - [ ] Shows subscription details
   - [ ] Shows next billing date
   - [ ] "Start Your First Activity" button

### Test 4.7: Activities Page (GATED) ?

1. **Click:** "Start Your First Activity"
2. **Verify:**
   - [ ] Page loads (not locked!)
   - [ ] Shows 8 activity cards:
     * Gratitude Journaling
     * Build a Fort
     * Nature Scavenger Hunt
     * Cooking Together
     * Story Time Swap
     * Art Project
     * Memory Lane Walk
     * Goal Setting Session
   - [ ] Each card shows emoji, title, duration

? **Success! You have access!**

### Test 4.8: Account Page ?

1. **Click:** "Account" in navigation
2. **Verify:**
   - [ ] Shows your email
   - [ ] Shows member since date
   - [ ] Shows subscription status: "active"
   - [ ] Shows next billing date
   - [ ] Shows subscription ID

---

## ?? Part 5: Test Idempotency (NEW) ?

### Test 5.1: View Processed Events

**Open Prisma Studio:**
```bash
npx prisma studio
```

Browser opens at http://localhost:5555

1. **Click:** "WebhookEvent" table
2. **Verify:**
   - [ ] You see at least 1 event
   - [ ] Event type is "checkout.session.completed"
   - [ ] Has stripeEventId (evt_xxx)
   - [ ] Has createdAt timestamp

### Test 5.2: Manually Resend Event (Test Duplicate)

**In Terminal 2 (Stripe CLI), you saw:**
```
--> checkout.session.completed [evt_1A2B3C4D5E6F7G8H]
```

**Copy that event ID and resend it:**
```bash
stripe events resend evt_1A2B3C4D5E6F7G8H
```

**Check Terminal 1 logs:**
```
[Webhook] Event evt_1A2B3C4D5E6F7G8H already processed at 2025-11-02T...
```

? **Perfect! Idempotency working!** Event was NOT reprocessed.

### Test 5.3: Verify No Duplicate Subscriptions

**In Prisma Studio:**
1. **Click:** "Subscription" table
2. **Verify:**
   - [ ] Only ONE subscription for your user
   - [ ] Not two subscriptions (despite resending event)

? **Idempotency prevented duplicate!**

---

## ?? Part 6: Test Cancellation Flow ?

### Test 6.1: Cancel Subscription in Stripe

1. **Go to:** https://dashboard.stripe.com/test/subscriptions
2. **Find:** Your subscription (look for your email)
3. **Click:** on the subscription
4. **Click:** "Cancel subscription" (top right)
5. **Choose:** "Cancel immediately"
6. **Click:** "Cancel subscription"

### Test 6.2: Verify Webhook Received

**Check Terminal 2:**
```
--> customer.subscription.deleted [evt_yyy]
<-- [200] POST http://localhost:3000/api/stripe/webhook [evt_yyy]
```

**Check Terminal 1:**
```
[Webhook] Successfully processed customer.subscription.deleted - evt_yyy
Subscription sub_xxx deleted/canceled
```

### Test 6.3: Verify Access Revoked

1. **Go to:** http://localhost:3000/app/activities
2. **Refresh the page** (F5)
3. **Verify:**
   - [ ] Shows lock icon ??
   - [ ] "Subscription Required" message
   - [ ] "View Pricing Plans" button
   - [ ] No activities visible

? **Access correctly revoked!**

### Test 6.4: Verify Database Updated

**In Prisma Studio:**
1. **Click:** "Subscription" table
2. **Click refresh icon**
3. **Verify:**
   - [ ] Status changed to "canceled"
   - [ ] currentPeriodEnd still shows date

---

## ?? Part 7: Test Re-subscription ?

### Test 7.1: Subscribe Again

1. **Click:** "View Pricing Plans" (from locked screen)
2. **Choose** a plan and subscribe again
3. **Use test card:** `4242 4242 4242 4242`
4. **Complete payment**

### Test 7.2: Verify Access Restored

1. **Go to:** http://localhost:3000/app/activities
2. **Verify:**
   - [ ] Activities are visible again
   - [ ] No lock screen
   - [ ] Can see all 8 activities

? **Re-subscription works!**

---

## ?? Part 8: Edge Case Testing ?

### Test 8.1: Direct URL Access (Middleware)

1. **Sign out** (clear cookies):
   - Open DevTools (F12)
   - Application ? Cookies ? Delete `llama_session`
2. **Try to access:** http://localhost:3000/app/activities
3. **Verify:**
   - [ ] Redirects to `/signin`
   - [ ] Cannot access without signing in

? **Middleware protection working!**

### Test 8.2: Multiple Webhook Retries

**Resend the same event 3 times:**
```bash
stripe events resend evt_xxx
stripe events resend evt_xxx
stripe events resend evt_xxx
```

**Check Terminal 1:**
- Should show "already processed" 3 times
- No errors
- Database unchanged

**Check WebhookEvent table:**
- Still only ONE entry for that event

? **Handles multiple retries perfectly!**

### Test 8.3: Invalid Session ID

1. **Go to:** http://localhost:3000/success?session_id=invalid_123
2. **Verify:**
   - [ ] Either redirects or shows error gracefully
   - [ ] App doesn't crash

---

## ?? Part 9: Verify Data Integrity ?

### Check All Tables

**Open Prisma Studio:** `npx prisma studio`

**User Table:**
- [ ] Has your email
- [ ] Has stripeCustomerId (starts with `cus_`)
- [ ] Has createdAt timestamp

**Session Table:**
- [ ] Has session token
- [ ] Has userId (matches your user)
- [ ] Has expiresAt (7 days from now)

**Subscription Table:**
- [ ] Has userId (matches your user)
- [ ] Has stripeSubscriptionId (starts with `sub_`)
- [ ] Status shows current state (active/canceled)
- [ ] Has currentPeriodEnd date

**WebhookEvent Table:**
- [ ] Has multiple events
- [ ] Each has unique stripeEventId
- [ ] Each has eventType
- [ ] Each has createdAt timestamp

? **All data looks good!**

---

## ?? Part 10: Test All Pages ?

Quick page checklist:

**Public Pages:**
- [ ] `/` - Homepage loads
- [ ] `/signin` - Sign in form works
- [ ] `/pricing` - Pricing cards display
- [ ] `/success` - Success page with session_id
- [ ] `/cancel` - Cancel page shows

**Protected Pages:**
- [ ] `/app/activities` - Gated content
- [ ] `/account` - Account details

**API Routes:**
- [ ] POST `/api/auth/start` - Creates session
- [ ] POST `/api/checkout/session` - Creates checkout
- [ ] POST `/api/stripe/webhook` - Processes webhooks

---

## ? Complete Testing Checklist

### Core Functionality:
- [x] User can sign in with email
- [x] User can view pricing
- [x] User can start checkout
- [x] Payment processes successfully
- [x] Webhook fires and updates database
- [x] User gains access to activities
- [x] User can view account details
- [x] User can be canceled and loses access
- [x] User can re-subscribe

### Idempotency:
- [x] Events are recorded in WebhookEvent table
- [x] Duplicate events are detected
- [x] Duplicate events don't reprocess
- [x] Multiple retries handled safely
- [x] No duplicate subscriptions created

### Security:
- [x] Middleware protects gated routes
- [x] Cannot access activities without subscription
- [x] Session cookies work correctly
- [x] Webhook signature verification works

### Edge Cases:
- [x] Invalid session IDs handled
- [x] Direct URL access blocked
- [x] Expired sessions handled
- [x] Multiple webhook retries safe

---

## ?? Troubleshooting

### Issue: Webhook not firing

**Check:**
1. Is Stripe CLI running in Terminal 2?
2. Does webhook secret match in `.env.local`?
3. Did you restart dev server after adding secret?
4. Check Terminal 2 for error messages

**Fix:**
```bash
# Restart Stripe listener
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Issue: Activities still locked after payment

**Check:**
1. Did webhook fire? Check Terminal 2
2. Was webhook processed? Check Terminal 1 logs
3. Check database: Does subscription exist?
4. Is status "active"?
5. Is currentPeriodEnd in the future?

**Debug:**
```bash
# Open Prisma Studio
npx prisma studio

# Check Subscription table
# Verify status and dates
```

### Issue: "Price ID not configured"

**Check:**
1. Did you add price IDs to `.env.local`?
2. Did you restart dev server?
3. Are price IDs correct format (start with `price_`)?

**Fix:**
1. Copy price IDs from Stripe dashboard
2. Paste into `.env.local` AND `.env`
3. Restart: `npm run dev`

### Issue: Build fails

**Check:**
```bash
# Check for errors
npm run lint

# Check TypeScript
npm run build
```

---

## ?? Success Criteria

You've successfully tested everything if:

? **Sign In:** Works with any email  
? **Checkout:** Redirects to Stripe  
? **Payment:** Processes with test card  
? **Webhook:** Fires and logs show success  
? **Activities:** Unlocked after payment  
? **Idempotency:** Duplicate events prevented  
? **Cancellation:** Removes access  
? **Re-subscription:** Restores access  
? **Database:** All 4 tables populated correctly  

---

## ?? What's Next?

### After Successful Testing:

1. **Review logs** - Everything clean?
2. **Check database** - All data correct?
3. **Test edge cases** - Try to break it!
4. **Read deployment guide** - Ready to ship?

### Ready to Deploy?

See: `DEPLOYMENT_CHECKLIST.md`

---

## ?? What You Tested

### You Verified:
- ? Complete subscription flow
- ? Webhook processing
- ? Idempotency protection
- ? Access control
- ? Database integrity
- ? Security measures
- ? Error handling

### You Can Confidently Say:
- ? Payment processing works
- ? Webhooks are reliable
- ? Duplicates are prevented
- ? Security is solid
- ? App is production-ready

---

## ?? Feeling Confident?

**Your app is working perfectly in test mode!**

Next step: Deploy to production! ??

See `DEPLOYMENT_CHECKLIST.md` for deployment steps.

---

**Happy Testing! ???**
