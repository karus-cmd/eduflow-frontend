import { redirect } from 'next/navigation';
import { getMeOrNull } from '@/lib/auth';
import { roleHome } from '@/lib/config';
import { LandingPage } from '@/components/landing/landing-page';

export const metadata = {
  title: 'EduFlow — enrollment, learning & commission in one flow',
  description:
    'EduFlow unifies your admissions pipeline, learning platform, and commission ledger — so a lead becomes a student, a student becomes revenue, and nothing slips between the two.',
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
