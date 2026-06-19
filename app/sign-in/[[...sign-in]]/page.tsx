// app/sign-in/[[...sign-in]]/page.tsx — Clerk catch-all sign-in.
//
// Added 2026-06-19 alongside the Supabase -> Clerk migration. Renders
// Clerk's hosted <SignIn /> widget; the catch-all segment is required so
// Clerk can route its own steps (verification, MFA, OAuth callback).

import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <SignIn afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard" />
    </div>
  );
}
