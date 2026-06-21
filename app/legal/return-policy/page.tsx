import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund and Return Policy | MNNR',
  description: 'Refund and return policy for MNNR, LLC - Software services, professional services, and digital deliverables.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a href="/" className="text-2xl font-bold text-blue-600">MNNR</a>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-12 prose prose-lg prose-slate max-w-none">
        <h1>Refund and Return Policy</h1>
        <p><strong>Last Updated:</strong> June 20, 2026</p>
        <p><strong>Effective Date:</strong> June 20, 2026</p>

        <hr />

        <h2>1. Scope</h2>
        <p>This Refund and Return Policy applies to all purchases made from MNNR, LLC ("MNNR," "we," "our," or "us"), a Wyoming limited liability company, EIN 33-3678186, registered office at 1603 Capitol Ave, Suite 413 PMB #1750, Cheyenne, WY 82001. It covers digital deliverables, professional services, software subscriptions, and one-time service-level SKUs offered at <a href="https://mnnr.app">https://mnnr.app</a>.</p>
        <p>MNNR does not ship physical goods. See our <a href="/legal/shipping-policy">Service Delivery Policy</a> for delivery terms on digital and service-based offerings.</p>

        <h2>2. Pre-Engagement Scoping — Money-Back Guarantee</h2>
        <p>For one-time professional-service SKUs purchased via Stripe-hosted checkout (including but not limited to the "A50 Five-Day Scoping Engagement"), MNNR offers a full refund if, during the initial scoping call (typically held within five business days of purchase), MNNR or the customer reasonably concludes that there is a material fit-mismatch between the customer's requirements and what MNNR is positioned to deliver.</p>
        <p>To request a fit-mismatch refund, contact <a href="mailto:legal@mnnr.app">legal@mnnr.app</a> within seven (7) calendar days of the scoping call. Refunds are processed to the original payment method within ten (10) business days of acknowledgment.</p>

        <h2>3. Refunds After Work Has Commenced</h2>
        <p>Once MNNR has begun substantive work on a professional-services engagement (defined as any deliverable other than the initial scoping call), refunds are pro-rated based on the work performed, calculated in good faith by MNNR with reference to the deliverable milestones agreed in the engagement statement of work.</p>
        <p>If the customer disputes the pro-ration calculation, MNNR will provide a line-item time and materials report within ten (10) business days. Disputes are governed by Section 11 of our <a href="/legal/terms">Terms of Service</a>.</p>

        <h2>4. Software Subscriptions</h2>
        <p>Monthly subscriptions to the MNNR usage analytics and authorization platform may be cancelled at any time. Cancellation takes effect at the end of the then-current billing period. MNNR does not pro-rate monthly subscription refunds for partial-period cancellation, except where required by applicable consumer-protection law.</p>
        <p>Annual subscriptions paid in advance are refundable on a pro-rated basis, less a 15% administrative fee, if cancelled within 30 days of the initial subscription start date. After 30 days, annual subscriptions are non-refundable but may be cancelled to prevent auto-renewal.</p>

        <h2>5. Digital Deliverables (Reports, Briefs, Attestations)</h2>
        <p>One-time downloadable deliverables (compliance briefs, signed attestation packets, custom regulatory framework reports) are non-refundable once delivered to the customer, except where:</p>
        <ul>
          <li>The deliverable materially fails to match the written specification in the order, in which case MNNR will, at its option, re-deliver a corrected version or refund the purchase price; or</li>
          <li>Required by applicable consumer-protection law (for example, EU Distance Selling Directive 2011/83/EU rights of withdrawal for consumers, where applicable).</li>
        </ul>

        <h2>6. Chargebacks</h2>
        <p>If a customer initiates a chargeback through their card issuer prior to first contacting MNNR support at <a href="mailto:legal@mnnr.app">legal@mnnr.app</a>, MNNR reserves the right to suspend the customer's account and contest the chargeback with the relevant payment processor.</p>

        <h2>7. How to Request a Refund</h2>
        <p>Send a written refund request to <a href="mailto:legal@mnnr.app">legal@mnnr.app</a> including:</p>
        <ul>
          <li>The Stripe transaction ID or invoice number;</li>
          <li>The product or service purchased;</li>
          <li>The date of purchase;</li>
          <li>The reason for the refund request.</li>
        </ul>
        <p>MNNR will acknowledge receipt within two (2) business days and issue a decision within ten (10) business days.</p>

        <h2>8. Not Legal Advice</h2>
        <p>The deliverables MNNR provides (including compliance briefs, signed attestation packets, and regulatory framework reports) are software outputs and informational artifacts. They do not constitute legal advice. MNNR is a software vendor, not a law firm. Customers should consult licensed counsel in the relevant jurisdiction before relying on any MNNR deliverable for regulatory or legal compliance purposes. The availability of a refund under this policy does not constitute an admission by MNNR of any defect, deficiency, or liability with respect to any deliverable.</p>

        <h2>9. Governing Law and Jurisdiction</h2>
        <p>This Refund and Return Policy is governed by the laws of the State of Wyoming, United States, without regard to its conflict-of-laws principles, except where the mandatory consumer-protection law of the customer's domicile provides otherwise. For European Union and United Kingdom customers, this policy is read together with the consumer-rights protections of EU Directive 2011/83/EU and the UK Consumer Rights Act 2015, as applicable.</p>

        <h2>10. Changes to This Policy</h2>
        <p>MNNR may update this Refund and Return Policy from time to time. Material changes will be communicated to active customers by email at least 30 days prior to taking effect. The version in effect on the date of purchase governs that purchase.</p>

        <h2>11. Contact</h2>
        <p>MNNR, LLC<br/>
        1603 Capitol Ave, Suite 413 PMB #1750<br/>
        Cheyenne, WY 82001<br/>
        Email: <a href="mailto:legal@mnnr.app">legal@mnnr.app</a></p>
      </article>
    </div>
  );
}
