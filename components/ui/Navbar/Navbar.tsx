import { createClient } from '@/utils/supabase/server';
import s from './Navbar.module.css';
import Navlinks from './Navlinks';

export default async function Navbar() {
  let user = null;

  try {
    const supabase = createClient();
    const getUserPromise = supabase.auth.getUser();
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 2000)
    );
    const response = await Promise.race([getUserPromise, timeout]);
    user = response.data.user ?? null;
  } catch (error) {
    console.warn('Failed to get user, continuing without auth:', error);
  }

  return (
    <nav className={s.root}>
      <a href="#skip" className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <div className="max-w-6xl px-6 mx-auto">
        <Navlinks user={user} />
      </div>
    </nav>
  );
}
