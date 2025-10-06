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
    <div>
      <p className="mt-24 text-xs uppercase text-zinc-400 text-center font-bold tracking-[0.3em]">
        Brought to you by
      </p>
      <div className="grid grid-cols-1 place-items-center my-12 space-y-4 sm:mt-8 sm:space-y-0 md:mx-auto md:max-w-2xl sm:grid sm:gap-6 sm:grid-cols-5">
        {LOGOS.map((logo) => (
          <div key={logo.src} className="flex items-center justify-start h-12">
            <a href={logo.href} aria-label={logo.ariaLabel}>
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
  );
}
