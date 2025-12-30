# Google Search Console Setup Guide for MNNR

This guide walks through setting up Google Search Console (GSC) for mnnr.app and submitting the sitemap for indexing.

## Step 1: Access Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Sign in with your Google account (or create one if needed)
3. Click **"Add property"** or **"Create property"**

## Step 2: Add Your Property

### Option A: Domain Property (Recommended)
1. Select **"Domain"** property type
2. Enter: `mnnr.app`
3. Click **Continue**

### Option B: URL Prefix Property
1. Select **"URL prefix"** property type
2. Enter: `https://mnnr.app`
3. Click **Continue**

## Step 3: Verify Ownership

Google requires verification to prove you own the domain. Choose one method:

### Method 1: DNS TXT Record (Recommended for Domain Property)

1. Google will provide a TXT record like: `google-site-verification=xxxxxxxxxxxxx`
2. Go to your domain registrar (GoDaddy, Namecheap, etc.)
3. Add a new TXT record with the value provided
4. Return to GSC and click **Verify**
5. Wait 5-30 minutes for DNS propagation

**Example DNS Record:**
```
Type: TXT
Name: mnnr.app (or @ for root)
Value: google-site-verification=xxxxxxxxxxxxx
TTL: 3600
```

### Method 2: HTML File Upload

1. Download the HTML verification file from GSC
2. Upload to: `https://mnnr.app/[verification-file].html`
3. Return to GSC and click **Verify**

### Method 3: HTML Meta Tag

1. Copy the meta tag provided: `<meta name="google-site-verification" content="xxxxxxxxxxxxx" />`
2. Add to `app/layout.tsx` in the `<head>` section
3. Deploy the changes
4. Return to GSC and click **Verify**

### Method 4: Google Analytics

If you have Google Analytics installed:
1. Click **Verify using Google Analytics**
2. Select your GA property
3. Click **Verify**

## Step 4: Submit Sitemap

Once verified:

1. In GSC left sidebar, go to **Sitemaps**
2. Enter sitemap URL: `https://mnnr.app/sitemap.xml`
3. Click **Submit**
4. You should see "Success" status

**Additional Sitemaps to Submit:**
- `https://mnnr.app/sitemap.xml` (main sitemap)

## Step 5: Verify Indexing

After submitting the sitemap:

1. Go to **Pages** section in GSC
2. Check if pages are being indexed
3. Look for any indexing issues or errors
4. Monitor the **Coverage** report

## Step 6: Monitor Search Performance

In GSC, you can monitor:

- **Performance**: Click-through rates, impressions, average position
- **Coverage**: Indexed vs. excluded pages
- **Enhancements**: Rich results, mobile usability
- **Security Issues**: Any malware or security problems

## Structured Data Validation

To verify your JSON-LD schemas are being recognized:

1. Go to **Enhancements** section in GSC
2. Look for:
   - **Rich results** (Organization, Product, FAQ, HowTo)
   - **Sitelinks search box**
   - **Mobile usability**

3. Check for any errors or warnings

## Expected Results

After 1-2 weeks:
- All pages should be indexed
- Rich results should appear for Organization, Product, and FAQ schemas
- Search impressions should increase for AI-related keywords

## Troubleshooting

### Sitemap Not Submitting
- Ensure `https://mnnr.app/sitemap.xml` is accessible
- Check that sitemap.xml is valid XML
- Verify robots.txt allows `/sitemap.xml`

### Pages Not Indexed
- Check for `noindex` meta tags
- Verify pages are not blocked in robots.txt
- Ensure pages are publicly accessible (no auth required)

### Rich Results Not Showing
- Use [Google Rich Results Test](https://search.google.com/test/rich-results)
- Validate JSON-LD syntax
- Check for required properties in schema

## Next Steps

1. **Set up Search Console alerts** - Get notified of indexing issues
2. **Monitor keyword rankings** - Track "AI agent billing" and related keywords
3. **Optimize for rich results** - Ensure all schemas are valid
4. **Submit to Bing Webmaster Tools** - Similar process for Bing
5. **Monitor Core Web Vitals** - Ensure fast page load times

## Resources

- [Google Search Console Help](https://support.google.com/webmasters)
- [Sitemap Protocol](https://www.sitemaps.org/)
- [Structured Data Testing Tool](https://search.google.com/test/rich-results)
- [Google Search Central Blog](https://developers.google.com/search/blog)
