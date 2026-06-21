// app/dashboard/settings/page.tsx — account settings.
//
// Identity is owned by Clerk; this page is mostly a display + link-out. The
// "Manage account" button opens Clerk's hosted UserProfile page (handles
// email changes, passwords, OAuth, MFA, sessions).

import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';

import { getOrCreateUser } from '@/lib/user';
import SettingsActions from './SettingsActions';

export const metadata: Metadata = {
  title: 'Settings | MNNR Dashboard',
  description: 'Manage your MNNR account, email, and connected sessions.',
};

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getOrCreateUser();
  if (!user) return null;

  const cu = await currentUser();
  const fullName =
    [cu?.firstName, cu?.lastName].filter(Boolean).join(' ') ||
    cu?.username ||
    user.email;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Identity, email, and account session management.
        </p>
      </header>

      <div className="space-y-6">
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-base font-semibold text-white">Profile</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Row label="Name" value={fullName} />
            <Row label="Email" value={user.email} mono />
            <Row label="User ID" value={user.id} mono />
            <Row
              label="Joined"
              value={user.createdAt.toLocaleDateString()}
            />
            <Row
              label="Onboarding"
              value={
                user.onboardedAt
                  ? `Completed ${user.onboardedAt.toLocaleDateString()}`
                  : 'Not yet completed'
              }
            />
          </dl>
        </section>

        <SettingsActions onboarded={Boolean(user.onboardedAt)} />

        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-base font-semibold text-white">
            Connected services
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Identity and authentication are managed by Clerk. Email
            verification, OAuth (Google / GitHub), MFA, and session
            revocation all live in your Clerk profile.
          </p>
        </section>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </dt>
      <dd
        className={`mt-1 text-white ${mono ? 'font-mono text-xs' : 'text-sm'}`}
      >
        {value}
      </dd>
    </div>
  );
}
