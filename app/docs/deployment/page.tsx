import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Deployment Guide - MNNR',
  description: 'Step-by-step production deployment guide with Vercel, Supabase, and monitoring setup.',
};

const deploymentSteps = [
  {
    number: 1,
    title: 'Environment Setup',
    icon: '⚙️',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30',
    items: [
      'Database URL (Supabase PostgreSQL)',
      'Stripe API keys (publishable + secret)',
      'Redis connection string for rate limiting',
      'Sentry DSN for error monitoring',
      'MNNR API keys for agent services',
    ],
    code: `# .env.production
DATABASE_URL="postgresql://..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
REDIS_URL="redis://..."
SENTRY_DSN="https://..."
MNNR_API_KEY="mnnr_live_..."`,
  },
  {
    number: 2,
    title: 'Database Migration',
    icon: '🗄️',
    gradient: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
    items: [
      'Create Supabase project',
      'Run schema migrations',
      'Configure Row Level Security (RLS)',
      'Set up agent_identities table',
      'Create transaction indexes',
    ],
    code: `# Run migrations
npx prisma migrate deploy

# Seed agent economy tables
npx prisma db seed

# Verify RLS policies
supabase db diff --linked`,
  },
  {
    number: 3,
    title: 'Vercel Deployment',
    icon: '🚀',
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    items: [
      'Connect GitHub repository',
      'Configure build settings (Next.js)',
      'Set environment variables',
      'Configure custom domain (mnnr.app)',
      'Enable Edge Functions for APIs',
    ],
    code: `# vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1", "sfo1", "fra1"],
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}`,
  },
  {
    number: 4,
    title: 'Monitoring Setup',
    icon: '📊',
    gradient: 'from-orange-500/20 to-amber-500/20',
    borderColor: 'border-orange-500/30',
    items: [
      'Sentry error monitoring',
      'Performance monitoring (Web Vitals)',
      'Database health checks',
      'Agent transaction monitoring',
      'Alert configuration (PagerDuty/Slack)',
    ],
    code: `// sentry.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
});`,
  },
  {
    number: 5,
    title: 'Security Hardening',
    icon: '🔐',
    gradient: 'from-red-500/20 to-rose-500/20',
    borderColor: 'border-red-500/30',
    items: [
      'Enable Redis rate limiting',
      'Configure CORS policies',
      'Set up SSL certificates (auto via Vercel)',
      'Review API access controls',
      'Enable audit logging',
    ],
    code: `// Rate limiting config
const rateLimiter = new RateLimiter({
  redis: redisClient,
  max: 100,
  windowMs: 60 * 1000,
  keyPrefix: 'rl:',
});`,
  },
];

const checklist = [
  { label: 'Environment variables configured', category: 'setup' },
  { label: 'Database schema deployed', category: 'setup' },
  { label: 'Stripe webhooks configured', category: 'setup' },
  { label: 'Domain SSL certificate active', category: 'setup' },
  { label: 'Monitoring tools configured', category: 'ops' },
  { label: 'Backup strategy in place', category: 'ops' },
  { label: 'Load testing completed', category: 'ops' },
  { label: 'Rollback plan documented', category: 'ops' },
];

export default function DeploymentPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_50%)]" />
        
        <div className="max-w-4xl mx-auto px-6 py-20 relative">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/docs" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
              ← Back to Documentation
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-blue-400 text-sm font-medium">🚀 Deployment</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Production{' '}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Deployment
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Deploy your agent infrastructure to production with Vercel, Supabase, 
              and enterprise-grade monitoring.
            </p>
          </div>

          {/* Architecture Overview */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-12">
            <h3 className="text-lg font-semibold text-white mb-4">Infrastructure Stack</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-black/40 rounded-lg">
                <span className="text-2xl mb-2 block">▲</span>
                <div className="text-white font-medium">Vercel</div>
                <div className="text-gray-400 text-sm">Edge Runtime</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-lg">
                <span className="text-2xl mb-2 block">⚡</span>
                <div className="text-white font-medium">Supabase</div>
                <div className="text-gray-400 text-sm">PostgreSQL</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-lg">
                <span className="text-2xl mb-2 block">🔴</span>
                <div className="text-white font-medium">Redis</div>
                <div className="text-gray-400 text-sm">Rate Limiting</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-lg">
                <span className="text-2xl mb-2 block">💳</span>
                <div className="text-white font-medium">Stripe</div>
                <div className="text-gray-400 text-sm">Payments</div>
              </div>
            </div>
          </div>

          {/* Deployment Steps */}
          <div className="space-y-6 mb-16">
            {deploymentSteps.map((step) => (
              <div
                key={step.number}
                className={`relative bg-gradient-to-br ${step.gradient} border ${step.borderColor} rounded-2xl p-6 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-black/60 rounded-2xl" />
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-xl">{step.icon}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Step {step.number}</span>
                      <h2 className="text-xl font-semibold text-white">{step.title}</h2>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-4">
                    {step.items.map((item, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="bg-black/40 border border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-800/50 px-3 py-2 border-b border-gray-700">
                      <span className="text-gray-400 text-sm">Configuration</span>
                    </div>
                    <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                      <code>{step.code}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pre-Deployment Checklist */}
          <div className="relative bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-8 overflow-hidden mb-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]" />
            <div className="relative">
              <h3 className="text-2xl font-bold text-white mb-6">Pre-Deployment Checklist</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-blue-400 font-medium mb-3">Setup</h4>
                  <div className="space-y-3">
                    {checklist.filter(c => c.category === 'setup').map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-5 h-5 border border-gray-600 rounded mr-3 flex items-center justify-center">
                          <span className="text-emerald-400 text-xs">✓</span>
                        </div>
                        <span className="text-gray-300">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-blue-400 font-medium mb-3">Operations</h4>
                  <div className="space-y-3">
                    {checklist.filter(c => c.category === 'ops').map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-5 h-5 border border-gray-600 rounded mr-3 flex items-center justify-center">
                          <span className="text-emerald-400 text-xs">✓</span>
                        </div>
                        <span className="text-gray-300">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Post-Deployment */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Post-Deployment Verification</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/40 border border-gray-700 rounded-lg p-4">
                <span className="text-2xl mb-2 block">🏥</span>
                <h4 className="text-white font-medium mb-1">Health Check</h4>
                <code className="text-emerald-400 text-sm">GET /api/health</code>
              </div>
              <div className="bg-black/40 border border-gray-700 rounded-lg p-4">
                <span className="text-2xl mb-2 block">⚡</span>
                <h4 className="text-white font-medium mb-1">Performance</h4>
                <p className="text-gray-400 text-sm">Run Lighthouse audit</p>
              </div>
              <div className="bg-black/40 border border-gray-700 rounded-lg p-4">
                <span className="text-2xl mb-2 block">🔐</span>
                <h4 className="text-white font-medium mb-1">Security</h4>
                <p className="text-gray-400 text-sm">Verify SSL & headers</p>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Need Deployment Help?</h3>
            <p className="text-gray-400 mb-4">
              Our DevOps team can assist with custom deployment configurations.
            </p>
            <a
              href="mailto:devops@mnnr.app"
              className="inline-flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 px-6 py-3 rounded-lg transition-colors"
            >
              <span>📧</span> Contact DevOps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
