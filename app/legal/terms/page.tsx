import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | MNNR',
  description: 'Terms of Service for MNNR, LLC - Usage Analytics for AI Applications'
};

export default function TermsofServicePage() {
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
        <h1>Terms of Service</h1>
        <p><strong>Last Updated:</strong> January 9, 2026  </p>
        <p><strong>Effective Date:</strong> January 9, 2026</p>
        
        <p>---</p>
        
        <h2>1. Acceptance of Terms</h2>
        
        <p>These Terms of Service ("Terms") constitute a legally binding agreement between you ("you," "your," or "User") and MNNR, LLC ("MNNR," "we," "our," or "us") governing your use of the MNNR usage analytics and metering platform, including the website at https://mnnr.app and associated APIs, SDKs, and services (collectively, the "Service").</p>
        
        <p><strong>BY ACCESSING OR USING THE SERVICE, YOU AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE, DO NOT USE THE SERVICE.</strong></p>
        
        <p><strong>Legal Entity:</strong>  </p>
        <p>MNNR, LLC  </p>
        <p>EIN: 33-3678186  </p>
        <p>1603 Capitol Ave, Suite 413 PMB #1750  </p>
        <p>Cheyenne, WY 82001  </p>
        <p>Phone: (252) 242-0710</p>
        
        <p><strong>Contact:</strong> legal@mnnr.app</p>
        
        <p>---</p>
        
        <h2>2. Beta Service Disclaimer</h2>
        
        <p><strong>IMPORTANT:</strong> MNNR is currently in beta (the "Beta Period").</p>
        
        <p><strong>Beta Service Terms:</strong></p>
        <ul>
        <li>The Service is provided "AS IS" without warranties of any kind</li>
        <li>Features may change, be removed, or added without notice</li>
        <li>Performance metrics and SLAs are targets, not guarantees</li>
        <li>Downtime may occur for maintenance and updates</li>
        <li>Data loss, while unlikely, is possible - maintain your own backups</li>
        <li>Beta access may be terminated at any time</li>
        </ul>
        
        <p><strong>Upon General Availability:</strong></p>
        <ul>
        <li>We will notify all users 30 days in advance</li>
        <li>Updated Terms and SLA will be provided</li>
        <li>You may opt out by deleting your account</li>
        <li>Continued use constitutes acceptance of new terms</li>
        </ul>
        
        <p><strong>Your Beta Responsibilities:</strong></p>
        <ul>
        <li>Do not use for mission-critical production systems</li>
        <li>Maintain backups of important data</li>
        <li>Provide feedback to help us improve</li>
        <li>Report bugs and security issues promptly</li>
        </ul>
        
        <p>---</p>
        
        <h2>3. Eligibility</h2>
        
        <p>To use the Service, you must:</p>
        
        <ul>
        <li>Be at least 18 years old (or 16 in the EU with parental consent)</li>
        <li>Have the legal capacity to enter into binding contracts</li>
        <li>Not be prohibited from using the Service under applicable law</li>
        <li>Provide accurate and complete registration information</li>
        <li>Comply with all applicable laws and regulations</li>
        </ul>
        
        <p><strong>Business Accounts:</strong></p>
        <ul>
        <li>You represent that you have authority to bind your organization</li>
        <li>Your organization agrees to be bound by these Terms</li>
        <li>You are responsible for all activity under your account</li>
        </ul>
        
        <p><strong>Prohibited Users:</strong></p>
        <ul>
        <li>Individuals or entities on US sanctions lists (OFAC, etc.)</li>
        <li>Users in embargoed countries (Cuba, Iran, North Korea, Syria, etc.)</li>
        <li>Competitors using the Service for competitive analysis</li>
        </ul>
        
        <p>---</p>
        
        <h2>4. Account Registration and Security</h2>
        
        <h3>4.1 Account Creation</h3>
        
        <p>You must create an account to use the Service. You agree to:</p>
        
        <ul>
        <li>Provide accurate, current, and complete information</li>
        <li>Maintain and update your information</li>
        <li>Keep your password secure and confidential</li>
        <li>Notify us immediately of unauthorized access</li>
        <li>Accept responsibility for all activity under your account</li>
        </ul>
        
        <p><strong>We reserve the right to:</strong></p>
        <ul>
        <li>Refuse registration to anyone</li>
        <li>Suspend or terminate accounts violating these Terms</li>
        <li>Require additional verification for security purposes</li>
        </ul>
        
        <h3>4.2 API Keys</h3>
        
        <p>You are responsible for:</p>
        
        <ul>
        <li>Keeping API keys confidential</li>
        <li>Not sharing keys publicly (code repositories, forums, etc.)</li>
        <li>Rotating keys if compromised</li>
        <li>Using appropriate key scoping and permissions</li>
        </ul>
        
        <p><strong>Security Best Practices:</strong></p>
        <ul>
        <li>Store keys in environment variables or secrets managers</li>
        <li>Never commit keys to version control</li>
        <li>Use separate keys for development and production</li>
        <li>Implement key rotation policies</li>
        </ul>
        
        <p><strong>We are NOT responsible for:</strong></p>
        <ul>
        <li>Unauthorized use of compromised API keys</li>
        <li>Charges incurred from stolen keys</li>
        <li>Data breaches resulting from exposed keys</li>
        </ul>
        
        <p>---</p>
        
        <h2>5. Acceptable Use Policy</h2>
        
        <h3>5.1 Permitted Uses</h3>
        
        <p>You may use the Service to:</p>
        
        <ul>
        <li>Track usage of your own applications and services</li>
        <li>Integrate our API into your products</li>
        <li>Monitor AI/ML API consumption</li>
        <li>Generate usage-based billing for your customers</li>
        <li>Analyze usage patterns and optimize costs</li>
        </ul>
        
        <h3>5.2 Prohibited Uses</h3>
        
        <p>You may NOT use the Service to:</p>
        
        <p><strong>Illegal Activities:</strong></p>
        <ul>
        <li>Violate any applicable laws or regulations</li>
        <li>Facilitate illegal activities</li>
        <li>Infringe intellectual property rights</li>
        <li>Engage in fraud or deception</li>
        </ul>
        
        <p><strong>Abuse and Harm:</strong></p>
        <ul>
        <li>Attack, abuse, or harass others</li>
        <li>Transmit viruses, malware, or harmful code</li>
        <li>Interfere with or disrupt the Service</li>
        <li>Bypass security measures or rate limits</li>
        <li>Conduct unauthorized penetration testing</li>
        </ul>
        
        <p><strong>Misuse:</strong></p>
        <ul>
        <li>Create fake or fraudulent usage data</li>
        <li>Manipulate or game our billing system</li>
        <li>Resell the Service without authorization</li>
        <li>Use for competitive intelligence gathering</li>
        <li>Reverse engineer our proprietary technology</li>
        </ul>
        
        <p><strong>Spam and Automation:</strong></p>
        <ul>
        <li>Send unsolicited messages through our webhooks</li>
        <li>Generate excessive API traffic for non-legitimate purposes</li>
        <li>Create fake accounts or bot activity</li>
        </ul>
        
        <p><strong>Violations Result In:</strong></p>
        <ul>
        <li>Immediate account suspension</li>
        <li>Termination of Service</li>
        <li>Legal action and damages</li>
        <li>Reporting to authorities (if applicable)</li>
        </ul>
        
        <p>---</p>
        
        <h2>6. Service Plans and Pricing</h2>
        
        <h3>6.1 Subscription Plans</h3>
        
        <p><strong>Free Plan:</strong></p>
        <ul>
        <li>10,000 API calls per month</li>
        <li>Basic features</li>
        <li>Community support</li>
        <li>No credit card required</li>
        </ul>
        
        <p><strong>Pro Plan ($49/month):</strong></p>
        <ul>
        <li>1M API calls per month</li>
        <li>Advanced features</li>
        <li>Email support</li>
        <li>Stripe billing integration</li>
        </ul>
        
        <p><strong>Enterprise Plan (Custom Pricing):</strong></p>
        <ul>
        <li>Unlimited API calls</li>
        <li>Custom features and SLA</li>
        <li>Dedicated support</li>
        <li>Custom contracts</li>
        </ul>
        
        <p><strong>We reserve the right to:</strong></p>
        <ul>
        <li>Change pricing with 30 days notice</li>
        <li>Modify plan features</li>
        <li>Discontinue plans (with 60 days notice)</li>
        </ul>
        
        <h3>6.2 Billing and Payment</h3>
        
        <p><strong>Payment Processing:</strong></p>
        <ul>
        <li>All payments processed through Stripe, Inc.</li>
        <li>We do NOT store credit card information</li>
        <li>Billing handled by Stripe according to your selected plan</li>
        </ul>
        
        <p><strong>Charges:</strong></p>
        <ul>
        <li>Subscription fees charged monthly in advance</li>
        <li>Overage charges (if applicable) billed monthly in arrears</li>
        <li>All fees in USD unless otherwise specified</li>
        <li>Prices exclusive of taxes</li>
        </ul>
        
        <p><strong>Overage:</strong></p>
        <ul>
        <li>Free plan: No overage allowed, service throttled at quota</li>
        <li>Pro plan: $0.10 per 10,000 additional calls (prorated)</li>
        <li>Enterprise: Custom overage rates</li>
        </ul>
        
        <p><strong>Taxes:</strong></p>
        <ul>
        <li>You are responsible for all applicable taxes</li>
        <li>Taxes calculated based on billing address</li>
        <li>Tax-exempt organizations must provide valid exemption certificate</li>
        </ul>
        
        <p><strong>Failed Payments:</strong></p>
        <ul>
        <li>We will retry failed payments up to 3 times</li>
        <li>Account suspended after 3 failed attempts</li>
        <li>Data retained for 30 days after suspension</li>
        <li>Account deleted after 30 days of non-payment</li>
        </ul>
        
        <p><strong>Refunds:</strong></p>
        <ul>
        <li>Beta users: Full refund within 30 days, no questions asked</li>
        <li>Pro plan: Prorated refund for unused time</li>
        <li>Annual plans: Prorated refund within first 30 days</li>
        <li>Overage charges: Non-refundable</li>
        <li>Enterprise: Per contract terms</li>
        </ul>
        
        <p>---</p>
        
        <h2>7. Data and Intellectual Property</h2>
        
        <h3>7.1 Your Data</h3>
        
        <p><strong>Ownership:</strong></p>
        <ul>
        <li>You retain all rights to data you submit to the Service</li>
        <li>We do NOT claim ownership of your usage data</li>
        <li>You grant us a license to process your data to provide the Service</li>
        </ul>
        
        <p><strong>License Grant:</strong></p>
        <p>You grant MNNR a worldwide, non-exclusive, royalty-free license to:</p>
        <ul>
        <li>Store, process, and transmit your data</li>
        <li>Generate analytics and reports</li>
        <li>Create aggregated, anonymized statistics</li>
        <li>Improve the Service using anonymized data</li>
        </ul>
        
        <p><strong>Data Portability:</strong></p>
        <ul>
        <li>You can export your data anytime (JSON/CSV)</li>
        <li>Data export available in dashboard</li>
        <li>API available for programmatic export</li>
        </ul>
        
        <p><strong>Data Deletion:</strong></p>
        <ul>
        <li>You can delete your data anytime</li>
        <li>Account deletion removes all personal data within 30 days</li>
        <li>Anonymized usage statistics may be retained</li>
        </ul>
        
        <h3>7.2 Our Intellectual Property</h3>
        
        <p><strong>MNNR Owns:</strong></p>
        <ul>
        <li>The Service, including all code, designs, and functionality</li>
        <li>MNNR trademark, logo, and branding</li>
        <li>Documentation, guides, and content</li>
        <li>Algorithms, ML models, and proprietary technology</li>
        </ul>
        
        <p><strong>You MAY:</strong></p>
        <ul>
        <li>Use the Service per these Terms</li>
        <li>Reference MNNR in your product (e.g., "Powered by MNNR")</li>
        <li>Link to our website and documentation</li>
        </ul>
        
        <p><strong>You MAY NOT:</strong></p>
        <ul>
        <li>Copy, modify, or create derivative works of the Service</li>
        <li>Reverse engineer, decompile, or disassemble</li>
        <li>Remove copyright or proprietary notices</li>
        <li>Use our name/logo without permission (except as allowed above)</li>
        <li>Claim affiliation or endorsement without written consent</li>
        </ul>
        
        <h3>7.3 Feedback</h3>
        
        <p>If you provide feedback, suggestions, or ideas:</p>
        
        <ul>
        <li>We may use them without obligation to you</li>
        <li>You grant us perpetual, irrevocable rights to implement them</li>
        <li>No compensation is owed for feedback</li>
        <li>Feedback does not create confidential relationship</li>
        </ul>
        
        <p>---</p>
        
        <h2>8. Service Level and Support</h2>
        
        <h3>8.1 Beta Service Level</h3>
        
        <p><strong>During Beta:</strong></p>
        <ul>
        <li>Target 99% uptime (not guaranteed)</li>
        <li>Scheduled maintenance may occur with 24h notice</li>
        <li>Emergency maintenance may occur without notice</li>
        <li>Performance targets are goals, not commitments</li>
        </ul>
        
        <p><strong>Upon General Availability:</strong></p>
        <ul>
        <li>99.9% uptime SLA (Pro and Enterprise)</li>
        <li>Published maintenance windows</li>
        <li>Service credits for downtime (per SLA)</li>
        </ul>
        
        <h3>8.2 Support</h3>
        
        <p><strong>Free Plan:</strong></p>
        <ul>
        <li>Community Discord support</li>
        <li>Documentation and guides</li>
        <li>Email support (best effort, 5-7 day response)</li>
        </ul>
        
        <p><strong>Pro Plan:</strong></p>
        <ul>
        <li>Priority email support (48h response target)</li>
        <li>Access to all documentation</li>
        <li>Feature requests considered</li>
        </ul>
        
        <p><strong>Enterprise:</strong></p>
        <ul>
        <li>Dedicated support team</li>
        <li>Custom SLA and response times</li>
        <li>Direct access to engineering (for critical issues)</li>
        <li>Onboarding and integration assistance</li>
        </ul>
        
        <p><strong>Support Exclusions:</strong></p>
        <ul>
        <li>Custom code or integration development</li>
        <li>Third-party service troubleshooting</li>
        <li>Training for large teams (Enterprise only)</li>
        </ul>
        
        <p>---</p>
        
        <h2>9. Privacy and Data Protection</h2>
        
        <p>Your use of the Service is subject to our Privacy Policy at https://mnnr.app/legal/privacy.</p>
        
        <p><strong>Key Points:</strong></p>
        <ul>
        <li>We do NOT sell your personal information</li>
        <li>Data encrypted in transit and at rest</li>
        <li>GDPR and CCPA compliant practices</li>
        <li>You control your data and can delete it anytime</li>
        </ul>
        
        <p><strong>Data Processing Agreement:</strong></p>
        <ul>
        <li>Enterprise customers may request a DPA</li>
        <li>Standard Contractual Clauses available for EU customers</li>
        <li>Email: dpa@mnnr.app</li>
        </ul>
        
        <p>---</p>
        
        <h2>10. Warranties and Disclaimers</h2>
        
        <h3>10.1 Beta Disclaimer</h3>
        
        <p><strong>THE SERVICE IS PROVIDED "AS IS" DURING BETA.</strong></p>
        
        <p>We make NO warranties, express or implied, including:</p>
        <ul>
        <li>Merchantability</li>
        <li>Fitness for particular purpose</li>
        <li>Non-infringement</li>
        <li>Accuracy or reliability</li>
        <li>Uninterrupted or error-free operation</li>
        </ul>
        
        <h3>10.2 Third-Party Services</h3>
        
        <p>We integrate with third-party services (Stripe, etc.). We are NOT responsible for:</p>
        <ul>
        <li>Third-party service availability</li>
        <li>Third-party terms or pricing changes</li>
        <li>Integration failures</li>
        <li>Third-party data breaches</li>
        </ul>
        
        <p><strong>Your Responsibility:</strong></p>
        <ul>
        <li>Review third-party terms before using integrations</li>
        <li>Maintain separate agreements with third parties</li>
        <li>Monitor third-party service status</li>
        </ul>
        
        <h3>10.3 No Professional Advice</h3>
        
        <p>The Service provides analytics and data, NOT:</p>
        <ul>
        <li>Legal, financial, or tax advice</li>
        <li>Compliance guidance</li>
        <li>Professional consulting</li>
        <li>Guaranteed cost savings</li>
        </ul>
        
        <p>Consult qualified professionals for advice.</p>
        
        <p>---</p>
        
        <h2>11. Limitation of Liability</h2>
        
        <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong></p>
        
        <h3>11.1 Damages Cap</h3>
        
        <p>MNNR's total liability for ANY claim shall NOT exceed:</p>
        <ul>
        <li>The greater of (a) $100 or (b) amounts paid by you in the preceding 12 months</li>
        </ul>
        
        <p>This applies regardless of:</p>
        <ul>
        <li>Legal theory (contract, tort, negligence, etc.)</li>
        <li>Whether we were advised of possibility of damages</li>
        <li>Failure of essential purpose</li>
        </ul>
        
        <h3>11.2 Excluded Damages</h3>
        
        <p>WE ARE NOT LIABLE FOR:</p>
        <ul>
        <li>Indirect, incidental, or consequential damages</li>
        <li>Lost profits, revenue, or business opportunities</li>
        <li>Data loss (beyond our retention obligations)</li>
        <li>Cost of substitute services</li>
        <li>Business interruption</li>
        <li>Reputational harm</li>
        </ul>
        
        <h3>11.3 Exceptions</h3>
        
        <p>Liability limitations do NOT apply to:</p>
        <ul>
        <li>Our gross negligence or willful misconduct</li>
        <li>Death or personal injury caused by us</li>
        <li>Fraud or fraudulent misrepresentation</li>
        <li>Violations of applicable law (where limitations prohibited)</li>
        </ul>
        
        <p>---</p>
        
        <h2>12. Indemnification</h2>
        
        <p>You agree to indemnify, defend, and hold harmless MNNR and its affiliates, officers, employees, and agents from any claims, damages, losses, or expenses (including attorneys' fees) arising from:</p>
        
        <ul>
        <li>Your use or misuse of the Service</li>
        <li>Violation of these Terms</li>
        <li>Violation of third-party rights</li>
        <li>Your data or content</li>
        <li>Negligence or willful misconduct</li>
        </ul>
        
        <p><strong>Process:</strong></p>
        <ul>
        <li>We will notify you promptly of any claim</li>
        <li>You will cooperate in defense</li>
        <li>We may participate in defense at our expense</li>
        <li>You may not settle without our written consent</li>
        </ul>
        
        <p>---</p>
        
        <h2>13. Term and Termination</h2>
        
        <h3>13.1 Term</h3>
        
        <p>These Terms begin when you create an account and continue until terminated.</p>
        
        <h3>13.2 Termination by You</h3>
        
        <p>You may terminate anytime by:</p>
        <ul>
        <li>Deleting your account in dashboard settings</li>
        <li>Emailing: support@mnnr.app</li>
        <li>Ceasing all use of the Service</li>
        </ul>
        
        <p><strong>Effect of Termination:</strong></p>
        <ul>
        <li>Access ends immediately</li>
        <li>Prorated refund for prepaid, unused time (if applicable)</li>
        <li>Data retained for 30 days, then deleted</li>
        <li>API keys immediately revoked</li>
        </ul>
        
        <h3>13.3 Termination by Us</h3>
        
        <p>We may suspend or terminate your account if:</p>
        
        <p><strong>Immediate Termination:</strong></p>
        <ul>
        <li>You violate Acceptable Use Policy</li>
        <li>You engage in illegal activity</li>
        <li>We're required by law</li>
        <li>Your account poses security risk</li>
        </ul>
        
        <p><strong>Termination with Notice:</strong></p>
        <ul>
        <li>Non-payment (after 30 days)</li>
        <li>Repeated Terms violations</li>
        <li>Service discontinuation (60 days notice)</li>
        </ul>
        
        <p><strong>Effect:</strong></p>
        <ul>
        <li>Immediate access termination</li>
        <li>No refund for violations</li>
        <li>Data available for export for 30 days</li>
        <li>Outstanding balances due immediately</li>
        </ul>
        
        <h3>13.4 Survival</h3>
        
        <p>These provisions survive termination:</p>
        <ul>
        <li>Sections 7 (Intellectual Property)</li>
        <li>Section 10 (Disclaimers)</li>
        <li>Section 11 (Limitation of Liability)</li>
        <li>Section 12 (Indemnification)</li>
        <li>Section 15 (Dispute Resolution)</li>
        </ul>
        
        <p>---</p>
        
        <h2>14. Modifications to Service and Terms</h2>
        
        <h3>14.1 Service Changes</h3>
        
        <p>We may:</p>
        <ul>
        <li>Add, modify, or remove features</li>
        <li>Change performance characteristics</li>
        <li>Discontinue the Service (with 60 days notice)</li>
        </ul>
        
        <p><strong>Notice:</strong></p>
        <ul>
        <li>Material changes announced via email</li>
        <li>Posted on website for 30 days</li>
        <li>Beta users: Changes may occur without notice</li>
        </ul>
        
        <h3>14.2 Terms Changes</h3>
        
        <p>We may modify these Terms:</p>
        <ul>
        <li>Changes posted at https://mnnr.app/legal/terms</li>
        <li>"Last Updated" date will change</li>
        <li>Material changes: 30 days email notice</li>
        </ul>
        
        <p><strong>Your Options:</strong></p>
        <ul>
        <li>Continue using = acceptance</li>
        <li>Stop using = termination</li>
        <li>Contact us with concerns</li>
        </ul>
        
        <p>---</p>
        
        <h2>15. Dispute Resolution</h2>
        
        <h3>15.1 Governing Law</h3>
        
        <p>These Terms are governed by the laws of the State of Wyoming, United States, without regard to conflict of law provisions.</p>
        
        <p><strong>Jurisdiction:</strong></p>
        <ul>
        <li>Exclusive jurisdiction: Laramie County, Wyoming</li>
        <li>You consent to personal jurisdiction there</li>
        <li>Venue for all disputes</li>
        </ul>
        
        <h3>15.2 Informal Resolution</h3>
        
        <p>Before formal proceedings, we encourage:</p>
        <ul>
        <li>Contact: legal@mnnr.app</li>
        <li>Good faith negotiation for 30 days</li>
        <li>Describe dispute and desired resolution</li>
        </ul>
        
        <h3>15.3 Arbitration Agreement</h3>
        
        <p><strong>PLEASE READ CAREFULLY - THIS AFFECTS YOUR LEGAL RIGHTS</strong></p>
        
        <p><strong>Binding Arbitration:</strong></p>
        <ul>
        <li>Disputes will be resolved through binding arbitration</li>
        <li>Conducted by American Arbitration Association (AAA)</li>
        <li>AAA Commercial Arbitration Rules apply</li>
        <li>One arbitrator, mutually agreed or AAA-appointed</li>
        <li>Arbitration in Cheyenne, Wyoming</li>
        </ul>
        
        <p><strong>What's Covered:</strong></p>
        <ul>
        <li>All disputes arising from or relating to these Terms</li>
        <li>The Service and your use of it</li>
        <li>Relationship between you and MNNR</li>
        </ul>
        
        <p><strong>Exceptions (Not Arbitrated):</strong></p>
        <ul>
        <li>Small claims court (under $10,000)</li>
        <li>Injunctive relief for IP violations</li>
        <li>Emergency relief (pending arbitration)</li>
        </ul>
        
        <p><strong>Class Action Waiver:</strong></p>
        <ul>
        <li>NO CLASS ACTIONS OR CLASS ARBITRATIONS</li>
        <li>You may only pursue individual claims</li>
        <li>No representative actions on behalf of others</li>
        <li>No consolidation of multiple claims</li>
        </ul>
        
        <p><strong>Costs:</strong></p>
        <ul>
        <li>AAA rules govern arbitration costs</li>
        <li>We pay arbitration fees for claims under $10,000</li>
        <li>Each party pays own attorneys' fees (unless rules provide otherwise)</li>
        </ul>
        
        <p><strong>Opt-Out Right:</strong></p>
        <ul>
        <li>You may opt out within 30 days of account creation</li>
        <li>Email: arbitration-opt-out@mnnr.app</li>
        <li>Include: Name, email, "I opt out of arbitration"</li>
        <li>Opt-out only for your individual account</li>
        </ul>
        
        <h3>15.4 Injunctive Relief</h3>
        
        <p>Either party may seek court injunction for:</p>
        <ul>
        <li>Intellectual property violations</li>
        <li>Confidentiality breaches</li>
        <li>Urgent matters requiring immediate relief</li>
        </ul>
        
        <p>---</p>
        
        <h2>16. General Provisions</h2>
        
        <h3>16.1 Entire Agreement</h3>
        
        <p>These Terms, Privacy Policy, and any order forms constitute the entire agreement and supersede all prior agreements.</p>
        
        <h3>16.2 Waiver</h3>
        
        <p>Failure to enforce any provision does NOT waive our right to enforce it later.</p>
        
        <h3>16.3 Severability</h3>
        
        <p>If any provision is found unenforceable, remaining provisions continue in full force.</p>
        
        <h3>16.4 Assignment</h3>
        
        <p><strong>You:</strong> Cannot assign these Terms without our written consent  </p>
        <p><strong>We:</strong> May assign to affiliates or in connection with merger/acquisition</p>
        
        <h3>16.5 Force Majeure</h3>
        
        <p>We are not liable for delays or failures due to causes beyond reasonable control (natural disasters, war, pandemics, government actions, etc.).</p>
        
        <h3>16.6 Export Controls</h3>
        
        <p>You agree to comply with all export laws. You may not:</p>
        <ul>
        <li>Export the Service to embargoed countries</li>
        <li>Provide access to prohibited parties</li>
        <li>Use for illegal weapons development</li>
        </ul>
        
        <h3>16.7 Government Users</h3>
        
        <p>If you're a US Government entity, the Service is "Commercial Computer Software" under FAR 12.212 and DFARS 227.7202.</p>
        
        <h3>16.8 Independent Contractors</h3>
        
        <p>You and MNNR are independent contractors. No partnership, agency, or employment relationship exists.</p>
        
        <h3>16.9 Notices</h3>
        
        <p><strong>To You:</strong> Via email to address on account  </p>
        <p><strong>To Us:</strong> legal@mnnr.app or MNNR, LLC, 1603 Capitol Ave, Suite 413 PMB #1750, Cheyenne, WY 82001</p>
        
        <p>Notices effective upon sending (email) or receipt (mail).</p>
        
        <h3>16.10 Third-Party Beneficiaries</h3>
        
        <p>No third-party beneficiaries to these Terms except as explicitly stated.</p>
        
        <p>---</p>
        
        <h2>17. Contact Information</h2>
        
        <p><strong>Questions about these Terms?</strong></p>
        
        <p>Email: legal@mnnr.app  </p>
        <p>Phone: (252) 242-0710  </p>
        <p>Support: support@mnnr.app  </p>
        
        <p><strong>Mailing Address:</strong>  </p>
        <p>MNNR, LLC  </p>
        <p>1603 Capitol Ave, Suite 413 PMB #1750  </p>
        <p>Cheyenne, WY 82001</p>
        
        <p><strong>Business Hours:</strong> Monday-Friday, 9am-5pm PT  </p>
        <p><strong>Response Time:</strong> 5 business days</p>
        
        <p>---</p>
        
        <h2>18. Acknowledgment</h2>
        
        <p>By clicking "I agree," creating an account, or using the Service, you acknowledge that:</p>
        
        <ul>
        <li>You have read and understand these Terms</li>
        <li>You agree to be bound by these Terms</li>
        <li>You have authority to enter into this agreement</li>
        <li>You are at least 18 years old (or 16 with parental consent in EU)</li>
        </ul>
        
        <p><strong>Beta Acknowledgment:</strong></p>
        <ul>
        <li>You understand this is a beta service</li>
        <li>You accept risks associated with beta software</li>
        <li>You will not use for mission-critical systems without backup plans</li>
        </ul>
        
        <p>---</p>
        
        <p><strong>Last Updated:</strong> January 9, 2026</p>
        
        <p>---</p>
        
        <p>*These Terms of Service are binding as of the Effective Date. Continued use of the Service after changes constitutes acceptance of modified Terms.*</p>
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
