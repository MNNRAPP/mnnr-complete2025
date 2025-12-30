/**
 * JSON-LD Structured Data for SEO
 * 
 * Implements Organization, Product, and FAQ schema for rich Google search results.
 * https://developers.google.com/search/docs/appearance/structured-data
 */

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MNNR",
    "alternateName": "MNNR Payments",
    "url": "https://mnnr.app",
    "logo": "https://mnnr.app/icon-512.png",
    "description": "Payments Infrastructure for the Machine Economy. The universal billing layer for AI agents, APIs, and autonomous systems.",
    "foundingDate": "2024",
    "sameAs": [
      "https://github.com/MNNRAPP",
      "https://twitter.com/mnnrapp"
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
    }
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
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web, API",
    "description": "Pay-per-call billing infrastructure for AI agents, APIs, and autonomous systems. Track usage, enforce limits, and collect payments from any machine.",
    "url": "https://mnnr.app",
    "image": "https://mnnr.app/icon-512.png",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Tier",
        "price": "0",
        "priceCurrency": "USD",
        "description": "10,000 API calls/month, basic analytics, API key management",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Pro",
        "price": "49",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31",
        "description": "1M API calls/month, advanced analytics, custom rate limits, Stripe integration",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "Enterprise",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Custom pricing - Unlimited API calls, dedicated infrastructure, SSO, custom SLA",
        "availability": "https://schema.org/InStock"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "127",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": [
      "Real-time usage tracking",
      "Programmable billing",
      "API key management",
      "Distributed rate limiting",
      "Web3/crypto support",
      "Stripe integration"
    ]
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
        "name": "What is MNNR?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "MNNR is payments infrastructure for the machine economy. We provide the universal billing layer for AI agents, IoT devices, autonomous systems, and any software that needs to track usage, enforce limits, and collect payments. Think of us as Stripe, but built specifically for machine-to-machine commerce."
        }
      },
      {
        "@type": "Question",
        "name": "How is MNNR different from Stripe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "While Stripe was built for human-initiated transactions, MNNR is designed for autonomous systems. We handle fast usage tracking, distributed rate limiting across global infrastructure, and billing models that don't exist in traditional commerce—like per-token pricing for AI, per-cycle billing for compute, or real-time streaming payments between agents."
        }
      },
      {
        "@type": "Question",
        "name": "How much does MNNR cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer a free tier with 10,000 API calls per month—no credit card required. Our Pro plan starts at $49/month with 1M calls included, and Enterprise plans are custom-priced based on volume. During our public beta, there are zero platform fees on transactions."
        }
      },
      {
        "@type": "Question",
        "name": "What happens if I exceed my API call limit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You won't experience service interruption. We'll notify you when you reach 80% of your limit, and overage is billed at competitive per-call rates. You can also set hard limits if you prefer to cap usage rather than allow overages. Enterprise plans include custom overage pricing."
        }
      },
      {
        "@type": "Question",
        "name": "How long does integration take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Integration takes about 5 minutes. Our SDK supports JavaScript/TypeScript, Python, Go, and Rust. You can track your first API call in under 5 minutes with just a few lines of code."
        }
      },
      {
        "@type": "Question",
        "name": "Is MNNR secure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. We use industry-standard AES-256 encryption for data in transit (TLS) and at rest. We're working toward SOC 2 Type II certification (target: Q2 2026) and are GDPR compliant. Payments are processed through Stripe, which is PCI DSS Level 1 certified."
        }
      },
      {
        "@type": "Question",
        "name": "Does MNNR support cryptocurrency payments?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! MNNR is Web3 native with first-class support for crypto payments, smart contract integration, and decentralized identity verification. We support Ethereum, Solana, and other major blockchains."
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
    "name": "MNNR",
    "url": "https://mnnr.app",
    "description": "Payments Infrastructure for the Machine Economy",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://mnnr.app/docs?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
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
    </>
  );
}
