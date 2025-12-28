import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Use Cases - MNNR',
  description: 'Discover how MNNR powers autonomous systems across AI, crypto, IoT, and robotics.',
};

const useCases = [
  {
    id: 'ai-agents',
    title: 'AI Agents & LLMs',
    subtitle: 'Monetize autonomous AI systems',
    description: 'Track token usage, enforce rate limits, and bill customers for AI agent interactions. Perfect for GPT wrappers, autonomous assistants, and AI-powered SaaS.',
    icon: '🤖',
    gradient: 'from-purple-500 to-pink-500',
    features: [
      'Per-token billing for LLM calls',
      'Usage caps and rate limiting',
      'Multi-model cost tracking',
      'Real-time usage dashboards',
    ],
    example: `// Track AI agent usage
const response = await mnnr.track('gpt-4-completion', {
  tokens: completion.usage.total_tokens,
  model: 'gpt-4-turbo',
  userId: agent.ownerId
});`,
    stats: { metric: '10B+', label: 'Tokens tracked monthly' },
  },
  {
    id: 'crypto-protocols',
    title: 'Crypto & DeFi',
    subtitle: 'Web3-native payment rails',
    description: 'Native support for crypto payments, smart contract integration, and decentralized identity. Build protocols that accept both fiat and crypto seamlessly.',
    icon: '⛓️',
    gradient: 'from-orange-500 to-amber-500',
    features: [
      'Multi-chain payment support',
      'Smart contract webhooks',
      'Wallet-based authentication',
      'On-chain usage verification',
    ],
    example: `// Verify on-chain payment
const payment = await mnnr.crypto.verify({
  chain: 'ethereum',
  txHash: '0x...',
  expectedAmount: '0.1 ETH'
});`,
    stats: { metric: '$50M+', label: 'Crypto volume processed' },
  },
  {
    id: 'iot-networks',
    title: 'IoT Networks',
    subtitle: 'Metered billing for connected devices',
    description: 'Track data usage, API calls, and compute cycles across millions of IoT devices. Sub-millisecond latency at the edge for real-time metering.',
    icon: '📡',
    gradient: 'from-cyan-500 to-blue-500',
    features: [
      'Device-level usage tracking',
      'Edge-optimized metering',
      'Bulk device provisioning',
      'Bandwidth & data billing',
    ],
    example: `// Track IoT device usage
await mnnr.iot.report({
  deviceId: 'sensor_001',
  dataPoints: 1500,
  bandwidth: '2.5MB',
  region: 'us-east-1'
});`,
    stats: { metric: '1M+', label: 'Devices connected' },
  },
  {
    id: 'robotics',
    title: 'Robotics & Automation',
    subtitle: 'Pay-per-task robot billing',
    description: 'Bill for robot tasks, compute cycles, and operational time. Perfect for RaaS (Robotics-as-a-Service) and autonomous fleet management.',
    icon: '🦾',
    gradient: 'from-emerald-500 to-teal-500',
    features: [
      'Task-based billing',
      'Compute cycle metering',
      'Fleet usage analytics',
      'Maintenance scheduling',
    ],
    example: `// Bill for robot task
await mnnr.robotics.completeTask({
  robotId: 'arm_001',
  taskType: 'pick_and_place',
  duration: 45, // seconds
  customerId: 'factory_xyz'
});`,
    stats: { metric: '500K+', label: 'Tasks billed daily' },
  },
  {
    id: 'edge-computing',
    title: 'Edge Computing',
    subtitle: 'Serverless at the edge',
    description: 'Meter compute usage at edge locations worldwide. Perfect for CDN providers, edge AI inference, and distributed computing platforms.',
    icon: '⚡',
    gradient: 'from-yellow-500 to-orange-500',
    features: [
      'Global edge metering',
      'Compute unit tracking',
      'Latency-based pricing',
      'Multi-region analytics',
    ],
    example: `// Track edge compute
await mnnr.edge.meter({
  location: 'edge-tokyo-1',
  computeUnits: 150,
  latencyMs: 12,
  functionId: 'image-resize'
});`,
    stats: { metric: '50+', label: 'Edge locations' },
  },
  {
    id: 'autonomous-vehicles',
    title: 'Autonomous Vehicles',
    subtitle: 'Mobility-as-a-Service billing',
    description: 'Track miles, compute, and service usage for autonomous vehicle fleets. Built for robotaxis, delivery bots, and autonomous logistics.',
    icon: '🚗',
    gradient: 'from-red-500 to-rose-500',
    features: [
      'Per-mile billing',
      'Compute usage tracking',
      'Fleet management APIs',
      'Real-time trip metering',
    ],
    example: `// Complete autonomous trip
await mnnr.mobility.completeTrip({
  vehicleId: 'av_001',
  miles: 12.5,
  computeHours: 0.5,
  passengerId: 'user_abc'
});`,
    stats: { metric: '10M+', label: 'Miles tracked' },
  },
];

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.1),transparent_50%)]" />
        
        <div className="max-w-6xl mx-auto px-6 py-20 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-emerald-400 text-sm font-medium">🌐 Use Cases</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powering the{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                machine economy
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From AI agents to autonomous vehicles, MNNR provides the billing infrastructure 
              for any system that needs to track usage and collect payments.
            </p>
          </div>

          {/* Use Case Grid */}
          <div className="space-y-16">
            {useCases.map((useCase, index) => (
              <div
                key={useCase.id}
                id={useCase.id}
                className={`grid md:grid-cols-2 gap-8 items-center ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{useCase.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{useCase.title}</h2>
                      <p className="text-gray-400">{useCase.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6">{useCase.description}</p>
                  
                  <ul className="space-y-3 mb-6">
                    {useCase.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-gray-300">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className={`inline-flex items-center gap-4 bg-gradient-to-r ${useCase.gradient} bg-clip-text`}>
                    <span className="text-3xl font-bold text-transparent">{useCase.stats.metric}</span>
                    <span className="text-gray-400">{useCase.stats.label}</span>
                  </div>
                </div>

                {/* Code Example */}
                <div className={`relative ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${useCase.gradient} opacity-20 blur-3xl`} />
                  <div className="relative bg-gray-900/80 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="ml-2 text-gray-500 text-sm">example.ts</span>
                    </div>
                    <pre className="p-4 text-sm overflow-x-auto">
                      <code className="text-gray-300">{useCase.example}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 blur-xl opacity-30" />
              <div className="relative bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to build?
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Start tracking usage and collecting payments in under 5 minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold px-6 py-3 rounded-lg hover:scale-105 transition-transform"
                  >
                    Start Building Free
                  </Link>
                  <Link
                    href="/docs/quick-start"
                    className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Read the Docs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
