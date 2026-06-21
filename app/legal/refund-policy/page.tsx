import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | MNNR',
  description: 'Refund policy for MNNR, LLC: A50 Emergency Retrofit SKU and EU Pilot Partner subscription refund terms.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a href="/" className="text-2xl font-bold text-blue-600">MNNR</a>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-12 prose prose-lg prose-slate max-w-none">
        <h1>Refund Policy</h1>
        <p><em>Last updated: 2026-06-21. Operator: MNNR, LLC.</em></p>

        <h2>1. Scope</h2>
        <p>This Refund Policy applies to all purchases of MNNR products and services, including the A50 Emergency Retrofit SKU (EUR 15,000 flat), the EU Pilot Partner subscription (EUR 5,000 per month), and any other SKU published on mnnr.app or specified in an Order Form. This Policy is incorporated by reference into the <a href="/legal/terms">Terms of Service</a>.</p>

        <h2>2. A50 Emergency Retrofit SKU &mdash; EUR 15,000 flat</h2>
        <ul>
          <li><strong>Pre-scoping refund (full).</strong> If, after the one-hour scoping call, MNNR or Customer determines in good faith that the engagement is a fit-mismatch, Customer is entitled to a full refund of the EUR 15,000 fee, processed within ten (10) business days to the original payment method.</li>
          <li><strong>Post-scoping refund (pro-rated).</strong> If Customer cancels after the scoping call but before MNNR&apos;s commencement of the three-hour technical integration call, Customer is entitled to a refund of EUR 13,500 (EUR 1,500 retained for completed scoping work).</li>
          <li><strong>Post-integration refund (limited).</strong> Once the technical integration call has commenced, the engagement is non-refundable except for MNNR&apos;s material uncured breach as defined in Section 13 of the Terms of Service.</li>
          <li><strong>Failure-to-deploy guarantee.</strong> If MNNR fails to deliver a working A50 self-identification integration within five (5) business days from completion of the technical integration call (delays caused by Customer excluded), Customer may elect either (a) a full refund or (b) continued engagement until completion at no additional fee.</li>
        </ul>

        <h2>3. EU Pilot Partner subscription &mdash; EUR 5,000 per month</h2>
        <ul>
          <li><strong>First 30 days.</strong> Pro-rated refund on written request, less EUR 1,000 onboarding cost.</li>
          <li><strong>After day 30.</strong> Non-refundable for the then-current monthly period. Customer may cancel future periods with thirty (30) days&apos; notice.</li>
          <li><strong>SLA credits.</strong> Service-credit remedies under the Service Level Agreement are separate from this Refund Policy and apply per the SLA when published.</li>
        </ul>

        <h2>4. How to request a refund</h2>
        <p>Email <a href="mailto:legal@mnnr.app">legal@mnnr.app</a> (or <a href="mailto:billing@mnnr.app">billing@mnnr.app</a> when provisioned) with (a) Customer name, (b) Stripe receipt number or invoice number, (c) SKU purchased, (d) date of purchase, and (e) brief reason. We acknowledge within two (2) business days and process eligible refunds within ten (10) business days to the original payment method. Refunds are issued in the original currency.</p>

        <h2>5. Chargebacks</h2>
        <p>Customer agrees to contact MNNR at <a href="mailto:legal@mnnr.app">legal@mnnr.app</a> before initiating a chargeback with its card issuer or bank. Chargebacks initiated without prior contact may, at MNNR&apos;s discretion, result in suspension or termination of the Service under Section 13 of the Terms of Service and recovery of associated chargeback fees.</p>

        <h2>6. EU/EEA consumer right of withdrawal</h2>
        <p>MNNR is a B2B service and does not provide services to consumers within the meaning of Directive 2011/83/EU. The fourteen-day consumer right of withdrawal does not apply. If a Customer&apos;s representative purports to purchase as a consumer, MNNR may, in its discretion, void the purchase and refund in full.</p>

        <h2>7. Contact</h2>
        <p>MNNR, LLC<br/>
        1603 Capitol Ave, Suite 413 PMB #1750<br/>
        Cheyenne, WY 82001<br/>
        Email: <a href="mailto:legal@mnnr.app">legal@mnnr.app</a></p>
      </article>
    </div>
  );
}
