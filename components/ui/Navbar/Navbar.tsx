// components/ui/Navbar/Navbar.tsx — Clerk (post-Supabase migration 2026-06-19).
//
// The server-side auth check is gone; Navlinks now uses Clerk's
// <SignedIn /> / <SignedOut /> / <UserButton /> client components, which
// pick up the session reactively without prop-drilling the user.

import s from './Navbar.module.css';
import Navlinks from './Navlinks';

export default function Navbar() {
  return (
    <nav className={s.root}>
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="max-w-6xl px-6 mx-auto">
        <Navlinks />
      </div>
    </nav>
  );
}
