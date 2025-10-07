export const metadata = {
  title: 'Terms of Service | MNNR.APP',
  description: 'Terms of Service for MNNR - AI-Powered Pilot Recruiting Platform'
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

      <p className="text-sm text-gray-600 mb-8">
        <strong>Last Updated:</strong> October 6, 2025<br />
        <strong>Effective Date:</strong> October 10, 2025
      </p>

      <div className="prose prose-lg max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>
          Welcome to MNNR ("Service," "we," "us," or "our"). By accessing or using mnnr.app (the "Platform"),
          you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.
        </p>

        <h2>2. Service Description</h2>
        <p>
          MNNR is an AI-powered pilot recruiting platform that connects aviation professionals with operators.
          We provide tools for pilot applications, operator subscriptions, and recruitment management.
        </p>

        <h3>2.1 Preview Access</h3>
        <p>
          The Service is currently in preview/beta mode. Features may change, and availability is not guaranteed.
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
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities under your account</li>
          <li>Notifying us immediately of unauthorized access</li>
        </ul>

        <h3>4.2 Account Types</h3>
        <ul>
          <li><strong>Pilots:</strong> Individual aviation professionals seeking positions</li>
          <li><strong>Operators:</strong> Organizations with paid subscriptions to access pilot pool</li>
        </ul>

        <h2>5. Subscription and Payments</h2>

        <h3>5.1 Operator Subscriptions</h3>
        <p>Operators must maintain an active paid subscription to access certain features, including:</p>
        <ul>
          <li>Pilot database access</li>
          <li>Application management</li>
          <li>Contact information</li>
        </ul>

        <h3>5.2 Billing</h3>
        <ul>
          <li>Subscriptions are billed monthly or annually in advance</li>
          <li>Prices are listed in USD</li>
          <li>Automatic renewal unless cancelled</li>
          <li>Payments processed securely through Stripe</li>
        </ul>

        <h3>5.3 Refund Policy</h3>
        <ul>
          <li><strong>Preview Access:</strong> 30-day money-back guarantee (no questions asked)</li>
          <li><strong>General:</strong> Prorated refunds within first 14 days of new subscription</li>
          <li><strong>Renewals:</strong> No refunds after renewal (cancel before renewal date)</li>
          <li><strong>Requests:</strong> Email <a href="mailto:billing@mnnr.app">billing@mnnr.app</a></li>
        </ul>

        <h3>5.4 Cancellation</h3>
        <p>
          You may cancel your subscription anytime. Access continues until the end of the current billing period.
          No prorated refunds for mid-cycle cancellations.
        </p>

        <h2>6. User Content and Conduct</h2>

        <h3>6.1 Your Content</h3>
        <p>
          You retain ownership of content you submit (resumes, profiles, messages). By submitting content, you grant us
          a license to use, store, and display it as necessary to provide the Service.
        </p>

        <h3>6.2 Prohibited Conduct</h3>
        <p>You agree NOT to:</p>
        <ul>
          <li>Provide false or misleading information</li>
          <li>Impersonate others or misrepresent affiliation</li>
          <li>Violate laws or regulations</li>
          <li>Harass, threaten, or discriminate against others</li>
          <li>Scrape, data mine, or automate access without permission</li>
          <li>Reverse engineer or attempt to access source code</li>
          <li>Upload malware, viruses, or harmful code</li>
          <li>Interfere with Service operation or security</li>
          <li>Use the Service for unauthorized recruiting (operators only)</li>
        </ul>

        <h3>6.3 Content Standards</h3>
        <p>All content must be:</p>
        <ul>
          <li>Accurate and truthful</li>
          <li>Professional and appropriate</li>
          <li>Free of discrimination or harassment</li>
          <li>Compliant with aviation industry standards</li>
        </ul>

        <h2>7. Intellectual Property</h2>

        <h3>7.1 Our Rights</h3>
        <p>
          MNNR owns all rights to the Platform, including trademarks, copyrights, trade secrets, and patents.
          You may not copy, modify, distribute, or create derivative works without our permission.
        </p>

        <h3>7.2 Limited License</h3>
        <p>
          We grant you a limited, non-exclusive, non-transferable license to access and use the Service
          for its intended purpose, subject to these Terms.
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

        <h3>9.2 No Employment Guarantee</h3>
        <p>
          We do not guarantee that pilots will find positions or that operators will find qualified pilots.
          We facilitate connections but do not participate in hiring decisions.
        </p>

        <h3>9.3 Third-Party Services</h3>
        <p>
          We integrate with third parties (Stripe, Supabase, etc.). We are not responsible for their services,
          availability, or data practices.
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
          <li>Your content or conduct</li>
        </ul>

        <h2>11. Termination</h2>

        <h3>11.1 By You</h3>
        <p>You may terminate your account anytime by emailing <a href="mailto:support@mnnr.app">support@mnnr.app</a></p>

        <h3>11.2 By Us</h3>
        <p>We may suspend or terminate your account if you:</p>
        <ul>
          <li>Violate these Terms</li>
          <li>Engage in fraudulent or harmful conduct</li>
          <li>Fail to pay (for operators)</li>
          <li>Request account deletion</li>
        </ul>

        <h3>11.3 Effect of Termination</h3>
        <ul>
          <li>Access to the Service immediately ceases</li>
          <li>No refunds for prepaid subscriptions (except as specified in Refund Policy)</li>
          <li>Your content may be deleted (we may retain backups as legally required)</li>
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

        <h3>14.5 Force Majeure</h3>
        <p>
          We are not liable for delays or failures due to circumstances beyond our reasonable control
          (natural disasters, war, cyberattacks, etc.).
        </p>

        <h2>15. Contact Information</h2>
        <p>For questions about these Terms, contact:</p>
        <ul>
          <li><strong>General:</strong> <a href="mailto:contact@mnnr.app">contact@mnnr.app</a></li>
          <li><strong>Legal:</strong> <a href="mailto:legal@mnnr.app">legal@mnnr.app</a></li>
          <li><strong>Support:</strong> <a href="mailto:support@mnnr.app">support@mnnr.app</a></li>
        </ul>

        <h2>16. Preview Access Terms</h2>
        <p>
          <strong>Founding Members & Preview Users:</strong>
        </p>
        <ul>
          <li>Limited to first 100 signups</li>
          <li>Discounted pricing locked in for lifetime (if applicable)</li>
          <li>Early access to new features</li>
          <li>Direct feedback channel to product team</li>
          <li>Recognition as founding member (optional)</li>
        </ul>
        <p>
          Preview access may include bugs or incomplete features. Your feedback helps shape the product!
        </p>

        <hr className="my-8" />

        <p className="text-sm text-gray-600">
          By clicking "I Agree" or by using MNNR, you acknowledge that you have read, understood,
          and agree to be bound by these Terms of Service.
        </p>
      </div>
    </div>
  );
}
