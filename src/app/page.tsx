import { redirect } from 'next/navigation';
import { getMeOrNull } from '@/lib/auth';
import { roleHome } from '@/lib/config';
import { getLandingCatalog } from '@/lib/catalog';
import { LandingPage } from '@/components/landing/landing-page';

export const metadata = {
  title: 'STEIN-X — learn the patterns, get the offer',
  description:
    'Two structured tracks for software-engineering roles: DSA patterns and machine learning. One ordered path per track, with mentor support and timed mock interviews on the paid plans.',
};

/** Root: signed-in users go to their dashboard; everyone else meets the landing page.
 *  The landing is the public front door, so it must render even if the backend is briefly
 *  unreachable — any auth failure simply falls through to the marketing page. */
export default async function Home() {
  // Started BEFORE awaiting auth, for two reasons: it overlaps the two backend round trips, and it
  // puts the fetch's discovery ahead of the request-time cookies() call so Next's Data Cache still
  // applies to it. getLandingCatalog never rejects, so there is no floating-rejection risk.
  const catalogPromise = getLandingCatalog();

  let me = null;
  try {
    me = await getMeOrNull();
  } catch {
    me = null;
  }
  if (me) redirect(roleHome(me.role));
  return <LandingPage catalog={await catalogPromise} />;
}
