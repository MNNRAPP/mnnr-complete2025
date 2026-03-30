import Link from 'next/link';

export default function ComplianceFooter() {
  return (
    <div className="border-t border-white/10 mt-16 pt-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Compliance Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40 mb-6">
          <Link href="/privacy" className="hover:text-amber-400 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-amber-400 transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy#gdpr" className="hover:text-amber-400 transition-colors">
            GDPR Rights
          </Link>
          <Link href="/security" className="hover:text-amber-400 transition-colors">
            Security
          </Link>
        </div>

        {/* Regulatory Disclaimers */}
        <div className="text-xs text-white/30 space-y-3 max-w-4xl mx-auto text-center">
          <p>
            <strong className="text-white/40">European Compliance:</strong> MNNR is designed for compliance with PSD3, MiCA, EUDIW (eIDAS 2.0), and GDPR. All agent transaction data is processed within EU-resident infrastructure. Regulatory certifications are in progress.
          </p>
          <p>
            <strong className="text-white/40">Rail-Neutral Architecture:</strong> MNNR routes transactions across Wero, SEPA Instant, Qivalis euro stablecoin, and traditional card networks. Rail availability depends on merchant and regional support.
          </p>
          <p>
            <strong className="text-white/40">Beta Service:</strong> MNNR is currently in beta. The service is provided &quot;as is&quot; without warranties. Performance metrics and SLA guarantees are targets for general availability.
          </p>
          <p>
            <strong className="text-white/40">Trademark Notice:</strong> Third-party logos and trademarks are property of their respective owners. MNNR is not affiliated with or endorsed by these companies unless explicitly stated.
          </p>
        </div>

        {/* Copyright */}
        <div className="text-center text-white/30 text-xs mt-8">
          &copy; {new Date().getFullYear()} MNNR, LLC. All rights reserved.
        </div>
      </div>
    </div>
  );
}
