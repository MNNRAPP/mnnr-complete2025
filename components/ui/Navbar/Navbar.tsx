import { getAuthenticatedUser } from '@/lib/auth';
import s from './Navbar.module.css';
import Navlinks from './Navlinks';

export default async function Navbar() {
  let user = null;

  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    // Continue without auth - user is null
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
