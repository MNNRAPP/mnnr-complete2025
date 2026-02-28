'use client';

// Legacy component — password update is not yet implemented.
// TODO: Implement password update flow
export default function UpdatePassword(_props: any) {
  return (
    <div className="my-8 text-center text-gray-400">
      <p>Password update is not yet available.</p>
      <a href="/sign-in" className="block mt-4 text-emerald-400 underline">Back to sign in</a>
    </div>
  );
}
