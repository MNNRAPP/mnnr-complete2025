/**
 * Settings Page
 * 
 * Created: 2025-12-26 23:12:00 EST
 * Action #18 in 19-hour optimization
 * 
 * Purpose: User settings and profile management
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import SettingsContent from './SettingsContent';

export const metadata = {
  title: 'Settings | MNNR',
  description: 'Manage your account settings and preferences',
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <SettingsContent user={user} profile={profile} />
      </div>
    </div>
  );
}
