import Link from 'next/link';
import Logo from '@/components/icons/Logo';

export default function Footer() {
  return (
    <footer className="bg-[#040714] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Compliance Badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 pb-12 border-b border-white/5">
          {[
            { label: 'PSD3', desc: 'Compliant' },
            { label: 'MiCA', desc: 'Ready' },
            { label: 'EUDIW', desc: 'Integrated' },
            { label: 'GDPR', desc: 'Native' },
            { label: 'eIDAS 2.0', desc: 'Compatible' },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-white/50 text-xs">
              <span className="text-amber-400 font-bold">{badge.label}</span>
              <span>{badge.desc}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo />
              <span className="text-white font-bold text-xl">MNNR</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              The authority layer for the European machine economy. Rail-neutral payments infrastructure for autonomous AI agents.
            </p>
            <div className="text-gray-500 text-xs space-y-1">
              <p>MNNR, LLC</p>
              <p>EIN: 33-3678186</p>
              <p>
                <a href="tel:+12522420710" className="hover:text-gray-300 transition-colors">
                  (252) 242-0710
                </a>
              </p>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#authority" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">
                  Authority Gap
                </Link>
              </li>
              <li>
                <Link href="/#architecture" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">
                  Rail Architecture
                </Link>
              </li>
              <li>
                <Link href="/#compliance" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">
                  Compliance
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/docs/api" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <a href="mailto:hello@mnnr.app" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">
                  Contact
                </a>
              </li>
              <li>
                <a href="mailto:partners@mnnr.app" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">
                  Design Partners
                </a>
              </li>
              <li>
                <a href="mailto:enterprise@mnnr.app" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">
                  Enterprise
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/legal/privacy" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/security" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy#gdpr" className="text-gray-400 hover:text-amber-400 transition-colors text-sm">
                  GDPR Rights
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimers */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">
              &copy; 2026 MNNR, LLC. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs">
              EIN: 33-3678186 | 1603 Capitol Ave, Suite 413 PMB #1750, Cheyenne, WY 82001
            </p>
            <div className="text-gray-600 text-xs leading-relaxed max-w-4xl">
              <p className="mb-2">
                <strong className="text-gray-500">European Compliance:</strong> MNNR is designed for compliance with PSD3, MiCA, EUDIW, and GDPR.
                All agent transaction data is processed within EU-resident infrastructure. Regulatory certifications are in progress.
              </p>
              <p>
                <strong className="text-gray-500">Beta Service:</strong> MNNR is currently in beta. The service is
                provided &quot;as is&quot; without warranties. Performance metrics and SLA guarantees are targets for general availability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
