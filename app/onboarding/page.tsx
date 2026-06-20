// app/onboarding/page.tsx — 3-step guided tour for new MNNR users.
//
// Flow:
//   /onboarding              -> step 1 (welcome)
//   /onboarding?step=2       -> step 2 (create first API key)
//   /onboarding?step=3       -> step 3 (make first API call via curl)
//   /onboarding?step=4       -> step 4 (welcome to dashboard) + marks complete
//
// Behavior:
//   - Unauthenticated visitors are bounced to /sign-in by the Clerk middleware
//     (this route is NOT in the publicRoutes list).
//   - Returning users (User.onboardedAt is set) bypass the tour and land on
//     /dashboard immediately. Net-new users see the tour.
//   - Step 4 is rendered server-side AFTER User.onboardedAt is stamped, so
//     refreshing /onboarding?step=4 a second time will bounce to /dashboard.
//
// All actual mutations (create-key, mark-onboarded) happen via the existing
// /api/keys endpoint and a tiny server action in this directory. Keeping
// the page itself a server component lets us read User.onboardedAt without
// shipping the Prisma client to the browser.

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

import { getOrCreateUser } from '@/lib/user';
import OnboardingStepOne from './OnboardingStepOne';
import OnboardingStepTwo from './OnboardingStepTwo';
import OnboardingStepThree from './OnboardingStepThree';
import OnboardingStepFour from './OnboardingStepFour';

export const metadata = {
  title: 'Get started | MNNR',
  description:
    'Welcome to MNNR — the rail-neutral authority layer for agentic payments. Create your first API key, make your first authenticated call, and reach your dashboard in 3 minutes.',
};

export const dynamic = 'force-dynamic';

interface OnboardingPageProps {
  searchParams?: { step?: string };
}

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  // Belt-and-suspenders auth: middleware will redirect unauth visitors, but
  // we still want a deterministic redirect if somehow this renders without a
  // session (e.g. middleware misconfig).
  const { userId: clerkId } = auth();
  if (!clerkId) redirect('/sign-in');

  const user = await getOrCreateUser();
  if (!user) redirect('/sign-in');

  const stepRaw = searchParams?.step ?? '1';
  const step = Number.parseInt(stepRaw, 10);
  const validStep = Number.isFinite(step) && step >= 1 && step <= 4 ? step : 1;

  // Returning user: if they've finished the tour before, skip it. Exception:
  // step=4 is the "you just finished, congrats" page — let them see it once
  // even if the mark-complete already ran (e.g. browser refresh).
  if (user.onboardedAt && validStep !== 4) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-[calc(100dvh-8rem)] bg-black px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <ProgressBar step={validStep} />
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
          {validStep === 1 && <OnboardingStepOne />}
          {validStep === 2 && <OnboardingStepTwo />}
          {validStep === 3 && <OnboardingStepThree />}
          {validStep === 4 && <OnboardingStepFour userId={user.id} />}
        </div>
        <div className="mt-6 text-center">
          <a
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-300 underline"
          >
            Skip onboarding
          </a>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  const steps = [
    { n: 1, label: 'Welcome' },
    { n: 2, label: 'First API key' },
    { n: 3, label: 'First API call' },
    { n: 4, label: 'Dashboard' },
  ];
  return (
    <div className="flex items-center justify-between">
      {steps.map((s, i) => {
        const done = step > s.n;
        const active = step === s.n;
        return (
          <div key={s.n} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                  done
                    ? 'border-emerald-500 bg-emerald-500 text-black'
                    : active
                      ? 'border-emerald-500 bg-zinc-900 text-emerald-400'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-500'
                }`}
              >
                {done ? '✓' : s.n}
              </div>
              <span
                className={`mt-2 text-xs ${
                  active ? 'text-emerald-400' : 'text-zinc-500'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 ${
                  done ? 'bg-emerald-500' : 'bg-zinc-800'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
