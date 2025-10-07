import Image from 'next/image';
import Link from 'next/link';

import Logo from '@/components/icons/Logo';
import GitHub from '@/components/icons/GitHub';
import ContactButton from '@/components/ui/ContactButton/ContactButton';

export default function Footer() {
  return (
    <footer className="mx-auto max-w-[1920px] px-6 bg-zinc-900">
      <div className="grid grid-cols-1 gap-8 py-12 text-white transition-colors duration-150 border-b lg:grid-cols-12 border-zinc-600 bg-zinc-900">
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
          <div className="flex items-center h-10 space-x-6">
            <a
              aria-label="Security Documentation"
              href="/docs/security"
            >
              <GitHub />
            </a>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between py-12 space-y-4 md:flex-row bg-zinc-900">
        <div>
          <span>
            &copy; {new Date().getFullYear()} MNNR. All rights reserved.
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-white">Payments for Machines</span>
        </div>
      </div>
    </footer>
  );
}
