import { redirect } from 'next/navigation';
import { getMeOrNull } from '@/lib/auth';
import { roleHome } from '@/lib/config';
import { LandingPage } from '@/components/landing/landing-page';

export const metadata = {
  title: 'EduFlow — learn it, drill it, ace it',
  description:
    'EduFlow turns courses, live classes, and thousands of practice questions into one habit that gets you exam and interview ready. Pick a track and start today.',
};

/** Root: signed-in users go to their dashboard; everyone else meets the landing page.
 *  The landing is the public front door, so it must render even if the backend is briefly
 *  unreachable — any auth failure simply falls through to the marketing page. */
export default async function Home() {
  let me = null;
  try {
    me = await getMeOrNull();
  } catch {
    me = null;
  }
  if (me) redirect(roleHome(me.role));
  return <LandingPage />;
}
