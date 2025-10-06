import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Documentation - MNNR',
  description: 'Complete documentation for MNNR platform features, security, and deployment guides.',
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            MNNR Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about using, securing, and deploying the MNNR platform.
          </p>
        </div>

        {/* Documentation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Security Documentation */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Security Guide</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Comprehensive security documentation covering our 10/10 security implementation.
            </p>
            <Link 
              href="/docs/security" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Read Security Docs →
            </Link>
          </div>

          {/* Deployment Guide */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Deployment</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Step-by-step production deployment guide with Vercel, Supabase, and monitoring setup.
            </p>
            <Link 
              href="/docs/deployment" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              View Deployment Guide →
            </Link>
          </div>

          {/* API Reference */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">API Reference</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Complete API documentation for webhooks, authentication, and subscription management.
            </p>
            <Link 
              href="/docs/api" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Explore API →
            </Link>
          </div>

          {/* Enterprise Features */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Enterprise</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Enterprise-grade features including monitoring, logging, and advanced security configurations.
            </p>
            <Link 
              href="/docs/enterprise" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Enterprise Features →
            </Link>
          </div>

          {/* Changelog */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Changelog</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Track all updates, security improvements, and new features in our detailed changelog.
            </p>
            <Link 
              href="/docs/changelog" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              View Changelog →
            </Link>
          </div>

          {/* Quick Start */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Quick Start</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Get up and running quickly with our step-by-step quick start guide.
            </p>
            <Link 
              href="/docs/quick-start" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Quick Start Guide →
            </Link>
          </div>
          
        </div>

        {/* Security Badge */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">🔒 Security Score: 10/10</h3>
          <p className="text-green-700">
            Enterprise-grade security with Redis rate limiting, Sentry monitoring, and comprehensive logging
          </p>
        </div>
      </div>
    </div>
  );
}