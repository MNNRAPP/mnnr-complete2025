import Link from 'next/link';

export default function CTA() {
  return (
    <section className="bg-zinc-950 text-white py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">Ship your agent to production</h2>
        <p className="text-gray-300 mb-10">
          Join the pilot—0% fees, white-glove onboarding, and priority support.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/partners/register" className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-8 py-4 rounded-lg transition-colors">
            Apply now
          </Link>
          <Link href="/docs/quick-start" className="border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black font-semibold px-8 py-4 rounded-lg transition-colors">
            Read the quick start
          </Link>
        </div>
      </div>
    </section>
  );
}
