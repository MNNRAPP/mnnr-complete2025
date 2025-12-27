/**
 * Billing Page
 * 
 * Created: 2025-12-26 23:14:00 EST
 * Action #20 in 19-hour optimization
 * 
 * Purpose: Billing and subscription management
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import BillingContent from './BillingContent';

export const metadata = {
  title: 'Billing | MNNR',
  description: 'Manage your billing and subscription',
};

export default async function BillingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select(`
      *,
      prices (
        *,
        products (*)
      )
    `)
    .eq('user_id', user.id);

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Billing
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your subscription, payment methods, and invoices
          </p>
        </div>

        <BillingContent
          user={user}
          subscriptions={subscriptions}
          customer={customer}
        />
      </div>
    </div>
  );
}
