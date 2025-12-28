'use client';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "MNNR gave us usage-based billing in 20 minutes. The latency is invisible—our users don't even notice the billing layer exists.",
      author: "Engineering Lead",
      company: "AI Infrastructure Startup",
      role: "Beta Partner",
      avatar: "🤖"
    },
    {
      quote: "We tried building billing ourselves for 3 months. MNNR replaced all of it in an afternoon. The rate limiting alone saved us weeks.",
      author: "CTO",
      company: "Autonomous Systems Company",
      role: "Beta Partner",
      avatar: "⚡"
    },
    {
      quote: "Finally, billing infrastructure that understands machine-to-machine transactions. The Web3 support is exactly what we needed.",
      author: "Founder",
      company: "Web3 Protocol",
      role: "Beta Partner",
      avatar: "🔗"
    }
  ];

  return (
    <section className="relative bg-[#0a0a0f] py-24 px-6 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-emerald-400 text-sm">💬 From Our Beta Partners</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            What Builders Are{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Saying
            </span>
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            Hear from the teams building the future of autonomous systems with MNNR
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative rounded-2xl bg-white/[0.02] border border-white/10 p-8 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-4xl text-white/5 group-hover:text-emerald-500/10 transition-colors">
                "
              </div>
              
              {/* Quote */}
              <p className="text-white/70 text-lg leading-relaxed mb-8 relative z-10">
                "{testimonial.quote}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold">{testimonial.author}</p>
                  <p className="text-white/40 text-sm">{testimonial.company}</p>
                  <p className="text-emerald-400/60 text-xs mt-1">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="text-center text-white/30 text-sm mt-12">
          * Testimonials from beta partners. Names anonymized per NDA agreements.
        </p>
      </div>
    </section>
  );
}
