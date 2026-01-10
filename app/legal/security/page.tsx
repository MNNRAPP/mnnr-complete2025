export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a href="/" className="text-2xl font-bold text-blue-600">MNNR</a>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-lg prose-slate max-w-none">
          <h1>Security</h1>
          <p className="text-gray-600">Last Updated: January 9, 2026</p>
          
          <p>At MNNR, security is fundamental to everything we build. We protect your data with industry-leading security practices and maintain transparency about our security posture.</p>

          <h2>🔒 Security Overview</h2>
          <h3>Our Commitment</h3>
          <ul>
            <li><strong>Data Protection:</strong> Your data is encrypted, monitored, and protected</li>
            <li><strong>Compliance:</strong> Working toward SOC 2 Type II (target: Q2 2026)</li>
            <li><strong>Transparency:</strong> We're open about our security practices</li>
            <li><strong>Responsibility:</strong> We take security incidents seriously</li>
          </ul>

          <p><strong>Status:</strong> Beta - Security controls implemented, formal certifications in progress</p>

          <h2>🛡️ Data Encryption</h2>
          <h3>In Transit</h3>
          <p><strong>TLS 1.3:</strong></p>
          <ul>
            <li>All data transmitted over HTTPS</li>
            <li>Perfect Forward Secrecy enabled</li>
            <li>Strong cipher suites only (AES-256-GCM)</li>
            <li>HSTS enforced (strict transport security)</li>
          </ul>

          <h3>At Rest</h3>
          <p><strong>Database Encryption:</strong></p>
          <ul>
            <li>AES-256 encryption for all data at rest</li>
            <li>Encrypted backups</li>
            <li>Key rotation every 90 days</li>
          </ul>

          <h2>🔐 Access Control</h2>
          <h3>Authentication</h3>
          <p><strong>User Authentication:</strong></p>
          <ul>
            <li>Password requirements: 12+ characters, complexity enforced</li>
            <li>Optional multi-factor authentication (2FA)</li>
            <li>Session timeout after 30 days inactivity</li>
          </ul>

          <h2>📊 Monitoring and Detection</h2>
          <p><strong>24/7 Monitoring:</strong></p>
          <ul>
            <li>Real-time security event monitoring</li>
            <li>Automated threat detection</li>
            <li>Log aggregation and analysis</li>
          </ul>

          <h2>🚨 Incident Response</h2>
          <p><strong>Notification:</strong></p>
          <ul>
            <li>Affected users notified within 72 hours (GDPR requirement)</li>
            <li>Transparent communication</li>
            <li>Regular status updates</li>
          </ul>

          <h3>Vulnerability Disclosure</h3>
          <p><strong>Responsible Disclosure Program:</strong></p>
          <ul>
            <li>Email: security@mnnr.app</li>
            <li>Response within 24 hours</li>
            <li>Bug bounty program (coming soon)</li>
          </ul>

          <h2>📞 Contact Security Team</h2>
          <p><strong>Report Security Issues:</strong></p>
          <ul>
            <li>Email: security@mnnr.app</li>
            <li>Emergency: Same email (monitored 24/7)</li>
          </ul>

          <p><strong>Mailing Address:</strong><br />
          MNNR, LLC<br />
          1603 Capitol Ave, Suite 413 PMB #1750<br />
          Cheyenne, WY 82001</p>

          <p><strong>Last Security Audit:</strong> Scheduled for Q1 2026<br />
          <strong>Next Planned Audit:</strong> Q2 2026<br />
          <strong>Security Incidents (Last 12 Months):</strong> 0</p>

          <p><strong>Questions about our security?</strong> Email security@mnnr.app</p>

          <p className="text-sm text-gray-500 mt-8"><em>This security page was last updated on January 9, 2026.</em></p>
        </div>
      </article>

      <footer className="border-t mt-20">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2026 MNNR, LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
