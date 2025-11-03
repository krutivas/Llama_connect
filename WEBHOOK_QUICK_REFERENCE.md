# ? Webhook Quick Reference

## ?? One File Controls Everything

```
/workspace/app/api/stripe/webhook/route.ts
```

This is the ONLY file that handles Stripe webhooks!

---

## ?? 5 Events Handled (Automatic Access Control)

### ? Already Working:
1. **`checkout.session.completed`** ? First payment ? **GRANTS ACCESS** ?
2. **`customer.subscription.updated`** ? Status changes ? Updates database
3. **`customer.subscription.deleted`** ? Cancellation ? **REVOKES ACCESS** ??

### ?? Just Added:
4. **`invoice.payment_succeeded`** ? Monthly renewal ? **KEEPS ACCESS** ?
5. **`invoice.payment_failed`** ? Payment failed ? Grace period + warning ??

---

## ?? How It Works

### When Customer Pays:
```
?? Customer subscribes
    ?
?? checkout.session.completed fires
    ?
?? Your webhook creates subscription
    ?
? Customer gets access to activities
```

### When Monthly Renewal:
```
?? Stripe charges card
    ?
?? invoice.payment_succeeded fires
    ?
?? Your webhook confirms active
    ?
? Customer keeps access
```

### When Payment Fails:
```
?? Stripe charge fails
    ?
?? invoice.payment_failed fires
    ?
?? Your webhook sets "past_due"
    ?
?? Customer sees warning (but keeps access temporarily)
```

### When Customer Cancels:
```
?? Customer cancels
    ?
?? customer.subscription.deleted fires
    ?
?? Your webhook sets "canceled"
    ?
?? Customer loses access immediately
```

---

## ?? To Update Stripe CLI

**Old command:**
```bash
stripe listen --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted --forward-to localhost:3000/api/stripe/webhook
```

**New command (with payment events):**
```bash
stripe listen --events checkout.session.completed,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed --forward-to localhost:3000/api/stripe/webhook
```

---

## ?? Quick Test

### Test New Payment Event:
```bash
# Simulate recurring payment success
stripe trigger invoice.payment_succeeded
```

### Check Logs:
```
Terminal 1 should show:
[Webhook] Recurring payment succeeded for subscription sub_xxx
```

---

## ? What You Get

### Automatic Access Management:
- ? New customers: Access granted on payment
- ? Recurring payments: Access maintained
- ? Failed payments: User warned, grace period
- ? Cancellations: Access revoked immediately

### All Without Manual Intervention!

---

## ?? Full Details

- **Complete guide:** See `WEBHOOK_EVENTS_GUIDE.md`
- **Testing guide:** See `TESTING_GUIDE.md`
- **Code file:** `/workspace/app/api/stripe/webhook/route.ts`

---

## ?? Key Takeaway

**You already had payment success handling!**

`checkout.session.completed` grants access when customers first pay.

**We just added:**
- `invoice.payment_succeeded` for recurring renewals
- `invoice.payment_failed` for payment failure warnings

**Everything is automatic and production-ready!** ?
