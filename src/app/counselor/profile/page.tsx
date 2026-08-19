import { AppShell } from '@/components/app-shell';
import { ProfileClient } from '@/components/profile-client';
import { requireRole } from '@/lib/auth';
import { COUNSELOR_NAV } from '@/lib/nav';

export const metadata = { title: 'Profile · EduFlow' };

export default async function CounselorProfilePage() {
  const me = await requireRole(['counselor', 'team_lead']);

  return (
    <AppShell title="Profile" user={me} nav={COUNSELOR_NAV} homeHref="/counselor">
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
