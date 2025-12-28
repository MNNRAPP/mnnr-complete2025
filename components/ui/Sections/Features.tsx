export default function Features() {
  return (
    <section className="bg-black text-white py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need to monetize AI
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Usage tracking, billing, and rate limiting in one simple API
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: '📊',
              title: 'Usage Tracking',
              body: 'Track API calls, tokens, compute time, or any custom metric. Real-time dashboards included.'
            },
            {
              icon: '💳',
              title: 'Automatic Billing',
              body: 'Stripe-powered invoicing. Usage-based, subscription, or hybrid pricing models.'
            },
            {
              icon: '🔑',
              title: 'API Key Management',
              body: 'Generate, rotate, and revoke API keys. Scoped permissions and usage limits per key.'
            },
            {
              icon: '⚡',
              title: 'Rate Limiting',
              body: 'Redis-backed rate limiting. Protect your infrastructure and enforce fair usage.'
            },
            {
              icon: '📈',
              title: 'Analytics Dashboard',
              body: 'Real-time usage analytics, revenue tracking, and customer insights out of the box.'
            },
            {
              icon: '🔒',
              title: 'Enterprise Ready',
              body: 'SOC 2 compliant infrastructure. SSO, audit logs, and dedicated support available.'
            }
          ].map((feature) => (
            <div 
              key={feature.title} 
              className="group rounded-2xl border border-gray-800 p-8 bg-gradient-to-b from-gray-900/50 to-black hover:border-emerald-500/50 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.body}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6">
            Join developers building the next generation of AI applications
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-500">
            <div>
              <span className="text-2xl font-bold text-emerald-400">5min</span>
              <p>Integration time</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-emerald-400">99.9%</span>
              <p>Uptime SLA</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-emerald-400">$0</span>
              <p>To start</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
