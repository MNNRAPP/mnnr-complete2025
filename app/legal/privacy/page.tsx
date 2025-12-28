import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | MNNR',
  description: 'Privacy Policy for MNNR - Billing Infrastructure for the Machine Economy'
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-emerald-400 text-sm">🔒 Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-white/50">
            <strong>Last Updated:</strong> December 28, 2025<br />
            <strong>Effective Date:</strong> January 1, 2026
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-white/70 prose-li:text-white/70 prose-a:text-emerald-400 prose-strong:text-white">
          <h2>1. Introduction</h2>
          <p>
            MNNR ("we," "us," or "our") operates the mnnr.app website and platform (the "Service").
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information
            when you use our billing infrastructure for autonomous systems.
          </p>

          <h2>2. Information We Collect</h2>

          <h3>2.1 Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> Email address, name, company information</li>
            <li><strong>API Usage Data:</strong> Metadata about API calls, usage metrics you track</li>
            <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store credit card details)</li>
            <li><strong>Communications:</strong> Support requests, feedback, and correspondence</li>
          </ul>

          <h3>2.2 Information Collected Automatically</h3>
          <ul>
            <li><strong>Usage Data:</strong> API calls, rate limit events, billing queries</li>
            <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
            <li><strong>Cookies:</strong> Authentication tokens, preferences (see Cookie Policy)</li>
          </ul>

          <h3>2.3 Information We Do NOT Collect</h3>
          <ul>
            <li>Your end users' personal data (unless you explicitly send it)</li>
            <li>Payment card numbers (handled by Stripe)</li>
            <li>Your application's actual content or data</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide usage tracking, billing, and payment services</li>
            <li>Process your subscription payments</li>
            <li>Send service-related communications</li>
            <li>Analyze usage patterns to improve our infrastructure</li>
            <li>Detect and prevent fraud, abuse, or security incidents</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. How We Share Your Information</h2>

          <h3>4.1 Service Providers</h3>
          <p>We share information with trusted service providers who assist us:</p>
          <ul>
            <li><strong>Stripe:</strong> Payment processing</li>
            <li><strong>Supabase:</strong> Database and authentication</li>
            <li><strong>Vercel:</strong> Hosting and infrastructure</li>
            <li><strong>Cloudflare:</strong> CDN and security</li>
          </ul>

          <h3>4.2 We Do NOT Sell Your Data</h3>
          <p>
            We do not sell, rent, or trade your personal information to third parties for marketing purposes.
          </p>

          <h3>4.3 Legal Requirements</h3>
          <p>We may disclose information if required by law or to:</p>
          <ul>
            <li>Comply with legal process (subpoena, court order)</li>
            <li>Enforce our Terms of Service</li>
            <li>Protect rights, property, or safety of MNNR, our users, or others</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>
            We implement industry-standard security measures including:
          </p>
          <ul>
            <li>TLS 1.3 encryption for all data in transit</li>
            <li>AES-256 encryption for data at rest</li>
            <li>Row-level security policies on databases</li>
            <li>Regular security audits and penetration testing</li>
            <li>24/7 security monitoring</li>
            <li>SOC 2 Type II compliance (in progress)</li>
          </ul>
          <p>
            <em>No method of transmission over the Internet is 100% secure. While we strive to protect
            your data, we cannot guarantee absolute security.</em>
          </p>

          <h2>6. Your Rights and Choices</h2>

          <h3>6.1 Access and Correction</h3>
          <p>You can access and update your account information through your dashboard.</p>

          <h3>6.2 Data Export</h3>
          <p>
            You can export your usage data and billing history at any time from your dashboard.
          </p>

          <h3>6.3 Data Deletion</h3>
          <p>
            You may request deletion of your account by contacting <a href="mailto:privacy@mnnr.app">privacy@mnnr.app</a>.
            We will delete your data within 30 days, except as required by law.
          </p>

          <h3>6.4 Marketing Communications</h3>
          <p>You can opt out of marketing emails via the unsubscribe link. We will still send service-related emails.</p>

          <h2>7. Data Retention</h2>
          <p>We retain your information for as long as:</p>
          <ul>
            <li>Your account is active</li>
            <li>Needed to provide the Service</li>
            <li>Required by law (tax records, financial transactions)</li>
            <li>Necessary to resolve disputes or enforce agreements</li>
          </ul>
          <p>Usage logs are retained for 90 days. Billing records are retained for 7 years per tax requirements.</p>

          <h2>8. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in the United States and other countries
            where our service providers operate. We ensure appropriate safeguards are in place per GDPR requirements.
          </p>

          <h2>9. Children's Privacy</h2>
          <p>
            Our Service is not directed to individuals under 18. We do not knowingly collect information
            from children. If you believe we have collected information from a child, contact us immediately.
          </p>

          <h2>10. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant changes via
            email or prominent notice on our Service. Your continued use after changes constitutes acceptance.
          </p>

          <h2>11. Contact Us</h2>
          <p>For privacy-related questions or requests, contact us at:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:privacy@mnnr.app">privacy@mnnr.app</a></li>
            <li><strong>Security Issues:</strong> <a href="mailto:security@mnnr.app">security@mnnr.app</a></li>
          </ul>

          <h2>12. California Privacy Rights (CCPA)</h2>
          <p>California residents have additional rights under the CCPA:</p>
          <ul>
            <li><strong>Right to Know:</strong> What personal information we collect and how it's used</li>
            <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
            <li><strong>Right to Opt-Out:</strong> Opt out of sale of personal information (we do not sell your data)</li>
            <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
          </ul>
          <p>To exercise these rights, contact <a href="mailto:privacy@mnnr.app">privacy@mnnr.app</a></p>

          <h2>13. European Users (GDPR)</h2>
          <p>If you are in the European Economic Area, you have rights under GDPR including:</p>
          <ul>
            <li>Right to access, rectify, or erase your data</li>
            <li>Right to restrict or object to processing</li>
            <li>Right to data portability</li>
            <li>Right to withdraw consent</li>
            <li>Right to lodge a complaint with a supervisory authority</li>
          </ul>
          <p>Our legal basis for processing: Consent, contract performance, legal obligation, legitimate interests.</p>

          <hr className="border-white/10 my-8" />

          <p className="text-sm text-white/40">
            This Privacy Policy is part of our Terms of Service. By using MNNR, you agree to this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
