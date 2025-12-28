# 🔐 Vercel Environment Variables - Copy & Paste Ready

**Use these exact values in your Vercel dashboard**

---

## 📋 Copy These to Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

### 1. Supabase Configuration (✅ Ready to Use)

```
NEXT_PUBLIC_SUPABASE_URL
https://wlzhczcvrjfxcspzasoz.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
sb_publishable_xXbFuzZXbBB4YHTDbZ7l4A_wiffwk5I
```

```
SUPABASE_SERVICE_ROLE_KEY
sb_publishable_xXbFuzZXbBB4YHTDbZ7l4A_wiffwk5I
```

### 2. Stripe Configuration (✅ Ready to Use)

```
STRIPE_SECRET_KEY
sk_test_51S6R0T8CWPGKXcGknkw727t8KJ8DyQyIqwtgGxJolLRvnupNPUnIYoAHmlAC9JmSYAoEjTq3rWiv0VJEa8YWuJNg00xzZvkFFx
```

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
pk_test_51S6R0T8CWPGKXcGkNFVJvfQfyp7qXFCqHZLWpCPQJJKlLRvnupNPUnIYoAHmlAC9JmSYAoEjTq3rWiv0VJEa8YWuJNg00xzZvkFFx
```

**Note**: Get the actual publishable key from [Stripe Dashboard → API Keys](https://dashboard.stripe.com/test/apikeys)

```
STRIPE_WEBHOOK_SECRET
(Add after creating webhook endpoint)
```

**How to get**:
1. Deploy to Vercel first
2. Copy your Vercel URL
3. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
4. Click "Add endpoint"
5. Enter: `https://your-vercel-url.vercel.app/api/webhooks`
6. Select events (see below)
7. Copy the webhook secret
8. Add to Vercel environment variables

**Webhook Events to Select**:
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.paid`
- ✅ `invoice.payment_failed`
- ✅ `payment_method.attached`
- ✅ `payment_method.detached`

### 3. Application Configuration

```
NEXT_PUBLIC_SITE_URL
(Your Vercel deployment URL)
```

Example: `https://mnnr-complete2025.vercel.app`

```
NODE_ENV
production
```

---

## 🎯 Quick Setup Checklist

### Step 1: Deploy to Vercel
- [ ] Click deploy button or use Vercel CLI
- [ ] Wait for initial deployment (~2 minutes)
- [ ] Copy your Vercel URL

### Step 2: Add Environment Variables
- [ ] Go to Vercel Dashboard → Settings → Environment Variables
- [ ] Add all Supabase variables (3 variables)
- [ ] Add Stripe secret key (1 variable)
- [ ] Add site URL with your Vercel URL
- [ ] Add NODE_ENV=production

### Step 3: Get Stripe Publishable Key
- [ ] Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- [ ] Copy "Publishable key" (starts with `pk_test_`)
- [ ] Add to Vercel as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Step 4: Configure Stripe Webhook
- [ ] Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
- [ ] Click "Add endpoint"
- [ ] Enter: `https://your-vercel-url.vercel.app/api/webhooks`
- [ ] Select the 7 events listed above
- [ ] Copy webhook secret (starts with `whsec_`)
- [ ] Add to Vercel as `STRIPE_WEBHOOK_SECRET`

### Step 5: Redeploy
- [ ] Go to Vercel Dashboard → Deployments
- [ ] Click "Redeploy" (or it will auto-redeploy)
- [ ] Wait ~2 minutes
- [ ] Test your application!

---

## 📊 Environment Variables Summary

| Variable | Value | Status |
|----------|-------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://wlzhczcvrjfxcspzasoz.supabase.co` | ✅ Ready |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_xXbFuzZXbBB4YHTDbZ7l4A_wiffwk5I` | ✅ Ready |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_publishable_xXbFuzZXbBB4YHTDbZ7l4A_wiffwk5I` | ✅ Ready |
| `STRIPE_SECRET_KEY` | `sk_test_51S6R0T8CWP...` | ✅ Ready |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Get from Stripe | ⏳ Todo |
| `STRIPE_WEBHOOK_SECRET` | Get after deployment | ⏳ Todo |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel URL | ⏳ Todo |
| `NODE_ENV` | `production` | ✅ Ready |

**Total**: 8 variables (5 ready, 3 to configure)

---

## 🔍 Where to Find Missing Values

### Stripe Publishable Key

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Look for "Publishable key"
3. It starts with `pk_test_`
4. Click "Reveal test key" if hidden
5. Copy the entire key

**Example**: `pk_test_51S6R0T8CWPGKXcGkNFVJvfQfyp7qXFCqHZLWpCPQJJKlLRvnupNPUnIYoAHmlAC9JmSYAoEjTq3rWiv0VJEa8YWuJNg00xzZvkFFx`

### Stripe Webhook Secret

1. Deploy to Vercel first
2. Go to: https://dashboard.stripe.com/test/webhooks
3. Click "Add endpoint"
4. Enter URL: `https://your-vercel-url.vercel.app/api/webhooks`
5. Select events (7 events listed above)
6. Click "Add endpoint"
7. Click "Reveal" under "Signing secret"
8. Copy the secret (starts with `whsec_`)

**Example**: `whsec_abcdefghijklmnopqrstuvwxyz1234567890`

### Site URL

This is your Vercel deployment URL. After deploying, you'll see it in:
- Vercel Dashboard → Your Project → Deployments
- Usually: `https://your-project-name.vercel.app`
- Or: `https://your-project-name-username.vercel.app`

**Example**: `https://mnnr-complete2025.vercel.app`

---

## 🚨 Important Notes

### Security

- ✅ **Never commit** these values to Git
- ✅ **Only add** in Vercel Dashboard
- ✅ **Use test keys** for development
- ✅ **Switch to live keys** for production

### Stripe Keys

Your Stripe account has 2 sets of keys:
- **Test keys** (for development): Start with `pk_test_` and `sk_test_`
- **Live keys** (for production): Start with `pk_live_` and `sk_live_`

Currently using: **Test keys** ✅

### Supabase Keys

The `SUPABASE_SERVICE_ROLE_KEY` has **admin access** to your database:
- ✅ Only use on server-side
- ✅ Never expose to client
- ✅ Keep secure in Vercel environment variables

---

## ✅ Verification

After adding all variables and redeploying, test:

1. **Visit your site**: `https://your-vercel-url.vercel.app`
2. **Check homepage** loads
3. **Try sign up** (tests Supabase)
4. **Try subscription** (tests Stripe)
5. **Check webhooks** in Stripe dashboard

If everything works: **You're live!** 🎉

---

## 🆘 Troubleshooting

### Issue: "Supabase connection error"
**Solution**: Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are correct

### Issue: "Stripe not loading"
**Solution**: Check `STRIPE_SECRET_KEY` is set correctly

### Issue: "Webhooks not working"
**Solution**: 
1. Verify webhook URL matches your Vercel URL
2. Check `STRIPE_WEBHOOK_SECRET` is set
3. Redeploy after adding the secret

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs/environment-variables
- **Stripe Docs**: https://stripe.com/docs/webhooks
- **Supabase Docs**: https://supabase.com/docs/guides/api

---

**Ready to deploy?** Copy these values to Vercel and you're good to go! 🚀
