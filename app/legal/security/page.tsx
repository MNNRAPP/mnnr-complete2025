import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security | MNNR',
  description: 'Security practices and compliance for MNNR, LLC'
};

export default function SecurityPage() {
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
        <h1>Security</h1>
        <p><strong>Last Updated:</strong> January 9, 2026</p>
        
        <p>At MNNR, security is fundamental to everything we build. We protect your data with industry-leading security practices and maintain transparency about our security posture.</p>
        
        <p>---</p>
        
        <h2>🔒 Security Overview</h2>
        
        <h3>Our Commitment</h3>
        
        <ul>
        <li>**Data Protection:** Your data is encrypted, monitored, and protected</li>
        <li>**Compliance:** Working toward SOC 2 Type II (target: Q2 2026)</li>
        <li>**Transparency:** We're open about our security practices</li>
        <li>**Responsibility:** We take security incidents seriously</li>
        </ul>
        
        <p><strong>Status:</strong> Beta - Security controls implemented, formal certifications in progress</p>
        
        <p>---</p>
        
        <h2>🛡️ Data Encryption</h2>
        
        <h3>In Transit</h3>
        
        <p><strong>TLS 1.3:</strong></p>
        <ul>
        <li>All data transmitted over HTTPS</li>
        <li>Perfect Forward Secrecy enabled</li>
        <li>Strong cipher suites only (AES-256-GCM)</li>
        <li>HSTS enforced (strict transport security)</li>
        </ul>
        
        <p><strong>API Connections:</strong></p>
        <ul>
        <li>TLS 1.2 minimum (TLS 1.3 preferred)</li>
        <li>Certificate pinning for mobile apps</li>
        <li>Mutual TLS available for Enterprise</li>
        </ul>
        
        <p><strong>SSL Rating:</strong> Target A+ on SSL Labs</p>
        
        <h3>At Rest</h3>
        
        <p><strong>Database Encryption:</strong></p>
        <ul>
        <li>AES-256 encryption for all data at rest</li>
        <li>Encrypted backups</li>
        <li>Encrypted database snapshots</li>
        <li>Key rotation every 90 days</li>
        </ul>
        
        <p><strong>File Storage:</strong></p>
        <ul>
        <li>Server-side encryption (SSE)</li>
        <li>Encrypted logs and exports</li>
        <li>Secure key management (AWS KMS / Vault)</li>
        </ul>
        
        <h3>Key Management</h3>
        
        <ul>
        <li>Encryption keys stored in dedicated key management service</li>
        <li>Keys never stored in application code</li>
        <li>Separate keys per environment (dev/staging/prod)</li>
        <li>Regular key rotation schedule</li>
        <li>Hardware security modules (HSM) for Enterprise</li>
        </ul>
        
        <p>---</p>
        
        <h2>🔐 Access Control</h2>
        
        <h3>Authentication</h3>
        
        <p><strong>User Authentication:</strong></p>
        <ul>
        <li>Password requirements: 12+ characters, complexity enforced</li>
        <li>Passwords hashed with bcrypt (cost factor 12)</li>
        <li>Optional multi-factor authentication (2FA)</li>
        <li>OAuth 2.0 / OpenID Connect support</li>
        <li>SSO available (Enterprise)</li>
        </ul>
        
        <p><strong>API Authentication:</strong></p>
        <ul>
        <li>API keys with scoped permissions</li>
        <li>Bearer token authentication</li>
        <li>Rate limiting per key</li>
        <li>Automatic key rotation support</li>
        <li>Webhook signature verification (HMAC-SHA256)</li>
        </ul>
        
        <p><strong>Session Management:</strong></p>
        <ul>
        <li>Secure session tokens (256-bit entropy)</li>
        <li>HttpOnly and Secure cookie flags</li>
        <li>Session timeout after 30 days inactivity</li>
        <li>Concurrent session limits</li>
        </ul>
        
        <h3>Authorization</h3>
        
        <p><strong>Role-Based Access Control (RBAC):</strong></p>
        <ul>
        <li>Principle of least privilege</li>
        <li>Granular permission system</li>
        <li>Team member roles: Owner, Admin, Developer, Viewer</li>
        <li>API key scoping (read/write/admin)</li>
        <li>Resource-level permissions</li>
        </ul>
        
        <p><strong>Internal Access:</strong></p>
        <ul>
        <li>Employee access logged and monitored</li>
        <li>Multi-factor authentication required</li>
        <li>Just-in-time (JIT) access for production</li>
        <li>Regular access reviews (quarterly)</li>
        <li>Separation of duties enforced</li>
        </ul>
        
        <p>---</p>
        
        <h2>🏗️ Infrastructure Security</h2>
        
        <h3>Hosting and Network</h3>
        
        <p><strong>Cloud Infrastructure:</strong></p>
        <ul>
        <li>SOC 2 Type II compliant hosting providers</li>
        <li>Supabase (database) - SOC 2 certified</li>
        <li>Vercel (application) - SOC 2 certified</li>
        <li>AWS (additional services) - Multiple certifications</li>
        </ul>
        
        <p><strong>Network Security:</strong></p>
        <ul>
        <li>Web Application Firewall (WAF)</li>
        <li>DDoS protection (Cloudflare)</li>
        <li>Network segmentation</li>
        <li>Private database connections</li>
        <li>IP allowlisting available (Enterprise)</li>
        </ul>
        
        <p><strong>Geographic Distribution:</strong></p>
        <ul>
        <li>Data residency options (Enterprise)</li>
        <li>Edge network for low latency</li>
        <li>Multi-region redundancy</li>
        </ul>
        
        <h3>Application Security</h3>
        
        <p><strong>Secure Development:</strong></p>
        <ul>
        <li>Security-focused code reviews</li>
        <li>Automated security scanning (Snyk, GitHub Advanced Security)</li>
        <li>Dependency vulnerability scanning</li>
        <li>Static Application Security Testing (SAST)</li>
        <li>Dynamic Application Security Testing (DAST)</li>
        </ul>
        
        <p><strong>Security Headers:</strong></p>
        <ul>
        <li>Content Security Policy (CSP)</li>
        <li>X-Frame-Options: DENY</li>
        <li>X-Content-Type-Options: nosniff</li>
        <li>Referrer-Policy: strict-origin-when-cross-origin</li>
        <li>Permissions-Policy configured</li>
        </ul>
        
        <p><strong>Input Validation:</strong></p>
        <ul>
        <li>All inputs validated and sanitized</li>
        <li>SQL injection prevention (parameterized queries)</li>
        <li>XSS protection</li>
        <li>CSRF tokens for state-changing operations</li>
        <li>Rate limiting on all endpoints</li>
        </ul>
        
        <p>---</p>
        
        <h2>📊 Monitoring and Detection</h2>
        
        <h3>Security Monitoring</h3>
        
        <p><strong>24/7 Monitoring:</strong></p>
        <ul>
        <li>Real-time security event monitoring</li>
        <li>Automated threat detection</li>
        <li>Intrusion detection system (IDS)</li>
        <li>Log aggregation and analysis (Sentry, Datadog)</li>
        <li>Anomaly detection algorithms</li>
        </ul>
        
        <p><strong>Alerts:</strong></p>
        <ul>
        <li>Suspicious activity alerts</li>
        <li>Failed authentication attempts</li>
        <li>API abuse detection</li>
        <li>Unusual usage patterns</li>
        <li>Infrastructure anomalies</li>
        </ul>
        
        <h3>Audit Logging</h3>
        
        <p><strong>Comprehensive Logs:</strong></p>
        <ul>
        <li>All authentication events</li>
        <li>API key creation/deletion</li>
        <li>Permission changes</li>
        <li>Data access (sensitive operations)</li>
        <li>Administrative actions</li>
        </ul>
        
        <p><strong>Log Retention:</strong></p>
        <ul>
        <li>Security logs: 1 year minimum</li>
        <li>Audit logs: 7 years (for compliance)</li>
        <li>Logs encrypted at rest</li>
        <li>Tamper-evident log storage</li>
        </ul>
        
        <p><strong>Log Access:</strong></p>
        <ul>
        <li>Audit logs available to Enterprise customers</li>
        <li>API for programmatic access</li>
        <li>SIEM integration support</li>
        </ul>
        
        <p>---</p>
        
        <h2>🚨 Incident Response</h2>
        
        <h3>Security Incident Plan</h3>
        
        <p><strong>Incident Response Team:</strong></p>
        <ul>
        <li>Dedicated security team</li>
        <li>24/7 on-call rotation</li>
        <li>Clear escalation procedures</li>
        <li>External security partner on retainer</li>
        </ul>
        
        <p><strong>Response Process:</strong></p>
        <p>1. <strong>Detection:</strong> Automated systems + manual monitoring</p>
        <p>2. <strong>Assessment:</strong> Determine scope and severity</p>
        <p>3. <strong>Containment:</strong> Isolate affected systems</p>
        <p>4. <strong>Eradication:</strong> Remove threat and vulnerabilities</p>
        <p>5. <strong>Recovery:</strong> Restore services securely</p>
        <p>6. <strong>Lessons Learned:</strong> Post-incident review</p>
        
        <p><strong>Notification:</strong></p>
        <ul>
        <li>Affected users notified within 72 hours (GDPR requirement)</li>
        <li>Transparent communication</li>
        <li>Regular status updates</li>
        <li>Post-incident report published</li>
        </ul>
        
        <h3>Vulnerability Disclosure</h3>
        
        <p><strong>Responsible Disclosure Program:</strong></p>
        <ul>
        <li>Email: security@mnnr.app</li>
        <li>PGP key available for encrypted communication</li>
        <li>Response within 24 hours</li>
        <li>Bug bounty program (coming soon)</li>
        </ul>
        
        <p><strong>Scope:</strong></p>
        <ul>
        <li>MNNR.app and subdomains</li>
        <li>API endpoints</li>
        <li>Mobile applications</li>
        <li>SDKs and libraries</li>
        </ul>
        
        <p><strong>Out of Scope:</strong></p>
        <ul>
        <li>Social engineering attacks</li>
        <li>Physical attacks</li>
        <li>Third-party services (report to them)</li>
        <li>Denial of service attacks</li>
        </ul>
        
        <p><strong>Safe Harbor:</strong></p>
        <ul>
        <li>We will not pursue legal action against security researchers</li>
        <li>Acting in good faith and following responsible disclosure</li>
        <li>Not accessing/modifying user data beyond minimal necessary for PoC</li>
        </ul>
        
        <p>---</p>
        
        <h2>🔒 Data Protection</h2>
        
        <h3>Data Handling</h3>
        
        <p><strong>Data Minimization:</strong></p>
        <ul>
        <li>Collect only necessary data</li>
        <li>Delete data when no longer needed</li>
        <li>Anonymize data where possible</li>
        <li>Pseudonymization for analytics</li>
        </ul>
        
        <p><strong>Data Retention:</strong></p>
        <ul>
        <li>Usage events: Per plan (7-90 days, or custom)</li>
        <li>Account data: While account active</li>
        <li>Deleted accounts: 30 days, then purged</li>
        <li>Backups: 90 days maximum</li>
        </ul>
        
        <p><strong>Data Deletion:</strong></p>
        <ul>
        <li>User-initiated deletion: Immediate (30-day grace period)</li>
        <li>Automated purge of expired data</li>
        <li>Secure deletion (cryptographic erasure)</li>
        <li>Backup overwrite cycles</li>
        </ul>
        
        <h3>Privacy and Compliance</h3>
        
        <p><strong>Certifications (In Progress):</strong></p>
        <ul>
        <li>SOC 2 Type II (target: Q2 2026)</li>
        <li>GDPR compliance (implemented)</li>
        <li>CCPA compliance (implemented)</li>
        <li>ISO 27001 (future consideration)</li>
        </ul>
        
        <p><strong>Data Processing:</strong></p>
        <ul>
        <li>Data Processing Agreement available</li>
        <li>Standard Contractual Clauses (EU)</li>
        <li>Privacy Shield successor framework</li>
        <li>GDPR Article 30 processing records</li>
        </ul>
        
        <p><strong>Privacy Features:</strong></p>
        <ul>
        <li>Data export (JSON/CSV)</li>
        <li>Account deletion</li>
        <li>Data portability</li>
        <li>Right to be forgotten</li>
        <li>Consent management</li>
        </ul>
        
        <p>---</p>
        
        <h2>👥 Employee Security</h2>
        
        <h3>Background Checks</h3>
        
        <ul>
        <li>Criminal background checks (where legally permitted)</li>
        <li>Employment verification</li>
        <li>Reference checks</li>
        <li>Ongoing monitoring for employees with data access</li>
        </ul>
        
        <h3>Security Training</h3>
        
        <p><strong>All Employees:</strong></p>
        <ul>
        <li>Security awareness training (onboarding)</li>
        <li>Annual security refresher</li>
        <li>Phishing simulation exercises</li>
        <li>Incident response drills</li>
        </ul>
        
        <p><strong>Engineering:</strong></p>
        <ul>
        <li>Secure coding practices</li>
        <li>OWASP Top 10 training</li>
        <li>Security code review training</li>
        <li>Threat modeling workshops</li>
        </ul>
        
        <p><strong>Confidentiality:</strong></p>
        <ul>
        <li>All employees sign NDAs</li>
        <li>Confidentiality obligations in employment contracts</li>
        <li>Data access limited to job requirements</li>
        <li>Exit procedures for departing employees</li>
        </ul>
        
        <p>---</p>
        
        <h2>🔍 Third-Party Security</h2>
        
        <h3>Vendor Management</h3>
        
        <p><strong>Due Diligence:</strong></p>
        <ul>
        <li>Security questionnaires for all vendors</li>
        <li>SOC 2 reports required for critical vendors</li>
        <li>Regular vendor reviews</li>
        <li>Contractual security requirements</li>
        </ul>
        
        <p><strong>Current Critical Vendors:</strong></p>
        <ul>
        <li>**Stripe:** PCI DSS Level 1, SOC 2 Type II</li>
        <li>**Supabase:** SOC 2 Type II, ISO 27001</li>
        <li>**Vercel:** SOC 2 Type II</li>
        <li>**Clerk:** SOC 2 Type II (authentication)</li>
        </ul>
        
        <p><strong>Sub-Processor List:</strong></p>
        <ul>
        <li>Available at: https://mnnr.app/legal/subprocessors</li>
        <li>Updated quarterly</li>
        <li>Email notifications for changes (Enterprise)</li>
        </ul>
        
        <h3>API Security</h3>
        
        <p><strong>Third-Party APIs:</strong></p>
        <ul>
        <li>Secure credential storage</li>
        <li>Encrypted API communications</li>
        <li>Rate limiting and throttling</li>
        <li>Circuit breakers for failures</li>
        <li>Regular credential rotation</li>
        </ul>
        
        <p>---</p>
        
        <h2>📝 Security Testing</h2>
        
        <h3>Regular Testing</h3>
        
        <p><strong>Automated Scanning:</strong></p>
        <ul>
        <li>Daily vulnerability scans</li>
        <li>Weekly dependency checks</li>
        <li>Continuous security monitoring</li>
        <li>Automated penetration testing tools</li>
        </ul>
        
        <p><strong>Manual Testing:</strong></p>
        <ul>
        <li>Quarterly penetration testing (target)</li>
        <li>Annual third-party security audit</li>
        <li>Code security reviews</li>
        <li>Infrastructure reviews</li>
        </ul>
        
        <p><strong>Testing Scope:</strong></p>
        <ul>
        <li>Web application</li>
        <li>API endpoints</li>
        <li>Mobile applications</li>
        <li>Infrastructure</li>
        <li>Third-party integrations</li>
        </ul>
        
        <h3>Security Metrics</h3>
        
        <p><strong>Key Performance Indicators:</strong></p>
        <ul>
        <li>Mean Time to Detect (MTTD): Target <1 hour</li>
        <li>Mean Time to Respond (MTTR): Target <4 hours</li>
        <li>Vulnerability remediation: Critical <24h, High <7 days</li>
        <li>Patch deployment: Critical <48h</li>
        </ul>
        
        <p>---</p>
        
        <h2>🎯 Compliance Roadmap</h2>
        
        <h3>Current Status (Beta)</h3>
        
        <p>✅ <strong>Implemented:</strong></p>
        <ul>
        <li>Data encryption (in transit and at rest)</li>
        <li>Access controls (RBAC)</li>
        <li>Audit logging</li>
        <li>Security monitoring</li>
        <li>Incident response plan</li>
        <li>GDPR/CCPA practices</li>
        <li>Secure development lifecycle</li>
        </ul>
        
        <p>🔄 <strong>In Progress:</strong></p>
        <ul>
        <li>SOC 2 Type II certification (Q2 2026 target)</li>
        <li>Formal penetration testing program</li>
        <li>Bug bounty program</li>
        <li>ISO 27001 (future)</li>
        </ul>
        
        <h3>Enterprise Certifications</h3>
        
        <p><strong>Available for Enterprise Customers:</strong></p>
        <ul>
        <li>Custom security reviews</li>
        <li>Dedicated security contact</li>
        <li>Custom Data Processing Agreement</li>
        <li>Security questionnaire completion</li>
        <li>Customer-requested audits (at cost)</li>
        </ul>
        
        <p>---</p>
        
        <h2>📞 Contact Security Team</h2>
        
        <p><strong>Report Security Issues:</strong></p>
        <ul>
        <li>Email: security@mnnr.app</li>
        <li>Emergency: Same email (monitored 24/7)</li>
        <li>PGP Key: [PROVIDE PGP KEY FINGERPRINT IF AVAILABLE]</li>
        </ul>
        
        <p><strong>General Security Questions:</strong></p>
        <ul>
        <li>Email: security@mnnr.app</li>
        <li>Response time: 2 business days</li>
        </ul>
        
        <p><strong>Compliance Questions:</strong></p>
        <ul>
        <li>Email: compliance@mnnr.app</li>
        <li>DPA requests: dpa@mnnr.app</li>
        </ul>
        
        <p><strong>Mailing Address:</strong>  </p>
        <p>MNNR, LLC  </p>
        <p>1603 Capitol Ave, Suite 413 PMB #1750  </p>
        <p>Cheyenne, WY 82001</p>
        
        <p>---</p>
        
        <h2>🔖 Security Resources</h2>
        
        <p><strong>For Developers:</strong></p>
        <ul>
        <li>[API Security Best Practices](/docs/security/api)</li>
        <li>[Webhook Security Guide](/docs/security/webhooks)</li>
        <li>[SDK Security Guidelines](/docs/security/sdk)</li>
        </ul>
        
        <p><strong>For Enterprise:</strong></p>
        <ul>
        <li>[Security Whitepaper](/security/whitepaper.pdf) [CREATE THIS]</li>
        <li>[Compliance Documentation](/security/compliance)</li>
        <li>[DPA Template](/legal/dpa)</li>
        </ul>
        
        <p><strong>External Resources:</strong></p>
        <ul>
        <li>[OWASP Top 10](https://owasp.org/www-project-top-ten/)</li>
        <li>[NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)</li>
        </ul>
        
        <p>---</p>
        
        <h2>🛡️ Our Security Commitment</h2>
        
        <p>At MNNR, we believe security is never "done" - it's an ongoing commitment. We continuously improve our security posture, stay current with emerging threats, and maintain transparency with our users.</p>
        
        <p><strong>Last Security Audit:</strong> [DATE OR "Scheduled for Q1 2026"]  </p>
        <p><strong>Next Planned Audit:</strong> Q2 2026  </p>
        <p><strong>Security Incidents (Last 12 Months):</strong> 0</p>
        
        <p>---</p>
        
        <p><strong>Questions about our security?</strong> Email security@mnnr.app</p>
        
        <p>*This security page was last updated on January 9, 2026.*</p>
        
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
