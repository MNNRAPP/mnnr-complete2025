import Image from 'next/image';

const TECH_STACK = [
  {
    href: 'https://nextjs.org',
    ariaLabel: 'Built with Next.js',
    src: '/nextjs.svg',
    alt: 'Next.js Logo',
    width: 120,
    height: 48,
    className: 'h-6 sm:h-12 w-auto text-white',
  },
  {
    href: 'https://supabase.io',
    ariaLabel: 'Powered by Supabase',
    src: '/supabase.svg',
    alt: 'Supabase Logo',
    width: 120,
    height: 40,
    className: 'h-10 w-auto text-white',
  },
  {
    href: 'https://stripe.com',
    ariaLabel: 'Payments by Stripe',
    src: '/stripe.svg',
    alt: 'Stripe Logo',
    width: 120,
    height: 48,
    className: 'h-12 w-auto text-white',
  },
  {
    href: 'https://github.com',
    ariaLabel: 'Open source on GitHub',
    src: '/github.svg',
    alt: 'GitHub Logo',
    width: 120,
    height: 40,
    className: 'h-8 w-auto text-white',
  },
];

export default function LogoCloud() {
  return (
    <div>
      <p className="mt-24 text-xs uppercase text-zinc-400 text-center font-bold tracking-[0.3em]">
        Built with
      </p>
      <div className="grid grid-cols-1 place-items-center my-12 space-y-4 sm:mt-8 sm:space-y-0 md:mx-auto md:max-w-2xl sm:grid sm:gap-6 sm:grid-cols-4">
        {TECH_STACK.map((tech) => (
          <div key={tech.src} className="flex items-center justify-start h-12">
            <a href={tech.href} aria-label={tech.ariaLabel}>
              <Image
                src={tech.src}
                alt={tech.alt}
                width={tech.width}
                height={tech.height}
                className={tech.className}
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
