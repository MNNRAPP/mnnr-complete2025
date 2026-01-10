import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About MNNR | MNNR',
  description: 'About MNNR, LLC - Real-time usage analytics for the AI economy'
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a href="/" className="text-2xl font-bold text-blue-600">MNNR</a>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12 prose prose-lg prose-slate max-w-none">
        <h1>About MNNR</h1>
        <p className="text-xl text-gray-600 mb-8">Real-time usage analytics for the AI economy.</p>
        
        <hr />

        <h2>🎯 Our Mission</h2>
        <p>
          We're building the infrastructure that makes AI applications financially sustainable. 
          MNNR provides developers with the tools to track, analyze, and optimize AI consumption - 
          turning usage data into actionable insights.
        </p>
        <p><strong>Vision:</strong> Every AI application should have clear visibility into costs, usage, and ROI.</p>

        <hr />

        <h2>🚀 What We Do</h2>
        <p>
          MNNR is a <strong>usage analytics and metering platform</strong> built specifically for AI applications. 
          We help companies:
        </p>
        <ul>
          <li><strong>Track</strong> AI API consumption in real-time</li>
          <li><strong>Analyze</strong> usage patterns and costs</li>
          <li><strong>Optimize</strong> spending and prevent bill shock</li>
          <li><strong>Bill</strong> customers accurately based on actual usage</li>
        </ul>
        <p>Think of us as <strong>Datadog for AI costs</strong> - we provide the observability layer that every AI company needs.</p>

        <hr />

        <h2>💡 Why We Exist</h2>
        <h3>The Problem</h3>
        <p>AI companies struggle with:</p>
        <ul>
          <li><strong>Opaque costs:</strong> No visibility into AI spending until the bill arrives</li>
          <li><strong>Bill shock:</strong> Unexpected spikes in usage lead to massive bills</li>
          <li><strong>Usage-based billing:</strong> Hard to implement accurately for customers</li>
          <li><strong>Multiple providers:</strong> OpenAI, Anthropic, AWS Bedrock - tracking is complex</li>
        </ul>
        <p>
          Traditional payment processors and analytics tools weren't built for the AI economy. 
          Per-token pricing, streaming costs, and machine-to-machine transactions need specialized infrastructure.
        </p>

        <h3>Our Solution</h3>
        <p>MNNR provides:</p>
        <ul>
          <li><strong>Real-time tracking</strong> with &lt;50ms latency</li>
          <li><strong>Automatic alerts</strong> when usage patterns change</li>
          <li><strong>Cost forecasting</strong> using ML models</li>
          <li><strong>Stripe integration</strong> for automated billing</li>
          <li><strong>Multi-provider support</strong> (OpenAI, Anthropic, AWS, and more)</li>
        </ul>
        <p>One API call to track everything. One dashboard to understand it all.</p>

        <hr />

        <h2>🏢 Company Information</h2>
        <h3>Legal Entity</h3>
        <p>
          <strong>Company Name:</strong> MNNR, LLC<br />
          <strong>Type:</strong> Wyoming Limited Liability Company<br />
          <strong>Incorporated:</strong> 2025<br />
          <strong>Location:</strong> Cheyenne, Wyoming
        </p>
        <p>
          <strong>Registered Address:</strong><br />
          1603 Capitol Ave, Suite 413 PMB #1750<br />
          Cheyenne, WY 82001
        </p>
        <p><strong>EIN:</strong> 33-3678186</p>

        <h3>Contact Information</h3>
        <p>
          <strong>General Inquiries:</strong> hello@mnnr.app<br />
          <strong>Support:</strong> support@mnnr.app<br />
          <strong>Sales:</strong> sales@mnnr.app<br />
          <strong>Legal:</strong> legal@mnnr.app<br />
          <strong>Security:</strong> security@mnnr.app<br />
          <strong>Privacy:</strong> privacy@mnnr.app<br />
          <strong>Phone:</strong> (252) 242-0710
        </p>
        <p><strong>Business Hours:</strong> Monday-Friday, 9:00 AM - 5:00 PM Pacific Time</p>

        <hr />

        <h2>📊 Product Status</h2>
        <h3>Current Status: <strong>Public Beta</strong></h3>
        <p><strong>What this means:</strong></p>
        <ul>
          <li>Core features are stable and production-ready</li>
          <li>Some advanced features still in development</li>
          <li>Pricing and plans may evolve</li>
          <li>We're incorporating user feedback rapidly</li>
          <li>Free tier available with no credit card required</li>
        </ul>

        <h3>Beta Timeline</h3>
        <ul>
          <li><strong>Q4 2025:</strong> Private beta launch</li>
          <li><strong>Q1 2026:</strong> Public beta (current)</li>
          <li><strong>Q2 2026:</strong> General availability + SOC 2 certification</li>
          <li><strong>Q3 2026:</strong> Enterprise features and advanced analytics</li>
        </ul>

        <hr />

        <h2>🌍 Our Commitment to Privacy</h2>
        <p>We take privacy seriously:</p>
        <ul>
          <li>✅ <strong>GDPR compliant</strong> - Full data protection for European users</li>
          <li>✅ <strong>CCPA compliant</strong> - California privacy rights respected</li>
          <li>✅ <strong>No data selling</strong> - We never sell your data, ever</li>
          <li>✅ <strong>Data portability</strong> - Export your data anytime</li>
          <li>✅ <strong>Right to delete</strong> - Delete your account and data anytime</li>
        </ul>
        <p>Read our full <a href="/legal/privacy">Privacy Policy</a></p>

        <hr />

        <h2>🔒 Security & Compliance</h2>
        <p><strong>Current Status:</strong></p>
        <ul>
          <li>✅ AES-256 encryption (data at rest and in transit)</li>
          <li>✅ SOC 2 compliant hosting providers</li>
          <li>✅ Secure development practices</li>
          <li>✅ 24/7 security monitoring</li>
          <li>🔄 SOC 2 Type II certification (Q2 2026 target)</li>
        </ul>
        <p>Read our full <a href="/legal/security">Security page</a></p>

        <hr />

        <h2>📬 Contact Us</h2>
        <p>
          <strong>General Questions:</strong> hello@mnnr.app<br />
          <strong>Sales & Enterprise:</strong> sales@mnnr.app<br />
          <strong>Technical Support:</strong> support@mnnr.app<br />
          <strong>Partnerships:</strong> partners@mnnr.app
        </p>
        <p>
          <strong>Mailing Address:</strong><br />
          MNNR, LLC<br />
          1603 Capitol Ave, Suite 413 PMB #1750<br />
          Cheyenne, WY 82001
        </p>

        <hr />

        <h2>📜 Legal</h2>
        <p>
          <strong>Terms of Service:</strong> <a href="/legal/terms">/legal/terms</a><br />
          <strong>Privacy Policy:</strong> <a href="/legal/privacy">/legal/privacy</a><br />
          <strong>Security:</strong> <a href="/legal/security">/legal/security</a>
        </p>

        <p><strong>© 2026 MNNR, LLC. All rights reserved.</strong></p>
        
        <p className="text-sm text-gray-600"><em>Last updated: January 9, 2026</em></p>
        
        <p className="mt-8">
          <strong>Have questions?</strong> We'd love to hear from you. Email us at hello@mnnr.app
        </p>
      </article>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2026 MNNR, LLC. All rights reserved.</p>
          <p className="text-sm mt-2">
            1603 Capitol Ave, Suite 413 PMB #1750, Cheyenne, WY 82001
          </p>
        </div>
      </footer>
    </div>
  );
}
