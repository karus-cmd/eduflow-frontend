import { forward } from '@/lib/bff';

/** Log a conversation on an owned lead — advances the stage + stamps last-contacted. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return forward('/conversations', { method: 'POST', body });
}
