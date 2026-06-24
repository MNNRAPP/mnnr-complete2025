// app/sign-up/[[...sign-up]]/page.tsx — Clerk catch-all sign-up.
//
// Polished 2026-06-19: after sign-up Clerk redirects to /onboarding, which
// runs the 3-step guided tour for new users (the same destination as
// sign-in — /onboarding owns the "first run vs. returning" decision).

import type { Metadata } from 'next';
import { SignUp } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Create your account | MNNR',
  description:
    'Sign up for MNNR — the rail-neutral authority layer for autonomous AI agents in Europe.',
};

export default function Page() {
  return (
    <div className="min-h-[calc(100dvh-8rem)] flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Get started</h1>
          <p className="mt-2 text-sm text-gray-400">
            Create your MNNR account in 30 seconds
          </p>
        </div>
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
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
            },
          }}
        />
      </div>
    </div>
  );
}
