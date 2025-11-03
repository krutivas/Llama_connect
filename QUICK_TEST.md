# ? Quick Test Reference Card

## ?? Quick Start (Copy & Paste)

### Terminal 1 - Dev Server:
```bash
npm run dev
```

### Terminal 2 - Stripe Webhooks:
```bash
stripe listen --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` secret and add to `.env.local` and `.env`, then restart Terminal 1.

---

## ?? Test Card Numbers

**Success:**
```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

**Decline:**
```
Card: 4000 0000 0000 9995
```

**3D Secure:**
```
Card: 4000 0025 0000 3155
```

---

## ?? Quick Links

- **App:** http://localhost:3000
- **Prisma Studio:** http://localhost:5555 (`npx prisma studio`)
- **Stripe Dashboard:** https://dashboard.stripe.com/test
- **Stripe Events:** https://dashboard.stripe.com/test/events

---

## ? Testing Checklist

### Basic Flow (5 min):
- [ ] Open http://localhost:3000
- [ ] Sign in with `test@example.com`
- [ ] Click "Subscribe Monthly"
- [ ] Pay with `4242 4242 4242 4242`
- [ ] See success page
- [ ] Access /app/activities (unlocked!)

### Webhook Check:
- [ ] Check Terminal 2 for `checkout.session.completed`
- [ ] Check Terminal 1 for success logs
- [ ] Open Prisma Studio, check WebhookEvent table

### Idempotency Test:
```bash
# In Terminal 2, find event ID like: evt_xxx
stripe events resend evt_xxx
# Check Terminal 1 - should say "already processed"
```

### Cancellation:
- [ ] Go to Stripe Dashboard ? Subscriptions
- [ ] Cancel your subscription
- [ ] Refresh /app/activities
- [ ] Should show lock screen ??

---

## ?? Quick Fixes

### Webhook not working?
```bash
# Restart Stripe listener
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy new whsec_... to .env.local
# Restart dev server
```

### Database issues?
```bash
npx prisma migrate dev
npx prisma generate
```

### Clear everything and restart?
```bash
rm prisma/dev.db
npx prisma migrate dev --name init
npm run dev
```

---

## ?? What to Check

**Terminal 1 (Dev Server):**
- ? No errors
- ? Webhook logs appear
- ? "Subscription created" message

**Terminal 2 (Stripe CLI):**
- ? Events received: `-->`
- ? Responses: `<-- [200]`
- ? No [400] or [500] errors

**Prisma Studio:**
- ? User created
- ? Session created
- ? Subscription active
- ? WebhookEvent recorded

---

## ?? Success = All Green!

If everything above works, you're ready to deploy! ??

See `TESTING_GUIDE.md` for detailed instructions.
