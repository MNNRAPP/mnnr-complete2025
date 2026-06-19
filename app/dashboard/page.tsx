/**
 * Dashboard Page — Clerk + Prisma (post-Supabase migration 2026-06-19).
 *
 * Fetches the local Prisma User row + the user's active Stripe subscription
 * (looked up by Clerk-session email; legacy `customers` join table is gone).
 */

import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { auth, currentUser } from '@clerk/nextjs/server';

import { getOrCreateUser } from '@/lib/user';
import DashboardContent from './DashboardContent';

export const metadata = {
  title: 'Dashboard | MNNR',
  description: 'View your subscription, usage, and analytics',
};

export default async function DashboardPage() {
  const { userId: clerkId } = auth();
  if (!clerkId) redirect('/sign-in');

  const user = await getOrCreateUser();
  if (!user) redirect('/sign-in');

  const cu = await currentUser();
  const displayName =
    [cu?.firstName, cu?.lastName].filter(Boolean).join(' ') ||
    cu?.username ||
    user.email;

  // Resolve active Stripe subscription via the user's email (no local
  // customers table in the Neon schema yet).
  let activeSubscription: Stripe.Subscription | null = null;
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      const customer = customers.data[0];
      if (customer) {
        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'all',
          limit: 10,
          expand: ['data.items.data.price.product'],
        });
        activeSubscription =
          subs.data.find((s) => s.status === 'active' || s.status === 'trialing') ??
          null;
      }
    } catch (err) {
      console.error('Dashboard Stripe lookup failed', err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, {displayName}
          </p>
        </div>

        <DashboardContent
          user={{
            id: user.id,
            clerkId: user.clerkId,
            email: user.email,
            firstName: cu?.firstName ?? null,
            lastName: cu?.lastName ?? null,
            imageUrl: cu?.imageUrl ?? null,
          }}
          profile={{
            id: user.id,
            email: user.email,
            full_name: displayName,
          }}
          subscription={activeSubscription}
        />
      </div>
    </div>
  );
}
