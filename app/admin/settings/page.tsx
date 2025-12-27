/**
 * Admin Settings Page
 * 
 * Created: 2025-12-27 00:22:00 EST
 * Part of 2-hour completion plan - Phase 3
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import SettingsContent from './SettingsContent';

export const metadata = {
  title: 'Settings | Admin | MNNR',
  description: 'Platform configuration and settings',
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin?redirect=/admin/settings');
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch current settings (mock data - replace with real settings)
  const settings = {
    general: {
      siteName: 'MNNR',
      siteUrl: 'https://mnnr.app',
      supportEmail: 'support@mnnr.app',
      maintenanceMode: false,
    },
    features: {
      signupEnabled: true,
      trialEnabled: true,
      trialDays: 14,
      apiAccessEnabled: true,
      webhooksEnabled: true,
    },
    limits: {
      maxUsersPerAccount: 10,
      maxApiRequestsPerMinute: 100,
      maxStoragePerUser: 1024, // MB
      maxFileSize: 10, // MB
    },
    email: {
      provider: 'sendgrid',
      fromEmail: 'noreply@mnnr.app',
      fromName: 'MNNR',
      replyTo: 'support@mnnr.app',
    },
    integrations: {
      stripeEnabled: true,
      sentryEnabled: true,
      analyticsEnabled: true,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Platform Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Configure platform-wide settings and features
          </p>
        </div>

        <SettingsContent settings={settings} />
      </div>
    </div>
  );
}
