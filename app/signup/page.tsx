import { redirect } from 'next/navigation';

export default function SignUpPage() {
  // Redirect to signin page which handles both sign in and sign up
  redirect('/signin/signup');
}
