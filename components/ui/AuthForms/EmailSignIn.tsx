'use client';

// Legacy component — email magic link sign-in is not supported.
// Use /sign-in for email+password authentication.
export default function EmailSignIn(_props: any) {
  return (
    <div className="my-8 text-center text-gray-400">
      <p>Magic link sign-in is not currently available.</p>
      <a href="/sign-in" className="text-emerald-400 underline">Sign in with password</a>
    </div>
  );
}
