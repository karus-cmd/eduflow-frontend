import { forward } from '@/lib/bff';

/** Register a video asset for a lesson (admin) → returns the R2 upload target. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return forward('/videos', { method: 'POST', body });
}
