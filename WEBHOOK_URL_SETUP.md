# ?? Stripe Webhook URL - Complete Setup Guide

## ?? Quick Answer

### Your Webhook Endpoint:
```
/api/stripe/webhook
```

### Full URLs by Environment:

**Local Development:**
```
http://localhost:3000/api/stripe/webhook
```

**Production (example):**
```
https://your-domain.com/api/stripe/webhook
```

---

## ?? LOCAL TESTING SETUP

### Step 1: Start Dev Server

**Terminal 1:**
```bash
npm run dev
```

Your app runs at: `http://localhost:3000`

### Step 2: Start Stripe Webhook Forwarding

**Terminal 2:**
```bash
stripe listen --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed --forward-to localhost:3000/api/stripe/webhook
```

### Step 3: Get Webhook Secret

Terminal 2 will show:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### Step 4: Add Secret to Environment

**Update `.env.local`:**
```env
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
```

**Also update `.env`:**
```env
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
```

### Step 5: Restart Dev Server

**Terminal 1:**
- Press `Ctrl+C`
- Run `npm run dev` again

### ? Local Setup Complete!

**Test URL:** http://localhost:3000/api/stripe/webhook  
**Forwarded by:** Stripe CLI  
**Webhook Secret:** From Stripe CLI output  

---

## ?? PRODUCTION SETUP

### Step 1: Deploy Your App

Deploy to hosting platform (Vercel recommended).

**Example URLs after deployment:**
- Vercel: `https://llama-connect.vercel.app`
- Netlify: `https://llama-connect.netlify.app`
- Railway: `https://llama-connect.up.railway.app`
- Custom domain: `https://llamaconnect.com`

### Step 2: Construct Webhook URL

Take your production domain and add `/api/stripe/webhook`:

**Examples:**
```
https://llama-connect.vercel.app/api/stripe/webhook
https://llamaconnect.com/api/stripe/webhook
https://app.llamaconnect.com/api/stripe/webhook
```

### Step 3: Add Webhook in Stripe Dashboard

1. **Go to:** https://dashboard.stripe.com/webhooks

2. **IMPORTANT: Switch to LIVE mode**
   - Toggle in top-right corner
   - Should NOT say "Test mode"

3. **Click:** "+ Add endpoint"

4. **Fill in form:**
   ```
   Endpoint URL: https://your-domain.com/api/stripe/webhook
   Description: Llama Connect Production Webhooks
   Version: Latest API version
   ```

5. **Click:** "Select events"

6. **Select these events:**
   - ? checkout.session.completed
   - ? customer.subscription.updated
   - ? customer.subscription.deleted
   - ? invoice.payment_succeeded
   - ? invoice.payment_failed

7. **Click:** "Add endpoint"

### Step 4: Get Production Webhook Secret

After creating endpoint:

1. **Click** on the newly created endpoint
2. **Find** "Signing secret" section
3. **Click** "Reveal"
4. **Copy** the `whsec_...` secret

### Step 5: Add to Production Environment

**On Vercel:**
1. Go to Project Settings
2. Environment Variables
3. Add: `STRIPE_WEBHOOK_SECRET` = `whsec_your_production_secret`
4. Redeploy app

**On Netlify:**
1. Site Settings
2. Build & Deploy ? Environment
3. Add: `STRIPE_WEBHOOK_SECRET` = `whsec_your_production_secret`
4. Trigger deploy

**On Railway:**
1. Project Variables
2. Add: `STRIPE_WEBHOOK_SECRET` = `whsec_your_production_secret`
3. Redeploy

### ? Production Setup Complete!

**Production URL:** https://your-domain.com/api/stripe/webhook  
**Configured in:** Stripe Dashboard ? Webhooks  
**Webhook Secret:** From Stripe Dashboard  

---

## ?? Comparison: Local vs Production

| Aspect | Local Testing | Production |
|--------|--------------|------------|
| **URL** | `localhost:3000/api/stripe/webhook` | `https://your-domain.com/api/stripe/webhook` |
| **Setup Method** | Stripe CLI (`stripe listen`) | Stripe Dashboard (Webhooks page) |
| **Webhook Secret** | From CLI output | From Dashboard |
| **Stripe Mode** | Test mode | Live mode |
| **Valid For** | Only your computer | Everyone |
| **Expires** | When CLI stops | Never (unless deleted) |

---

## ?? Testing the Webhook URL

### Local Testing:

```bash
# Terminal 1: Dev server running
npm run dev

# Terminal 2: Stripe forwarding running
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Terminal 3: Test
curl -X POST http://localhost:3000/api/stripe/webhook
# Should get "No signature provided" (means endpoint exists)
```

### Production Testing:

```bash
# Test endpoint is reachable
curl -X POST https://your-domain.com/api/stripe/webhook
# Should get "No signature provided" (means endpoint exists)
```

Or check in Stripe Dashboard:
1. Go to Webhooks
2. Click your endpoint
3. Click "Send test webhook"
4. Choose an event type
5. Click "Send test webhook"
6. Should show 200 response

---

## ?? Security Notes

### Your Webhook Endpoint:

**? GOOD:**
- Uses HTTPS in production (automatic on Vercel/Netlify)
- Verifies webhook signatures
- Checks idempotency
- Logs all events

**? Don't worry about:**
- Public URL - it's supposed to be public!
- Stripe sends events to it
- Signature verification prevents fake requests

**??? Protection:**
Your webhook handler verifies every request:
```typescript
// Verifies signature - only Stripe can send valid requests
event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

---

## ?? Where is the Endpoint Defined?

### In Your Code:

**File:** `/workspace/app/api/stripe/webhook/route.ts`

**Next.js automatically creates the route:**
```
File path:        app/api/stripe/webhook/route.ts
Becomes route:    /api/stripe/webhook
Full URL (local): http://localhost:3000/api/stripe/webhook
Full URL (prod):  https://your-domain.com/api/stripe/webhook
```

**No additional configuration needed!** Next.js handles routing automatically.

---

## ?? Common Issues

### Issue: "Webhook not receiving events in production"

**Check:**
1. Is webhook URL correct in Stripe Dashboard?
2. Is webhook secret correct in environment variables?
3. Did you redeploy after adding secret?
4. Is URL using HTTPS (not HTTP)?
5. Check Stripe Dashboard ? Webhooks ? View events ? Any 400/500 errors?

**Solution:**
```bash
# Verify webhook is reachable
curl -I https://your-domain.com/api/stripe/webhook
# Should return 405 Method Not Allowed (POST is required, not GET)

# Check Stripe Dashboard Events tab for delivery status
```

---

### Issue: "Webhook secret invalid"

**Common causes:**
- Using test secret in production (or vice versa)
- Secret has spaces or quotes
- Secret not added to environment variables
- App not redeployed after adding secret

**Solution:**
1. Get correct secret from Stripe Dashboard (live mode for production)
2. Add to environment variables (no quotes, no spaces)
3. Redeploy application
4. Test: Send test webhook from Stripe Dashboard

---

### Issue: "Can't set up webhook in Stripe Dashboard"

**Requirements:**
- Must have deployed app (localhost won't work!)
- URL must be HTTPS (not HTTP)
- URL must be publicly accessible
- Must switch to Live mode for production webhooks

**For testing, use Stripe CLI instead:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## ? Quick Setup Checklist

### Local Development:
- [ ] Dev server running (`npm run dev`)
- [ ] Stripe CLI installed
- [ ] Stripe CLI forwarding (`stripe listen --forward-to...`)
- [ ] Webhook secret in `.env.local` and `.env`
- [ ] Dev server restarted after adding secret

### Production:
- [ ] App deployed to hosting platform
- [ ] Production URL obtained
- [ ] Switched to Live mode in Stripe
- [ ] Webhook endpoint added in Stripe Dashboard
- [ ] Correct events selected (5 events)
- [ ] Webhook secret copied
- [ ] Secret added to production environment variables
- [ ] App redeployed
- [ ] Test webhook sent successfully

---

## ?? Related Files

**Webhook handler:** `/workspace/app/api/stripe/webhook/route.ts`  
**Environment template:** `.env.local.example`  
**Testing guide:** `TESTING_GUIDE.md`  
**Webhook events:** `WEBHOOK_EVENTS_GUIDE.md`  
**Deployment:** `DEPLOYMENT_CHECKLIST.md`  

---

## ?? Summary

### Your Webhook URL Format:
```
[YOUR_DOMAIN]/api/stripe/webhook
```

### Examples:
- **Local:** `http://localhost:3000/api/stripe/webhook` (via Stripe CLI)
- **Production:** `https://your-domain.com/api/stripe/webhook` (via Dashboard)

### Setup:
- **Local:** Use `stripe listen` command
- **Production:** Add in Stripe Dashboard ? Webhooks

### Security:
- ? Signature verification built-in
- ? HTTPS in production
- ? Idempotency protection
- ? Public endpoint is safe!

---

**Ready to set up?** Follow the checklist above!

**Need help testing?** See `TESTING_GUIDE.md`

**Ready to deploy?** See `DEPLOYMENT_CHECKLIST.md`
