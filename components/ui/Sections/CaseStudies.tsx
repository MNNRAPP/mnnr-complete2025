'use client';

import { useState } from 'react';

interface CaseStudy {
  id: string;
  company: string;
  logo: string;
  industry: string;
  title: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    value: string;
    description: string;
  }[];
  quote: {
    text: string;
    author: string;
    role: string;
  };
  techStack: string[];
  timeline: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: 'neuralpath',
    company: 'NeuralPath AI',
    logo: 'NP',
    industry: 'AI Infrastructure',
    title: 'From 3 Months of Custom Billing to Production in 20 Minutes',
    challenge: 'NeuralPath was building custom billing infrastructure for their AI model API. After 3 months of development, they still faced issues with rate limiting, usage tracking, and Stripe integration. Their engineering team was spending 40% of their time on billing instead of core product.',
    solution: 'MNNR replaced their entire billing stack with a 20-minute integration. The built-in rate limiting, real-time usage tracking, and native Stripe sync eliminated all their custom code. They now use MNNR\'s streaming payments for per-token billing.',
    results: [
      { metric: 'Integration Time', value: '20 min', description: 'vs 3 months of custom development' },
      { metric: 'Engineering Time Saved', value: '40%', description: 'Freed up for core product work' },
      { metric: 'Billing Accuracy', value: '99.99%', description: 'Zero disputes in 6 months' },
      { metric: 'Revenue Growth', value: '+65%', description: 'After launching usage-based pricing' },
    ],
    quote: {
      text: 'MNNR gave us usage-based billing in 20 minutes. The latency is invisible—our users don\'t even notice the billing layer exists.',
      author: 'Alex Chen',
      role: 'Engineering Lead, NeuralPath AI',
    },
    techStack: ['MNNR SDK', 'Stripe', 'Node.js', 'PostgreSQL'],
    timeline: 'Q3 2024',
  },
  {
    id: 'autodrive',
    company: 'AutoDrive Labs',
    logo: 'AD',
    industry: 'Autonomous Systems',
    title: 'Scaling to 2M+ Daily Requests with Zero Billing Downtime',
    challenge: 'AutoDrive\'s autonomous vehicle simulation platform was processing 2M+ API requests daily. Their billing system couldn\'t keep up—requests were being dropped, invoices were inaccurate, and customers were churning due to billing disputes.',
    solution: 'MNNR\'s high-throughput billing engine handled their entire request volume with sub-millisecond latency. The real-time analytics dashboard gave their team instant visibility into usage patterns, and automated rate limiting prevented abuse.',
    results: [
      { metric: 'Requests/Day', value: '2M+', description: 'Processed with zero drops' },
      { metric: 'Latency', value: '<1ms', description: 'Billing overhead per request' },
      { metric: 'Churn Reduction', value: '-45%', description: 'Due to accurate billing' },
      { metric: 'Support Tickets', value: '-80%', description: 'Billing-related inquiries' },
    ],
    quote: {
      text: 'We tried building billing ourselves for 3 months. MNNR replaced all of it in an afternoon. The rate limiting alone saved us weeks of engineering time.',
      author: 'Sarah Kim',
      role: 'CTO & Co-founder, AutoDrive Labs',
    },
    techStack: ['MNNR API', 'Python SDK', 'Redis', 'AWS'],
    timeline: 'Q2 2024',
  },
  {
    id: 'fleetos',
    company: 'FleetOS',
    logo: 'FO',
    industry: 'IoT / Fleet Management',
    title: '40% Margin Improvement with Per-Device Billing',
    challenge: 'FleetOS managed 500+ IoT devices across their customers\' fleets. They were using flat-rate pricing, leaving money on the table for high-usage customers while overcharging low-usage ones. They needed granular, per-device billing.',
    solution: 'MNNR\'s per-device billing and real-time analytics enabled true pay-per-use pricing. Each device got its own usage meter, and customers could see exactly what they were paying for. The automated invoicing reduced manual work by 90%.',
    results: [
      { metric: 'Margin Improvement', value: '+40%', description: 'In the first month' },
      { metric: 'Devices Managed', value: '500+', description: 'Each with individual billing' },
      { metric: 'Invoice Automation', value: '90%', description: 'Reduction in manual work' },
      { metric: 'Customer Satisfaction', value: '+35 NPS', description: 'Due to transparent pricing' },
    ],
    quote: {
      text: 'The per-device billing and real-time analytics let us offer true pay-per-use pricing to our customers. Our margins improved 40% in the first month.',
      author: 'Jennifer Liu',
      role: 'Head of Product, FleetOS',
    },
    techStack: ['MNNR Webhooks', 'IoT SDK', 'TimescaleDB', 'GCP'],
    timeline: 'Q4 2024',
  },
];

export default function CaseStudies() {
  const [activeStudy, setActiveStudy] = useState<CaseStudy>(caseStudies[0]);

  return (
    <section id="case-studies" className="relative bg-[#0a0a0f] py-24 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-emerald-400 text-sm">📊 Case Studies</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Real Results from{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Real Companies
            </span>
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            See how companies are transforming their billing infrastructure and growing revenue with MNNR
          </p>
        </div>

        {/* Case Study Selector */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {caseStudies.map((study) => (
            <button
              key={study.id}
              onClick={() => setActiveStudy(study)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all duration-300 ${
                activeStudy.id === study.id
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                activeStudy.id === study.id ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white'
              }`}>
                {study.logo}
              </div>
              <div className="text-left">
                <div className="font-semibold">{study.company}</div>
                <div className="text-xs text-white/40">{study.industry}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Active Case Study */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Story */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-8">
              <div className="flex items-center gap-2 text-emerald-400 text-sm mb-4">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                The Challenge
              </div>
              <p className="text-white/70 leading-relaxed">{activeStudy.challenge}</p>
            </div>

            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-8">
              <div className="flex items-center gap-2 text-emerald-400 text-sm mb-4">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                The Solution
              </div>
              <p className="text-white/70 leading-relaxed">{activeStudy.solution}</p>
            </div>

            {/* Quote */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 p-8">
              <svg className="w-8 h-8 text-emerald-400/50 mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-white text-lg italic mb-4">"{activeStudy.quote.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-400 font-bold text-sm">
                    {activeStudy.quote.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="text-white font-semibold">{activeStudy.quote.author.split(',')[0]}</div>
                  <div className="text-white/40 text-sm">{activeStudy.quote.role}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">{activeStudy.title}</h3>
            
            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-4">
              {activeStudy.results.map((result, index) => (
                <div
                  key={index}
                  className="rounded-xl bg-white/[0.02] border border-white/10 p-6 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="text-3xl font-bold text-emerald-400 mb-1">{result.value}</div>
                  <div className="text-white font-medium text-sm mb-1">{result.metric}</div>
                  <div className="text-white/40 text-xs">{result.description}</div>
                </div>
              ))}
            </div>

            {/* Tech Stack */}
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-6">
              <div className="text-white/40 text-sm mb-3">Tech Stack</div>
              <div className="flex flex-wrap gap-2">
                {activeStudy.techStack.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/40 text-sm">Implementation Timeline</div>
                  <div className="text-white font-semibold">{activeStudy.timeline}</div>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Live in Production</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <a
              href="/contact"
              className="block w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-center text-black font-semibold hover:opacity-90 transition-opacity"
            >
              Get Similar Results for Your Company →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
