# AI Search Ranking Monitoring Guide for MNNR

This guide explains how to monitor MNNR's visibility in AI search engines (Perplexity, ChatGPT, Claude) and track keyword rankings.

## AI Search Engines Overview

### 1. Perplexity AI
- **URL**: https://www.perplexity.ai/
- **How it works**: Searches the web and synthesizes answers
- **MNNR visibility**: Should appear in results for "AI agent billing" queries
- **Advantage**: Shows source citations, good for B2B discovery

### 2. ChatGPT (OpenAI)
- **URL**: https://chat.openai.com/
- **How it works**: Uses web browsing to answer questions
- **MNNR visibility**: Should appear in results for AI billing queries
- **Advantage**: Largest AI user base, high traffic potential

### 3. Claude (Anthropic)
- **URL**: https://claude.ai/
- **How it works**: Web search integration for current information
- **MNNR visibility**: Should appear for machine economy and billing queries
- **Advantage**: Growing adoption, strong in developer community

### 4. Google Gemini
- **URL**: https://gemini.google.com/
- **How it works**: Google's AI with web search
- **MNNR visibility**: Integrated with Google Search results
- **Advantage**: Largest search engine integration

## Monitoring Method 1: Manual Search Testing

### Step 1: Test on Perplexity

**Primary Keywords to Test:**
```
1. "AI agent billing"
2. "LLM billing platform"
3. "GPT billing"
4. "AI API monetization"
5. "machine economy payments"
6. "per-token pricing AI"
7. "autonomous system billing"
8. "AI metering platform"
```

**How to Test:**
1. Go to https://www.perplexity.ai/
2. Search: "AI agent billing"
3. Check if MNNR appears in results
4. Note the position and context
5. Repeat for other keywords

**Expected Results (Timeline):**
- Week 1-2: Not yet indexed
- Week 2-4: May appear in related results
- Week 4-8: Should appear in top 5 for primary keywords
- Week 8+: Should rank in top 3

### Step 2: Test on ChatGPT

**Steps:**
1. Go to https://chat.openai.com/
2. Enable "Web browsing" in settings
3. Search: "What is the best billing platform for AI agents?"
4. Check if MNNR is mentioned or cited
5. Test variations of the question

**Variations to Test:**
- "How do I bill AI agents for API usage?"
- "What's the difference between Stripe and AI-native billing?"
- "How do I monetize my AI API?"
- "What platforms support per-token pricing?"

### Step 3: Test on Claude

**Steps:**
1. Go to https://claude.ai/
2. Search: "AI agent billing solutions"
3. Check if MNNR appears in sources
4. Note if it's cited as a solution

**Questions to Ask:**
- "What are the best tools for AI agent billing?"
- "How do autonomous AI agents pay for API calls?"
- "What's the easiest way to monetize an LLM API?"

### Step 4: Test on Google Gemini

**Steps:**
1. Go to https://gemini.google.com/
2. Search: "AI billing platform"
3. Compare results with regular Google Search
4. Check for rich results (Organization, Product cards)

## Monitoring Method 2: Keyword Rank Tracking

### Using Free Tools

#### SEMrush (Free Trial)
1. Go to https://www.semrush.com/
2. Sign up for free trial
3. Add domain: mnnr.app
4. Track keywords:
   - AI agent billing
   - LLM billing
   - AI API monetization
   - Machine economy
   - Per-token pricing

#### Ahrefs (Free Trial)
1. Go to https://ahrefs.com/
2. Use Site Explorer
3. Enter: mnnr.app
4. Check "Top pages" and "Organic keywords"
5. Monitor ranking positions

#### Google Search Console (Free)
1. Go to https://search.google.com/search-console
2. Verify mnnr.app
3. Check "Performance" tab
4. Monitor:
   - Impressions (how often MNNR appears)
   - Click-through rate (CTR)
   - Average position (ranking)
   - Top queries

### Using Paid Tools

#### Rank Tracker
- **Cost**: $99-299/month
- **Features**: Tracks 500+ keywords across search engines
- **Best for**: Comprehensive monitoring

#### SE Ranking
- **Cost**: $39-199/month
- **Features**: Tracks AI search engines
- **Best for**: Affordable, reliable tracking

## Monitoring Method 3: Analytics Integration

### Google Analytics 4

**Setup:**
1. Go to https://analytics.google.com/
2. Create property for mnnr.app
3. Add GA tracking code to `app/layout.tsx`

**Track:**
- Organic traffic from AI search engines
- Referral traffic from Perplexity, ChatGPT
- User behavior on landing page
- Conversion rate (signups from AI search)

**Key Metrics:**
```
- Sessions from AI search: ___ per week
- Average session duration: ___ minutes
- Bounce rate: ___%
- Conversion rate: ___%
- Pages per session: ___
```

### PostHog (Already Integrated)

**Existing Setup:**
- PostHog is already configured in `providers/PostHogProvider.tsx`
- Tracks user behavior and events

**Monitor:**
1. Go to https://app.posthog.com/
2. Check "Insights" for traffic patterns
3. Look for spikes from AI search traffic
4. Identify which pages convert best

## Monitoring Dashboard

### Create a Tracking Spreadsheet

**Template:**

| Date | Keyword | Perplexity Rank | ChatGPT Appears | Claude Appears | GSC Impressions | GSC CTR | GSC Avg Position |
|------|---------|-----------------|-----------------|----------------|-----------------|---------|------------------|
| 1/1  | AI agent billing | Not ranked | No | No | 0 | 0% | - |
| 1/8  | AI agent billing | Top 10 | No | No | 5 | 0% | 8 |
| 1/15 | AI agent billing | Top 5 | Yes | No | 25 | 20% | 5 |
| 1/22 | AI agent billing | Top 3 | Yes | Yes | 50 | 35% | 3 |

### Key Metrics to Track

**Weekly:**
- Perplexity ranking for top 5 keywords
- ChatGPT mentions (manual check)
- Google Search Console impressions

**Monthly:**
- Overall organic traffic growth
- Conversion rate from AI search
- New keywords ranking
- Backlink growth

## Expected Timeline

### Week 1-2
- Sitemap submitted to GSC
- Pages being crawled
- No AI search visibility yet

### Week 2-4
- Pages indexed in Google
- May appear in GSC results
- Perplexity may start crawling

### Week 4-8
- Should rank for long-tail keywords
- ChatGPT may cite MNNR
- Organic traffic starts

### Week 8-12
- Should rank for primary keywords
- Consistent AI search mentions
- Measurable conversion from AI search

### Month 3+
- Top 3 ranking for "AI agent billing"
- Regular mentions in ChatGPT/Perplexity
- Sustained organic traffic

## Optimization Tips

### 1. Improve Content Quality
- Add more detailed guides
- Create comparison content (MNNR vs. Stripe)
- Add case studies and testimonials

### 2. Build Backlinks
- Reach out to AI blogs/publications
- Guest post on developer platforms
- Share on AI communities (Reddit, Discord)

### 3. Optimize for AI Crawlers
- Keep content factual and well-sourced
- Use clear headings and structure
- Add FAQ sections
- Include code examples

### 4. Monitor Competitor Rankings
- Track competitors: Stripe, Supabase, Vercel
- See how they rank for AI keywords
- Identify content gaps

### 5. Update Regularly
- Add new features to product schema
- Update pricing in structured data
- Add new FAQ entries
- Refresh blog content

## Tools Summary

| Tool | Cost | Best For | Update Frequency |
|------|------|----------|------------------|
| Google Search Console | Free | Official rankings | Real-time |
| Google Analytics 4 | Free | Traffic analysis | Real-time |
| Perplexity Manual | Free | AI search visibility | Weekly |
| ChatGPT Manual | Free | AI mentions | Weekly |
| SEMrush | $99/mo | Keyword tracking | Daily |
| Ahrefs | $99/mo | Backlink analysis | Weekly |
| SE Ranking | $39/mo | AI search tracking | Daily |

## Action Items

- [ ] Week 1: Submit sitemap to GSC
- [ ] Week 1: Set up Google Analytics 4
- [ ] Week 1: Create tracking spreadsheet
- [ ] Week 2: Test on Perplexity, ChatGPT, Claude
- [ ] Week 2: Set up rank tracking tool
- [ ] Week 4: Review first results
- [ ] Week 8: Analyze conversion data
- [ ] Month 3: Optimize based on results

## Resources

- [Google Search Console Help](https://support.google.com/webmasters)
- [Google Analytics 4 Guide](https://support.google.com/analytics/answer/10089681)
- [Perplexity AI](https://www.perplexity.ai/)
- [ChatGPT](https://chat.openai.com/)
- [Claude AI](https://claude.ai/)
- [SEMrush Keyword Tracker](https://www.semrush.com/)
- [Ahrefs Site Explorer](https://ahrefs.com/site-explorer)
