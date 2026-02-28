'use client';

// Legacy component — redirects to the new sign-in page.
// The new auth system uses /sign-in with direct API calls.
export default function PasswordSignIn(_props: any) {
  return (
    <div className="my-8 text-center text-gray-400">
      <a href="/sign-in" className="text-emerald-400 underline">Go to sign in</a>
    </div>
  );
}
