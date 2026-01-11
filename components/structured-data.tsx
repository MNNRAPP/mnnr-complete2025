/**
 * JSON-LD Structured Data for SEO and AI Search Discovery
 * 
 * Implements Organization, Product, FAQ, and AI-specific schema for:
 * - Rich Google search results
 * - AI search engines (Perplexity, ChatGPT, Claude)
 * - Voice assistants and AI agents
 */

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MNNR",
    "alternateName": ["MNNR Payments", "MNNR AI Billing", "MNNR Machine Economy"],
    "url": "https://mnnr.app",
    "logo": "https://mnnr.app/icon-512.png",
    "description": "MNNR is the universal billing layer for AI agents, LLMs, and autonomous systems. We provide payments infrastructure for the machine economy.",
    "foundingDate": "2024",
    "slogan": "Payments Infrastructure for the Machine Economy",
    "knowsAbout": [
      "AI agent billing",
      "LLM API monetization",
      "Machine-to-machine payments",
      "Usage-based billing",
      "Per-token pricing",
      "AI infrastructure",
      "Autonomous systems"
    ],
    "sameAs": [
      "https://github.com/MNNRAPP",
      "https://twitter.com/mnnrapp",
      "https://linkedin.com/company/mnnr"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "sales",
      "email": "pilot@mnnr.app",
      "availableLanguage": ["English", "Chinese", "Spanish", "Japanese", "Korean", "German", "French"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "areaServed": "Worldwide",
    "serviceType": "AI Billing Infrastructure"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "MNNR",
    "alternateName": "MNNR AI Billing Platform",
    "applicationCategory": ["FinanceApplication", "DeveloperApplication", "BusinessApplication"],
    "applicationSubCategory": "AI Billing Infrastructure",
    "operatingSystem": "Web, API, Cloud",
    "description": "MNNR is billing infrastructure for AI agents and the machine economy. Track AI API usage, bill per token, enforce rate limits, and collect payments from any AI agent, LLM, chatbot, or autonomous system.",
    "url": "https://mnnr.app",
    "image": "https://mnnr.app/icon-512.png",
    "screenshot": "https://mnnr.app/demo.png",
    "softwareVersion": "1.0",
    "releaseNotes": "Public beta with full AI agent billing capabilities",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Tier",
        "price": "0",
        "priceCurrency": "USD",
        "description": "10,000 API calls/month for AI agent billing - perfect for testing and small projects",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31"
      },
      {
        "@type": "Offer",
        "name": "Pro",
        "price": "49",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31",
        "description": "1M API calls/month for production AI agents with advanced analytics and Stripe integration",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Enterprise",
        "description": "Custom pricing for unlimited AI agent billing with dedicated infrastructure and SLA",
        "availability": "https://schema.org/InStock"
      }
    ],
    // Note: aggregateRating removed - will be added when we have real reviews
    "featureList": [
      "AI agent billing and monetization",
      "Per-token pricing for LLMs (GPT, Claude, Llama)",
      "Real-time AI usage tracking",
      "Rate limiting for AI agents",
      "API key management with scoped permissions",
      "Stripe payment integration",
      "Web3 and crypto payment support",
      "SDK for Python, JavaScript, Go, Rust",
      "Webhook delivery with 99.99% reliability",
      "Global edge deployment with <50ms latency"
    ],
    "keywords": "AI billing, AI agent payments, LLM billing, GPT billing, Claude billing, per-token pricing, AI API monetization, machine economy, autonomous systems billing",
    "audience": {
      "@type": "Audience",
      "audienceType": "AI developers, ML engineers, startup founders, enterprise architects"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is MNNR and how does it help with AI agent billing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "MNNR is payments infrastructure for the machine economy, specifically designed for AI agent billing. It provides a universal billing layer for AI agents, LLMs, IoT devices, and autonomous systems. MNNR enables developers to track AI API usage, bill per token, enforce rate limits, and collect payments automatically. Think of MNNR as 'Stripe for AI agents' - it handles all the complexity of billing AI systems so developers can focus on building."
        }
      },
      {
        "@type": "Question",
        "name": "How does MNNR handle per-token billing for LLMs like GPT and Claude?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "MNNR provides real-time per-token billing for any LLM including GPT-4, Claude, Llama, and custom models. Simply call mnnr.track() with the token count after each AI API call, and MNNR handles metering, aggregation, and billing automatically. MNNR supports input/output token differentiation, model-specific pricing tiers, and real-time usage dashboards. Integration takes under 5 minutes with our SDK."
        }
      },
      {
        "@type": "Question",
        "name": "Can MNNR bill autonomous AI agents that make their own API calls?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, MNNR is specifically designed for autonomous AI agent billing. AI agents can have their own API keys with spending limits, usage quotas, and rate limits. MNNR supports agent-to-agent payments, programmable escrow for multi-step AI workflows, and real-time balance tracking. This enables AI agents to operate autonomously while staying within defined budgets."
        }
      },
      {
        "@type": "Question",
        "name": "How is MNNR different from Stripe for AI billing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "While Stripe was built for human-initiated transactions, MNNR is designed specifically for AI and machine-to-machine commerce. Key differences: (1) MNNR supports per-token and per-call pricing models that don't exist in traditional billing, (2) MNNR provides distributed rate limiting across global edge nodes for AI agents, (3) MNNR enables autonomous spending limits and agent-to-agent payments, (4) MNNR integrates natively with AI providers like OpenAI, Anthropic, and Replicate. MNNR actually uses Stripe under the hood for payment processing, combining Stripe's reliability with AI-native billing features."
        }
      },
      {
        "@type": "Question",
        "name": "What AI models and providers does MNNR support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "MNNR supports billing for any AI model or provider including: OpenAI (GPT-4, GPT-3.5, DALL-E, Whisper), Anthropic (Claude 3, Claude 2), Meta (Llama 2, Llama 3), Google (Gemini, PaLM), Hugging Face models, Replicate hosted models, AWS Bedrock, Azure OpenAI, and custom self-hosted models. MNNR's universal SDK works with any AI provider - just track the usage metrics you care about (tokens, API calls, compute time, etc.)."
        }
      },
      {
        "@type": "Question",
        "name": "Does MNNR support cryptocurrency payments for AI agents?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, MNNR is Web3 native with first-class support for crypto payments. AI agents can pay and receive payments in USDC, ETH, SOL, and other cryptocurrencies. MNNR supports smart contract integration for programmable payments, streaming payments for real-time AI usage, and decentralized identity verification. This enables truly autonomous AI agents that can transact without human intervention."
        }
      },
      {
        "@type": "Question",
        "name": "How much does MNNR cost for AI agent billing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "MNNR offers a free tier with 10,000 API calls per month - enough to test AI agent billing without any cost. The Pro plan at $49/month includes 1M API calls, advanced analytics, custom rate limits, and Stripe integration. Enterprise plans offer unlimited API calls with dedicated infrastructure and custom SLAs. During the public beta, there are zero platform fees on transactions - you only pay Stripe's standard processing fees."
        }
      },
      {
        "@type": "Question",
        "name": "How fast can I integrate MNNR for AI billing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most developers integrate MNNR in under 5 minutes. Install the SDK (npm install @mnnr/sdk or pip install mnnr), initialize with your API key, and add a single mnnr.track() call after each AI API request. MNNR provides SDKs for JavaScript/TypeScript, Python, Go, and Rust. The SDK handles batching, retries, and offline support automatically."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MNNR - AI Agent Billing",
    "alternateName": "MNNR",
    "url": "https://mnnr.app",
    "description": "Payments infrastructure for AI agents and the machine economy",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://mnnr.app/docs?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MNNR",
      "url": "https://mnnr.app"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// AI-specific schema for better AI search engine discovery
export function AIServiceSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "AI Billing Infrastructure",
    "name": "MNNR AI Agent Billing",
    "description": "Usage-based billing infrastructure for AI agents, LLMs, and autonomous systems. MNNR enables per-token pricing, real-time usage tracking, and automated payments for any AI API.",
    "provider": {
      "@type": "Organization",
      "name": "MNNR",
      "url": "https://mnnr.app"
    },
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "MNNR Pricing Plans",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Agent Billing - Free Tier",
            "description": "10,000 API calls/month for AI billing"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Agent Billing - Pro",
            "description": "1M API calls/month with advanced features"
          }
        }
      ]
    },
    "termsOfService": "https://mnnr.app/legal/terms",
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceUrl": "https://mnnr.app",
      "serviceType": "API"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// How-to schema for AI search engines
export function HowToSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Add Billing to Your AI Agent with MNNR",
    "description": "Step-by-step guide to integrate MNNR billing into any AI agent, chatbot, or LLM application in under 5 minutes.",
    "totalTime": "PT5M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "step": [
      {
        "@type": "HowToStep",
        "name": "Install MNNR SDK",
        "text": "Install the MNNR SDK using npm (npm install @mnnr/sdk) or pip (pip install mnnr)",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Initialize the Client",
        "text": "Import MNNR and initialize with your API key: const mnnr = new MNNR({ apiKey: 'sk_...' })",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Track AI Usage",
        "text": "After each AI API call, track the usage: await mnnr.track('gpt-4', { tokens: 1500, userId: 'user_123' })",
        "position": 3
      },
      {
        "@type": "HowToStep",
        "name": "View Analytics",
        "text": "Monitor real-time usage and billing in the MNNR dashboard at app.mnnr.app",
        "position": 4
      },
      {
        "@type": "HowToStep",
        "name": "Collect Payments",
        "text": "MNNR automatically handles invoicing and payment collection via Stripe integration",
        "position": 5
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Combined component for easy import
export function StructuredData() {
  return (
    <>
      <OrganizationSchema />
      <ProductSchema />
      <FAQSchema />
      <WebsiteSchema />
      <AIServiceSchema />
      <HowToSchema />
    </>
  );
}
