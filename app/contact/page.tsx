import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | MNNR',
  description: 'Contact MNNR, LLC. One human reads each submission. We respond within one business day.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a href="/" className="text-2xl font-bold text-blue-600">MNNR</a>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-12 prose prose-lg prose-slate max-w-none">
        <h1>Contact</h1>
        <p>One human reads each submission. That human is Tohid Naeem, founder, MNNR, LLC. We respond within one business day.</p>

        <h2>By role</h2>
        <table>
          <tbody>
            <tr><td><strong>Sales, pilot, partnership</strong></td><td><a href="mailto:hello@mnnr.app">hello@mnnr.app</a></td></tr>
            <tr><td><strong>Security, vulnerability disclosure</strong></td><td><a href="mailto:security@mnnr.app">security@mnnr.app</a> &mdash; see also <a href="/.well-known/security.txt">/.well-known/security.txt</a></td></tr>
            <tr><td><strong>Privacy, GDPR, CCPA requests</strong></td><td><a href="mailto:privacy@mnnr.app">privacy@mnnr.app</a></td></tr>
            <tr><td><strong>Legal, contracts, DPA, SCC</strong></td><td><a href="mailto:legal@mnnr.app">legal@mnnr.app</a></td></tr>
            <tr><td><strong>Accessibility feedback</strong></td><td><a href="mailto:accessibility@mnnr.app">accessibility@mnnr.app</a></td></tr>
            <tr><td><strong>Support, existing customers</strong></td><td><a href="mailto:support@mnnr.app">support@mnnr.app</a></td></tr>
            <tr><td><strong>Press, analyst</strong></td><td><a href="mailto:press@mnnr.app">press@mnnr.app</a></td></tr>
          </tbody>
        </table>

        <h2>Mailing address</h2>
        <p>MNNR, LLC<br/>
        1603 Capitol Ave, Suite 413 PMB #1750<br/>
        Cheyenne, WY 82001<br/>
        United States of America<br/>
        EIN: 33-3678186</p>

        <h2>Phone</h2>
        <p>+1 (252) 242-0710</p>

        <h2>EU representative (GDPR Art. 27)</h2>
        <p>To be designated. Inquiries to <a href="mailto:legal@mnnr.app">legal@mnnr.app</a> in the interim.</p>

        <h2>UK representative (UK GDPR Art. 27)</h2>
        <p>To be designated. Inquiries to <a href="mailto:legal@mnnr.app">legal@mnnr.app</a> in the interim.</p>

        <h2>German Imprint / Impressum (TMG &sect;5, MStV &sect;18)</h2>
        <p>See our dedicated <a href="/legal/imprint">Imprint / Impressum</a> page.</p>
      </article>
    </div>
  );
}
