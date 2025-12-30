export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 text-white/70 leading-relaxed">
          <p className="text-sm text-white/50">
            <strong>Last Updated:</strong> December 29, 2025<br />
            <strong>Effective Date:</strong> December 29, 2025
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              MNNR (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates mnnr.app (the &quot;Service&quot;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. By using the Service, you consent to the data practices described in this policy.
            </p>
            <p className="mt-4">
              <strong>Important:</strong> MNNR is currently in beta. This Privacy Policy may be updated as we refine our services and compliance practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Information:</strong> Name, email address, company name when you create an account</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe. We do not store complete credit card numbers</li>
              <li><strong>Usage Data:</strong> API keys, usage metrics, transaction logs related to your AI agents and applications</li>
              <li><strong>Communications:</strong> Messages you send to our support team or through contact forms</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Log Data:</strong> IP address, browser type, device information, pages visited, time spent</li>
              <li><strong>Cookies:</strong> We use essential cookies for authentication and analytics cookies to improve our Service</li>
              <li><strong>API Usage:</strong> Request timestamps, response times, error rates, and usage patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p>We use collected information for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Providing and maintaining the Service</li>
              <li>Processing transactions and sending billing notifications</li>
              <li>Monitoring usage and analyzing performance</li>
              <li>Detecting and preventing fraud or abuse</li>
              <li>Responding to support requests</li>
              <li>Sending product updates and marketing communications (with your consent)</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.1 Service Providers</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Supabase:</strong> Database and authentication services</li>
              <li><strong>Vercel:</strong> Hosting and edge infrastructure</li>
              <li><strong>Analytics Providers:</strong> Usage analytics and monitoring</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.2 Legal Requirements</h3>
            <p>We may disclose your information if required by law, court order, or to protect our rights and safety.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">4.3 Business Transfers</h3>
            <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Retention</h2>
            <p>We retain your information for as long as your account is active or as needed to provide services. Specific retention periods:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li><strong>Account Data:</strong> Until account deletion + 90 days</li>
              <li><strong>Transaction Records:</strong> 7 years (legal requirement)</li>
              <li><strong>Usage Logs:</strong> 13 months</li>
              <li><strong>Marketing Data:</strong> Until you unsubscribe + 30 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
            
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.1 GDPR Rights (EU Users)</h3>
            <p>If you are in the European Economic Area, you have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Access your personal data</li>
              <li>Rectify inaccurate data</li>
              <li>Request erasure (&quot;right to be forgotten&quot;)</li>
              <li>Restrict processing</li>
              <li>Data portability</li>
              <li>Object to processing</li>
              <li>Withdraw consent at any time</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.2 CCPA Rights (California Users)</h3>
            <p>California residents have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Know what personal information is collected</li>
              <li>Know if personal information is sold or disclosed</li>
              <li>Opt-out of the sale of personal information</li>
              <li>Request deletion of personal information</li>
              <li>Non-discrimination for exercising CCPA rights</li>
            </ul>
            <p className="mt-4">
              <strong>Note:</strong> We do not sell your personal information.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">6.3 Exercising Your Rights</h3>
            <p>To exercise any of these rights, contact us at <a href="mailto:privacy@mnnr.app" className="text-emerald-400 hover:underline">privacy@mnnr.app</a></p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Security</h2>
            <p>We implement industry-standard security measures to protect your information:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>TLS/SSL encryption for data in transit</li>
              <li>AES-256 encryption for sensitive data at rest</li>
              <li>Regular security audits and penetration testing</li>
              <li>Access controls and authentication requirements</li>
              <li>SOC 2 Type II compliance in progress (target: Q2 2026)</li>
            </ul>
            <p className="mt-4">
              <strong>Important:</strong> No method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Children&apos;s Privacy</h2>
            <p>
              Our Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by email or through a prominent notice on our Service. Your continued use of the Service after changes become effective constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Us</h2>
            <p>For questions about this Privacy Policy or our data practices, contact:</p>
            <div className="mt-4 p-6 bg-white/5 rounded-lg border border-white/10">
              <p><strong>MNNR Data Protection</strong></p>
              <p>Email: <a href="mailto:privacy@mnnr.app" className="text-emerald-400 hover:underline">privacy@mnnr.app</a></p>
              <p>Address: [To be added - physical address required for GDPR compliance]</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Data Protection Officer</h2>
            <p>
              For EU users, you may contact our Data Protection Officer at: <a href="mailto:dpo@mnnr.app" className="text-emerald-400 hover:underline">dpo@mnnr.app</a>
            </p>
          </section>

          <section className="mt-12 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <h3 className="text-xl font-semibold text-emerald-400 mb-3">California Residents: Do Not Sell My Personal Information</h3>
            <p>
              We do not sell personal information. If you would like to opt-out of any future sales (should our practices change), please email <a href="mailto:privacy@mnnr.app" className="text-emerald-400 hover:underline">privacy@mnnr.app</a> with &quot;CCPA Opt-Out&quot; in the subject line.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
