import { AppShell } from '@/components/app-shell';
import { PageMark } from '@/components/stickers/page-mark';
import { ProfileClient } from '@/components/profile-client';
import { requireRole } from '@/lib/auth';
import { STUDENT_NAV } from '@/lib/nav';

export const metadata = { title: 'Profile · STEIN-X' };

export default async function ProfilePage() {
  const me = await requireRole(['student']);

  return (
    <AppShell title="Profile" user={me} nav={STUDENT_NAV} homeHref="/student">
      <div className="relative">
        <PageMark name="keycap" variant="watermark" tone="ink" className="-top-6 right-0" />
        <h1 className="relative mb-6 text-2xl font-semibold tracking-tight">Profile &amp; settings</h1>
      </div>
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
