import Link from 'next/link';
import Logo from '@/components/icons/Logo';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0f] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo />
              <span className="text-white font-bold text-xl">MNNR</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              Billing infrastructure for the machine economy. Track usage, enforce limits, collect payments.
            </p>
          </div>
          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/#features" className="text-white/50 hover:text-emerald-400 transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-white/50 hover:text-emerald-400 transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-white/50 hover:text-emerald-400 transition-colors text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/docs/api" className="text-white/50 hover:text-emerald-400 transition-colors text-sm">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/docs/changelog" className="text-white/50 hover:text-emerald-400 transition-colors text-sm">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>
          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-white/50 hover:text-emerald-400 transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <a href="mailto:pilot@mnnr.app" className="text-white/50 hover:text-emerald-400 transition-colors text-sm">
                  Pilot Program
                </a>
              </li>
              <li>
                <a href="mailto:support@mnnr.app" className="text-white/50 hover:text-emerald-400 transition-colors text-sm">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="mailto:enterprise@mnnr.app" className="text-white/50 hover:text-emerald-400 transition-colors text-sm">
                  Enterprise
                </a>
              </li>
            </ul>
          </div>
          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/legal/terms" className="text-white/50 hover:text-emerald-400 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-white/50 hover:text-emerald-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/security" className="text-white/50 hover:text-emerald-400 transition-colors text-sm">
                  Security
                </Link>
              </li>
            </ul>
          </div>
          {/* Connect */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://github.com/MNNRAPP" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-emerald-400 transition-colors text-sm"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="mailto:hello@mnnr.app"
                  className="text-white/50 hover:text-emerald-400 transition-colors text-sm"
                >
                  Email Us
                </a>
              </li>
              <li>
                <Link 
                  href="/docs"
                  className="text-white/50 hover:text-emerald-400 transition-colors text-sm"
                >
                  Developer Docs
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} MNNR. All rights reserved.
          </div>
          <div className="text-white/40 text-xs text-center max-w-md">
            Third-party logos are trademarks of their respective owners. No endorsement implied.
          </div>
          <div className="text-white/40 text-sm">
            Billing Infrastructure for the Machine Economy
          </div>
        </div>
      </div>
    </footer>
  );
}
