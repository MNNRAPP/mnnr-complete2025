'use client';

// Legacy component — password reset flow is not yet implemented.
// TODO: Implement password reset via email token
export default function ForgotPassword(_props: any) {
  return (
    <div className="my-8 text-center text-gray-400">
      <p>Password reset is not yet available.</p>
      <p className="mt-2 text-sm">Please contact <a href="mailto:support@mnnr.app" className="text-emerald-400 underline">support@mnnr.app</a> to reset your password.</p>
      <a href="/sign-in" className="block mt-4 text-emerald-400 underline">Back to sign in</a>
    </div>
  );
}
