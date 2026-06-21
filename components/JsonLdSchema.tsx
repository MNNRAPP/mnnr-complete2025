/**
 * JSON-LD structured data for MNNR site SEO.
 *
 * Drop into app/layout.tsx <head> or app/page.tsx as a child of the page root.
 * Provides Organization, SoftwareApplication, Offer, and FAQPage schemas
 * per schema.org and Google rich-result guidelines.
 *
 * Built 2026-06-20 PT per Genspark site audit Item B (SEO JSON-LD gap).
 * Keep claims defensible — do not advertise certifications or partnerships
 * that are not in force. Update offerCount and price values when the
 * pricing page changes.
 */

export default function JsonLdSchema() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://mnnr.app/#organization',
    name: 'MNNR, LLC',
    legalName: 'MNNR, LLC',
    alternateName: 'MNNR',
    url: 'https://mnnr.app',
    logo: {
      '@type': 'ImageObject',
      url: 'https://mnnr.app/icon-512.png',
      width: 512,
      height: 512,
    },
    description:
      'Rail-neutral authorization, governance, and audit layer for agentic payments. Compliant with PSD3, MiCA, EUDIW, and DORA from day one. Bank-agnostic. EU-sovereign by default.',
    foundingDate: '2025-02-26',
    taxID: '33-3678186',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1603 Capitol Ave, Suite 413 PMB #1750',
      addressLocality: 'Cheyenne',
      addressRegion: 'WY',
      postalCode: '82001',
      addressCountry: 'US',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@mnnr.app',
        availableLanguage: ['English'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'legal',
        email: 'legal@mnnr.app',
        availableLanguage: ['English', 'German'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'security',
        email: 'security@mnnr.app',
        availableLanguage: ['English'],
      },
    ],
    sameAs: [
      'https://github.com/MNNRAPP',
    ],
  };

  const softwareApplication = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://mnnr.app/#software',
    name: 'MNNR Authority Layer',
    alternateName: 'MNNR',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Compliance and Risk Management',
    operatingSystem: 'Web-based',
    description:
      'Rail-neutral control plane that authorizes AI agent spend. Governance, attestation, and audit overlay above Stripe Tempo MPP, Coinbase x402, AWS Bedrock AgentCore Payments, Chrome WebMCP, Visa Agentic Ready, and Mastercard Agent Pay.',
    url: 'https://mnnr.app',
    publisher: { '@id': 'https://mnnr.app/#organization' },
    offers: [
      {
        '@type': 'Offer',
        name: 'A50 Five-Day Scoping Engagement',
        price: '15000',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url: 'https://mnnr.app/a50/',
        description:
          'Five-business-day scoping engagement covering EU Article 50 disclosure and PSD3/MiCA/DORA/EUDIW agentic-payments governance posture for a single product line.',
      },
      {
        '@type': 'Offer',
        name: 'Pilot Engagement',
        price: '5000',
        priceCurrency: 'EUR',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '5000',
          priceCurrency: 'EUR',
          unitText: 'MONTH',
        },
        availability: 'https://schema.org/PreOrder',
        url: 'https://mnnr.app/#pilot',
        description:
          'Monthly pilot engagement, scope agreed in a statement of work signed by both parties.',
      },
    ],
    featureList: [
      'Bank-agnostic governance overlay',
      'Post-quantum cryptography (ML-DSA-65 + ML-KEM-768)',
      'Signed attestation packets',
      'Cross-rail audit log',
      'EU-sovereign by default',
      'PSD3, MiCA, DORA, EUDI Wallet compatible',
    ],
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://mnnr.app/#faq',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is MNNR?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MNNR is a rail-neutral authorization, governance, and audit overlay for agentic payments. We sit above existing payment rails (Stripe Tempo MPP, Coinbase x402, AWS Bedrock AgentCore Payments, Chrome WebMCP) and network agentic programs (Visa Agentic Ready, Mastercard Agent Pay), adding consent, attestation, policy enforcement, and audit-grade evidence for AI-initiated payments.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is MNNR a payment processor or a law firm?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Neither. MNNR is a software vendor. We are not a payment processor and do not move money. We are not a law firm and do not provide legal advice. We provide governance and audit software, and our content is informational. Customers should consult licensed counsel in the relevant jurisdiction before relying on any MNNR deliverable for regulatory compliance purposes.',
        },
      },
      {
        '@type': 'Question',
        name: 'What regulatory frameworks does MNNR cover?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MNNR is designed to operate alongside PSD2, PSD3, the Payment Services Regulation, the Instant Payments Regulation, MiCA, DORA, eIDAS 2.0 / EUDI Wallet, and the EU AI Act. For United States customers, MNNR aligns with NIST FIPS 203 and 204 post-quantum standards and with National Security Memorandum 11 timelines.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does MNNR relate to Visa Agentic Ready and Mastercard Agent Pay?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The network agentic programs (Visa Agentic Ready, Mastercard Agent Pay) operate at the card-network rail layer. MNNR sits above the rail as the bank-agnostic governance, attestation, and audit overlay. A bank can participate in Visa Agentic Ready and also use MNNR to maintain consistent policy and audit controls across other rails (Stripe Tempo MPP, x402, AWS AgentCore, Chrome WebMCP). The two are complementary, not competitive.',
        },
      },
      {
        '@type': 'Question',
        name: 'What insurance does MNNR carry?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MNNR is in active broker engagement for technology errors-and-omissions, cyber liability, and commercial general liability coverage. Coverage status will be published on the MNNR Security and Trust page when binders are in force.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where is MNNR incorporated and what is the legal entity?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MNNR is operated by MNNR, LLC, a Wyoming limited liability company organized 26 February 2025, EIN 33-3678186, registered office 1603 Capitol Ave Suite 413 PMB 1750, Cheyenne, WY 82001, United States.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplication) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  );
}
