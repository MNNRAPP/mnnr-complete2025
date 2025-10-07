import Link from 'next/link';

import Logo from '@/components/icons/Logo';
import GitHub from '@/components/icons/GitHub';
import ContactButton from '@/components/ui/ContactButton/ContactButton';

export default function Footer() {
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? 'https://github.com/MNNRAPP/mnnr-complete2025';

  return (
    <footer className="mx-auto max-w-[1920px] px-6">
      <div className="grid grid-cols-1 gap-8 border-b border-white/10 bg-black/60 py-12 text-white transition-colors duration-150 backdrop-blur lg:grid-cols-12">
        <div className="col-span-1 lg:col-span-2">
          <Link
            href="/"
            className="flex items-center flex-initial font-bold md:mr-24"
          >
            <span className="mr-3">
              <Logo />
            </span>
          </Link>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-col flex-initial md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Home
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/docs"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Documentation
              </Link>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/partners/register"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Pilot Program
              </Link>
            </li>
          </ul>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-col flex-initial md:flex-1">
            <li className="py-3 md:py-0 md:pb-4">
              <p className="font-bold text-white transition duration-150 ease-in-out hover:text-zinc-200">
                SUPPORT
              </p>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <ContactButton className="text-white transition duration-150 ease-in-out hover:text-zinc-200">
                📧 Contact Support
              </ContactButton>
            </li>
            <li className="py-3 md:py-0 md:pb-4">
              <Link
                href="/docs"
                className="text-white transition duration-150 ease-in-out hover:text-zinc-200"
              >
                Documentation
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex items-start col-span-1 text-white lg:col-span-6 lg:justify-end">
          <div className="flex h-10 items-center space-x-6">
            <a
              aria-label="GitHub link"
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
            >
              <GitHub />
            </a>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between space-y-4 bg-black/60 py-12 text-sm text-zinc-400 backdrop-blur md:flex-row">
        <span>&copy; {new Date().getFullYear()} MNNR. All rights reserved.</span>
        <span className="text-zinc-300">Payments for Machines</span>
      </div>
    </footer>
  );
}
