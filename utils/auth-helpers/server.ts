'use server';

import { redirect } from 'next/navigation';

export async function redirectToPath(path: string) {
  return redirect(path);
}

export async function SignOut(formData: FormData) {
  const pathName = String(formData.get('pathName')).trim();

  // The actual sign-out is handled client-side by calling /api/auth/signout
  // This server action just returns the redirect path
  return '/sign-in';
}
