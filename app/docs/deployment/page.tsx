import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Deployment Guide - MNNR',
  description: 'Step-by-step production deployment guide with Vercel, Supabase, and monitoring setup.',
};

export default function DeploymentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Deployment Guide
          </h1>
          <p className="text-xl text-gray-600">
            Complete production deployment with Vercel, Supabase, and monitoring
          </p>
        </div>

        {/* Deployment Steps */}
        <div className="space-y-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">1</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Environment Setup</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p>Configure your production environment variables:</p>
              <ul>
                <li>Database URL (Supabase)</li>
                <li>Stripe API keys</li>
                <li>Redis connection string</li>
                <li>Sentry DSN</li>
                <li>Email service configuration</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">2</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Database Migration</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p>Run database migrations and seed initial data:</p>
              <ul>
                <li>Create Supabase project</li>
                <li>Run schema migrations</li>
                <li>Configure Row Level Security (RLS)</li>
                <li>Set up authentication policies</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">3</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Vercel Deployment</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p>Deploy to Vercel with proper configuration:</p>
              <ul>
                <li>Connect GitHub repository</li>
                <li>Configure build settings</li>
                <li>Set environment variables</li>
                <li>Configure custom domains</li>
                <li>Set up monitoring and alerts</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">4</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Monitoring Setup</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p>Configure monitoring and error tracking:</p>
              <ul>
                <li>Sentry error monitoring</li>
                <li>Performance monitoring</li>
                <li>Database health checks</li>
                <li>API endpoint monitoring</li>
                <li>Alert configuration</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">5</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Security Hardening</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p>Final security configuration:</p>
              <ul>
                <li>Enable rate limiting</li>
                <li>Configure CORS policies</li>
                <li>Set up SSL certificates</li>
                <li>Review access controls</li>
                <li>Security testing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Deployment Checklist */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-blue-800 mb-4">Pre-Deployment Checklist</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" disabled />
                <span className="text-blue-700">Environment variables configured</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" disabled />
                <span className="text-blue-700">Database schema deployed</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" disabled />
                <span className="text-blue-700">Stripe webhooks configured</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" disabled />
                <span className="text-blue-700">Domain SSL certificate</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" disabled />
                <span className="text-blue-700">Monitoring tools configured</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" disabled />
                <span className="text-blue-700">Backup strategy in place</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" disabled />
                <span className="text-blue-700">Load testing completed</span>
              </div>
              <div className="flex items-center">
                <input type="checkbox" className="mr-2" disabled />
                <span className="text-blue-700">Rollback plan documented</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Docs */}
        <div className="text-center mt-12">
          <Link
            href="/docs"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}