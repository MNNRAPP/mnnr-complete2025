import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Imprint / Impressum | MNNR',
  description: 'Imprint / Impressum disclosure for MNNR, LLC per German TMG §5 and EU DSA Art. 12.',
};

export default function ImprintPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a href="/" className="text-2xl font-bold text-blue-600">MNNR</a>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-12 prose prose-lg prose-slate max-w-none">
        <h1>Imprint / Impressum</h1>
        <p><strong>Last Updated:</strong> June 20, 2026</p>
        <p>Disclosure published pursuant to German Telemediengesetz (TMG) § 5 and Regulation (EU) 2022/2065 (Digital Services Act) Article 12, for visitors and customers in the European Union, Germany, Austria, and Switzerland.</p>

        <hr />

        <h2>Provider Identification (Anbieterkennzeichnung)</h2>
        <p><strong>Operator / Diensteanbieter:</strong><br/>
        MNNR, LLC<br/>
        (Wyoming limited liability company)<br/>
        EIN: 33-3678186</p>

        <p><strong>Registered office / Sitz:</strong><br/>
        1603 Capitol Ave, Suite 413 PMB #1750<br/>
        Cheyenne, WY 82001<br/>
        United States of America</p>

        <p><strong>Authorized representative / Vertretungsberechtigt:</strong><br/>
        Tohid Naeem, Founder and Sole Member</p>

        <p><strong>Contact / Kontakt:</strong><br/>
        Email: <a href="mailto:legal@mnnr.app">legal@mnnr.app</a><br/>
        Phone: +1 (252) 242-0710</p>

        <p><strong>EU Single Point of Contact (DSA Art. 11, where applicable):</strong><br/>
        Email: <a href="mailto:legal@mnnr.app">legal@mnnr.app</a></p>

        <h2>Commercial Registry</h2>
        <p>MNNR, LLC is a limited liability company organized under the laws of the State of Wyoming, United States. The Wyoming Secretary of State maintains the public business registry at <a href="https://wyobiz.wyo.gov/Business/FilingSearch.aspx" rel="noopener noreferrer">https://wyobiz.wyo.gov/Business/FilingSearch.aspx</a>. MNNR, LLC is not registered in the German Handelsregister or any equivalent EU member-state commercial registry.</p>

        <h2>Value-Added Tax / Umsatzsteuer-Identifikationsnummer</h2>
        <p>MNNR, LLC is a United States entity and does not hold a German Umsatzsteuer-Identifikationsnummer (USt-IdNr.). For EU customers, MNNR collects and remits VAT through the One-Stop Shop (OSS) or via Stripe Tax, as applicable to the type of supply.</p>

        <h2>Responsible for Editorial Content (§ 18 Abs. 2 MStV)</h2>
        <p>Tohid Naeem<br/>
        c/o MNNR, LLC<br/>
        1603 Capitol Ave, Suite 413 PMB #1750<br/>
        Cheyenne, WY 82001<br/>
        United States</p>

        <h2>Professional Liability Insurance</h2>
        <p>MNNR, LLC's professional liability (technology errors and omissions) coverage status is published at the <a href="/legal/security">Security and Trust</a> page. Customers may request current certificate of insurance details at <a href="mailto:legal@mnnr.app">legal@mnnr.app</a>.</p>

        <h2>EU Online Dispute Resolution (Art. 14 Reg. (EU) 524/2013)</h2>
        <p>The European Commission provides a platform for online dispute resolution at <a href="https://ec.europa.eu/consumers/odr/" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>. MNNR is, however, not obligated and not willing to participate in dispute resolution proceedings before a consumer arbitration board within the meaning of the German Verbraucherstreitbeilegungsgesetz (VSBG). EU and German consumers retain all statutory rights.</p>

        <h2>EU Representative (GDPR Art. 27)</h2>
        <p>MNNR's GDPR Article 27 EU Representative designation is published at our <a href="/legal/privacy">Privacy Policy</a>. Customers may direct GDPR-specific inquiries to the representative or to <a href="mailto:legal@mnnr.app">legal@mnnr.app</a>.</p>

        <h2>Liability Notice (Haftungsausschluss)</h2>
        <p>The content of this website is published with care. However, MNNR assumes no liability for the correctness, completeness, or topicality of the content. For external links to third-party websites, MNNR is not responsible for the content of the linked pages. The respective provider of the linked pages is solely responsible for their content.</p>

        <h2>Copyright (Urheberrecht)</h2>
        <p>The content and works on this website (text, images, audio, video, source code, design system) are subject to the copyright laws of the United States and to international copyright treaties to which the United States is a party. Reproduction, editing, distribution, or any form of use beyond what is permitted by law require the prior written consent of MNNR, LLC.</p>
      </article>
    </div>
  );
}
