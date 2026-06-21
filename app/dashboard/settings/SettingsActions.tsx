// app/dashboard/settings/SettingsActions.tsx — client-side action buttons.
//
// Sign-out uses Clerk's <SignOutButton /> wrapper which calls Clerk's
// signOut() and redirects. "Manage account" links to the Clerk-hosted
// /user-profile (if you've configured one) or to Clerk's drop-in
// UserButton-style modal — we use a plain link to /sign-in so users on a
// signed-out path can re-enter without surprise.

'use client';

import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';
import { useToast } from '@/components/ui/Toasts/use-toast';

export default function SettingsActions({
  onboarded,
}: {
  onboarded: boolean;
}) {
  const { toast } = useToast();

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-base font-semibold text-white">Actions</h2>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!onboarded && (
          <Link
            href="/onboarding"
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20"
          >
            Take the guided tour
          </Link>
        )}
        {/*
          Clerk v4 <SignOutButton> wraps the inner button and handles the
          signOut() call itself. We use the no-prop form (defaults to signing
          out + redirecting to /); the inner onClick fires a confirmation
          toast before Clerk's handler takes over.
        */}
        <SignOutButton>
          <button
            type="button"
            onClick={() =>
              toast({
                title: 'Signing out',
                description: 'You will be redirected to the home page.',
              })
            }
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Sign out
          </button>
        </SignOutButton>
      </div>
    </section>
  );
}
