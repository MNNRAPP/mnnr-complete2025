import { redirect } from 'next/navigation';

export default async function SignIn({
  params,
}: {
  params: { id: string };
}) {
  // Legacy sign-in route — redirect to new sign-in page
  redirect('/sign-in');
}
