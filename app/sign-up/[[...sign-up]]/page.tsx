'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="text-3xl font-bold text-white">
            $MNNR
          </a>
          <p className="text-gray-400 mt-2">
            Create your account to start tracking AI usage
          </p>
        </div>

        {/* Clerk SignUp Component */}
        <SignUp
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-gray-800/50 backdrop-blur border border-gray-700 shadow-2xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton: 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600',
              socialButtonsBlockButtonText: 'text-white',
              dividerLine: 'bg-gray-600',
              dividerText: 'text-gray-400',
              formFieldLabel: 'text-gray-300',
              formFieldInput: 'bg-gray-700 border-gray-600 text-white placeholder-gray-400',
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
              footerActionLink: 'text-blue-400 hover:text-blue-300',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-blue-400',
            },
          }}
          redirectUrl="/dashboard"
          signInUrl="/sign-in"
        />

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          By signing up, you agree to our{' '}
          <a href="/legal/terms" className="text-blue-400 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/legal/privacy" className="text-blue-400 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
