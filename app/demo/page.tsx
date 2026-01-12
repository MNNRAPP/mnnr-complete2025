/**
 * Demo Dashboard - Working Product Demo
 * No auth required - shows real data from Neon
 */

import { db } from '@/lib/db';
import DemoDashboard from './DemoDashboard';
import UsageCharts from '@/components/analytics/UsageCharts';

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
      <div className="max-w-7xl mx-auto px-6 py-12">
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

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex gap-4 border-b border-white/10">
            <TabLink href="#keys" active>API Keys</TabLink>
            <TabLink href="#analytics">Analytics</TabLink>
            <TabLink href="#quickstart">Quick Start</TabLink>
          </nav>
        </div>

        {/* API Keys Section */}
        <section id="keys" className="mb-16">
          <DemoDashboard initialData={data} />
        </section>

        {/* Analytics Section */}
        <section id="analytics" className="mb-16">
          <UsageCharts />
        </section>

        {/* Live Usage Simulator */}
        <section className="mb-16">
          <LiveUsageSimulator />
        </section>
      </div>
    </div>
  );
}

function TabLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <a 
      href={href}
      className={`px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
        active 
          ? 'text-emerald-400 border-emerald-400' 
          : 'text-white/60 border-transparent hover:text-white hover:border-white/20'
      }`}
    >
      {children}
    </a>
  );
}

function LiveUsageSimulator() {
  return (
    <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-8">
      <h2 className="text-2xl font-bold text-white mb-4">Try It Live</h2>
      <p className="text-white/60 mb-6">
        Test the MNNR API by tracking some usage. Copy the curl command below and run it in your terminal.
      </p>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-2">1. Create an API Key</h3>
          <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto text-sm">
            <code className="text-emerald-300">
              curl -X POST https://mnnr.app/api/v1/keys \{'\n'}
              {'  '}-H &quot;Content-Type: application/json&quot; \{'\n'}
              {'  '}-d &apos;{`{"name": "My Test Key"}`}&apos;
            </code>
          </pre>
        </div>

        <div>
          <h3 className="text-white font-medium mb-2">2. Track Usage</h3>
          <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto text-sm">
            <code className="text-cyan-300">
              curl -X POST https://mnnr.app/api/v1/track \{'\n'}
              {'  '}-H &quot;Authorization: Bearer YOUR_API_KEY&quot; \{'\n'}
              {'  '}-H &quot;Content-Type: application/json&quot; \{'\n'}
              {'  '}-d &apos;{`{"model": "gpt-4", "tokens": 1500}`}&apos;
            </code>
          </pre>
        </div>

        <div>
          <h3 className="text-white font-medium mb-2">3. View Analytics</h3>
          <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto text-sm">
            <code className="text-purple-300">
              curl https://mnnr.app/api/v1/analytics?period=7d
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
