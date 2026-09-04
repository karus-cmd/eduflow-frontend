import { forward } from '@/lib/bff';

/** Deactivate a user — e.g. remove a manager (admin only, audited). Soft: flips status to
 *  `inactive` rather than deleting, so their historical leads/commission/enrollments stay intact
 *  for audit. They can no longer log in once their current access token expires. */
export async function POST(_req: Request, ctx: RouteContext<'/api/users/[id]/deactivate'>) {
  const { id } = await ctx.params;
  return forward(`/users/${id}/deactivate`, { method: 'POST' });
}
