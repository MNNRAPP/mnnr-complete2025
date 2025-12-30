export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="space-y-8 text-white/70 leading-relaxed">
          <p className="text-sm text-white/50">
            <strong>Last Updated:</strong> December 29, 2025<br />
            <strong>Effective Date:</strong> December 29, 2025
          </p>

          <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 font-semibold mb-2">⚠️ Beta Service Notice</p>
            <p>
              MNNR is currently in beta. The Service is provided &quot;as is&quot; and may contain bugs, errors, or interruptions. By using the Service during beta, you acknowledge these limitations and agree to provide feedback to help us improve.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using MNNR (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Service.
            </p>
            <p className="mt-4">
              These Terms constitute a legally binding agreement between you and MNNR (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p>
              MNNR provides usage analytics, metering, and billing infrastructure for AI applications and autonomous systems. The Service includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Usage tracking and analytics APIs</li>
              <li>Rate limiting and quota management</li>
              <li>Billing integration and invoicing</li>
              <li>Developer dashboard and reporting tools</li>
              <li>API documentation and SDKs</li>
            </ul>
            <p className="mt-4">
              <strong>Important:</strong> MNNR integrates with third-party payment processors (currently Stripe) for actual payment processing. We do not directly process payments or store complete payment card information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Account Registration</h2>
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Eligibility</h3>
            <p>You must be at least 18 years old and capable of forming a binding contract to use the Service.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Account Security</h3>
            <p>You are responsible for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.3 Accurate Information</h3>
            <p>You agree to provide accurate, current, and complete information during registration and to update it as necessary.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use Policy</h2>
            <p>You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malware, viruses, or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use the Service for fraudulent purposes</li>
              <li>Scrape or harvest data without permission</li>
              <li>Resell or redistribute the Service without authorization</li>
              <li>Use the Service to compete with MNNR</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Pricing and Payment</h2>
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.1 Fees</h3>
            <p>
              Pricing is available at <a href="https://mnnr.app/#pricing" className="text-emerald-400 hover:underline">mnnr.app/#pricing</a>. We reserve the right to modify pricing with 30 days notice.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.2 Billing</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fees are billed monthly or annually based on your plan</li>
              <li>Usage-based charges are calculated at the end of each billing period</li>
              <li>All fees are non-refundable except as required by law</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.3 Payment Processing</h3>
            <p>
              Payments are processed through Stripe. By providing payment information, you agree to Stripe&apos;s Terms of Service.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.4 Late Payment</h3>
            <p>
              Failure to pay may result in suspension or termination of your account. We may charge interest on overdue amounts at 1.5% per month or the maximum rate permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Service Level Agreement (SLA)</h2>
            <p>
              <strong>Beta Period:</strong> During beta, we do not guarantee any specific uptime or performance metrics. The Service is provided on a best-effort basis.
            </p>
            <p className="mt-4">
              <strong>Post-Launch:</strong> We target 99.9% uptime for paid plans, measured monthly. SLA credits may be available for qualifying downtime. Full SLA terms will be published upon general availability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Intellectual Property</h2>
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.1 Our IP</h3>
            <p>
              MNNR and all related trademarks, logos, and content are owned by us. You may not use our IP without prior written permission.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.2 Your Data</h3>
            <p>
              You retain all rights to data you submit to the Service. By using the Service, you grant us a limited license to process your data solely to provide the Service.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">7.3 Feedback</h3>
            <p>
              Any feedback, suggestions, or ideas you provide become our property and may be used without compensation or attribution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Data Privacy and Security</h2>
            <p>
              Your use of the Service is also governed by our <a href="/privacy" className="text-emerald-400 hover:underline">Privacy Policy</a>. We implement reasonable security measures but cannot guarantee absolute security.
            </p>
            <p className="mt-4">
              <strong>Data Processing Agreement:</strong> For enterprise customers, a separate Data Processing Agreement (DPA) is available upon request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Disclaimers and Limitations of Liability</h2>
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.1 No Warranties</h3>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.2 Limitation of Liability</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, MNNR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="mt-4">
              OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless MNNR from any claims, damages, losses, or expenses (including legal fees) arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your data or content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Termination</h2>
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.1 By You</h3>
            <p>You may terminate your account at any time through your account settings or by contacting support.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.2 By Us</h3>
            <p>We may suspend or terminate your account if you:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Violate these Terms</li>
              <li>Fail to pay fees</li>
              <li>Engage in fraudulent activity</li>
              <li>Pose a security risk</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">11.3 Effect of Termination</h3>
            <p>
              Upon termination, your right to use the Service immediately ceases. We may delete your data after 90 days, except as required by law or for legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Dispute Resolution</h2>
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">12.1 Governing Law</h3>
            <p>
              These Terms are governed by the laws of [Jurisdiction - to be determined], without regard to conflict of law principles.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">12.2 Arbitration</h3>
            <p>
              Any disputes shall be resolved through binding arbitration in accordance with [Arbitration Rules - to be determined], except that either party may seek injunctive relief in court.
            </p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">12.3 Class Action Waiver</h3>
            <p>
              You agree to resolve disputes on an individual basis and waive any right to participate in class actions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. Material changes will be notified via email or through the Service. Continued use after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. General Provisions</h2>
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">14.1 Entire Agreement</h3>
            <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and MNNR.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">14.2 Severability</h3>
            <p>If any provision is found unenforceable, the remaining provisions remain in full effect.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">14.3 No Waiver</h3>
            <p>Our failure to enforce any right does not constitute a waiver of that right.</p>

            <h3 className="text-xl font-semibold text-white mt-6 mb-3">14.4 Assignment</h3>
            <p>You may not assign these Terms without our consent. We may assign these Terms without restriction.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">15. Contact Information</h2>
            <p>For questions about these Terms, contact:</p>
            <div className="mt-4 p-6 bg-white/5 rounded-lg border border-white/10">
              <p><strong>MNNR Legal</strong></p>
              <p>Email: <a href="mailto:legal@mnnr.app" className="text-emerald-400 hover:underline">legal@mnnr.app</a></p>
              <p>Address: [To be added]</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
