import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security | MNNR',
  description: 'Security practices and compliance at MNNR - Billing Infrastructure for the Machine Economy'
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-emerald-400 text-sm">🛡️ Security</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Security at MNNR</h1>
          <p className="text-xl text-white/50">
            Enterprise-grade security for your billing infrastructure
          </p>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Encryption</h3>
            <p className="text-white/50">TLS 1.3 in transit, AES-256 at rest</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">SOC 2 Type II</h3>
            <p className="text-white/50">Audit in progress, completion Q1 2026</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Global Infrastructure</h3>
            <p className="text-white/50">50+ edge locations with auto-failover</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">24/7 Monitoring</h3>
            <p className="text-white/50">Real-time threat detection and alerts</p>
          </div>
        </div>

        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-white/70 prose-li:text-white/70 prose-a:text-emerald-400 prose-strong:text-white">
          <h2>Infrastructure Security</h2>
          
          <h3>Encryption</h3>
          <ul>
            <li><strong>In Transit:</strong> All data is encrypted using TLS 1.3 with perfect forward secrecy</li>
            <li><strong>At Rest:</strong> AES-256 encryption for all stored data</li>
            <li><strong>API Keys:</strong> Hashed using bcrypt, never stored in plaintext</li>
          </ul>

          <h3>Hosting & Network</h3>
          <ul>
            <li><strong>Cloud Provider:</strong> Multi-region deployment on enterprise-grade infrastructure</li>
            <li><strong>DDoS Protection:</strong> Cloudflare Enterprise with automatic mitigation</li>
            <li><strong>Edge Network:</strong> 50+ global edge locations for low-latency access</li>
            <li><strong>Failover:</strong> Automatic failover with &lt;30 second recovery time</li>
          </ul>

          <h3>Access Control</h3>
          <ul>
            <li>Role-based access control (RBAC) for all internal systems</li>
            <li>Multi-factor authentication required for all employees</li>
            <li>Principle of least privilege enforced</li>
            <li>Audit logs for all administrative actions</li>
          </ul>

          <h2>Compliance & Certifications</h2>
          
          <div className="not-prose my-8">
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Certification</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <tr>
                    <td className="px-6 py-4 text-white/70">SOC 2 Type II</td>
                    <td className="px-6 py-4"><span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm">In Progress</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white/70">GDPR Compliant</td>
                    <td className="px-6 py-4"><span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">Compliant</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white/70">CCPA Compliant</td>
                    <td className="px-6 py-4"><span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">Compliant</span></td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-white/70">PCI DSS Level 1</td>
                    <td className="px-6 py-4"><span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">Via Stripe</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <h2>Data Protection</h2>
          <ul>
            <li><strong>Data Isolation:</strong> Customer data is logically isolated with row-level security</li>
            <li><strong>No Card Storage:</strong> We never store payment card data—handled by Stripe (PCI compliant)</li>
            <li><strong>Backups:</strong> Automatic backups every 6 hours with 30-day retention</li>
            <li><strong>Data Export:</strong> Export your data anytime from your dashboard</li>
            <li><strong>Data Deletion:</strong> Request complete deletion within 30 days</li>
          </ul>

          <h2>Application Security</h2>
          <ul>
            <li><strong>Secure Development:</strong> Security review required for all code changes</li>
            <li><strong>Dependency Scanning:</strong> Automated vulnerability scanning for all dependencies</li>
            <li><strong>Penetration Testing:</strong> Annual third-party penetration tests</li>
            <li><strong>Bug Bounty:</strong> Responsible disclosure program with bounties</li>
          </ul>

          <h2>Incident Response</h2>
          <p>
            We have a documented incident response plan that includes:
          </p>
          <ul>
            <li>24/7 on-call security team</li>
            <li>Automated alerting for anomalous activity</li>
            <li>Defined escalation procedures</li>
            <li>Customer notification within 72 hours of confirmed breach</li>
            <li>Post-incident review and remediation</li>
          </ul>

          <h2>Vulnerability Reporting</h2>
          <p>
            We take security seriously and appreciate responsible disclosure. If you discover a security vulnerability:
          </p>
          <ul>
            <li>Email us at <a href="mailto:security@mnnr.app">security@mnnr.app</a></li>
            <li>Include detailed steps to reproduce</li>
            <li>Allow us reasonable time to respond and fix</li>
            <li>Do not publicly disclose until we've addressed the issue</li>
          </ul>
          <p>
            <strong>Bug Bounty:</strong> We offer bounties for responsibly disclosed vulnerabilities. 
            Rewards range from $100 to $10,000 depending on severity.
          </p>

          <h2>Enterprise Security Features</h2>
          <p>Enterprise customers have access to additional security features:</p>
          <ul>
            <li>Single Sign-On (SSO) with SAML 2.0</li>
            <li>Custom data retention policies</li>
            <li>Dedicated infrastructure options</li>
            <li>Custom SLAs up to 99.999% uptime</li>
            <li>Security questionnaire and audit support</li>
            <li>Direct access to security team</li>
          </ul>

          <h2>Questions?</h2>
          <p>
            For security-related questions or to request our security documentation:
          </p>
          <ul>
            <li><strong>Security Team:</strong> <a href="mailto:security@mnnr.app">security@mnnr.app</a></li>
            <li><strong>Enterprise Sales:</strong> <a href="mailto:enterprise@mnnr.app">enterprise@mnnr.app</a></li>
          </ul>

          <hr className="border-white/10 my-8" />

          <p className="text-sm text-white/40">
            Last updated: December 28, 2025
          </p>
        </div>
      </div>
    </div>
  );
}
