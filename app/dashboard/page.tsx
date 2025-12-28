/**
 * Dashboard Page
 * 
 * Created: 2025-12-26 23:07:00 EST
 * Action #15 in 19-hour optimization
 * 
 * Purpose: Main dashboard with user analytics, subscription status, and quick actions
 * 
 * Features:
 * - Subscription status card
 * - Usage metrics
 * - Recent invoices
 * - Quick actions
 * - Analytics charts
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import DashboardContent from './DashboardContent';

export const metadata = {
  title: 'Dashboard | MNNR',
  description: 'View your subscription, usage, and analytics',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch subscription data
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select(`
      *,
      prices (
        *,
        products (*)
      )
    `)
    .eq('user_id', user.id)
    .order('created', { ascending: false });

  const activeSubscription = subscriptions?.find(
    (sub) => sub.status === 'active' || sub.status === 'trialing'
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, {profile?.full_name || user.email}
          </p>
        </div>

        {/* Dashboard Content */}
        <DashboardContent
          user={user}
          profile={profile}
          subscription={activeSubscription}
        />
      </div>
    </div>
  );
}
