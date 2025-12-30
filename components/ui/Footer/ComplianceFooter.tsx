import Link from 'next/link';

export default function ComplianceFooter() {
  return (
    <div className="border-t border-white/10 mt-16 pt-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Compliance Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/40 mb-6">
          <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-emerald-400 transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy#ccpa" className="hover:text-emerald-400 transition-colors">
            Do Not Sell My Personal Information
          </Link>
          <Link href="/security" className="hover:text-emerald-400 transition-colors">
            Security
          </Link>
        </div>

        {/* Regulatory Disclaimers */}
        <div className="text-xs text-white/30 space-y-3 max-w-4xl mx-auto text-center">
          <p>
            <strong className="text-white/40">Payment Processing:</strong> MNNR does not directly process payments. All payment transactions are handled by Stripe, Inc., a PCI DSS Level 1 certified payment processor. MNNR provides usage tracking, metering, and billing infrastructure that integrates with Stripe.
          </p>
          <p>
            <strong className="text-white/40">Beta Service:</strong> MNNR is currently in beta. The service is provided &quot;as is&quot; without warranties. Performance metrics and SLA guarantees are targets for general availability and not guaranteed during beta.
          </p>
          <p>
            <strong className="text-white/40">Compliance Status:</strong> SOC 2 Type II certification in progress (target: Q2 2026). GDPR and CCPA compliance practices are implemented. For enterprise customers requiring specific compliance certifications, please contact our sales team.
          </p>
          <p>
            <strong className="text-white/40">Trademark Notice:</strong> Third-party logos and trademarks are property of their respective owners. MNNR is not affiliated with or endorsed by these companies unless explicitly stated. Logos indicate technical compatibility only.
          </p>
        </div>

        {/* Copyright */}
        <div className="text-center text-white/30 text-xs mt-8">
          © {new Date().getFullYear()} MNNR. All rights reserved.
        </div>
      </div>
    </div>
  );
}
