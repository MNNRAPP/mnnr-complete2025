import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Disclaimer | MNNR',
  description: 'Legal disclaimer for MNNR, LLC - Software vendor, not a law firm; not legal advice.',
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a href="/" className="text-2xl font-bold text-blue-600">MNNR</a>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-12 prose prose-lg prose-slate max-w-none">
        <h1>Legal Disclaimer</h1>
        <p><strong>Last Updated:</strong> June 20, 2026</p>

        <hr />

        <h2>1. Informational Purposes Only</h2>
        <p>All content published on <a href="https://mnnr.app">https://mnnr.app</a> and in any document, report, brief, attestation, checklist, scoping outcome, or similar deliverable produced by MNNR, LLC ("MNNR") is provided for general informational purposes only. Such content does not constitute legal advice, regulatory advice, tax advice, accounting advice, audit opinion, financial advice, investment advice, or any other form of professional advice.</p>

        <h2>2. MNNR Is a Software Vendor, Not a Law Firm</h2>
        <p>MNNR is a Wyoming limited liability company that develops and operates software, software-as-a-service offerings, and professional engineering services in the field of agentic-payments authorization, governance, and audit infrastructure. MNNR is not a law firm and does not provide legal services. No attorney-client relationship is created by accessing the MNNR website, purchasing any MNNR product, engaging in any scoping or pilot conversation, or relying on any MNNR deliverable.</p>

        <h2>3. Regulatory Interpretations</h2>
        <p>Statements MNNR publishes about EU Regulation 2024/1689 (Artificial Intelligence Act), Payment Services Directive 2 (Directive (EU) 2015/2366), Payment Services Directive 3 (COM(2023) 366), the Payment Services Regulation, Markets in Crypto-Assets Regulation (Regulation (EU) 2023/1114), Digital Operational Resilience Act (Regulation (EU) 2022/2554), eIDAS 2.0 (Regulation (EU) 2024/1183 establishing the European Digital Identity Wallet framework), the Instant Payments Regulation (Regulation (EU) 2024/886), the European Banking Authority "No-Action Letter" of June 2025 on PSD2/MiCA interplay, NIST Federal Information Processing Standards 203 and 204, National Security Memorandum 11, and any other primary or secondary law represent MNNR's good-faith interpretation as of the publication date. Such interpretations may not be the only reasonable reading of the underlying legal text and may not be endorsed by the European Commission, the European Banking Authority, the European Securities and Markets Authority, any National Competent Authority, the United States Federal Trade Commission, the United States Treasury Department, or any other regulatory or supervisory body.</p>

        <h2>4. Consult Licensed Counsel</h2>
        <p>Customers, prospective customers, and visitors should consult licensed legal counsel in the relevant jurisdiction before relying on any MNNR content or deliverable for regulatory compliance, contract drafting, dispute resolution, regulatory filing, supervisory communication, certification or licensing application, or any other purpose that may carry legal consequences.</p>

        <h2>5. No Guarantee of Outcome</h2>
        <p>MNNR's "five-day Article 50 scoping engagement," "compliance brief," "14-point engineering checklist," "signed attestation packet," and any other named offering or deliverable describes the work MNNR performs and the artifact MNNR provides. None of these descriptions constitutes a guarantee that any specific regulatory outcome, supervisory determination, audit conclusion, certification, license, contract award, sanction avoidance, or litigation result will follow. Regulatory outcomes depend on facts and circumstances specific to each customer, the supervisory body involved, the applicable law as interpreted by the courts having jurisdiction, and many factors outside MNNR's control or knowledge.</p>

        <h2>6. Reliance on Statements About Status</h2>
        <p>Where MNNR describes its operational status (for example, that an integration is "Live," "Integration roadmap," or "Interest accepted," or that a certification or qualification is "registered," "in progress," "pending," or "eligible"), such descriptions reflect MNNR's engineering posture and administrative state on the date of publication and do not constitute a commercial partnership claim, an endorsement by a third party, or a guarantee of future status. Customers should not rely on MNNR status descriptions as a substitute for direct verification with the third party named (for example, by contacting Stripe, Visa, Mastercard, the United States Small Business Administration, or any other named entity directly).</p>

        <h2>7. Limitation of Liability</h2>
        <p>To the maximum extent permitted by applicable law, MNNR disclaims any liability for fines, sanctions, penalties, regulatory action, supervisory determination, contract loss, lost profit, lost data, lost goodwill, or any other direct, indirect, incidental, consequential, special, exemplary, or punitive damages arising from reliance on any MNNR content or deliverable. The complete limitation-of-liability framework that governs MNNR commercial relationships is set out in our <a href="/legal/terms">Terms of Service</a>.</p>

        <h2>8. Consumer-Protection Carve-Outs</h2>
        <p>Nothing in this Legal Disclaimer is intended to limit or exclude any liability that cannot be limited or excluded under applicable consumer-protection law, including but not limited to the EU Distance Selling Directive 2011/83/EU, the UK Consumer Rights Act 2015, and applicable United States state consumer-protection statutes.</p>

        <h2>9. Updates</h2>
        <p>This Legal Disclaimer may be updated from time to time. The version in effect on the date a customer accesses MNNR content or relies on a MNNR deliverable governs that access or reliance.</p>

        <h2>10. Contact</h2>
        <p>MNNR, LLC<br/>
        1603 Capitol Ave, Suite 413 PMB #1750<br/>
        Cheyenne, WY 82001<br/>
        Email: <a href="mailto:legal@mnnr.app">legal@mnnr.app</a></p>
      </article>
    </div>
  );
}
