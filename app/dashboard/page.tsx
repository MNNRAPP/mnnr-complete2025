import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';
import DashboardContent from './DashboardContent';

export const metadata = {
  title: 'Dashboard | MNNR',
  description: 'View your subscription, usage, and analytics',
};

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/sign-in');
  }

  const profile = await db.getUserById(user.id);
  const subscription = await db.getActiveSubscription(user.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, {profile?.full_name || user.email}
          </p>
        </div>

        <DashboardContent
          user={user}
          profile={profile}
          subscription={subscription}
        />
      </div>
    </div>
  );
}
