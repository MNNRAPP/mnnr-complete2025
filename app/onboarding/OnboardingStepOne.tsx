// app/onboarding/OnboardingStepOne.tsx — Welcome screen.
//
// Pure presentation; no client state. "Let's start" pushes to ?step=2 via a
// plain anchor (no JS needed), so this still works if the user has scripts
// disabled.

export default function OnboardingStepOne() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-white sm:text-4xl">
        Welcome to MNNR
      </h1>
      <p className="mt-3 text-lg text-gray-300">
        The trust layer for agentic payments.
      </p>
      <p className="mx-auto mt-6 max-w-xl text-sm text-gray-400">
        In three steps you&apos;ll have a working API key, your first
        authenticated API call, and a tour of your dashboard. Takes about
        three minutes.
      </p>

      <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
        <Card icon="🔑" title="Create a key" body="Generate your first API key — name it, copy it, save it." />
        <Card icon="📡" title="Make a call" body="Run a single curl. Confirm the response. You're live." />
        <Card icon="📊" title="See it land" body="Your usage event lights up the dashboard in real time." />
      </div>

      <div className="mt-10">
        <a
          href="/onboarding?step=2"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-3 text-base font-semibold text-black transition-colors hover:bg-emerald-400"
        >
          Let&apos;s start
          <svg
            className="ml-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}

function Card({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-2 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-xs text-gray-400">{body}</p>
    </div>
  );
}
