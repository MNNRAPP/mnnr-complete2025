// app/signin/[id]/page.tsx — Clerk redirect (post-Supabase migration 2026-06-19).
//
// The legacy multi-view sign-in page (password_signin / email_signin /
// signup / forgot_password / update_password) is replaced by Clerk's hosted
// sign-in. We keep this URL as a permanent 302 to Clerk's /sign-in route
// so any existing inbound links (emails, docs, ads) still land in a working
// place. Subroutes like /signin/signup also reach Clerk via the catch-all.

import { redirect } from 'next/navigation';

export default function SigninRedirect({
  params,
}: {
  params: { id: string };
}) {
  if (params.id === 'signup') redirect('/sign-up');
  if (params.id === 'forgot_password' || params.id === 'update_password') {
    redirect('/sign-in');
  }
  redirect('/sign-in');
}
