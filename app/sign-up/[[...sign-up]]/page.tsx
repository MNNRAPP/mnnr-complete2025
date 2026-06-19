// app/sign-up/[[...sign-up]]/page.tsx — Clerk catch-all sign-up.

import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <SignUp afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard" />
    </div>
  );
}
