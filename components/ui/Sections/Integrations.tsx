import Image from 'next/image';

const PARTNERS = [
  { name: 'Stripe', src: '/stripe.svg', height: 32 },
  { name: 'Supabase', src: '/supabase.svg', height: 40 },
  { name: 'Vercel', src: '/vercel.svg', height: 28 },
  { name: 'GitHub', src: '/github.svg', height: 32 }
];

const CONNECTORS = [
  {
    title: 'Deploy anywhere',
    body: 'Vercel, Railway, and container-native deploys with environment-aware configuration helpers.'
  },
  {
    title: 'Observability native',
    body: 'PostHog, OpenTelemetry, and Sentry events ship with structured payloads for finance and ops teams.'
  },
  {
    title: 'Data you can trust',
    body: 'Warehouse exports land in minutes. Pipe usage into Snowflake, BigQuery, or the lake of your choice.'
  }
];

export default function Integrations() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_100%,rgba(59,130,246,0.12),rgba(15,23,42,0))]" />
      <div className="mx-auto grid w-full max-w-6xl gap-16 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
            Integrations
          </span>
          <h2 className="text-3xl font-semibold text-white md:text-5xl md:leading-[1.1]">
            Connect the rails you rely on without heavy lifting
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-zinc-300 md:text-lg">
            Provision wallets, configure spend policies, and stream receipts into the systems your team already uses.
            No migrations, no re-platforming—just the glue that makes agents revenue-ready.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {PARTNERS.map((partner) => (
              <div
                key={partner.name}
                className="flex h-24 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur"
              >
                <Image
                  src={partner.src}
                  alt={`${partner.name} logo`}
                  width={160}
                  height={partner.height}
                  className="h-10 w-auto"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/60 p-10 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
          <div className="absolute -right-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative space-y-8">
            {CONNECTORS.map((connector) => (
              <div key={connector.title} className="space-y-2">
                <h3 className="text-lg font-semibold text-white">{connector.title}</h3>
                <p className="text-sm text-zinc-300">{connector.body}</p>
                <div className="h-px w-full bg-gradient-to-r from-white/0 via-white/20 to-white/0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
