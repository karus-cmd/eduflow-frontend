import { AppShell } from '@/components/app-shell';
import { ProfileClient } from '@/components/profile-client';
import { requireRole } from '@/lib/auth';
import { STUDENT_NAV } from '@/lib/nav';

export const metadata = { title: 'Profile · EduFlow' };

export default async function ProfilePage() {
  const me = await requireRole(['student']);

  return (
    <AppShell title="Profile" user={me} nav={STUDENT_NAV} homeHref="/student">
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
