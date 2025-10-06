# DNS Configuration Guide for docs.mnnr.app

## Prerequisites
- Access to your domain registrar (where you purchased mnnr.app)
- Vercel account with project deployed

## Step-by-Step DNS Configuration

### Option 1: Using Your Domain Registrar

#### Step 1: Log in to Your Domain Registrar
Common providers:
- **Namecheap**: https://www.namecheap.com
- **GoDaddy**: https://www.godaddy.com
- **Google Domains**: https://domains.google
- **Cloudflare**: https://dash.cloudflare.com

#### Step 2: Navigate to DNS Management
- Find "DNS Management" or "DNS Settings" for mnnr.app
- Look for options like "Manage DNS", "DNS Records", or "Advanced DNS"

#### Step 3: Add CNAME Record
Create a new DNS record with these exact values:

```
Type:  CNAME
Name:  docs
Value: cname.vercel-dns.com
TTL:   3600 (or Auto)
```

**Visual Example:**
```
┌────────┬──────┬─────────────────────┬──────┐
│ Type   │ Name │ Value               │ TTL  │
├────────┼──────┼─────────────────────┼──────┤
│ CNAME  │ docs │ cname.vercel-dns.com│ 3600 │
└────────┴──────┴─────────────────────┴──────┘
```

#### Step 4: Save Changes
- Click "Save", "Add Record", or "Update"
- Wait 5-10 minutes for DNS propagation

### Option 2: Using Cloudflare (Recommended for better performance)

#### Step 1: Add Domain to Cloudflare
1. Sign up at https://cloudflare.com
2. Click "Add a Site"
3. Enter `mnnr.app`
4. Follow wizard to update nameservers at your registrar

#### Step 2: Add DNS Record
1. Go to DNS tab
2. Click "Add record"
3. Configure:
   ```
   Type:  CNAME
   Name:  docs
   Target: cname.vercel-dns.com
   Proxy status: DNS only (gray cloud ☁️)
   TTL:   Auto
   ```

#### Step 3: Save
- Click "Save"
- DNS propagates faster with Cloudflare (usually 1-3 minutes)

## Verification

### Method 1: Using PowerShell Script
```powershell
.\scripts\verify-deployment.ps1
```

### Method 2: Manual Verification
```powershell
# Check DNS resolution
nslookup docs.mnnr.app

# Test health endpoint
curl https://docs.mnnr.app/api/health

# Open in browser
start https://docs.mnnr.app/docs
```

### Method 3: Online Tools
- **DNS Checker**: https://dnschecker.org
  - Enter: `docs.mnnr.app`
  - Type: `CNAME`
  - Should show: `cname.vercel-dns.com`

- **What's My DNS**: https://www.whatsmydns.net
  - Check propagation globally

## Vercel Domain Configuration

### Step 1: Add Domain in Vercel Dashboard

```bash
# Via CLI
vercel domains add docs.mnnr.app

# Or via Dashboard:
# 1. Go to https://vercel.com/dashboard
# 2. Select your project
# 3. Go to Settings → Domains
# 4. Enter: docs.mnnr.app
# 5. Click "Add"
```

### Step 2: Verify Domain Ownership
Vercel will automatically verify once DNS is configured correctly.

### Step 3: Wait for SSL Certificate
- Vercel provisions SSL certificate automatically
- Usually takes 1-5 minutes
- You'll see "Valid Configuration" when ready

## Troubleshooting

### DNS Not Resolving
```powershell
# Clear local DNS cache
ipconfig /flushdns

# Test with different DNS server
nslookup docs.mnnr.app 8.8.8.8
```

### SSL Certificate Issues
- Wait 10 minutes after DNS configuration
- Ensure proxy is disabled if using Cloudflare
- Check Vercel dashboard for SSL status

### 404 Errors
- Verify deployment is successful on Vercel
- Check domain is added in Vercel settings
- Ensure main app is deployed (not just preview)

### "Invalid Configuration" in Vercel
Common fixes:
1. Remove and re-add the domain
2. Verify CNAME record is exact: `cname.vercel-dns.com`
3. Disable Cloudflare proxy (use DNS only)
4. Wait for DNS propagation (up to 48 hours max)

## Quick Reference

### Required DNS Record
```
docs.mnnr.app → cname.vercel-dns.com (CNAME)
```

### Expected Response (after setup)
```bash
$ curl https://docs.mnnr.app/api/health
{
  "status": "ok",
  "timestamp": "2025-10-06T...",
  "environment": "production",
  "version": "1.0.0"
}
```

### Deployment Commands
```bash
# Verify local
npm run dev

# Build production
npm run build

# Deploy to Vercel
vercel --prod

# Or use script
.\scripts\deploy-docs.ps1
```

## Provider-Specific Instructions

### Namecheap
1. Advanced DNS → Add New Record
2. Type: CNAME Record
3. Host: docs
4. Value: cname.vercel-dns.com
5. TTL: Automatic

### GoDaddy
1. DNS → Add → CNAME
2. Name: docs
3. Value: cname.vercel-dns.com
4. TTL: 1 Hour

### Google Domains
1. DNS → Manage Custom Records
2. Create new record
3. Type: CNAME
4. Name: docs
5. Data: cname.vercel-dns.com
6. TTL: 1h

### Cloudflare
1. DNS → Add record
2. Type: CNAME
3. Name: docs
4. Target: cname.vercel-dns.com
5. Proxy: OFF (gray cloud)
6. Save

## Support

If you encounter issues:
1. Run verification script: `.\scripts\verify-deployment.ps1`
2. Check Vercel logs: https://vercel.com/dashboard
3. Verify DNS propagation: https://dnschecker.org
4. Contact Vercel support: https://vercel.com/help

## Timeline

- **DNS Propagation**: 5-10 minutes (up to 48 hours worst case)
- **SSL Certificate**: 1-5 minutes after DNS
- **Full Availability**: ~15 minutes total

## Success Criteria

✅ DNS resolves to Vercel
✅ SSL certificate valid (https)
✅ Health endpoint returns 200 OK
✅ Docs page loads correctly
✅ No security warnings in browser
