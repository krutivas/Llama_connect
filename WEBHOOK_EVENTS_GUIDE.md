# ?? Stripe Webhook Events - Complete Guide

## ?? Where Webhooks Are Handled

**File:** `/workspace/app/api/stripe/webhook/route.ts`

This is the **ONLY** file where you handle Stripe webhook events.

---

## ? Events Currently Handled (5 Total)

### 1. **`checkout.session.completed`** - Initial Payment Success ?
**When it fires:** Customer completes payment for the first time  
**What it does:** 
- Creates subscription in database
- Stores Stripe customer ID
- **Grants access to activities** ?
- Updates subscription status to "active"

**Code location:** Line 69-71
```typescript
case 'checkout.session.completed':
  await handleCheckoutCompleted(event.data.object);
  break;
```

**This is the main event that gives users access after payment!**

---

### 2. **`customer.subscription.updated`** - Subscription Changes
**When it fires:** 
- Subscription status changes
- Plan upgraded/downgraded
- Billing cycle renews

**What it does:**
- Updates subscription status in database
- Updates currentPeriodEnd date

**Code location:** Line 73-75

---

### 3. **`customer.subscription.deleted`** - Cancellation
**When it fires:** Subscription is canceled

**What it does:**
- Sets status to "canceled"
- **Revokes access to activities** ??
- Updates period end date

**Code location:** Line 77-79

---

### 4. **`invoice.payment_succeeded`** - Recurring Payment Success ? NEW
**When it fires:** Monthly/annual renewal payment succeeds

**What it does:**
- Confirms subscription is still active
- Updates subscription details
- Maintains access to activities ?
- (Optional) Send confirmation email

**Code location:** Line 81-83

**Why this matters:** Ensures access continues after recurring payments!

---

### 5. **`invoice.payment_failed`** - Payment Failed ?? NEW
**When it fires:** Monthly/annual renewal payment fails

**What it does:**
- Updates subscription status (usually to "past_due")
- Subscription enters grace period
- (Optional) Send notification to user

**Code location:** Line 85-87

**Why this matters:** Allows you to notify users to update payment method!

---

## ?? Webhook Flow Diagram

### Initial Purchase:
```
User pays ? checkout.session.completed ? Create subscription ? Grant access ?
```

### Monthly Renewal (Success):
```
Stripe charges card ? invoice.payment_succeeded ? Confirm active ? Keep access ?
```

### Monthly Renewal (Failure):
```
Stripe charges card ? invoice.payment_failed ? Status: past_due ? Show warning ??
```

### Cancellation:
```
User cancels ? customer.subscription.deleted ? Status: canceled ? Revoke access ??
```

---

## ?? How to Update Webhook Listeners

### For Local Testing (Stripe CLI):

**Current command:**
```bash
stripe listen --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted --forward-to localhost:3000/api/stripe/webhook
```

**Updated command (with new events):**
```bash
stripe listen \
  --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed \
  --forward-to localhost:3000/api/stripe/webhook
```

---

### For Production (Stripe Dashboard):

1. **Go to:** https://dashboard.stripe.com/webhooks
2. **Click:** "Add endpoint"
3. **URL:** `https://your-domain.com/api/stripe/webhook`
4. **Select events:**
   - ? `checkout.session.completed`
   - ? `customer.subscription.updated`
   - ? `customer.subscription.deleted`
   - ? `invoice.payment_succeeded` (NEW)
   - ? `invoice.payment_failed` (NEW)
5. **Copy** webhook signing secret
6. **Add** to production environment variables

---

## ?? What Each Event Does for Access Control

| Event | Access Status | User Experience |
|-------|--------------|-----------------|
| `checkout.session.completed` | ? **Grant Access** | Activities unlocked! |
| `invoice.payment_succeeded` | ? **Keep Access** | Smooth renewal |
| `customer.subscription.updated` | ? Stay Active | Status updated |
| `invoice.payment_failed` | ?? **Grace Period** | Show warning banner |
| `customer.subscription.deleted` | ?? **Revoke Access** | Activities locked |

---

## ?? Understanding the Flow

### Scenario 1: New Customer
```
Day 1:  Customer subscribes
        ? checkout.session.completed fires
        ? Access granted ?
        ? Can see activities

Day 30: First renewal
        ? invoice.payment_succeeded fires
        ? Confirms still active ?
        ? Access continues
```

### Scenario 2: Payment Failure
```
Day 30: Renewal payment fails
        ? invoice.payment_failed fires
        ? Status: "past_due"
        ? User still has access (grace period)
        ? Show warning: "Update payment method"

Day 31: User updates card
        ? invoice.payment_succeeded fires
        ? Status: "active"
        ? Warning removed ?
```

### Scenario 3: Cancellation
```
Any day: User cancels
         ? customer.subscription.deleted fires
         ? Status: "canceled"
         ? Access revoked immediately ??
         ? Shows lock screen
```

---

## ?? How to Test New Events

### Test invoice.payment_succeeded:

**Option 1: Use Stripe CLI**
```bash
stripe trigger invoice.payment_succeeded
```

**Option 2: Simulate in Dashboard**
1. Go to https://dashboard.stripe.com/test/subscriptions
2. Click on a subscription
3. Click "..." menu ? "Update subscription"
4. This triggers invoice events

---

### Test invoice.payment_failed:

**Option 1: Use Stripe CLI**
```bash
stripe trigger invoice.payment_failed
```

**Option 2: Use Failing Card**
1. Update payment method to `4000 0000 0000 0341`
2. Wait for next billing cycle
3. Payment will fail

**Option 3: Manually fail in Dashboard**
1. Go to subscription
2. Update payment method to test failing card
3. Trigger manual invoice

---

## ?? Complete Event Reference

### Events You MUST Handle:
- ? `checkout.session.completed` - Initial payment (grants access)
- ? `customer.subscription.deleted` - Cancellation (revokes access)

### Events You SHOULD Handle:
- ? `customer.subscription.updated` - Status changes
- ? `invoice.payment_succeeded` - Recurring payments (confirms access)
- ? `invoice.payment_failed` - Payment issues (warn user)

### Events You COULD Handle (Optional):
- `customer.subscription.trial_will_end` - Notify before trial ends
- `invoice.upcoming` - Notify before next charge
- `charge.refunded` - Handle refunds
- `charge.dispute.created` - Handle chargebacks

---

## ?? Security Features (Already Implemented)

? **Webhook Signature Verification** (Line 39)
- Verifies requests actually come from Stripe
- Prevents fake webhook attacks

? **Idempotency** (Line 54-65)
- Prevents duplicate processing
- Handles Stripe retries safely

? **Error Handling** (Line 95-100)
- Catches errors
- Allows Stripe to retry

---

## ?? Monitoring Webhooks

### Check Logs in Development:
```bash
# Terminal with dev server shows:
[Webhook] Successfully processed checkout.session.completed - evt_xxx
[Webhook] Recurring payment succeeded for subscription sub_xxx
[Webhook] Payment failed for subscription sub_xxx - status: past_due
```

### Check in Production:

**Vercel Logs:**
- Go to Vercel Dashboard ? Your Project ? Logs
- Filter by `/api/stripe/webhook`

**Stripe Dashboard:**
- Go to Developers ? Events
- See all webhook deliveries
- Check response codes (200 = success)

---

## ?? Troubleshooting

### Webhook not firing?

**Check:**
1. Is Stripe CLI running? (`stripe listen...`)
2. Is webhook secret correct in `.env.local`?
3. Did you restart dev server after adding secret?

**Solution:**
```bash
# Get new webhook secret
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy whsec_... to .env.local
# Restart: npm run dev
```

---

### Event received but not processed?

**Check Terminal 1 logs for errors:**
```bash
# Look for:
[Webhook] Handler error: ...
# This tells you what went wrong
```

**Common issues:**
- Database connection lost
- Subscription ID not found
- Stripe API error

---

### Access not granted after payment?

**Debug checklist:**
1. Did `checkout.session.completed` fire?
2. Check Terminal for "Subscription created" log
3. Open Prisma Studio: `npx prisma studio`
4. Check Subscription table:
   - Status should be "active"
   - currentPeriodEnd should be in future
5. Check WebhookEvent table:
   - Event should be recorded

---

## ? Summary

### Where to Update:
**File:** `/workspace/app/api/stripe/webhook/route.ts`

### What's Handled Now:
1. ? Initial payment (grants access)
2. ? Recurring payments (confirms access)
3. ? Payment failures (grace period)
4. ? Subscription updates
5. ? Cancellations (revokes access)

### How Access is Granted:
- `checkout.session.completed` ? Creates subscription ? Access granted
- `invoice.payment_succeeded` ? Confirms active ? Access maintained

### How Access is Revoked:
- `customer.subscription.deleted` ? Status: canceled ? Access removed

---

## ?? You're All Set!

Your webhook handler now covers:
- ? Initial payments
- ? Recurring payments
- ? Payment failures
- ? Cancellations
- ? Status updates

**Everything is automated!** When customers pay, they automatically get access. When they cancel, access is automatically revoked.

---

**Need to test?** See `TESTING_GUIDE.md`  
**Ready to deploy?** See `DEPLOYMENT_CHECKLIST.md`
