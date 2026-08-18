import { forward } from '@/lib/bff';

/**
 * Trigger a password-reset email for the signed-in user (used by the profile Security tab).
 * The backend endpoint is public and always responds generically (no account enumeration).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  return forward('/auth/forgot-password', { method: 'POST', body });
}
