import { forward } from '@/lib/bff';

/** Schedule a follow-up on an owned lead. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return forward('/follow-ups', { method: 'POST', body });
}
