import { forward } from '@/lib/bff';

/** Onboard a staff account — admin or counselor (admin only, audited). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return forward('/users', { method: 'POST', body });
}
