import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Quick Start - MNNR',
  description: 'Get up and running quickly with our step-by-step quick start guide for the Agent Economy.',
};

interface StepItem {
  text: string;
  link?: { href: string; label: string };
}

interface StepContent {
  description: string;
  steps?: StepItem[];
  warning?: string;
  code?: { python: string; javascript: string };
}

interface Step {
  number: number;
  title: string;
  color: string;
  gradient: string;
  borderColor: string;
  content: StepContent;
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Create Account',
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-cyan-500/20',
    borderColor: 'border-emerald-500/30',
    content: {
      description: 'Sign up for a MNNR account to get started:',
      steps: [
        { text: 'Visit', link: { href: '/', label: 'mnnr.app' } },
        { text: 'Click "Get Started" and create your account' },
        { text: 'Verify your email address' },
        { text: 'Choose your plan (Free tier available)' },
      ],
    },
  },
  {
    number: 2,
    title: 'Get API Keys',
    color: 'blue',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30',
    content: {
      description: 'Generate your API credentials:',
      steps: [
        { text: 'Go to your Dashboard' },
        { text: 'Navigate to "API Keys" section' },
        { text: 'Click "Generate New Key"' },
        { text: 'Copy your API key (keep it secure!)' },
      ],
      warning: 'Never share your API keys publicly. Store them securely in environment variables.',
    },
  },
  {
    number: 3,
    title: 'Install SDK',
    color: 'purple',
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    content: {
      description: 'Choose your preferred SDK:',
      code: {
        python: `pip install mnnr-sdk

import mnnr
client = mnnr.Client(api_key="your-api-key")`,
        javascript: `npm install @mnnr/sdk

import { MNNR } from '@mnnr/sdk';
const client = new MNNR({ apiKey: 'your-api-key' });`,
      },
    },
  },
  {
    number: 4,
    title: 'Create Your First Agent',
    color: 'orange',
    gradient: 'from-orange-500/20 to-amber-500/20',
    borderColor: 'border-orange-500/30',
    content: {
      description: 'Register an agent with economic identity:',
      code: {
        python: `# Create an agent identity
agent = client.agents.create(
    name="my-first-agent",
    spending_limit=100,  # $100 USD
    currency="USD",
    capabilities=["data-processing", "api-calls"]
)

print(f"Agent ID: {agent.id}")
print(f"Wallet: {agent.wallet_address}")`,
        javascript: `// Create an agent identity
const agent = await client.agents.create({
  name: 'my-first-agent',
  spendingLimit: 100,  // $100 USD
  currency: 'USD',
  capabilities: ['data-processing', 'api-calls']
});

console.log(\`Agent ID: \${agent.id}\`);
console.log(\`Wallet: \${agent.walletAddress}\`);`,
      },
    },
  },
  {
    number: 5,
    title: 'Make Agent-to-Agent Payment',
    color: 'cyan',
    gradient: 'from-cyan-500/20 to-teal-500/20',
    borderColor: 'border-cyan-500/30',
    content: {
      description: 'Enable your agent to pay for services:',
      code: {
        python: `# Pay another agent for a service
payment = client.payments.create(
    from_agent=agent.id,
    to_agent="service-provider-agent-id",
    amount=0.50,  # $0.50 USD
    currency="USD",
    description="Data processing task"
)

print(f"Payment ID: {payment.id}")
print(f"Status: {payment.status}")`,
        javascript: `// Pay another agent for a service
const payment = await client.payments.create({
  fromAgent: agent.id,
  toAgent: 'service-provider-agent-id',
  amount: 0.50,  // $0.50 USD
  currency: 'USD',
  description: 'Data processing task'
});

console.log(\`Payment ID: \${payment.id}\`);
console.log(\`Status: \${payment.status}\`);`,
      },
    },
  },
];

export default function QuickStartPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.1),transparent_50%)]" />
        
        <div className="max-w-4xl mx-auto px-6 py-20 relative">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/docs" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
              ← Back to Documentation
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-emerald-400 text-sm font-medium">⚡ Quick Start</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Deploy Your First{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Agent
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Get up and running with MNNR in under 5 minutes. Create an agent, 
              fund its wallet, and start making autonomous payments.
            </p>
          </div>

          {/* Time Estimate */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-4 bg-gray-900/50 border border-gray-800 rounded-full px-6 py-3">
              <span className="text-gray-400">Estimated time:</span>
              <span className="text-emerald-400 font-bold">~5 minutes</span>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-6 mb-16">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`relative bg-gradient-to-br ${step.gradient} border ${step.borderColor} rounded-2xl p-6 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-black/60 rounded-2xl" />
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className={`w-10 h-10 bg-${step.color}-500/20 border border-${step.color}-500/30 rounded-lg flex items-center justify-center mr-4`}>
                      <span className={`text-xl font-bold text-${step.color}-400`}>{step.number}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-white">{step.title}</h2>
                  </div>
                  
                  <p className="text-gray-400 mb-4">{step.content.description}</p>
                  
                  {step.content.steps && (
                    <ol className="space-y-2 mb-4">
                      {step.content.steps.map((item, index) => (
                        <li key={index} className="flex items-center text-gray-300">
                          <span className="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center text-xs text-gray-400 mr-3">
                            {index + 1}
                          </span>
                          {item.link ? (
                            <>
                              {item.text}{' '}
                              <Link href={item.link.href} className="text-emerald-400 hover:text-emerald-300 ml-1">
                                {item.link.label}
                              </Link>
                            </>
                          ) : (
                            item.text
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                  
                  {step.content.warning && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                      <p className="text-yellow-400 text-sm">
                        <strong>⚠️ Security Note:</strong> {step.content.warning}
                      </p>
                    </div>
                  )}
                  
                  {step.content.code && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-black/40 border border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-800/50 px-3 py-2 border-b border-gray-700 flex items-center gap-2">
                          <span className="text-yellow-400 text-sm">🐍</span>
                          <span className="text-gray-300 text-sm">Python</span>
                        </div>
                        <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                          <code>{step.content.code.python}</code>
                        </pre>
                      </div>
                      <div className="bg-black/40 border border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-800/50 px-3 py-2 border-b border-gray-700 flex items-center gap-2">
                          <span className="text-yellow-400 text-sm">⚡</span>
                          <span className="text-gray-300 text-sm">JavaScript</span>
                        </div>
                        <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                          <code>{step.content.code.javascript}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Success Banner */}
          <div className="relative bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center overflow-hidden mb-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),transparent_70%)]" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">You're All Set!</h3>
              <p className="text-gray-400 max-w-xl mx-auto mb-6">
                Your first agent is ready to participate in the machine economy. 
                Explore more features or dive into the full API documentation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/docs/api"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  View API Docs
                </Link>
                <Link
                  href="/account"
                  className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">What's Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/docs/api#streams"
                className="bg-black/40 border border-gray-700 hover:border-emerald-500/30 rounded-lg p-4 transition-colors"
              >
                <span className="text-2xl mb-2 block">💸</span>
                <h4 className="text-white font-medium mb-1">Streaming Payments</h4>
                <p className="text-gray-400 text-sm">Set up continuous micropayments</p>
              </Link>
              <Link
                href="/docs/api#escrow"
                className="bg-black/40 border border-gray-700 hover:border-emerald-500/30 rounded-lg p-4 transition-colors"
              >
                <span className="text-2xl mb-2 block">🔒</span>
                <h4 className="text-white font-medium mb-1">Programmable Escrow</h4>
                <p className="text-gray-400 text-sm">Conditional payment releases</p>
              </Link>
              <Link
                href="/docs/api#marketplace"
                className="bg-black/40 border border-gray-700 hover:border-emerald-500/30 rounded-lg p-4 transition-colors"
              >
                <span className="text-2xl mb-2 block">🏪</span>
                <h4 className="text-white font-medium mb-1">Agent Marketplace</h4>
                <p className="text-gray-400 text-sm">List and discover agent services</p>
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
            <p className="text-gray-400 mb-4">
              Our support team is here to help you get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:support@mnnr.app"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-lg transition-colors"
              >
                <span>📧</span> Contact Support
              </a>
              <a
                href="https://github.com/MNNRAPP/mnnr-complete2025/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <span>💬</span> Community
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
