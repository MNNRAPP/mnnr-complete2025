import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Risk Disclosures | MNNR',
  description: 'Comprehensive risk disclosures for MNNR, LLC: not legal advice, forward-looking statements, regulatory interpretation risk, penalty exposure, certification status, cryptographic risk, third-party rails, service availability, cyber/adversarial-AI risk, insurance, veteran-owned status.',
};

export default function RiskDisclosuresPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a href="/" className="text-2xl font-bold text-blue-600">MNNR</a>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-12 prose prose-lg prose-slate max-w-none">
        <h1>Risk Disclosures</h1>
        <p><em>Last updated: 2026-06-21. Read these disclosures before purchasing, deploying, or relying on the MNNR Service or any MNNR brief, checklist, or attestation. These disclosures are incorporated by reference into the <a href="/legal/terms">Terms of Service</a>.</em></p>

        <h2>1. Not legal advice</h2>
        <p>MNNR, LLC is a software vendor. MNNR is not a law firm. No employee, contractor, or representative of MNNR is acting as your attorney. The mnnr.app website, the EU brief, the federal brief, the compliance brief, the 14-point engineering checklist, the A50 SKU page, every published attestation, and every communication from MNNR are provided <strong>for informational purposes only</strong> and do <strong>not</strong> constitute legal, regulatory, accounting, tax, or investment advice. Customer is solely responsible for obtaining advice of qualified licensed counsel in the relevant jurisdiction before relying on any MNNR statement for compliance, contracting, or regulatory purposes. No attorney-client relationship is formed by accessing the website, downloading materials, executing an Order Form, or using the Service.</p>

        <h2>2. Forward-looking statements</h2>
        <p>Statements in MNNR materials about regulatory timelines (including the EU AI Act Article 50 applicability date of 2026-08-02, PSD3/PSR adoption following the November 2025 Council/Parliament provisional political agreement, with Official Journal publication and implementation timelines pending, NSPM-11 implementation, CNSA 2.0 milestones, and FedRAMP authorization), product roadmap milestones, and integration availability are <strong>forward-looking</strong> and subject to change. Actual regulatory text, dates, interpretations, and enforcement priorities may differ from MNNR&apos;s good-faith summaries. MNNR undertakes no obligation to update forward-looking statements except as required by law.</p>

        <h2>3. Regulatory interpretation risk</h2>
        <p>MNNR&apos;s compliance interpretations, including the framing of Article 50 self-identification obligations as machine-verifiable AI-actor tags, the application of PSD3/PSR to agentic flows, and the mapping of NSPM-11 to a cross-vendor policy layer, represent MNNR&apos;s good-faith reading of public sources. These interpretations are <strong>not endorsed</strong> by the European Commission, the European AI Office, the European Banking Authority, BaFin, the Federal Trade Commission, the U.S. Securities and Exchange Commission, the Executive Office of the President, or any other regulator or supervisory authority. A regulator may adopt a different interpretation. Customer&apos;s score on any MNNR-published checklist does not constitute a safe harbor against enforcement.</p>

        <h2>4. Penalty exposure</h2>
        <p>Penalties under EU AI Act Article 99 may reach the higher of EUR 15,000,000 or 3% of worldwide annual turnover. Penalties under GDPR Art. 83 may reach the higher of EUR 20,000,000 or 4% of worldwide annual turnover. Penalties under PSD3/PSR will be set in the final adopted text following Official Journal publication; the November 2025 provisional political agreement informs current expectations but is not yet binding law. <strong>MNNR is not liable for any fine, penalty, or sanction assessed against Customer or any third party by any regulator.</strong> See Section 12 of the Terms of Service.</p>

        <h2>5. Certification status</h2>
        <p>The following certifications and authorizations are <strong>aspirational or in progress</strong> as of the date of this disclosure and have <strong>not</strong> been obtained:</p>
        <ul>
          <li>SOC 2 Type I &mdash; targeted Q4 2026 audit window</li>
          <li>ISO/IEC 27001 &mdash; controls mapping in build, certification track 2027</li>
          <li>FedRAMP Moderate &mdash; path in scoping</li>
          <li>SDVOSB (Service-Disabled Veteran-Owned Small Business) &mdash; SBA verification in progress; SAM.gov registration in progress</li>
          <li>PCI DSS &mdash; not applicable; MNNR does not store cardholder data</li>
          <li>HIPAA / HITRUST &mdash; not applicable to current scope</li>
        </ul>
        <p>Customer must not rely on the eventual achievement of any of the foregoing as a condition of using the Service unless expressly warranted in a fully-executed Order Form.</p>

        <h2>6. Cryptographic and post-quantum risk</h2>
        <p>The post-quantum primitives published at <a href="/crypto/">/crypto/</a> implement NIST FIPS 203 (ML-KEM-768) and FIPS 204 (ML-DSA-65). These standards are recent. Future cryptanalysis may reveal weaknesses. MNNR commits to migrate to a successor standard within a commercially reasonable period of any formal NIST deprecation notice. MNNR&apos;s signing keys are held under founder custody pending HSM migration scheduled for Q3 2026; until that migration is complete, key-compromise risk is operationally mitigated through cold-storage and access controls but not eliminated.</p>

        <h2>7. Third-party rails</h2>
        <p>MNNR is a governance layer that sits above third-party agentic-payment rails (Visa Agentic Ready, Mastercard Agent Pay, Stripe Tempo MPP, PayPal Agent Ready, Crossmint Agentic Cards, AWS Bedrock AgentCore Payments, Adyen Agentic, Google Cloud UCP, Chrome WebMCP, and any successor). MNNR makes no representation or warranty regarding the availability, security, performance, or compliance of any third-party rail. &quot;Integration roadmap&quot; means engineering in progress; &quot;Interest accepted&quot; means initial buyer-side conversations underway. Neither status constitutes a commercial partnership, endorsement, or affiliation.</p>

        <h2>8. Service-availability risk</h2>
        <p>The Service depends on infrastructure operated by Cloudflare, Amazon Web Services, Stripe, and other sub-processors. MNNR&apos;s Service Level Agreement, when published, will set out service-availability commitments and remedies. Service availability does not equal compliance.</p>

        <h2>9. Cyber, fraud, and adversarial-AI risk</h2>
        <p>Agentic payments are an emerging domain. Adversarial agents, prompt injection, mandate-scope evasion, and supply-chain attacks present residual risks that no current technology eliminates. MNNR&apos;s governance layer is designed to reduce, not eliminate, these risks. Customer remains responsible for end-to-end fraud, abuse, and operational-risk management.</p>

        <h2>10. Insurance</h2>
        <p>MNNR maintains the insurance coverage described in its current Trust Center page (when published). Coverage limits, retentions, and exclusions apply. Insurance does not increase MNNR&apos;s contractual liability cap set out in Section 12 of the <a href="/legal/terms">Terms of Service</a>.</p>

        <h2>11. Veteran-owned status</h2>
        <p>MNNR is founded by a 100% service-connected disabled U.S. military veteran. Veteran-owned status is a corporate fact and does not constitute, on its own, any specific contracting set-aside eligibility absent the certifications listed in Section 5.</p>

        <h2>12. Material changes</h2>
        <p>MNNR will update these Risk Disclosures from time to time. Continued use of the website, materials, or Service after the &quot;Last updated&quot; date constitutes acceptance of the revised disclosures.</p>

        <h2>13. Contact</h2>
        <p>Legal: <a href="mailto:legal@mnnr.app">legal@mnnr.app</a><br/>
        MNNR, LLC, 1603 Capitol Ave, Suite 413 PMB #1750, Cheyenne, WY 82001</p>
      </article>
    </div>
  );
}
