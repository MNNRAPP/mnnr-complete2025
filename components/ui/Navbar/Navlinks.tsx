'use client';

/**
 * Navlinks — Clerk (post-Supabase migration 2026-06-19).
 *
 * Sign-in / sign-up are routed to Clerk's hosted /sign-in and /sign-up.
 * Signed-in state renders the UserButton (avatar dropdown + sign-out) and
 * an Account link.
 */

import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

import Logo from '@/components/icons/Logo';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import s from './Navbar.module.css';

export default function Navlinks() {
  return (
    <div className="relative flex flex-row justify-between py-4 align-center md:py-6">
      <div className="flex items-center flex-1">
        <Link href="/" className={s.logo} aria-label="Logo">
          <Logo />
        </Link>
        <nav className="ml-6 space-x-1 lg:block hidden md:flex">
          <Link href="/#authority" className={s.link}>
            Authority Gap
          </Link>
          <Link href="/#architecture" className={s.link}>
            Architecture
          </Link>
          <Link href="/#compliance" className={s.link}>
            Compliance
          </Link>
          <Link href="/docs/quick-start" className={s.link}>
            Docs
          </Link>
          <SignedIn>
            <Link href="/account" className={s.link}>
              Account
            </Link>
          </SignedIn>
        </nav>
      </div>
      <div className="flex justify-end items-center space-x-3">
        <div className="hidden md:flex items-center space-x-2">
          <LanguageSelector />
        </div>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in" className={s.link}>
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold text-sm px-5 py-2.5 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
          >
            Become a Partner
          </Link>
        </SignedOut>
      </div>
    </div>
  );
}
