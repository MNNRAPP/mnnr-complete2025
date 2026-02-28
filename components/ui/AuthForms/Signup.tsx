'use client';

// Legacy component — redirects to the new sign-up page.
// The new auth system uses /sign-up with direct API calls.
export default function SignUp(_props: any) {
  return (
    <div className="my-8 text-center text-gray-400">
      <a href="/sign-up" className="text-emerald-400 underline">Go to sign up</a>
    </div>
  );
}
