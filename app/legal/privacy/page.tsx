export const metadata = {
  title: 'Privacy Policy | MNNR.APP',
  description: 'Privacy Policy for MNNR - AI-Powered Pilot Recruiting Platform'
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <p className="text-sm text-gray-600 mb-8">
        <strong>Last Updated:</strong> October 6, 2025<br />
        <strong>Effective Date:</strong> October 10, 2025
      </p>

      <div className="prose prose-lg max-w-none">
        <h2>1. Introduction</h2>
        <p>
          MNNR (“we,” “us,” or “our”) operates the mnnr.app website and platform (the “Service”).
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information
          when you use our Service.
        </p>

        <h2>2. Information We Collect</h2>

        <h3>2.1 Information You Provide</h3>
        <ul>
          <li><strong>Account Information:</strong> Email address, name, company information</li>
          <li><strong>Profile Information:</strong> Job preferences, aviation credentials, experience</li>
          <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store full credit card details)</li>
          <li><strong>Communications:</strong> Messages sent through our platform, support requests</li>
        </ul>

        <h3>2.2 Information Collected Automatically</h3>
        <ul>
          <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
          <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
          <li><strong>Cookies:</strong> Authentication tokens, preferences, analytics (see Cookie Policy)</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Provide and improve our Service</li>
          <li>Process payments and subscriptions</li>
          <li>Send service-related communications</li>
          <li>Match pilots with operators (core service function)</li>
          <li>Analyze usage patterns to improve user experience</li>
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
          <li><strong>Analytics Providers:</strong> Usage analytics (anonymized)</li>
        </ul>

        <h3>4.2 With Your Consent</h3>
        <p>
          When you apply to pilot positions, we share your profile information with the hiring operators.
          You control which information is visible in your profile settings.
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
          <li>Encryption in transit (TLS/SSL) and at rest</li>
          <li>Row-level security policies on databases</li>
          <li>Regular security audits and monitoring</li>
          <li>Access controls and authentication</li>
          <li>Incident response procedures</li>
        </ul>
        <p>
          <em>No method of transmission over the Internet is 100% secure. While we strive to protect
          your data, we cannot guarantee absolute security.</em>
        </p>

        <h2>6. Your Rights and Choices</h2>

        <h3>6.1 Access and Correction</h3>
        <p>You can access and update your account information through your profile settings.</p>

        <h3>6.2 Data Deletion</h3>
        <p>
          You may request deletion of your account by contacting <a href="mailto:privacy@mnnr.app">privacy@mnnr.app</a>.
          We will retain certain information as required by law or for legitimate business purposes.
        </p>

        <h3>6.3 Marketing Communications</h3>
        <p>You can opt out of marketing emails via the unsubscribe link. We will still send service-related emails.</p>

        <h3>6.4 Cookies</h3>
        <p>You can control cookies through your browser settings. Some features may not work if cookies are disabled.</p>

        <h2>7. Data Retention</h2>
        <p>We retain your information for as long as:</p>
        <ul>
          <li>Your account is active</li>
          <li>Needed to provide the Service</li>
          <li>Required by law (tax records, financial transactions)</li>
          <li>Necessary to resolve disputes or enforce agreements</li>
        </ul>
        <p>Audit logs and security records are retained for 90 days.</p>

        <h2>8. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in the United States and other countries
          where our service providers operate. We ensure appropriate safeguards are in place.
        </p>

        <h2>9. Children’s Privacy</h2>
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
          <li><strong>Right to Know:</strong> What personal information we collect and how it’s used</li>
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

        <hr className="my-8" />

        <p className="text-sm text-gray-600">
          This Privacy Policy is part of our Terms of Service. By using MNNR, you agree to this Privacy Policy.
        </p>
      </div>
    </div>
  );
}
