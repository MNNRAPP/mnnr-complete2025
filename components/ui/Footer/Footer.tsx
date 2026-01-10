import Link from 'next/link';
import Logo from '@/components/icons/Logo';

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo />
              <span className="text-white font-bold text-xl">MNNR</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Billing infrastructure for the machine economy. Track usage, enforce limits, collect payments.
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
                <Link href="/#features" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/docs/api" className="text-gray-400 hover:text-white transition-colors text-sm">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Status Page
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <a href="mailto:hello@mnnr.app" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </a>
              </li>
              <li>
                <a href="tel:+12522420710" className="text-gray-400 hover:text-white transition-colors text-sm">
                  (252) 242-0710
                </a>
              </li>
              <li>
                <a href="mailto:pilot@mnnr.app" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Pilot Program
                </a>
              </li>
              <li>
                <a href="mailto:enterprise@mnnr.app" className="text-gray-400 hover:text-white transition-colors text-sm">
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
                <Link href="/legal/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/security" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy#ccpa" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Do Not Sell My Info
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimers */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="space-y-4">
            {/* Copyright */}
            <p className="text-gray-500 text-sm">
              © 2026 MNNR, LLC. All rights reserved.
            </p>
            
            {/* Address */}
            <p className="text-gray-600 text-xs">
              EIN: 33-3678186 | 1603 Capitol Ave, Suite 413 PMB #1750, Cheyenne, WY 82001
            </p>

            {/* Payment Processing Disclaimer */}
            <div className="text-gray-600 text-xs leading-relaxed max-w-4xl">
              <p className="mb-2">
                <strong className="text-gray-500">Payment Processing:</strong> MNNR does not directly process payments. 
                All payment transactions are handled by Stripe, Inc., a PCI DSS Level 1 certified payment processor.
              </p>
              
              {/* Beta Service Disclaimer */}
              <p>
                <strong className="text-gray-500">Beta Service:</strong> MNNR is currently in beta. The service is 
                provided "as is" without warranties. Performance metrics and SLA guarantees are targets for general availability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
