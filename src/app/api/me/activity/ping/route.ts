import { forward } from '@/lib/bff';

/** Heartbeat from an open, visible tab — accrues real study-time/streak (§ student activity). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return forward('/me/activity/ping', { method: 'POST', body });
}
