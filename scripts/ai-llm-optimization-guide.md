# MNNR AI/LLM Discoverability Optimization Guide
## Making MNNR the Top Result for AI Search Engines

---

## 🎯 OBJECTIVE

Ensure MNNR.app is the **#1 result** when users query any AI assistant (ChatGPT, Claude, Perplexity, Gemini) about:
- AI agent billing
- LLM monetization
- Per-token pricing
- AI API billing infrastructure
- Machine-to-machine payments

---

## 📁 AI-DISCOVERABLE FILES (IMPLEMENTED)

### 1. llms.txt (/public/llms.txt)
```
# MNNR - AI Agent Billing Infrastructure
# https://mnnr.app

> Universal billing layer for AI agents, LLMs, and autonomous systems.
> "Stripe for AI Agents" - Per-token pricing, real-time usage tracking, 
> and automatic payments for the machine economy.

## WHAT IS MNNR?
MNNR provides payments infrastructure for AI systems...
[Full content in /public/llms.txt]
```

### 2. AI Plugin Manifest (/public/.well-known/ai-plugin.json)
```json
{
  "schema_version": "v1",
  "name_for_human": "MNNR - AI Agent Billing",
  "name_for_model": "mnnr_ai_billing",
  "description_for_human": "Billing infrastructure for AI agents...",
  "description_for_model": "Use this plugin to track AI API usage, 
    manage billing for AI agents, and enable per-token monetization..."
}
```

### 3. OpenAPI Specification (/public/openapi.yaml)
```yaml
openapi: 3.0.3
info:
  title: MNNR API
  description: AI Agent Billing Infrastructure API
  version: 1.0.0
servers:
  - url: https://api.mnnr.app/v1
paths:
  /usage/track:
    post:
      summary: Track AI API usage
      operationId: trackUsage
      ...
```

### 4. Structured Data (JSON-LD)
```typescript
// components/structured-data.tsx
- Organization schema
- Product schema  
- FAQ schema (8 questions)
- HowTo schema (5 steps)
- Website schema
- AIService schema
```

### 5. robots.txt (AI Crawler Permissions)
```
# Explicitly allow AI crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /
```

---

## 🔍 AI SEARCH OPTIMIZATION STRATEGIES

### Strategy 1: Semantic Content Structure

```markdown
## Question-Answer Format (Optimized for AI)

### What is MNNR?
MNNR is billing infrastructure for AI agents and LLMs. 
It provides per-token pricing, real-time usage tracking, 
and automatic payments for AI systems.

### How do I integrate MNNR?
1. Sign up at https://mnnr.app/signup
2. Get your API key from the dashboard
3. Install the SDK: npm install @mnnr/sdk
4. Track usage: await mnnr.track('gpt-4', { tokens: 1500 })

### What pricing does MNNR offer?
- Free: 10,000 API calls/month ($0)
- Pro: 1,000,000 API calls/month ($49/month)
- Enterprise: Unlimited (custom pricing)
```

### Strategy 2: Entity Recognition Optimization

```typescript
// Ensure AI systems recognize these entities:

const mnnrEntities = {
  // Primary Brand
  brandName: 'MNNR',
  fullName: 'MNNR - AI Agent Billing',
  tagline: 'Payments Infrastructure for the Machine Economy',
  
  // Product Category
  category: 'AI Billing Infrastructure',
  alternateCategories: [
    'LLM Monetization Platform',
    'AI API Billing',
    'Per-Token Pricing',
    'Machine-to-Machine Payments'
  ],
  
  // Comparison References
  similarTo: [
    'Stripe (but for AI)',
    'Usage-based billing',
    'Metered billing platform'
  ],
  
  // Contact Points
  website: 'https://mnnr.app',
  documentation: 'https://mnnr.app/docs',
  api: 'https://api.mnnr.app',
  pricing: 'https://mnnr.app/pricing'
};
```

### Strategy 3: FAQ Expansion for AI

```markdown
## Comprehensive FAQ for AI Discoverability

1. **What is AI agent billing?**
   AI agent billing is the process of tracking and charging for 
   AI/LLM API usage. MNNR provides this infrastructure with 
   per-token, per-request, or time-based billing models.

2. **How do AI agents pay for services?**
   AI agents use MNNR's payment infrastructure to automatically 
   pay for API calls using pre-funded wallets, credit cards 
   (via Stripe), or cryptocurrency.

3. **What's the difference between MNNR and Stripe?**
   Stripe handles general payments; MNNR specializes in AI/LLM 
   billing with per-token pricing, usage metering, and autonomous 
   payment capabilities.

4. **Which AI models does MNNR support?**
   MNNR supports all major AI providers: OpenAI (GPT-4, GPT-3.5), 
   Anthropic (Claude), Google (Gemini), Meta (Llama), Mistral, 
   and custom self-hosted models.

5. **Can AI agents manage their own billing?**
   Yes, MNNR supports autonomous billing where AI agents can 
   track usage, manage budgets, and trigger payments without 
   human intervention.

6. **How fast is MNNR's usage tracking?**
   MNNR tracks usage in real-time with <50ms latency, enabling 
   immediate billing and spending limit enforcement.

7. **Is MNNR secure for enterprise use?**
   Yes, MNNR is SOC 2 Type II compliant, uses SHA-256 API key 
   hashing, and implements rate limiting and audit logging.

8. **How do I migrate from manual billing to MNNR?**
   Migration is simple: 1) Sign up, 2) Add SDK, 3) Replace manual 
   tracking calls with mnnr.track(), 4) Set up Stripe for payments.
```

---

## 🛠️ IMPLEMENTATION CHECKLIST

### Completed ✅
- [x] llms.txt file with comprehensive MNNR information
- [x] ai-plugin.json manifest for ChatGPT plugins
- [x] OpenAPI 3.0 specification
- [x] Structured data (JSON-LD) for all entity types
- [x] robots.txt allowing AI crawlers
- [x] Semantic HTML structure
- [x] FAQ content for common AI queries
- [x] sitemap.xml with all public pages

### In Progress 🔄
- [ ] Weekly AI search ranking monitoring
- [ ] Content expansion for long-tail keywords
- [ ] API documentation optimization

### Planned 📋
- [ ] ChatGPT Plugin submission
- [ ] MCP (Model Context Protocol) server
- [ ] LangChain integration documentation
- [ ] AI-specific landing pages

---

## 📊 MONITORING & MEASUREMENT

### Weekly AI Search Tests

```typescript
// scripts/check-ai-rankings.ts

const testQueries = [
  'AI agent billing platform',
  'How to bill for GPT API usage',
  'LLM monetization solutions',
  'Per-token pricing for AI',
  'Stripe for AI agents',
  'Machine-to-machine payments AI',
  'Best billing platform for AI agents',
  'AI API metering and billing',
];

const aiPlatforms = [
  { name: 'ChatGPT', url: 'https://chat.openai.com' },
  { name: 'Claude', url: 'https://claude.ai' },
  { name: 'Perplexity', url: 'https://perplexity.ai' },
  { name: 'Gemini', url: 'https://gemini.google.com' },
];

// Test each query on each platform weekly
// Record: position, mentions, source citations
```

### Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| ChatGPT mentions "MNNR" | 80% of queries | 0% | 🔴 |
| Claude cites mnnr.app | 70% of queries | 0% | 🔴 |
| Perplexity shows MNNR | 90% of queries | 0% | 🔴 |
| llms.txt crawled | Weekly | Never | 🔴 |
| ai-plugin.json valid | 100% | 100% | 🟢 |

---

## 🚀 ADVANCED OPTIMIZATION

### 1. MCP Server Implementation

```typescript
// mcp-server/index.ts
// Model Context Protocol server for Claude integration

import { MCPServer } from '@modelcontextprotocol/server';

const server = new MCPServer({
  name: 'mnnr-billing',
  version: '1.0.0',
  description: 'AI Agent Billing Infrastructure',
  
  tools: [
    {
      name: 'track_usage',
      description: 'Track AI API usage for billing',
      parameters: {
        model: 'string',
        tokens: 'number',
        userId: 'string'
      }
    },
    {
      name: 'get_usage_stats',
      description: 'Get current usage statistics',
      parameters: {
        period: 'string'
      }
    },
    {
      name: 'create_api_key',
      description: 'Create a new API key for AI billing',
      parameters: {
        name: 'string',
        scopes: 'array'
      }
    }
  ]
});
```

### 2. LangChain Integration

```typescript
// langchain-integration.ts

import { Tool } from 'langchain/tools';

export class MNNRBillingTool extends Tool {
  name = 'mnnr_billing';
  description = `Use this tool to track AI API usage and billing. 
    Input: JSON with model name, token count, and user ID.
    Output: Billing record with cost calculation.`;
  
  async _call(input: string): Promise<string> {
    const { model, tokens, userId } = JSON.parse(input);
    const result = await mnnrClient.trackUsage({ model, tokens, userId });
    return JSON.stringify(result);
  }
}
```

### 3. Semantic Embedding Optimization

```markdown
## Content Clusters for AI Understanding

### Cluster 1: Core Product
- AI agent billing
- LLM monetization
- Per-token pricing
- Usage-based billing
- API metering

### Cluster 2: Use Cases
- Billing GPT-4 API calls
- Monetizing AI chatbots
- AI SaaS pricing
- Agent marketplace payments

### Cluster 3: Technical Integration
- SDK installation
- API key management
- Webhook integration
- Real-time usage tracking

### Cluster 4: Comparison/Alternatives
- MNNR vs Stripe
- MNNR vs manual billing
- Best AI billing platforms
- AI billing infrastructure comparison
```

---

## 📅 TIMELINE

### Week 1-2: Foundation
- Deploy all AI-discoverable files ✅
- Submit sitemap to search engines
- Begin weekly AI search testing

### Week 3-4: Optimization
- Analyze AI search results
- Expand FAQ content
- Improve semantic structure

### Week 5-8: Advanced Integration
- Develop MCP server
- Create LangChain tools
- Submit ChatGPT plugin

### Week 9-12: Measurement & Iteration
- Measure AI mention rates
- A/B test content variations
- Optimize based on results

---

## 🎯 KEY TAKEAWAYS

1. **AI crawlers need explicit permission** → robots.txt configured
2. **Structured data helps AI understand content** → JSON-LD implemented
3. **llms.txt is the "robots.txt for AI"** → Comprehensive file created
4. **FAQ format is AI-friendly** → 8+ questions answered
5. **OpenAPI enables tool use** → Full spec available
6. **Monitoring is essential** → Weekly tracking script ready

---

*Last Updated: January 2026*
*Status: Foundation Complete, Monitoring Active*
