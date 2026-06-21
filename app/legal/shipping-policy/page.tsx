import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Service Delivery Policy | MNNR',
  description: 'Service delivery policy for MNNR, LLC - Digital services and professional services delivery terms.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a href="/" className="text-2xl font-bold text-blue-600">MNNR</a>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-12 prose prose-lg prose-slate max-w-none">
        <h1>Service Delivery Policy</h1>
        <p><strong>Last Updated:</strong> June 20, 2026</p>
        <p><strong>Effective Date:</strong> June 20, 2026</p>

        <hr />

        <h2>1. No Physical Shipping</h2>
        <p>MNNR, LLC ("MNNR," "we," "our," or "us"), a Wyoming limited liability company (EIN 33-3678186, registered office at 1603 Capitol Ave, Suite 413 PMB #1750, Cheyenne, WY 82001), does not sell or ship physical goods. All MNNR offerings are digital products, software services, or professional services delivered electronically.</p>
        <p>This Service Delivery Policy describes how MNNR delivers each category of offering and the timelines a customer should expect.</p>

        <h2>2. Software Subscriptions (MNNR Usage Analytics and Authorization Platform)</h2>
        <p><strong>Activation:</strong> Subscription access is provisioned within five (5) minutes of payment confirmation. Activation is fully automated. The customer receives an email at the address provided during checkout containing sign-in instructions, API key issuance flow, and a link to the MNNR dashboard.</p>
        <p><strong>Service availability target:</strong> 99.5% monthly uptime, measured at the customer-facing API endpoint. Planned maintenance windows are announced at least 48 hours in advance via the MNNR status page. See our <a href="/legal/terms">Terms of Service</a> for the complete service-level commitment.</p>

        <h2>3. Digital Deliverables (Reports, Briefs, Attestation Packets)</h2>
        <p>One-time digital deliverables (compliance briefs, signed attestation packets, custom regulatory framework reports) are delivered:</p>
        <ul>
          <li>By secure download link sent to the customer email of record; OR</li>
          <li>By upload to a customer-designated secure storage location (S3-compatible, Google Drive, SharePoint, or similar), at MNNR's reasonable discretion based on the deliverable type and customer preference.</li>
        </ul>
        <p>Delivery timing for digital deliverables is specified in the relevant product listing or statement of work. Where no timing is specified, MNNR will deliver within ten (10) business days of payment confirmation.</p>

        <h2>4. Professional Services (A50 Scoping Engagement, Pilot Engagements, Custom Work)</h2>
        <p><strong>A50 Five-Day Scoping Engagement:</strong> Within two (2) business days of payment confirmation, MNNR will contact the customer to schedule the initial scoping call. The scoping call will be held within five (5) business days of payment confirmation, subject to mutual calendar availability. Written scoping outcomes will be delivered within three (3) business days of the call.</p>
        <p><strong>Pilot engagements:</strong> Pilot engagement timelines are specified in the engagement statement of work, signed by both parties before work commences.</p>
        <p><strong>Custom work:</strong> Custom engagements are governed by a separate statement of work that includes scope, timeline, deliverables, milestones, and payment terms.</p>

        <h2>5. Delivery Confirmation</h2>
        <p>Software subscription activation is confirmed by the activation email. Digital deliverable delivery is confirmed by the delivery email containing the secure download link or by a delivery confirmation message sent to the customer's email of record. Professional services delivery is confirmed by the customer's written or verbal acknowledgment at the conclusion of the engagement.</p>
        <p>If a customer does not receive expected delivery within the timeframes specified above, the customer should contact <a href="mailto:legal@mnnr.app">legal@mnnr.app</a> within five (5) business days of the expected delivery date.</p>

        <h2>6. Geographic Availability</h2>
        <p>MNNR services are available globally where lawful. MNNR does not provide services to customers located in jurisdictions subject to comprehensive United States sanctions (currently including but not limited to Cuba, Iran, North Korea, Syria, and the so-called Donetsk People's Republic and Luhansk People's Republic regions of Ukraine), or to any person or entity on the United States Specially Designated Nationals list, the European Union consolidated financial-sanctions list, or the United Kingdom HM Treasury consolidated sanctions list.</p>

        <h2>7. Delivery Failure</h2>
        <p>If MNNR fails to deliver a service within the timeframes specified above due to MNNR's act or omission, the customer's exclusive remedy is the refund framework set out in our <a href="/legal/return-policy">Refund and Return Policy</a>.</p>
        <p>MNNR is not liable for delivery delay caused by (a) customer act or omission (including failure to provide required information or scheduling cooperation), (b) third-party service-provider outage outside MNNR's reasonable control, (c) force majeure events, or (d) any other cause outside MNNR's reasonable control.</p>

        <h2>8. Not Legal Advice</h2>
        <p>The deliverables MNNR provides (including compliance briefs, signed attestation packets, regulatory framework reports, and scoping outcomes) are software outputs and informational artifacts. They do not constitute legal advice. MNNR is a software vendor, not a law firm. Customers should consult licensed counsel in the relevant jurisdiction before relying on any MNNR deliverable for regulatory or legal compliance purposes.</p>

        <h2>9. Changes to This Policy</h2>
        <p>MNNR may update this Service Delivery Policy from time to time. Material changes will be communicated to active customers by email at least 30 days prior to taking effect. The version in effect on the date of purchase governs that purchase.</p>

        <h2>10. Contact</h2>
        <p>MNNR, LLC<br/>
        1603 Capitol Ave, Suite 413 PMB #1750<br/>
        Cheyenne, WY 82001<br/>
        Email: <a href="mailto:legal@mnnr.app">legal@mnnr.app</a></p>
      </article>
    </div>
  );
}
