import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement | MNNR',
  description: 'Accessibility statement for MNNR, LLC per EU Directive 2019/882 (European Accessibility Act) and WCAG 2.2 AA.',
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a href="/" className="text-2xl font-bold text-blue-600">MNNR</a>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-12 prose prose-lg prose-slate max-w-none">
        <h1>Accessibility Statement</h1>
        <p><strong>Last Updated:</strong> June 20, 2026</p>
        <p>Published in compliance with EU Directive 2019/882 (European Accessibility Act, in force 28 June 2025) and aligned with the Web Content Accessibility Guidelines 2.2, Level AA.</p>

        <hr />

        <h2>Our Commitment</h2>
        <p>MNNR, LLC is committed to making <a href="https://mnnr.app">https://mnnr.app</a> and the MNNR usage analytics and authorization platform accessible to as many people as possible, including users with disabilities. We aim to conform to the Web Content Accessibility Guidelines 2.2 at Level AA published by the World Wide Web Consortium, and we monitor our conformance against the European Accessibility Act and relevant national implementing legislation.</p>

        <h2>Conformance Status</h2>
        <p>The MNNR website currently conforms with WCAG 2.2 Level AA, with the following known partial-conformance items currently being remediated:</p>
        <ul>
          <li><strong>Skip-to-content link:</strong> a top-of-page skip link is being added in the next release.</li>
          <li><strong>Focus-visible indicators:</strong> explicit focus indicators beyond the browser default are being added to interactive elements.</li>
          <li><strong>prefers-reduced-motion:</strong> hover transforms are being wrapped in a media query to respect the user's reduced-motion preference.</li>
          <li><strong>aria-live regions:</strong> the homepage countdown component is being upgraded to announce changes via an aria-live="polite" region for screen-reader users.</li>
          <li><strong>Form labels:</strong> visible or screen-reader-only labels are being added to the waitlist form input.</li>
        </ul>
        <p>These items are tracked in the MNNR GitHub repository and expected to be fully resolved within the current quarter.</p>

        <h2>Accessibility Features Already in Place</h2>
        <ul>
          <li>Body text contrast ratio of 14.2:1 against the page background (exceeds WCAG 2.2 AAA threshold of 7:1).</li>
          <li>All text on the site is selectable and copy-pasteable (no image-of-text used for body content).</li>
          <li>Semantic HTML with a single top-level h1 per page.</li>
          <li>aria-expanded state set on the mobile navigation toggle.</li>
          <li>lang="en" set on the document root.</li>
          <li>No autoplay audio or video on any page.</li>
          <li>All hyperlinks have descriptive link text (no "click here").</li>
          <li>The site is fully usable at 200% browser zoom without horizontal scrolling on standard screen widths.</li>
        </ul>

        <h2>Assistive Technologies Supported</h2>
        <p>The MNNR website is regularly tested against:</p>
        <ul>
          <li>NVDA (latest stable) on Windows with Firefox and Chrome</li>
          <li>VoiceOver on macOS Safari and iOS Safari</li>
          <li>TalkBack on Android Chrome</li>
          <li>Keyboard-only navigation across all supported browsers</li>
        </ul>

        <h2>Known Limitations</h2>
        <p>The waitlist form requires JavaScript to load Cloudflare Turnstile bot protection. Users with JavaScript disabled cannot currently submit the waitlist form. As a workaround, such users may email <a href="mailto:waitlist@mnnr.app">waitlist@mnnr.app</a> with their request to be added to the waitlist.</p>
        <p>Some downloadable PDFs (the EU brief, federal brief, and compliance brief) are currently provided as standard PDFs without tagged structure. Tagged-PDF versions are planned within the current quarter. In the interim, the underlying content is also available as web pages, which are fully accessible.</p>

        <h2>Feedback and Contact</h2>
        <p>If you encounter an accessibility barrier on the MNNR website or any MNNR product, please contact us so we can address it:</p>
        <p>Email: <a href="mailto:accessibility@mnnr.app">accessibility@mnnr.app</a> (or <a href="mailto:legal@mnnr.app">legal@mnnr.app</a> if the dedicated alias has not yet been provisioned in your jurisdiction)<br/>
        Postal: MNNR, LLC, 1603 Capitol Ave, Suite 413 PMB #1750, Cheyenne, WY 82001, United States</p>
        <p>We aim to acknowledge accessibility-feedback messages within five (5) business days and to provide a substantive response within fifteen (15) business days.</p>

        <h2>Enforcement Procedure (EU)</h2>
        <p>If you are located in the European Union and you believe that we have not responded adequately to your accessibility concern, you may contact the supervisory authority of your member state designated under EU Directive 2019/882. In Germany, this is the Bundesfachstelle für Barrierefreiheit (<a href="https://www.bundesfachstelle-barrierefreiheit.de/" rel="noopener noreferrer">https://www.bundesfachstelle-barrierefreiheit.de/</a>).</p>

        <h2>Conformance Evaluation</h2>
        <p>This Accessibility Statement was prepared on 20 June 2026 based on internal evaluation against WCAG 2.2 Level AA criteria. The statement is reviewed and updated at least once per quarter, and after any material site change.</p>
      </article>
    </div>
  );
}
