import { forward } from '@/lib/bff';

/** Authenticated password change (current + new). The backend revokes other sessions on success. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return forward('/auth/change-password', { method: 'POST', body });
}
