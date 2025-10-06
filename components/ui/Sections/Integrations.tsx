import Image from 'next/image';

const INTS = [
  { name: 'Stripe', src: '/stripe.svg', h: 24 },
  { name: 'Supabase', src: '/supabase.svg', h: 32 },
  { name: 'Vercel', src: '/vercel.svg', h: 20 },
  { name: 'GitHub', src: '/github.svg', h: 24 },
];

export default function Integrations() {
  return (
    <section className="bg-gradient-to-b from-zinc-950 to-black text-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Plays nicely with your stack</h2>
        <p className="text-gray-300 mb-10 max-w-3xl">
          Use our API with your existing auth, storage, and deployment. No migration required.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center">
          {INTS.map((i) => (
            <div key={i.name} className="flex items-center justify-center rounded-xl border border-zinc-800 p-6 bg-zinc-900/30">
              <Image src={i.src} alt={`${i.name} logo`} width={120} height={i.h} className="h-6 sm:h-8 w-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
