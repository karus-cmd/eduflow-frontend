import type { NextRequest } from 'next/server';
import { forward } from '@/lib/bff';

/** List users — filter by ?role=/?status=/?email= (admin only). Also used to look up an
 *  existing account by email before promoting it. */
export async function GET(req: NextRequest) {
  const qs = req.nextUrl.search;
  return forward(`/users${qs}`);
}

/** Onboard a staff account — admin or counselor (admin only, audited). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return forward('/users', { method: 'POST', body });
}
