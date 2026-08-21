import { AppShell } from '@/components/app-shell';
import { ProfileClient } from '@/components/profile-client';
import { requireRole } from '@/lib/auth';
import { ADMIN_NAV } from '@/lib/nav';

export const metadata = { title: 'Settings · EduFlow' };

export default async function AdminSettingsPage() {
  const me = await requireRole(['admin', 'finance']);

  return (
    <AppShell title="Settings" user={me} nav={ADMIN_NAV} homeHref="/admin">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Profile &amp; settings</h1>
      <ProfileClient
        user={{
          fullName: me.fullName,
          email: me.email,
          phone: me.phone,
          role: me.role,
          status: me.status,
          lastLoginAt: me.lastLoginAt,
        }}
      />
    </AppShell>
  );
}
