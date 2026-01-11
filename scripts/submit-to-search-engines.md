# Search Engine & AI Index Submission Guide

## Traditional Search Engines

### Google Search Console
1. Go to: https://search.google.com/search-console
2. Add property: `https://mnnr.app`
3. Verify ownership (DNS TXT record or HTML file)
4. Submit sitemap: `https://mnnr.app/sitemap.xml`
5. Request indexing for key pages

### Bing Webmaster Tools
1. Go to: https://www.bing.com/webmasters
2. Add site: `https://mnnr.app`
3. Verify ownership
4. Submit sitemap
5. Configure IndexNow for instant indexing

### Yandex Webmaster
1. Go to: https://webmaster.yandex.com
2. Add site and verify
3. Submit sitemap

### Baidu Webmaster (China)
1. Go to: https://ziyuan.baidu.com
2. Add site and verify
3. Submit sitemap
4. Important for Chinese market

## AI Search Engines & Training Data

### Perplexity AI
- No direct submission needed
- Ensure site is crawlable (robots.txt allows PerplexityBot)
- Build quality backlinks for discovery
- Create comprehensive, factual content

### ChatGPT/OpenAI
- Ensure GPTBot is allowed in robots.txt ✅
- Create ai-plugin.json for plugin recognition ✅
- Build presence in OpenAI's training data sources
- Submit to Common Crawl (CC-MAIN dataset)

### Claude/Anthropic
- Ensure Claude-Web and Anthropic-AI are allowed ✅
- Create high-quality, factual content
- Build authoritative backlinks

### Google Gemini
- Same as Google Search Console
- AI features use Google's search index

## Common Crawl Submission
1. Ensure site is crawlable
2. CCBot is allowed in robots.txt ✅
3. Content will be included in next crawl cycle
4. Used by many AI training pipelines

## AI Plugin Directories

### ChatGPT Plugin Store
1. Create plugin manifest (ai-plugin.json) ✅
2. Create OpenAPI spec (openapi.yaml) ✅
3. Apply to ChatGPT Plugin program
4. Submit for review

### LangChain Tools
1. Create tool wrapper for MNNR API
2. Publish to LangChain Hub
3. Document integration

### AutoGPT Plugins
1. Create AutoGPT plugin
2. Publish to plugin directory
3. Document capabilities

## Schema.org Validation
1. Test at: https://search.google.com/test/rich-results
2. Enter: https://mnnr.app
3. Verify all 6 schemas are recognized:
   - Organization ✅
   - SoftwareApplication ✅
   - FAQPage ✅
   - WebSite ✅
   - Service ✅
   - HowTo ✅

## Social Media Verification

### Twitter/X
1. Add meta tags (twitter:card, twitter:site) ✅
2. Validate at: https://cards-dev.twitter.com/validator

### Facebook/Meta
1. Add OG tags ✅
2. Validate at: https://developers.facebook.com/tools/debug/

### LinkedIn
1. Add OG tags ✅
2. Validate at: https://www.linkedin.com/post-inspector/

## Backlink Strategy for AI Discovery

### High-Value Sources
- GitHub (README links, awesome lists)
- Hacker News submissions
- Reddit posts (r/MachineLearning, r/artificial)
- Dev.to articles
- Medium publications
- TechCrunch coverage
- ProductHunt listing

### Developer Documentation Sites
- Awesome AI lists on GitHub
- AI/ML resource compilations
- Developer tool directories

### Industry Publications
- AI-focused newsletters
- Developer podcasts
- Tech blogs and publications

## Monitoring

### Weekly Tasks
- [ ] Check Google Search Console for errors
- [ ] Test on Perplexity AI with target queries
- [ ] Test on ChatGPT with web browsing
- [ ] Monitor Google Analytics for AI traffic
- [ ] Check backlink growth

### Monthly Tasks
- [ ] Run SEO audit
- [ ] Update sitemap if new pages
- [ ] Refresh llms.txt if features change
- [ ] Review keyword rankings
- [ ] Analyze competitor rankings

## Submission Checklist

- [ ] Google Search Console - Sitemap submitted
- [ ] Bing Webmaster Tools - Site verified
- [ ] robots.txt - All AI crawlers allowed
- [ ] llms.txt - Comprehensive and current
- [ ] ai-plugin.json - Valid and complete
- [ ] openapi.yaml - All endpoints documented
- [ ] Schema.org - All schemas valid
- [ ] Social cards - OG and Twitter tags set
- [ ] Security.txt - Contact info present
