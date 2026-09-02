import { forward } from '@/lib/bff';

/** List pending admin invites (admin only — `settings.manage`). */
export async function GET() {
  return forward('/admin-invites');
}

/** Invite an email to become admin automatically on first Google sign-in (admin only, audited). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return forward('/admin-invites', { method: 'POST', body });
}
