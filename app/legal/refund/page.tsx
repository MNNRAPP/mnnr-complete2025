/* eslint-disable react/no-unescaped-entities */
// Legal text intentionally keeps standard punctuation for readability.

export const metadata = {
  title: 'Refund Policy | MNNR.APP',
  description: 'Refund and cancellation policy for MNNR subscriptions and services'
};

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>

      <p className="text-sm text-gray-600 mb-8">
        <strong>Last Updated:</strong> October 6, 2025
      </p>

      <div className="prose prose-lg max-w-none">
        <h2>1. Overview</h2>
        <p>
          MNNR subscriptions are designed to provide immediate access to pilot recruiting tools, secure
          data integrations, and premium support. Because value is delivered at signup, refunds are
          limited to the situations described below.
        </p>

        <h2>2. Eligibility for Refunds</h2>
        <ul>
          <li>
            <strong>Duplicate charges:</strong> If you were accidentally billed more than once for the
            same subscription period, contact us within 14 days and we will reverse the duplicate
            charge.
          </li>
          <li>
            <strong>Service outages:</strong> If platform downtime exceeds 24 consecutive hours outside of
            scheduled maintenance windows, you may request a pro-rated credit for the affected billing
            period.
          </li>
          <li>
            <strong>Onboarding guarantee:</strong> If you complete the onboarding checklist within 30 days
            and the core features outlined in your plan are not available, we will refund your most
            recent payment.
          </li>
        </ul>

        <h2>3. Non-Refundable Items</h2>
        <ul>
          <li>Completed consulting or implementation services</li>
          <li>Third-party fees (for example, Stripe processing costs)</li>
          <li>Usage-based charges that were already incurred before cancellation</li>
        </ul>

        <h2>4. Cancellation Policy</h2>
        <p>
          You can cancel your subscription at any time from the billing dashboard. Cancellation stops
          future renewals but does not issue an automatic refund for prior charges unless one of the
          eligibility criteria above is met.
        </p>

        <h2>5. How to Request a Refund</h2>
        <ol>
          <li>Email <a href="mailto:billing@mnnr.app">billing@mnnr.app</a> from your account address.</li>
          <li>Include your workspace name, recent invoice ID, and reason for the request.</li>
          <li>Attach any supporting evidence (for example, duplicate receipt, uptime log).</li>
        </ol>
        <p>
          We review refund requests within five business days. Approved refunds are issued back to the
          original payment method.
        </p>

        <h2>6. Chargebacks</h2>
        <p>
          Filing a chargeback without contacting MNNR first may result in immediate suspension of your
          account and loss of access to pilot data. We work directly with Stripe to resolve disputes and
          can typically address billing concerns faster when you reach out to us first.
        </p>

        <h2>7. Contact</h2>
        <p>
          Questions about this policy? Reach our billing team at{' '}
          <a href="mailto:billing@mnnr.app">billing@mnnr.app</a>.
        </p>
      </div>
    </div>
  );
}
