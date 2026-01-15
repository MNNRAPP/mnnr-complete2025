import { redirect } from 'next/navigation';

export default function SignUpPage() {
  // Redirect to Clerk sign-up page
  redirect('/sign-up');
}
