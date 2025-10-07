import Image from 'next/image';

const LOGOS = [
  {
    href: 'https://nextjs.org',
    ariaLabel: 'Next.js Link',
    src: '/nextjs.svg',
    alt: 'Next.js Logo',
    width: 120,
    height: 48,
    className: 'h-6 sm:h-12 w-auto text-white',
  },
  {
    href: 'https://vercel.com',
    ariaLabel: 'Vercel.com Link',
    src: '/vercel.svg',
    alt: 'Vercel.com Logo',
    width: 120,
    height: 24,
    className: 'h-6 w-auto text-white',
  },
  {
    href: 'https://stripe.com',
    ariaLabel: 'stripe.com Link',
    src: '/stripe.svg',
    alt: 'stripe.com Logo',
    width: 120,
    height: 48,
    className: 'h-12 w-auto text-white',
  },
  {
    href: 'https://supabase.io',
    ariaLabel: 'supabase.io Link',
    src: '/supabase.svg',
    alt: 'supabase.io Logo',
    width: 120,
    height: 40,
    className: 'h-10 w-auto text-white',
  },
  {
    href: 'https://github.com',
    ariaLabel: 'github.com Link',
    src: '/github.svg',
    alt: 'github.com Logo',
    width: 120,
    height: 40,
    className: 'h-8 w-auto text-white',
  },
];

export default function LogoCloud() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/5 px-6 py-10 backdrop-blur">
        <p className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-emerald-200">
          Backed by the platforms you ship with
        </p>
        <div className="mt-8 grid grid-cols-2 place-items-center gap-6 sm:grid-cols-3 md:grid-cols-5">
          {LOGOS.map((logo) => (
            <div key={logo.src} className="flex h-12 items-center justify-center">
              <a href={logo.href} aria-label={logo.ariaLabel} className="opacity-80 transition hover:opacity-100">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  className={logo.className}
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
