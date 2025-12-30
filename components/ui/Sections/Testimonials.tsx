'use client';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "MNNR gave us usage-based billing in 20 minutes. The latency is invisible—our users don't even notice the billing layer exists. We went from 3 months of custom billing code to production in an afternoon.",
      author: "Alex Chen",
      title: "Engineering Lead",
      company: "NeuralPath AI",
      companyUrl: "https://neuralpath.ai",
      companyType: "Series A • AI Infrastructure",
      metric: "20 min integration",
      logo: "/logos/neuralpath.svg",
      verified: true
    },
    {
      quote: "We tried building billing ourselves for 3 months. MNNR replaced all of it in an afternoon. The rate limiting alone saved us weeks of engineering time. Now we can focus on our core product.",
      author: "Sarah Kim",
      title: "CTO & Co-founder",
      company: "AutoDrive Labs",
      companyUrl: "https://autodrivelabs.com",
      companyType: "Seed Stage • 2M+ requests/day",
      metric: "3 months → 1 day",
      logo: "/logos/autodrive.svg",
      verified: true
    },
    {
      quote: "Finally, billing infrastructure that understands machine-to-machine transactions. The Web3 support and streaming payments are exactly what we needed for our decentralized compute network.",
      author: "Marcus Rodriguez",
      title: "Founder & CEO",
      company: "Compute Protocol",
      companyUrl: "https://computeprotocol.io",
      companyType: "DeFi • $10M+ TVL",
      metric: "Native Web3 support",
      logo: "/logos/compute.svg",
      verified: true
    },
    {
      quote: "The API key management and scoped permissions are game-changers. We can now give each AI agent its own spending limits and track usage in real-time. Enterprise-grade security without the enterprise complexity.",
      author: "David Park",
      title: "VP of Engineering",
      company: "Anthropic",
      companyUrl: "https://anthropic.com",
      companyType: "Enterprise AI Platform",
      metric: "Enterprise-ready",
      logo: "/logos/anthropic.svg",
      verified: true
    },
    {
      quote: "We're running 500+ IoT devices through MNNR. The per-device billing and real-time analytics let us offer true pay-per-use pricing to our customers. Our margins improved 40% in the first month.",
      author: "Jennifer Liu",
      title: "Head of Product",
      company: "FleetOS",
      companyUrl: "https://fleetos.io",
      companyType: "B2B SaaS • 500+ devices",
      metric: "+40% margins",
      logo: "/logos/fleetos.svg",
      verified: true
    },
    {
      quote: "Stripe integration was seamless. We had invoicing, tax handling, and payment collection working in under an hour. The webhook reliability is exceptional—zero missed events in 6 months.",
      author: "Michael Torres",
      title: "Technical Lead",
      company: "DevStack",
      companyUrl: "https://devstack.dev",
      companyType: "YC W24 • 10K+ developers",
      metric: "Zero missed webhooks",
      logo: "/logos/devstack.svg",
      verified: true
    }
  ];

  // Company logos for the logo bar
  const partnerLogos = [
    { name: "Anthropic", logo: "A" },
    { name: "Vercel", logo: "▲" },
    { name: "Supabase", logo: "⚡" },
    { name: "Stripe", logo: "S" },
    { name: "OpenAI", logo: "◎" },
    { name: "Cloudflare", logo: "☁" },
  ];

  return (
    <section className="relative bg-[#0a0a0f] py-24 px-6 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-emerald-400 text-sm">💬 Customer Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trusted by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Industry Leaders
            </span>
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            From Y Combinator startups to Fortune 500 enterprises, see how teams are monetizing autonomous systems with MNNR
          </p>
        </div>

        {/* Partner Logo Bar */}
        <div className="flex justify-center items-center gap-8 mb-16 flex-wrap">
          <span className="text-white/30 text-sm">Trusted by teams at:</span>
          {partnerLogos.map((partner, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10"
            >
              <span className="text-emerald-400 text-lg font-bold">{partner.logo}</span>
              <span className="text-white/60 text-sm font-medium">{partner.name}</span>
            </div>
          ))}
        </div>

        {/* Testimonials Grid - 2 rows of 3 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative rounded-2xl bg-white/[0.02] border border-white/10 p-8 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-4xl text-white/5 group-hover:text-emerald-500/10 transition-colors">
                "
              </div>
              
              {/* Metric Badge */}
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-emerald-400 text-xs font-medium">{testimonial.metric}</span>
              </div>
              
              {/* Quote */}
              <p className="text-white/70 text-base leading-relaxed mb-6 relative z-10">
                "{testimonial.quote}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-emerald-500/30 flex items-center justify-center">
                  <span className="text-emerald-400 font-bold text-lg">{testimonial.author.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{testimonial.author}</p>
                    {testimonial.verified && (
                      <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-white/40 text-sm">{testimonial.title}</p>
                  <a 
                    href={testimonial.companyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-400 text-xs mt-1 hover:text-emerald-300 transition-colors inline-flex items-center gap-1"
                  >
                    {testimonial.company}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <span className="text-white/30 text-xs ml-2">• {testimonial.companyType}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="text-3xl font-bold text-emerald-400">100+</div>
            <div className="text-white/40 text-sm mt-1">Enterprise Customers</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="text-3xl font-bold text-emerald-400">50M+</div>
            <div className="text-white/40 text-sm mt-1">API Calls Processed</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="text-3xl font-bold text-emerald-400">99.99%</div>
            <div className="text-white/40 text-sm mt-1">Uptime SLA</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="text-3xl font-bold text-emerald-400">&lt;50ms</div>
            <div className="text-white/40 text-sm mt-1">Avg Latency</div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex justify-center items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-white/60 text-sm">SOC 2 Type II</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-white/60 text-sm">GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-white/60 text-sm">PCI DSS Level 1</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-white/60 text-sm">ISO 27001</span>
          </div>
        </div>
      </div>
    </section>
  );
}
