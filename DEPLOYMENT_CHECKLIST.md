# ?? Llama Connect - Deployment Checklist

## Pre-Launch Verification

### ? Local Testing Complete
- [x] App builds successfully (`npm run build`)
- [x] Linting passes (`npm run lint`)
- [x] TypeScript compiles with no errors
- [x] Database migrations run successfully
- [x] All pages render correctly
- [x] API routes respond properly

---

## ?? Deployment Steps

### Step 1: Choose Your Platform

**Recommended: Vercel** (Best for Next.js)
- ? Built by Next.js creators
- ? Zero-config deployment
- ? Automatic HTTPS
- ? Great free tier
- ? Easy environment variables

**Alternatives:**
- Netlify (Good alternative)
- Railway (Includes database hosting)
- Heroku (Classic choice)
- AWS/GCP/Azure (Enterprise)

---

## ?? Vercel Deployment (Recommended)

### Step 1: Prepare Your Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Llama Connect subscription app"

# Push to GitHub/GitLab/Bitbucket
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to** [vercel.com](https://vercel.com)
2. **Sign up** with GitHub/GitLab/Bitbucket
3. **Click** "Add New Project"
4. **Import** your repository
5. **Configure** project:
   - Framework: Next.js (auto-detected)
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`

### Step 3: Set Environment Variables

In Vercel dashboard, add these environment variables:

```env
# Database (use production database URL)
DATABASE_URL="your-production-database-url"

# Stripe LIVE Keys (switch from test to live!)
STRIPE_SECRET_KEY="sk_live_YOUR_LIVE_KEY"
STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_LIVE_KEY"

# Stripe Production Price IDs (create in live mode)
STRIPE_PRICE_MONTHLY="price_YOUR_LIVE_MONTHLY_ID"
STRIPE_PRICE_ANNUAL="price_YOUR_LIVE_ANNUAL_ID"

# Production webhook secret (get from Stripe dashboard)
STRIPE_WEBHOOK_SECRET="whsec_YOUR_PRODUCTION_SECRET"

# Your production URL
NEXT_PUBLIC_BASE_URL="https://your-domain.vercel.app"
```

### Step 4: Deploy!

Click **"Deploy"** and wait ~2 minutes.

Your app will be live at: `https://your-project.vercel.app`

---

## ??? Database Setup for Production

### Option 1: Vercel Postgres (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Create Postgres database
vercel postgres create

# Get connection string (automatically added to env vars)
# Run migrations
npx prisma migrate deploy
```

### Option 2: Railway (Good for beginners)

1. Go to [railway.app](https://railway.app)
2. Create new project ? PostgreSQL
3. Copy connection string
4. Add to Vercel environment variables as `DATABASE_URL`
5. Run migrations: `npx prisma migrate deploy`

### Option 3: Supabase (Generous free tier)

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy database connection string
4. Add to Vercel as `DATABASE_URL`
5. Update schema to PostgreSQL (from SQLite):
   ```prisma
   datasource db {
     provider = "postgresql"  // Changed from sqlite
     url      = env("DATABASE_URL")
   }
   ```
6. Run migrations: `npx prisma migrate deploy`

### Option 4: PlanetScale (MySQL, great free tier)

1. Go to [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection string
4. Update Prisma schema to MySQL
5. Deploy

---

## ?? Stripe Production Setup

### Switch to Live Mode

1. **Go to** [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Toggle** to "Live mode" (top-right)
3. **Get API keys** from Developers ? API keys
   - Copy `pk_live_...` (Publishable key)
   - Copy `sk_live_...` (Secret key)

### Create Production Products

1. **Go to** Products
2. **Create** Monthly product:
   - Name: "Llama Connect Monthly"
   - Price: $9.99 USD
   - Billing: Monthly, recurring
   - Copy **Price ID** (`price_...`)

3. **Create** Annual product:
   - Name: "Llama Connect Annual"  
   - Price: $99 USD
   - Billing: Yearly, recurring
   - Copy **Price ID** (`price_...`)

### Set Up Production Webhook

1. **Go to** Developers ? Webhooks
2. **Click** "Add endpoint"
3. **Enter URL:** `https://your-domain.vercel.app/api/stripe/webhook`
4. **Select events:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. **Copy** signing secret (`whsec_...`)
6. **Add** to Vercel environment variables

---

## ?? Post-Deployment Testing

### Test 1: Basic Pages
- [ ] Visit homepage - should load
- [ ] Sign in page - should render
- [ ] Pricing page - should show plans

### Test 2: Sign In
- [ ] Enter real email
- [ ] Should create account
- [ ] Should set session cookie
- [ ] Should redirect to pricing

### Test 3: Subscription Flow
- [ ] Click subscribe on either plan
- [ ] Should redirect to Stripe Checkout
- [ ] Use **real card** (you'll actually be charged!)
- [ ] Complete payment
- [ ] Should redirect to success page
- [ ] Should show subscription details

### Test 4: Verify Webhook
- [ ] Check Vercel logs for webhook event
- [ ] Check Stripe dashboard ? Events
- [ ] Verify subscription created in database
- [ ] Visit /app/activities - should be unlocked

### Test 5: Account Page
- [ ] Visit /account
- [ ] Should show subscription status
- [ ] Should show next billing date
- [ ] Should show correct plan

### Test 6: Cancellation (Important!)
- [ ] Go to Stripe dashboard ? Customers
- [ ] Find your subscription
- [ ] Cancel it
- [ ] Wait for webhook
- [ ] Refresh /app/activities
- [ ] Should show lock screen

---

## ?? Security Checklist

### Before Going Live:

- [ ] All Stripe keys are LIVE mode (not test)
- [ ] Webhook secret is production secret
- [ ] DATABASE_URL points to production database
- [ ] NEXT_PUBLIC_BASE_URL is your production URL
- [ ] No test data in production database
- [ ] Environment variables are set in hosting platform (not in code)
- [ ] `.env` and `.env.local` are in `.gitignore`
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] Cookies set to `secure: true` in production (already done in code)

---

## ?? Monitoring Setup

### Stripe Dashboard

Monitor these daily:
- **Payments** - See successful subscriptions
- **Customers** - Track new signups
- **Events** - Watch webhook deliveries
- **Disputes** - Handle any chargebacks (rare)

### Vercel Dashboard

Monitor:
- **Deployments** - Track builds
- **Logs** - Check for errors
- **Analytics** - See traffic (upgrade for more)
- **Performance** - Response times

### Set Up Alerts

1. **Stripe Email Notifications:**
   - Go to Settings ? Notifications
   - Enable alerts for failed payments, disputes

2. **Vercel Notifications:**
   - Enable deployment notifications
   - Set up error alerts (if on paid plan)

---

## ?? Common Issues & Solutions

### Issue: Webhook Not Receiving Events
**Solution:**
- Check webhook URL is correct
- Verify webhook secret in environment variables
- Check Stripe dashboard ? Events for delivery attempts
- Check Vercel logs for incoming requests

### Issue: Subscription Not Unlocking Activities
**Solution:**
- Check database - is subscription created?
- Verify subscription status is "active" or "trialing"
- Check currentPeriodEnd is in the future
- Look at Vercel logs for webhook processing

### Issue: Payment Succeeds but No Webhook
**Solution:**
- Stripe may retry webhooks for up to 3 days
- Check Stripe Events tab for delivery status
- Manually resend webhook from Stripe dashboard
- Verify webhook endpoint is accessible (not behind auth)

### Issue: Users Can't Sign In
**Solution:**
- Check database connection
- Verify Prisma migrations ran
- Check Vercel logs for errors
- Test database connectivity

---

## ?? Growth Checklist

### Immediate (Week 1):
- [ ] Share with friends/family for testing
- [ ] Monitor Stripe dashboard daily
- [ ] Check Vercel logs for errors
- [ ] Test on mobile devices
- [ ] Verify email addresses work for sign-in

### Short-term (Month 1):
- [ ] Set up Google Analytics (optional)
- [ ] Add error tracking (Sentry, optional)
- [ ] Monitor customer feedback
- [ ] Fix any reported bugs
- [ ] Consider implementing improvements from IMPROVEMENTS_GUIDE.md

### Long-term:
- [ ] Add Customer Portal for self-service billing
- [ ] Implement email notifications
- [ ] Add more bonding activities
- [ ] Build activity tracking features
- [ ] Add social features (optional)

---

## ?? Pricing Considerations

### Costs to Expect:

**Vercel:**
- Free tier: $0/month (good for starting out)
- Pro: $20/month (more features, no ads)

**Database:**
- Vercel Postgres: Free tier available
- Railway: $5/month for small DB
- Supabase: Free tier (generous)

**Stripe:**
- 2.9% + $0.30 per transaction
- No monthly fees
- Example: $9.99 subscription = $0.59 to Stripe, $9.40 to you

---

## ?? Launch Day Checklist

### Morning of Launch:

- [ ] ? Get coffee
- [ ] Double-check all environment variables
- [ ] Test complete user flow one more time
- [ ] Have credit card ready for test purchase
- [ ] Clear browser cache before testing
- [ ] Test on mobile AND desktop

### During Launch:

- [ ] Share link with initial users
- [ ] Monitor Stripe dashboard live
- [ ] Watch Vercel logs in real-time
- [ ] Have Stripe dashboard open in one tab
- [ ] Have Vercel logs open in another tab
- [ ] Respond to any issues immediately

### End of Day:

- [ ] Review all transactions
- [ ] Check for any errors in logs
- [ ] Verify webhook events processed
- [ ] Send thank you to first customers
- [ ] Celebrate! ??

---

## ?? Support Resources

### If You Get Stuck:

**Stripe Support:**
- Email: support@stripe.com
- Chat: In Stripe dashboard
- Docs: https://docs.stripe.com

**Vercel Support:**
- Twitter: @vercel
- Discord: vercel.com/discord
- Docs: https://vercel.com/docs

**Your Code:**
- README.md - Full documentation
- SETUP_GUIDE.md - Setup instructions
- IMPROVEMENTS_GUIDE.md - Enhancement ideas
- STRIPE_COMPLIANCE_AUDIT.md - Technical details

---

## ?? Success Metrics

### Track These KPIs:

**Week 1:**
- [ ] Number of signups
- [ ] Number of subscriptions
- [ ] Conversion rate (visitors ? subscribers)
- [ ] Any errors or issues reported

**Month 1:**
- [ ] Monthly Recurring Revenue (MRR)
- [ ] Churn rate (cancellations)
- [ ] Average revenue per user (ARPU)
- [ ] Customer feedback/satisfaction

---

## ?? You're Ready!

### Final Reminders:

1. ? Your code is production-ready
2. ? Security is excellent
3. ? Stripe integration follows best practices
4. ? You have comprehensive documentation
5. ? Support resources are available

### What You Built:

- ?? A complete subscription platform
- ?? Secure payment processing
- ?? Gated content system
- ?? Responsive, modern UI
- ??? Enterprise-grade security
- ?? Professional documentation

---

## ?? DEPLOY COMMAND

When you're ready:

```bash
# Push to GitHub
git push origin main

# Or deploy with Vercel CLI
vercel --prod
```

---

**You've got this! Ship it and start helping families connect! ????**

---

*Need help? All documentation is in the `/workspace` folder.*  
*Have questions? Everything is documented in the README.md*  
*Want to improve? Check IMPROVEMENTS_GUIDE.md*

**GO MAKE IT HAPPEN! ??**
