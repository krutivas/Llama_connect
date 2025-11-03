# ?? Update Stripe Keys - Quick Reference

## ?? **Files to Edit**

### 1. `/workspace/.env.local`
### 2. `/workspace/.env`

**Update BOTH files with the SAME values!**

---

## ?? **What to Update**

### Get from Stripe Dashboard ? Developers ? API keys:

```env
STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY_HERE"
```

### Get from Stripe Dashboard ? Products:

Create two products, then copy their Price IDs:

```env
STRIPE_PRICE_MONTHLY="price_YOUR_MONTHLY_ID"
STRIPE_PRICE_ANNUAL="price_YOUR_ANNUAL_ID"
```

---

## ? **Quick Steps**

### Step 1: Get Keys
1. Go to https://dashboard.stripe.com
2. Toggle to "Test mode"
3. Developers ? API keys
4. Copy both keys

### Step 2: Get Price IDs
1. Products ? Add product
2. Create Monthly ($9.99/month)
3. Create Annual ($99/year)
4. Copy both Price IDs

### Step 3: Update Files
1. Open `.env.local`
2. Replace placeholder values
3. Open `.env`
4. Replace with same values

### Step 4: Restart
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## ? **Verification**

### Test it works:
1. `npm run dev`
2. Go to http://localhost:3000
3. Sign in
4. Click "Subscribe"
5. See Stripe Checkout? ? Working!

---

## ?? **Finding Price IDs**

**WRONG (Product ID):**
```
prod_abc123
```

**CORRECT (Price ID):**
```
price_abc123
```

**Where to find:**
1. Dashboard ? Products
2. Click your product
3. Look in "Pricing" section
4. Copy the ID that starts with `price_`

---

## ?? **Troubleshooting**

### "Price ID not configured"
- Check you copied Price ID (not Product ID)
- Price ID starts with `price_`
- Restart dev server after updating

### "Invalid API key"
- Check you're in Test mode
- Keys should start with `pk_test_` and `sk_test_`
- Not `pk_live_` or `sk_live_`

### Changes not working
- Did you restart dev server?
- Did you update BOTH `.env.local` AND `.env`?
- No typos in keys?

---

## ?? **Checklist**

- [ ] Get secret key from Stripe
- [ ] Get publishable key from Stripe
- [ ] Create monthly product ($9.99)
- [ ] Create annual product ($99)
- [ ] Copy monthly price ID
- [ ] Copy annual price ID
- [ ] Update `.env.local` file
- [ ] Update `.env` file
- [ ] Restart dev server
- [ ] Test by subscribing

---

## ?? **Pro Tips**

1. **Never commit these files to git!**
   - They're in `.gitignore` already ?

2. **Test mode vs Live mode:**
   - Test: `pk_test_...` and `sk_test_...`
   - Live: `pk_live_...` and `sk_live_...`
   - Always use TEST for development!

3. **Where keys are used:**
   - `STRIPE_SECRET_KEY` ? Server-side API calls
   - `STRIPE_PUBLISHABLE_KEY` ? Client-side (browser)
   - `STRIPE_PRICE_MONTHLY` ? Monthly subscription
   - `STRIPE_PRICE_ANNUAL` ? Annual subscription

---

## ?? **Links**

- **Stripe Dashboard:** https://dashboard.stripe.com
- **API Keys:** https://dashboard.stripe.com/test/apikeys
- **Products:** https://dashboard.stripe.com/test/products

---

## ?? **Need Help?**

See detailed guides:
- `TESTING_GUIDE.md` - Full testing walkthrough
- `WEBHOOK_URL_SETUP.md` - Webhook configuration
- `README.md` - Complete documentation

---

**Remember:** Always use TEST mode keys for development!
