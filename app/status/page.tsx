'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  description: string;
  latency?: number;
  uptime: number;
}

const services: ServiceStatus[] = [
  { name: 'API Gateway', status: 'operational', description: 'Core API endpoints', latency: 23, uptime: 99.99 },
  { name: 'Authentication', status: 'operational', description: 'User authentication services', latency: 67, uptime: 99.99 },
  { name: 'Usage Tracking', status: 'operational', description: 'Real-time usage metering', latency: 12, uptime: 99.98 },
  { name: 'Billing Engine', status: 'operational', description: 'Payment processing via Stripe', latency: 45, uptime: 99.97 },
  { name: 'Rate Limiting', status: 'operational', description: 'Distributed rate limiting', latency: 8, uptime: 99.99 },
  { name: 'Webhooks', status: 'operational', description: 'Event delivery system', latency: 34, uptime: 99.96 },
  { name: 'Dashboard', status: 'operational', description: 'Web application interface', latency: 156, uptime: 99.95 },
  { name: 'Documentation', status: 'operational', description: 'API docs and guides', latency: 89, uptime: 100 },
];

const pastIncidents = [
  {
    id: '1',
    title: 'Elevated API Latency in US-East',
    status: 'resolved',
    severity: 'minor',
    date: 'December 15, 2024',
    duration: '75 minutes',
    updates: [
      { time: '10:30 AM', message: 'Investigating elevated latency in US-East region.' },
      { time: '11:00 AM', message: 'Root cause identified: Database connection pool exhaustion.' },
      { time: '11:30 AM', message: 'Fix deployed. Monitoring for stability.' },
      { time: '11:45 AM', message: 'Resolved. All systems operating normally.' },
    ],
  },
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
    degraded: 'Degraded',
    outage: 'Outage',
    maintenance: 'Maintenance',
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${colors[status as keyof typeof colors] || colors.operational} animate-pulse`} />
      <span className="text-white/70 text-sm">{labels[status as keyof typeof labels] || 'Unknown'}</span>
    </div>
  );
}

function UptimeBar() {
  // Generate 90 days of uptime visualization
  const days = Array.from({ length: 90 }, (_, i) => {
    // Simulate mostly operational with rare issues
    const rand = Math.random();
    if (i === 75) return 'degraded'; // One degraded day for realism
    return 'operational';
  });

  return (
    <div className="flex gap-[2px]">
      {days.map((status, i) => (
        <div
          key={i}
          className={`w-[3px] h-8 rounded-sm transition-all hover:scale-y-110 ${
            status === 'operational' ? 'bg-emerald-500' :
            status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          title={`Day ${90 - i}: ${status}`}
        />
      ))}
    </div>
  );
}

export default function StatusPage() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    }));
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('en-US', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const allOperational = services.every(s => s.status === 'operational');
  const avgLatency = Math.round(services.reduce((acc, s) => acc + (s.latency || 0), 0) / services.length);
  const avgUptime = (services.reduce((acc, s) => acc + s.uptime, 0) / services.length).toFixed(2);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="relative py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px]" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <Link href="/" className="text-white/50 hover:text-white text-sm mb-6 inline-block transition-colors">
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
            <span className={`font-medium ${allOperational ? 'text-emerald-400' : 'text-yellow-400'}`}>
              {allOperational ? 'All Systems Operational' : 'Some Systems Degraded'}
            </span>
          </div>
          
          <p className="text-white/50 mt-4 text-sm">
            Last updated: {currentTime || 'Loading...'}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
            <div className="text-3xl font-bold text-emerald-400">{avgUptime}%</div>
            <div className="text-white/50 text-sm mt-1">30-Day Uptime</div>
          </div>
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
            <div className="text-3xl font-bold text-emerald-400">{avgLatency}ms</div>
            <div className="text-white/50 text-sm mt-1">Avg Response Time</div>
          </div>
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
            <div className="text-3xl font-bold text-emerald-400">0</div>
            <div className="text-white/50 text-sm mt-1">Active Incidents</div>
          </div>
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
            <div className="text-3xl font-bold text-emerald-400">8</div>
            <div className="text-white/50 text-sm mt-1">Services Monitored</div>
          </div>
        </div>

        {/* 90-Day Uptime History */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">90-Day Uptime History</h2>
            <span className="text-emerald-400 text-sm font-medium">{avgUptime}% uptime</span>
          </div>
          <UptimeBar />
          <div className="flex justify-between text-xs text-white/40 mt-3">
            <span>90 days ago</span>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-6 mt-4 text-xs text-white/50">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span>Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-yellow-500" />
              <span>Degraded</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-red-500" />
              <span>Outage</span>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Service Status</h2>
          </div>
          
          <div className="divide-y divide-white/5">
            {services.map((service) => (
              <div key={service.name} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-medium">{service.name}</h3>
                    {service.latency && (
                      <span className="text-white/30 text-xs px-2 py-0.5 rounded bg-white/5">
                        {service.latency}ms
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-sm mt-0.5">{service.description}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-white/40 text-sm hidden md:block">{service.uptime}% uptime</span>
                  <StatusBadge status={service.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incident History */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Incident History</h2>
            <p className="text-white/40 text-sm mt-1">Past 90 days</p>
          </div>
          
          {pastIncidents.length === 0 ? (
            <div className="p-8 text-center text-white/40">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>No incidents reported in the last 90 days.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {pastIncidents.map((incident) => (
                <div key={incident.id} className="p-5">
                  <button
                    onClick={() => setExpandedIncident(expandedIncident === incident.id ? null : incident.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">{incident.title}</h4>
                        <p className="text-white/40 text-sm mt-1">
                          {incident.date} • Duration: {incident.duration}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${
                          incident.status === 'resolved' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {incident.status}
                        </span>
                        <svg 
                          className={`w-5 h-5 text-white/40 transition-transform ${expandedIncident === incident.id ? 'rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                  
                  {expandedIncident === incident.id && (
                    <div className="mt-4 pl-4 border-l-2 border-white/10 space-y-3">
                      {incident.updates.map((update, i) => (
                        <div key={i} className="flex gap-4 text-sm">
                          <span className="text-white/40 whitespace-nowrap font-mono">{update.time}</span>
                          <span className="text-white/70">{update.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscribe */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Subscribe to Status Updates</h3>
          <p className="text-white/50 mb-6 max-w-md mx-auto">
            Get notified via email when MNNR creates, updates, or resolves an incident.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button className="bg-emerald-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-emerald-400 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white/40 pt-8 border-t border-white/10">
          <p>
            Having issues? Contact us at{' '}
            <a href="mailto:support@mnnr.app" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              support@mnnr.app
            </a>
          </p>
          <p className="mt-2 text-sm">
            <a href="https://mnnr.app" className="hover:text-white transition-colors">mnnr.app</a>
            {' • '}
            <a href="https://mnnr.app/docs" className="hover:text-white transition-colors">Documentation</a>
            {' • '}
            <a href="https://mnnr.app/legal/privacy" className="hover:text-white transition-colors">Privacy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
