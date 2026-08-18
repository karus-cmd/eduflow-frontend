import { redirect } from 'next/navigation';
import { getMe } from '@/lib/auth';
import { roleHome } from '@/lib/config';

/** Root: bounce to the signed-in user's home, or to /login (via getMe) if unauthenticated. */
export default async function Home() {
  const me = await getMe();
  redirect(roleHome(me.role));
}
