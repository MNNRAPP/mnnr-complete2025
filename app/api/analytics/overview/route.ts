import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAnalyticsOverview } from '@/utils/analytics/overview';

export async function GET() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const overview = await getAnalyticsOverview();

  if (!overview.status.ok) {
    return NextResponse.json(overview, { status: 503 });
  }

  return NextResponse.json(overview);
}
