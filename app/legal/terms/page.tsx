import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | MNNR',
  description: 'Terms of Service for MNNR - Billing Infrastructure for the Machine Economy'
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-emerald-400 text-sm">📜 Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-white/50">
            <strong>Last Updated:</strong> December 28, 2025<br />
            <strong>Effective Date:</strong> January 1, 2026
          </p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-white/70 prose-li:text-white/70 prose-a:text-emerald-400 prose-strong:text-white">
          <h2>1. Acceptance of Terms</h2>
          <p>
            Welcome to MNNR ("Service," "we," "us," or "our"). By accessing or using mnnr.app (the "Platform"),
            you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.
          </p>

          <h2>2. Service Description</h2>
          <p>
            MNNR is billing infrastructure for the machine economy. We provide real-time usage tracking, 
            programmable billing, API key management, distributed rate limiting, and payment collection 
            for AI agents, IoT devices, autonomous systems, and any software that needs to monetize.
          </p>

          <h3>2.1 Beta Access</h3>
          <p>
            The Service is currently in public beta. Features may change, and availability is not guaranteed.
            We appreciate your feedback to improve the platform.
          </p>

          <h2>3. Eligibility</h2>
          <p>You must be:</p>
          <ul>
            <li>At least 18 years old</li>
            <li>Legally able to enter into binding contracts</li>
            <li>Not prohibited from using the Service under applicable laws</li>
          </ul>

          <h2>4. User Accounts</h2>

          <h3>4.1 Account Creation</h3>
          <p>You must provide accurate, complete information when creating an account. You are responsible for:</p>
          <ul>
            <li>Maintaining the confidentiality of your API keys and account credentials</li>
            <li>All activities under your account</li>
            <li>Notifying us immediately of unauthorized access</li>
          </ul>

          <h3>4.2 API Keys</h3>
          <p>
            API keys are sensitive credentials. You are solely responsible for securing your API keys 
            and any usage that occurs through them. We recommend rotating keys regularly and using 
            scoped permissions.
          </p>

          <h2>5. Subscription and Payments</h2>

          <h3>5.1 Plans</h3>
          <ul>
            <li><strong>Free Tier:</strong> 10,000 API calls per month, no credit card required</li>
            <li><strong>Pro:</strong> $49/month with 1M API calls included</li>
            <li><strong>Enterprise:</strong> Custom pricing and limits</li>
          </ul>

          <h3>5.2 Billing</h3>
          <ul>
            <li>Subscriptions are billed monthly or annually in advance</li>
            <li>Prices are listed in USD</li>
            <li>Automatic renewal unless cancelled</li>
            <li>Payments processed securely through Stripe</li>
            <li>Overage billed at plan-specific rates</li>
          </ul>

          <h3>5.3 Refund Policy</h3>
          <ul>
            <li><strong>Annual Plans:</strong> 30-day money-back guarantee, no questions asked</li>
            <li><strong>Monthly Plans:</strong> Cancel anytime, no refunds for partial months</li>
            <li><strong>Prepaid Credits:</strong> Refundable within 60 days if unused</li>
            <li><strong>Requests:</strong> Email <a href="mailto:billing@mnnr.app">billing@mnnr.app</a></li>
          </ul>

          <h3>5.4 Cancellation</h3>
          <p>
            You may cancel your subscription anytime. Access continues until the end of the current billing period.
            No prorated refunds for mid-cycle cancellations on monthly plans.
          </p>

          <h2>6. Acceptable Use</h2>

          <h3>6.1 Permitted Use</h3>
          <p>
            You may use MNNR to track usage, manage billing, and collect payments for your applications, 
            AI agents, IoT devices, and autonomous systems.
          </p>

          <h3>6.2 Prohibited Conduct</h3>
          <p>You agree NOT to:</p>
          <ul>
            <li>Use the Service for illegal activities</li>
            <li>Attempt to circumvent rate limits or usage tracking</li>
            <li>Share API keys publicly or with unauthorized parties</li>
            <li>Reverse engineer or attempt to access source code</li>
            <li>Upload malware, viruses, or harmful code</li>
            <li>Interfere with Service operation or security</li>
            <li>Use the Service to process payments for prohibited goods/services</li>
            <li>Resell access to the Service without authorization</li>
          </ul>

          <h2>7. Intellectual Property</h2>

          <h3>7.1 Our Rights</h3>
          <p>
            MNNR owns all rights to the Platform, including trademarks, copyrights, trade secrets, and patents.
            You may not copy, modify, distribute, or create derivative works without our permission.
          </p>

          <h3>7.2 Your Data</h3>
          <p>
            You retain ownership of your data. We only access your data to provide the Service and as 
            described in our Privacy Policy.
          </p>

          <h2>8. Privacy and Data</h2>
          <p>
            Your use of the Service is governed by our <a href="/legal/privacy">Privacy Policy</a>, which is
            incorporated into these Terms.
          </p>

          <h2>9. Disclaimers and Limitations</h2>

          <h3>9.1 "As Is" Service</h3>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
            INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </p>

          <h3>9.2 Uptime</h3>
          <p>
            While we target 99.99% uptime, we do not guarantee uninterrupted service. Planned maintenance 
            will be communicated in advance when possible.
          </p>

          <h3>9.3 Third-Party Services</h3>
          <p>
            We integrate with third parties (Stripe, cloud providers, etc.). We are not responsible for their 
            services, availability, or data practices.
          </p>

          <h3>9.4 Limitation of Liability</h3>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, MNNR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
            CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA, OR OPPORTUNITIES, EVEN IF ADVISED OF
            THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p>
            OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM,
            OR $100, WHICHEVER IS GREATER.
          </p>

          <h2>10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless MNNR, its officers, employees, and partners from any claims,
            damages, or expenses arising from:
          </p>
          <ul>
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of others</li>
            <li>Your end users' activities</li>
          </ul>

          <h2>11. Termination</h2>

          <h3>11.1 By You</h3>
          <p>You may terminate your account anytime from your dashboard or by emailing <a href="mailto:support@mnnr.app">support@mnnr.app</a></p>

          <h3>11.2 By Us</h3>
          <p>We may suspend or terminate your account if you:</p>
          <ul>
            <li>Violate these Terms</li>
            <li>Engage in fraudulent or harmful conduct</li>
            <li>Fail to pay (for paid plans)</li>
            <li>Request account deletion</li>
          </ul>

          <h3>11.3 Effect of Termination</h3>
          <ul>
            <li>Access to the Service immediately ceases</li>
            <li>API keys are revoked</li>
            <li>Your data may be deleted after 30 days (we may retain backups as legally required)</li>
          </ul>

          <h2>12. Dispute Resolution</h2>

          <h3>12.1 Informal Resolution</h3>
          <p>
            Before filing a claim, contact <a href="mailto:legal@mnnr.app">legal@mnnr.app</a> to resolve disputes informally.
            We commit to good-faith negotiations for 60 days.
          </p>

          <h3>12.2 Arbitration Agreement</h3>
          <p>
            Any disputes that cannot be resolved informally shall be resolved by binding arbitration in accordance with
            the American Arbitration Association's rules. You waive your right to a jury trial or class action.
          </p>

          <h3>12.3 Governing Law</h3>
          <p>
            These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict of law principles.
          </p>

          <h2>13. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will notify you of significant changes via email or prominent notice.
            Continued use after changes constitutes acceptance. If you disagree, you must stop using the Service.
          </p>

          <h2>14. General Provisions</h2>

          <h3>14.1 Entire Agreement</h3>
          <p>These Terms constitute the entire agreement between you and MNNR regarding the Service.</p>

          <h3>14.2 Severability</h3>
          <p>If any provision is found unenforceable, the remaining provisions remain in effect.</p>

          <h3>14.3 No Waiver</h3>
          <p>Our failure to enforce any right or provision does not constitute a waiver.</p>

          <h3>14.4 Assignment</h3>
          <p>You may not assign these Terms. We may assign them without notice (e.g., in a merger or acquisition).</p>

          <h2>15. Contact Information</h2>
          <p>For questions about these Terms, contact:</p>
          <ul>
            <li><strong>General:</strong> <a href="mailto:contact@mnnr.app">contact@mnnr.app</a></li>
            <li><strong>Legal:</strong> <a href="mailto:legal@mnnr.app">legal@mnnr.app</a></li>
            <li><strong>Support:</strong> <a href="mailto:support@mnnr.app">support@mnnr.app</a></li>
          </ul>

          <hr className="border-white/10 my-8" />

          <p className="text-sm text-white/40">
            By using MNNR, you acknowledge that you have read, understood,
            and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
