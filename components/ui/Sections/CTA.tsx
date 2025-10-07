import ContactButton from '@/components/ui/ContactButton/ContactButton';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(16,185,129,0.18),rgba(0,0,0,0))]" />
      <div className="mx-auto max-w-4xl px-6">
        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-black/70 via-emerald-500/10 to-black/70 p-10 text-center shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
          <div className="absolute -left-16 -top-20 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-52 w-52 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="relative space-y-6">
            <span className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-100">
              Pilot access
            </span>
            <h2 className="text-3xl font-semibold text-white md:text-4xl">
              Launch with white-glove onboarding and zero pilot fees
            </h2>
            <p className="text-base text-zinc-200 md:text-lg">
              Our solutions engineers pair with your team to integrate, meter, and validate. We stay alongside you
              through go-live with enterprise support hours.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
              <Link
                href="/partners/register"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-base font-semibold text-black transition hover:bg-emerald-200"
              >
                Apply for the pilot
              </Link>
              <ContactButton
                source="cta-section"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-3 text-base font-semibold text-white transition hover:border-emerald-300/60 hover:bg-emerald-300/10"
              >
                Schedule a walkthrough
              </ContactButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
