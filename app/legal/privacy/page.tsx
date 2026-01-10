import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | MNNR',
  description: 'Privacy Policy for MNNR, LLC - Usage Analytics for AI Applications'
};

export default function PrivacyPolicy() {
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
        <h1>Privacy Policy</h1>
        
        <p className="text-gray-600">
          <strong>Last Updated:</strong> January 9, 2026<br />
          <strong>Effective Date:</strong> January 9, 2026
        </p>

        <hr />

        <h2>1. Introduction</h2>
        <p>
          Welcome to MNNR ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you use our usage analytics and metering platform at https://mnnr.app (the "Service").
        </p>
        <p>
          <strong>Legal Entity:</strong> MNNR, LLC<br />
          <strong>EIN:</strong> 33-3678186<br />
          <strong>Address:</strong> 1603 Capitol Ave, Suite 413 PMB #1750, Cheyenne, WY 82001<br />
          <strong>Phone:</strong> (252) 242-0710<br />
          <strong>Email:</strong> legal@mnnr.app
        </p>

        <h2>2. Information We Collect</h2>
        
        <h3>2.1 Information You Provide to Us</h3>
        <p><strong>Account Information:</strong></p>
        <ul>
          <li>Email address</li>
          <li>Name (optional)</li>
          <li>Company name (optional)</li>
          <li>Password (encrypted, we never store plain text)</li>
        </ul>

        <p><strong>Billing Information:</strong></p>
        <ul>
          <li>Payment information is collected and processed by Stripe, Inc.</li>
          <li>We do NOT store credit card numbers or payment credentials</li>
          <li>We receive only payment confirmation and customer ID from Stripe</li>
        </ul>

        <p><strong>Usage Data You Send to Our API:</strong></p>
        <ul>
          <li>API usage metrics (tokens, calls, compute cycles)</li>
          <li>Metadata you choose to include (model names, user IDs, etc.)</li>
          <li>Timestamps of API requests</li>
          <li>API key identifiers</li>
        </ul>

        <h3>2.2 Information We Collect Automatically</h3>
        <p><strong>Technical Information:</strong></p>
        <ul>
          <li>IP address</li>
          <li>Browser type and version</li>
          <li>Device information</li>
          <li>Operating system</li>
          <li>Referring URLs</li>
          <li>Pages visited and time spent</li>
          <li>API request logs</li>
        </ul>

        <p><strong>Cookies and Similar Technologies:</strong></p>
        <ul>
          <li>Essential cookies (authentication, security)</li>
          <li>Analytics cookies (Google Analytics, opt-in required)</li>
          <li>Preference cookies (language, theme)</li>
        </ul>
        <p>We use cookies to enhance your experience. You can control cookies through our cookie consent banner and your browser settings.</p>

        <h2>3. How We Use Your Information</h2>
        <p>We use collected information for:</p>
        
        <p><strong>Service Delivery:</strong></p>
        <ul>
          <li>Providing usage analytics and metering services</li>
          <li>Processing API requests</li>
          <li>Generating usage reports and dashboards</li>
          <li>Billing and invoicing (via Stripe)</li>
        </ul>

        <p><strong>Service Improvement:</strong></p>
        <ul>
          <li>Analyzing usage patterns (aggregated, anonymized)</li>
          <li>Improving platform performance</li>
          <li>Developing new features</li>
          <li>Troubleshooting technical issues</li>
        </ul>

        <p><strong>Communication:</strong></p>
        <ul>
          <li>Sending service updates and announcements</li>
          <li>Responding to support requests</li>
          <li>Sending usage alerts and notifications</li>
          <li>Marketing communications (opt-in only)</li>
        </ul>

        <p><strong>Legal and Security:</strong></p>
        <ul>
          <li>Preventing fraud and abuse</li>
          <li>Complying with legal obligations</li>
          <li>Enforcing our Terms of Service</li>
          <li>Protecting our rights and property</li>
        </ul>

        <h2>4. How We Share Your Information</h2>
        <p>We do NOT sell your personal information. We share data only in these limited circumstances:</p>

        <p><strong>Service Providers:</strong></p>
        <ul>
          <li><strong>Stripe:</strong> Payment processing (PCI DSS Level 1 certified)</li>
          <li><strong>Supabase:</strong> Database hosting (SOC 2 Type II certified)</li>
          <li><strong>Vercel:</strong> Application hosting and CDN</li>
          <li><strong>Sentry:</strong> Error tracking and monitoring</li>
          <li><strong>Google Analytics:</strong> Usage analytics (anonymized, opt-in)</li>
        </ul>

        <p><strong>Legal Requirements:</strong></p>
        <ul>
          <li>To comply with applicable laws and regulations</li>
          <li>In response to valid legal requests (subpoenas, court orders)</li>
          <li>To protect our rights, property, or safety</li>
          <li>In connection with legal proceedings</li>
        </ul>

        <p><strong>Business Transfers:</strong></p>
        <ul>
          <li>In the event of merger, acquisition, or sale of assets</li>
          <li>You will be notified via email 30 days before transfer</li>
          <li>You may delete your account before transfer completes</li>
        </ul>

        <p><strong>With Your Consent:</strong></p>
        <ul>
          <li>When you explicitly authorize us to share your information</li>
          <li>For purposes you have approved</li>
        </ul>

        <h2>5. Data Retention</h2>
        <p><strong>Account Data:</strong> Retained while your account is active</p>
        <p><strong>Usage Events:</strong></p>
        <ul>
          <li>Free plan: 7 days</li>
          <li>Pro plan: 90 days</li>
          <li>Enterprise: Custom retention period</li>
        </ul>
        <p><strong>Billing Records:</strong> 7 years (legal requirement for tax purposes)</p>
        <p><strong>Deleted Accounts:</strong></p>
        <ul>
          <li>Account data deleted within 30 days of account closure</li>
          <li>Anonymized usage data may be retained for analytics</li>
          <li>Backups purged within 90 days</li>
        </ul>
        <p>You can request immediate deletion by contacting legal@mnnr.app</p>

        <h2>6. Your Rights</h2>
        
        <h3>6.1 GDPR Rights (European Users)</h3>
        <p>If you are in the European Economic Area, you have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Request copies of your personal data</li>
          <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
          <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
          <li><strong>Restriction:</strong> Limit how we process your data</li>
          <li><strong>Portability:</strong> Receive your data in machine-readable format</li>
          <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
          <li><strong>Withdraw Consent:</strong> Opt out of marketing or optional processing</li>
        </ul>
        <p>To exercise these rights, email: gdpr@mnnr.app</p>
        <p>We will respond within 30 days of your request.</p>

        <h3>6.2 CCPA Rights (California Residents)</h3>
        <p>California residents have the right to:</p>
        <ul>
          <li><strong>Know:</strong> What personal information we collect, use, and share</li>
          <li><strong>Delete:</strong> Request deletion of your personal information</li>
          <li><strong>Opt-Out:</strong> Opt out of sale of personal information (we do NOT sell data)</li>
          <li><strong>Non-Discrimination:</strong> Not receive discriminatory treatment for exercising rights</li>
        </ul>
        <p>To exercise these rights, email: privacy@mnnr.app or call (252) 242-0710</p>
        <p>We will respond within 45 days of your verified request.</p>

        <h3>6.3 All Users</h3>
        <p>Regardless of location, you can:</p>
        <ul>
          <li>Update your account information in dashboard settings</li>
          <li>Export your usage data (JSON/CSV format)</li>
          <li>Delete your account at any time</li>
          <li>Opt out of marketing emails (unsubscribe link in emails)</li>
          <li>Disable non-essential cookies via cookie settings</li>
        </ul>

        <h2>7. Data Security</h2>
        <p>We implement industry-standard security measures:</p>
        
        <p><strong>Encryption:</strong></p>
        <ul>
          <li>TLS 1.3 for data in transit</li>
          <li>AES-256 encryption for data at rest</li>
          <li>Encrypted database backups</li>
        </ul>

        <p><strong>Access Controls:</strong></p>
        <ul>
          <li>Multi-factor authentication for admin access</li>
          <li>Role-based access control (RBAC)</li>
          <li>API keys with scoped permissions</li>
          <li>Regular access reviews</li>
        </ul>

        <p><strong>Infrastructure:</strong></p>
        <ul>
          <li>SOC 2 compliant hosting providers</li>
          <li>Automated security scanning</li>
          <li>Regular penetration testing</li>
          <li>24/7 monitoring and alerting</li>
        </ul>

        <p><strong>Incident Response:</strong></p>
        <ul>
          <li>Security incidents reported within 72 hours (GDPR requirement)</li>
          <li>Affected users notified promptly</li>
          <li>Post-incident reports published</li>
        </ul>

        <p><strong>Note:</strong> No method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.</p>

        <h2>8. International Data Transfers</h2>
        <p>Our servers are located in the United States. If you access our Service from outside the US, your data will be transferred to and processed in the United States.</p>
        
        <p><strong>For EU Users:</strong></p>
        <ul>
          <li>We use Standard Contractual Clauses (SCCs) approved by the European Commission</li>
          <li>Our sub-processors are GDPR-compliant</li>
          <li>Data Processing Agreement available upon request: dpa@mnnr.app</li>
        </ul>

        <p><strong>For UK Users:</strong></p>
        <ul>
          <li>We comply with UK GDPR and Data Protection Act 2018</li>
          <li>International Data Transfer Addendum available upon request</li>
        </ul>

        <h2>9. Children's Privacy</h2>
        <p>Our Service is NOT intended for children under 16 (or 13 in the US). We do not knowingly collect personal information from children.</p>
        <p>If you are a parent or guardian and believe your child has provided us with personal information, contact us at legal@mnnr.app and we will delete it immediately.</p>

        <h2>10. Changes to This Privacy Policy</h2>
        <p>We may update this policy from time to time. Changes will be posted on this page with updated "Last Updated" date.</p>
        
        <p><strong>Material Changes:</strong></p>
        <ul>
          <li>We will notify you via email (to address on file)</li>
          <li>Notice will be posted on our homepage for 30 days</li>
          <li>Continued use after changes constitutes acceptance</li>
        </ul>

        <p><strong>Your Options:</strong></p>
        <ul>
          <li>Review changes and decide whether to continue using the Service</li>
          <li>Delete your account if you disagree with changes</li>
        </ul>

        <h2>11. Contact Us</h2>
        <p>For questions about this Privacy Policy or our privacy practices:</p>
        <p>
          <strong>Email:</strong> privacy@mnnr.app<br />
          <strong>Legal:</strong> legal@mnnr.app<br />
          <strong>Support:</strong> support@mnnr.app<br />
          <strong>Phone:</strong> (252) 242-0710
        </p>
        <p>
          <strong>Mailing Address:</strong><br />
          MNNR, LLC<br />
          1603 Capitol Ave, Suite 413 PMB #1750<br />
          Cheyenne, WY 82001
        </p>

        <hr />

        <p><strong>Acknowledgment:</strong> By using our Service, you acknowledge that you have read and understood this Privacy Policy.</p>
        
        <p className="text-sm text-gray-600"><em>This Privacy Policy was last updated on January 9, 2026.</em></p>
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
