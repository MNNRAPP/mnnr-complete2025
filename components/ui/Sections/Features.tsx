export default function Features() {
  return (
    <section className="bg-black text-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for Agents, Ready for Scale</h2>
        <p className="text-gray-300 mb-12 max-w-3xl">
          Opinionated primitives to run pay-per-call agents and APIs with safety rails. Keep your current
          stack—drop in, switch on, and scale.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Per-call Billing',
              body: 'Deterministic metering with cryptographic receipts and transparent pricing.'
            },
            { title: 'Spend Caps', body: 'Wallet-level limits with alerts and automatic throttling.' },
            {
              title: 'Multi-rail Settlement',
              body: 'USDC + Stripe in a single API with instant, verifiable settlement.'
            },
            {
              title: 'Sandbox & Replay',
              body: 'Deterministic replays, request signing, and shadow mode for safe rollouts.'
            },
            { title: 'Observability', body: 'Sentry, logs, and real-time events out of the box.' },
            { title: 'Rate Limiting', body: 'Redis-backed, token-bucket limits per key and per wallet.' }
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-zinc-800 p-6 bg-zinc-900/30">
              <h3 className="font-semibold text-emerald-400 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-300">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
