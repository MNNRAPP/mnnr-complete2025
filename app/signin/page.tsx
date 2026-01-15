import { redirect } from 'next/navigation';

export default function SignInPage() {
  // Redirect to Clerk sign-in page
  redirect('/sign-in');
}
