// app/dashboard/layout.tsx — shared chrome for every dashboard subpage.
//
// Auth gate: middleware already redirects unauthed users from /dashboard*,
// but we belt-and-suspenders by checking server-side here. If a user lands
// here without a Clerk session we send them to /sign-in.
//
// Onboarding gate: if User.onboardedAt is null, we still let them in. The
// signin/signup flow tries to push first-time users through /onboarding,
// but if they navigated here directly the dashboard is the source of truth
// for what they own. Skipping onboarding shouldn't lock anyone out of their
// data.

import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

import { getOrCreateUser } from '@/lib/user';
import DashboardNav from './DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId: clerkId } = auth();
  if (!clerkId) redirect('/sign-in');

  const user = await getOrCreateUser();
  if (!user) redirect('/sign-in');

  return (
    <div className="min-h-[calc(100dvh-8rem)] bg-black">
      <DashboardNav />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
