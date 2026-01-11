/**
 * Demo Dashboard - Working Product Demo
 * No auth required - shows real data from Neon
 */

import { db } from '@/lib/db';
import DemoDashboard from './DemoDashboard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Demo Dashboard | MNNR',
  description: 'See MNNR in action - real API key management and usage tracking',
};

async function getDemoData() {
  // Get demo user
  const user = await db.getUserByEmail('test@mnnr.app');
  
  if (!user) {
    return { 
      user: null, 
      keys: [], 
      usage: { total_requests: 0, total_tokens: 0, models_used: 0, keys_used: 0 } 
    };
  }

  // Get API keys
  const keys = await db.getApiKeysByUserId(user.id);
  
  // Get usage summary
  const usage = await db.getUsageSummary(user.id, 30);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    keys: keys.map(k => ({
      id: k.id,
      name: k.name,
      prefix: k.key_prefix,
      created_at: k.created_at,
      last_used_at: k.last_used_at,
    })),
    usage: {
      total_requests: Number(usage?.total_requests || 0),
      total_tokens: Number(usage?.total_tokens || 0),
      models_used: Number(usage?.models_used || 0),
      keys_used: Number(usage?.keys_used || 0),
    }
  };
}

export default async function DemoPage() {
  const data = await getDemoData();
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 text-sm font-medium">Live Demo</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">MNNR Dashboard</h1>
          <p className="text-white/60">
            This is a live demo showing real data from our database. 
            Create API keys and track usage in real-time.
          </p>
        </div>

        {/* Dashboard */}
        <DemoDashboard initialData={data} />
      </div>
    </div>
  );
}
