import { Metadata } from 'next';
import Link from 'next/link';
import ContactButton from '@/components/ui/ContactButton/ContactButton';

export const metadata: Metadata = {
  title: 'Quick Start - MNNR',
  description: 'Get up and running quickly with our step-by-step quick start guide.',
};

export default function QuickStartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ⚡ Quick Start Guide
          </h1>
          <p className="text-xl text-gray-600">
            Get up and running with MNNR in under 5 minutes
          </p>
        </div>

        {/* Quick Start Steps */}
        <div className="space-y-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Create Account</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p>Sign up for a MNNR account to get started:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Visit <Link href="/" className="text-blue-600 hover:text-blue-800">mnnr.app</Link></li>
                <li>Click &quot;Sign Up&quot; and create your account</li>
                <li>Verify your email address</li>
                <li>Set up your payment method</li>
              </ol>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Get API Keys</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p>Generate your API credentials:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Go to your Account settings</li>
                <li>Navigate to &quot;API Keys&quot; section</li>
                <li>Click &quot;Generate New Key&quot;</li>
                <li>Copy your API key (keep it secure!)</li>
              </ol>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mt-4">
                <p className="text-yellow-800 text-sm">
                  <strong>⚠️ Security Note:</strong> Never share your API keys publicly. Store them securely in environment variables.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Install SDK</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p>Choose your preferred SDK:</p>

              <h4>Python</h4>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`pip install mnnr-sdk

import mnnr
client = mnnr.Client(api_key="your-api-key")`}
              </pre>

              <h4>JavaScript/TypeScript</h4>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`npm install @mnnr/sdk

import { MNNR } from '@mnnr/sdk';
const client = new MNNR({ apiKey: 'your-api-key' });`}
              </pre>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Make Your First Payment</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p>Create your first payment:</p>

              <h4>Python</h4>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`payment = client.create_payment(
    amount=100,  # Amount in cents
    currency="USD",
    description="Test payment"
)

print(f"Payment ID: {payment.id}")
print(f"Status: {payment.status}")`}
              </pre>

              <h4>JavaScript</h4>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`const payment = await client.payments.create({
  amount: 100,  // Amount in cents
  currency: 'USD',
  description: 'Test payment'
});

console.log(\`Payment ID: \${payment.id}\`);
console.log(\`Status: \${payment.status}\`);`}
              </pre>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-red-600">5</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Handle Webhooks</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p>Set up webhook handling for payment events:</p>

              <h4>Configure Webhook Endpoint</h4>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`# In your Account settings
Webhook URL: https://your-app.com/webhooks/mnnr

# Handle these events:
- payment.succeeded
- payment.failed
- payment.refunded`}
              </pre>

              <h4>Example Webhook Handler</h4>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`@app.post('/webhooks/mnnr')
def handle_webhook(request):
    event = mnnr.Webhook.construct_event(
        request.body, request.headers['signature'],
        'your-webhook-secret'
    )

    if event.type == 'payment.succeeded':
        # Handle successful payment
        print(f"Payment {event.data.id} succeeded!")

    return {'status': 'ok'}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">🎉 You&apos;re All Set!</h3>
          <p className="text-green-700 mb-4">
            Your MNNR integration is ready. Start processing payments with confidence.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/docs/api"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
            >
              View API Docs
            </Link>
            <Link
              href="/account"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>

        {/* Need Help */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Need Help?</h3>
          <p className="text-blue-700 mb-4">
            Our support team is here to help you get started. Don&apos;t hesitate to reach out!
          </p>
          <p className="text-sm text-blue-600">
            <ContactButton className="text-blue-600 hover:text-blue-800 font-medium">
              📧 Contact Support
            </ContactButton> | 📚 Docs: <Link href="/docs" className="text-blue-600 hover:text-blue-800">docs.mnnr.app</Link>
          </p>
        </div>

        {/* Back to Docs */}
        <div className="text-center mt-12">
          <Link
            href="/docs"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}