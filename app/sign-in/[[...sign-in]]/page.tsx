// app/sign-in/[[...sign-in]]/page.tsx — Clerk catch-all sign-in.
//
// Added 2026-06-19 alongside the Supabase -> Clerk migration. Renders
// Clerk's hosted <SignIn /> widget; the catch-all segment is required so
// Clerk can route its own steps (verification, MFA, OAuth callback).
//
// Polished 2026-06-19 (PR feat/onboarding-flow-dashboard-polish):
//   - Routes new+returning users to /onboarding. /onboarding is the single
//     decision point — it bounces existing users to /dashboard if
//     User.onboardedAt is already set, otherwise it runs the 3-step tour.
//   - Branded appearance bound to the MNNR dark theme.

import type { Metadata } from 'next';
import { SignIn } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Sign in | MNNR',
  description:
    'Sign in to MNNR to manage API keys, monitor usage, and access the agentic-payments authority layer.',
};

export default function Page() {
  return (
    <div className="min-h-[calc(100dvh-8rem)] flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to your MNNR account
          </p>
        </div>
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          afterSignInUrl="/onboarding"
          afterSignUpUrl="/onboarding"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-zinc-900 border border-zinc-800 shadow-xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton:
                'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700',
              dividerLine: 'bg-zinc-700',
              dividerText: 'text-gray-400',
              formFieldLabel: 'text-gray-300',
              formFieldInput:
                'bg-zinc-800 border-zinc-700 text-white focus:border-emerald-500',
              formButtonPrimary:
                'bg-emerald-500 hover:bg-emerald-600 text-black font-semibold',
              footerActionText: 'text-gray-400',
              footerActionLink: 'text-emerald-400 hover:text-emerald-300',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-emerald-400',
            },
          }}
        />
      </div>
    </div>
  );
}
