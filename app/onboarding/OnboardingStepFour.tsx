// app/onboarding/OnboardingStepFour.tsx — finish line + dashboard tour.
//
// Side effect on mount: POST /api/user/onboarding/complete to stamp
// User.onboardedAt = now(). Idempotent — second call is a no-op. We do this
// from the client (not from the page server component) because the page
// component is shared with steps 1-3 and we don't want a stray refresh on
// step 3 to mark the user "done" prematurely.

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function readCsrfCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function OnboardingStepFour({ userId }: { userId: string }) {
  // userId is unused in the body — it's passed so we can future-extend
  // (e.g., personalized welcome). The server already authorizes the
  // mark-complete call via Clerk session.
  void userId;

  const router = useRouter();
  const [marking, setMarking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const csrf = readCsrfCookie();
        await fetch('/api/user/onboarding/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(csrf ? { 'x-csrf-token': csrf } : {}),
          },
          credentials: 'same-origin',
        });
      } catch {
        // Non-fatal — if the mark-complete fails the user will see this
        // page again next time they hit /onboarding, which is recoverable.
      } finally {
        if (!cancelled) setMarking(false);
        // Clear the cached plaintext key from sessionStorage — onboarding done.
        try {
          sessionStorage.removeItem('mnnr.onboarding.firstKey');
        } catch {
          /* ignore */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
          <svg
            className="h-8 w-8 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white">You&apos;re live</h2>
        <p className="mt-3 text-sm text-gray-300">
          {marking
            ? 'Saving your onboarding status…'
            : 'Onboarding complete. Here’s what lives in your dashboard.'}
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <TourCard
          title="API Keys"
          href="/dashboard/keys"
          body="Create, rotate, and revoke keys. Each shows a prefix + last-used time. Plaintext keys are returned exactly once on creation."
        />
        <TourCard
          title="Usage"
          href="/dashboard/usage"
          body="Every API call logs a usage event. Filter by day / week / month, see request counts and event types."
        />
        <TourCard
          title="Audit"
          href="/dashboard/audit"
          body="Every authentication, key change, and payment attempt is logged with IP + user agent. Useful for SOC 2 and incident review."
        />
        <TourCard
          title="Settings"
          href="/dashboard/settings"
          body="Manage your profile, email, and connected accounts. (Auth itself is handled by Clerk.)"
        />
      </div>

      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-8 py-3 text-base font-semibold text-black transition-colors hover:bg-emerald-400"
        >
          Go to dashboard →
        </button>
      </div>
    </div>
  );
}

function TourCard({
  title,
  body,
  href,
}: {
  title: string;
  body: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition-colors hover:border-emerald-500/40 hover:bg-zinc-900"
    >
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-xs text-gray-400">{body}</p>
      <span className="mt-2 inline-block text-xs text-emerald-400">
        Open →
      </span>
    </a>
  );
}
