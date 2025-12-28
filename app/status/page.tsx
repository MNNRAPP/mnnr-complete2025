import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'System Status | MNNR',
  description: 'Current operational status of MNNR platform services'
};

const services = [
  { name: 'API Gateway', status: 'operational', description: 'Core API endpoints' },
  { name: 'Authentication', status: 'operational', description: 'User authentication services' },
  { name: 'Usage Tracking', status: 'operational', description: 'Real-time usage metering' },
  { name: 'Billing Engine', status: 'operational', description: 'Payment processing via Stripe' },
  { name: 'Dashboard', status: 'operational', description: 'Web application interface' },
  { name: 'Documentation', status: 'operational', description: 'API docs and guides' },
];

function StatusBadge({ status }: { status: string }) {
  const colors = {
    operational: 'bg-emerald-500',
    degraded: 'bg-yellow-500',
    outage: 'bg-red-500',
    maintenance: 'bg-blue-500',
  };

  const labels = {
    operational: 'Operational',
    degraded: 'Degraded Performance',
    outage: 'Service Outage',
    maintenance: 'Under Maintenance',
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${colors[status as keyof typeof colors] || colors.operational}`} />
      <span className="text-white/70 text-sm">{labels[status as keyof typeof labels] || 'Unknown'}</span>
    </div>
  );
}

export default function StatusPage() {
  const allOperational = services.every(s => s.status === 'operational');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px]" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Link href="/" className="text-white/50 hover:text-white text-sm mb-8 inline-block">
            ← Back to MNNR
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            System{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Status
            </span>
          </h1>
          
          {/* Overall Status */}
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${
            allOperational 
              ? 'bg-emerald-500/10 border border-emerald-500/20' 
              : 'bg-yellow-500/10 border border-yellow-500/20'
          }`}>
            <span className={`w-3 h-3 rounded-full ${allOperational ? 'bg-emerald-500' : 'bg-yellow-500'} animate-pulse`} />
            <span className={allOperational ? 'text-emerald-400' : 'text-yellow-400'}>
              {allOperational ? 'All Systems Operational' : 'Some Systems Degraded'}
            </span>
          </div>
          
          <p className="text-white/50 mt-6">
            Last updated: {new Date().toLocaleString('en-US', { 
              dateStyle: 'medium', 
              timeStyle: 'short' 
            })}
          </p>
        </div>
      </div>

      {/* Services */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Services</h2>
          </div>
          
          <div className="divide-y divide-white/5">
            {services.map((service) => (
              <div key={service.name} className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">{service.name}</h3>
                  <p className="text-white/40 text-sm">{service.description}</p>
                </div>
                <StatusBadge status={service.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Incident History */}
        <div className="mt-8 bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Recent Incidents</h2>
          </div>
          
          <div className="p-6 text-center text-white/40">
            <p>No incidents reported in the last 90 days.</p>
          </div>
        </div>

        {/* Subscribe */}
        <div className="mt-8 bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Get Status Updates</h3>
          <p className="text-white/50 mb-4">
            Subscribe to receive notifications about service disruptions.
          </p>
          <a 
            href="mailto:status@mnnr.app?subject=Subscribe to Status Updates"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all"
          >
            Subscribe to Updates
          </a>
        </div>

        {/* Contact */}
        <div className="mt-8 text-center text-white/40">
          <p>
            Having issues? Contact us at{' '}
            <a href="mailto:support@mnnr.app" className="text-emerald-400 hover:text-emerald-300">
              support@mnnr.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
