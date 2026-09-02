import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** List leads assigned to the caller (counselor) or in-org (admin), per query filters. */
export async function GET(req: NextRequest) {
  const qs = req.nextUrl.search;
  return forward(`/leads${qs}`);
}

/** Create a lead (counselor creates against themselves; admin may assign). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return forward('/leads', { method: 'POST', body });
}
