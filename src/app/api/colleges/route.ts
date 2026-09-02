import { forward } from '@/lib/bff';

/** List colleges (admin) — includes the org's default "General" college. */
export async function GET() {
  return forward('/colleges');
}

/** Create a college (admin, audited). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return forward('/colleges', { method: 'POST', body });
}
