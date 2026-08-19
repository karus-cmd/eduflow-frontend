import { forward } from '@/lib/bff';

/** Self-service profile edit — basic fields only (backend rejects role/email/etc). */
export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  return forward('/me', { method: 'PATCH', body });
}
