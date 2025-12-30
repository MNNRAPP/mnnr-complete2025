# Structured Data Validation Guide for MNNR

This guide explains how to validate the 6 JSON-LD schemas implemented on mnnr.app using Google's Rich Results Test and other tools.

## Overview of Implemented Schemas

MNNR implements the following JSON-LD schemas:

1. **Organization Schema** - Company information, contact details, social links
2. **Product/SoftwareApplication Schema** - App features, pricing, ratings
3. **FAQ Schema** - 8 AI-specific questions and answers
4. **Website Schema** - Site search functionality
5. **AI Service Schema** - AI billing service details
6. **HowTo Schema** - 5-step integration guide

## Validation Method 1: Google Rich Results Test

### Step 1: Access the Tool
1. Go to [Google Rich Results Test](https://search.google.com/test/rich-results)
2. You can test by URL or by pasting HTML/JSON

### Step 2: Test by URL
1. Enter: `https://mnnr.app`
2. Click **Test URL**
3. Wait for results (usually 10-30 seconds)

### Step 3: Review Results

You should see:
- ✅ **Organization** - Company schema valid
- ✅ **Product** - SoftwareApplication schema valid
- ✅ **FAQ** - 8 questions detected
- ✅ **HowTo** - 5-step process detected
- ✅ **Website** - Search action recognized

### Step 4: Check for Errors

Look for any red error messages:
- Missing required properties
- Invalid data types
- Syntax errors in JSON

If errors appear:
1. Note the specific error message
2. Check `components/structured-data.tsx`
3. Verify the schema matches Schema.org specification
4. Re-test after fixing

## Validation Method 2: Schema.org Validator

### Step 1: Access Tool
1. Go to [Schema.org Validator](https://validator.schema.org/)
2. Enter your URL or paste JSON-LD

### Step 2: Validate
1. Click **Validate**
2. Review the parsed schema tree

### Step 3: Check Hierarchy
- Organization (root)
  - name, url, logo, description
  - contactPoint
  - sameAs (social links)
- Product (root)
  - name, description, offers
  - aggregateRating
  - featureList
- FAQ (root)
  - mainEntity (array of questions)
- Website (root)
  - potentialAction (search)
- HowTo (root)
  - step (array of steps)

## Validation Method 3: JSON-LD Playground

### Step 1: Access Tool
1. Go to [JSON-LD Playground](https://json-ld.org/playground/)

### Step 2: Paste Schema
1. Copy JSON-LD from page source
2. Paste into left panel
3. View parsed output on right

### Step 3: Verify Structure
- Check that all required fields are present
- Verify data types are correct
- Ensure no syntax errors

## Validation Method 4: Structured Data Testing Tool

### Step 1: Access Tool
1. Go to [Structured Data Testing Tool](https://search.google.com/structured-data/testing-tool)

### Step 2: Enter URL
1. Paste: `https://mnnr.app`
2. Click **Fetch URL**

### Step 3: Review Parsed Items
You should see all 6 schemas listed with their properties

## Expected Results

### Organization Schema
```
✅ name: MNNR
✅ url: https://mnnr.app
✅ logo: https://mnnr.app/icon-512.png
✅ description: Payments infrastructure for the machine economy
✅ contactPoint: pilot@mnnr.app
✅ sameAs: [GitHub, Twitter, LinkedIn URLs]
```

### Product Schema
```
✅ name: MNNR
✅ applicationCategory: FinanceApplication, DeveloperApplication
✅ description: AI agent billing platform
✅ offers: [Free, Pro, Enterprise tiers]
✅ aggregateRating: 4.9/5 (127 reviews)
✅ featureList: [10+ features listed]
```

### FAQ Schema
```
✅ 8 questions detected:
  1. What is MNNR and how does it help with AI agent billing?
  2. How does MNNR handle per-token billing for LLMs?
  3. Can MNNR bill autonomous AI agents?
  4. How is MNNR different from Stripe?
  5. What AI models and providers does MNNR support?
  6. Does MNNR support cryptocurrency payments?
  7. How much does MNNR cost?
  8. How fast can I integrate MNNR?
```

### HowTo Schema
```
✅ 5 steps detected:
  1. Install MNNR SDK
  2. Initialize the Client
  3. Track AI Usage
  4. View Analytics
  5. Collect Payments
```

### Website Schema
```
✅ name: MNNR - AI Agent Billing
✅ url: https://mnnr.app
✅ potentialAction: SearchAction with urlTemplate
```

### AI Service Schema
```
✅ serviceType: AI Billing Infrastructure
✅ name: MNNR AI Agent Billing
✅ provider: MNNR Organization
✅ areaServed: Worldwide
✅ hasOfferCatalog: Pricing plans
```

## Rich Results Preview

Once validated, you should see rich results in Google Search for:

- **Organization Card** - Company name, logo, contact info
- **Product Card** - App name, rating, pricing
- **FAQ Accordion** - Expandable Q&A in search results
- **HowTo Snippet** - Step-by-step guide preview

## Troubleshooting

### Schema Not Appearing in Results

**Problem**: Tool shows no schemas detected

**Solutions**:
1. Verify `components/structured-data.tsx` is imported in `app/layout.tsx`
2. Check that `<StructuredData />` is rendered in `<head>`
3. Ensure no JavaScript errors in browser console
4. Clear browser cache and reload

### Missing Required Properties

**Problem**: "Missing required property: X"

**Solutions**:
1. Check Schema.org documentation for required fields
2. Add missing property to schema
3. Ensure property has correct data type
4. Re-test after fix

### Invalid Data Type

**Problem**: "Property X should be of type Y, not Z"

**Solutions**:
1. Verify property value matches expected type
2. For objects, use `@type` field
3. For arrays, use JSON array syntax `[]`
4. For dates, use ISO 8601 format

### Duplicate Schemas

**Problem**: Multiple Organization schemas detected

**Solutions**:
1. Check that `<StructuredData />` is only rendered once
2. Verify no duplicate imports in layout.tsx
3. Ensure each schema type appears only once

## Monitoring

After validation:

1. **Set up GSC alerts** - Get notified of rich result issues
2. **Monitor monthly** - Check for new errors
3. **Update schemas** - When adding new features/pricing
4. **Re-validate** - After any schema changes

## Next Steps

1. ✅ Validate all 6 schemas using Rich Results Test
2. ✅ Fix any errors found
3. ✅ Submit sitemap to Google Search Console
4. ✅ Monitor indexing in GSC
5. ✅ Track rich result impressions in GSC Performance report

## Resources

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Documentation](https://schema.org/)
- [Google Structured Data Guide](https://developers.google.com/search/docs/guides/intro-structured-data)
- [JSON-LD Specification](https://json-ld.org/)
- [Schema.org Validator](https://validator.schema.org/)
