'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What exactly is MNNR?",
    answer: "MNNR is payments infrastructure for the machine economy. We provide the universal billing layer for AI agents, IoT devices, autonomous systems, and any software that needs to track usage, enforce limits, and collect payments. Think of us as Stripe, but built specifically for machine-to-machine commerce."
  },
  {
    question: "How is MNNR different from Stripe or other payment processors?",
    answer: "While Stripe was built for human-initiated transactions, MNNR is designed for autonomous systems. We handle sub-millisecond usage tracking, distributed rate limiting across global edge nodes, and billing models that don't exist in traditional commerce—like per-token pricing for AI, per-cycle billing for compute, or real-time streaming payments between agents."
  },
  {
    question: "How much does MNNR cost?",
    answer: "We offer a free tier with 10,000 API calls per month—no credit card required. Our Pro plan starts at $49/month with 100,000 calls included, and Enterprise plans are custom-priced based on volume. During our public beta, there are zero platform fees on transactions."
  },
  {
    question: "What happens if I exceed my plan limits?",
    answer: "You won't experience service interruption. We'll notify you when you reach 80% of your limit, and overage is billed at competitive per-call rates. You can also set hard limits if you prefer to cap usage rather than allow overages. Enterprise plans include custom overage pricing."
  },
  {
    question: "How do I integrate MNNR into my application?",
    answer: "Integration takes about 5 minutes. Install our SDK (available for Node.js, Python, Go, and Rust), initialize with your API key, and start tracking usage with a single function call. We provide comprehensive documentation, code examples, and a sandbox environment for testing."
  },
  {
    question: "What billing models does MNNR support?",
    answer: "We support usage-based billing (pay-per-call, per-token, per-compute-cycle), subscription models, prepaid credits, hybrid approaches, and custom models. You can also implement tiered pricing, volume discounts, and promotional credits. Our Stripe integration handles invoicing and payment collection automatically."
  },
  {
    question: "Is my data secure with MNNR?",
    answer: "Absolutely. We use bank-level 256-bit encryption for all data in transit and at rest. We're SOC 2 Type II ready, GDPR compliant, and CCPA compliant. All infrastructure runs on enterprise-grade cloud providers with 99.99% uptime SLA. We never store sensitive payment information—that's handled by Stripe."
  },
  {
    question: "Do you support cryptocurrency and Web3 payments?",
    answer: "Yes! MNNR is Web3-native. We support crypto payments, smart contract integration, and decentralized identity verification. You can accept payments in major cryptocurrencies, integrate with DeFi protocols, and build billing for decentralized applications."
  },
  {
    question: "Can I migrate from my current billing solution?",
    answer: "Yes, we provide migration guides and support for common billing systems. Our API is designed to be a drop-in replacement for most use cases. For Enterprise customers, we offer white-glove migration assistance to ensure zero downtime during the transition."
  },
  {
    question: "What kind of support do you offer?",
    answer: "Free tier users get access to our documentation, community Discord, and email support. Pro users get priority support with 4-hour response times. Enterprise customers receive dedicated support, custom SLAs, and direct access to our engineering team. We also offer integration consulting for complex use cases."
  }
];

function FAQItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-medium text-white group-hover:text-emerald-400 transition-colors pr-8">
          {item.question}
        </span>
        <span className={`flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-emerald-500/20 border-emerald-500/30 rotate-180' : ''}`}>
          <svg 
            className={`w-4 h-4 transition-colors ${isOpen ? 'text-emerald-400' : 'text-white/50'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}
      >
        <p className="text-white/60 leading-relaxed pr-12">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative bg-[#0a0a0f] py-32 px-6 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-emerald-400 text-sm">❓ FAQ</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Questions
            </span>
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            Everything you need to know about MNNR. Can't find what you're looking for? 
            <a href="mailto:support@mnnr.app" className="text-emerald-400 hover:text-emerald-300 ml-1">
              Contact our team
            </a>
          </p>
        </div>

        {/* FAQ List */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm">
          <div className="p-2 md:p-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                item={faq}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-white/40 mb-6">
            Still have questions? We're here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/docs" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Read the Docs
            </a>
            <a 
              href="mailto:support@mnnr.app" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
