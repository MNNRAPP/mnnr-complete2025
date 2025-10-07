import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AnalyticsDashboard from '@/components/ui/AnalyticsDashboard/AnalyticsDashboard';
import { getAnalyticsOverview } from '@/utils/analytics/overview';

export default async function AccountAnalyticsPage() {
  const supabase = createClient();
  const [
    {
      data: { user }
    },
    overview
  ] = await Promise.all([supabase.auth.getUser(), getAnalyticsOverview()]);

  if (!user) {
    redirect('/signin');
  }

  return (
    <section className="bg-black py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Analytics control center</h1>
            <p className="mt-4 max-w-2xl text-lg text-zinc-300">
              Monitor subscription health, revenue performance, and SDK signals from one enterprise-grade view.
            </p>
          </div>
        </div>
        <div className="mt-10">
          <AnalyticsDashboard initialData={overview} />
        </div>
      </div>
    </section>
  );
}
