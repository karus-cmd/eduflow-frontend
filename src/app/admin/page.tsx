import { AppShell } from '@/components/app-shell';
import { PageMark } from '@/components/stickers/page-mark';
import { StatCard } from '@/components/stat-card';
import { DashboardManagers } from '@/components/admin/dashboard-managers';
import { requireRole } from '@/lib/auth';
import { serverApi } from '@/lib/server-api';
import { formatPaise } from '@/lib/money';
import { ADMIN_NAV } from '@/lib/nav';
import type { AdminDashboard, College, CounselorListItem, Paginated } from '@/lib/api/types';

export default async function AdminDashboardPage() {
  const me = await requireRole(['admin', 'finance']);
  const [dash, managers, colleges] = await Promise.all([
    serverApi<AdminDashboard>('/dashboard/admin'),
    serverApi<Paginated<CounselorListItem>>('/counselors?limit=50'),
    serverApi<College[]>('/colleges').catch(() => [] as College[]),
  ]);
  const s = dash.stats;

  return (
    <AppShell title="Admin" user={me} nav={ADMIN_NAV} homeHref="/admin">
      <div className="relative mb-6 overflow-hidden">
        <PageMark name="gauge" variant="watermark" className="-top-4 right-0" size={140} />
        <h1 className="relative font-heading text-3xl font-extrabold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">The whole institute at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Revenue" value={formatPaise(s.revenuePaise)} hint="paid orders" icon={<IconCoin />} accent="azure" />
        <StatCard label="Managers" value={s.counselors} icon={<IconUsers />} accent="ink" />
        <StatCard label="Students" value={s.students} icon={<IconCap />} accent="lime" />
        <StatCard label="Enrollments" value={s.enrollments} icon={<IconCheck />} accent="coral" />
        <StatCard label="Leads" value={s.leads} icon={<IconFunnel />} accent="azure" />
        <StatCard label="Convos today" value={s.conversationsToday} icon={<IconChat />} accent="coral" />
      </div>

      <DashboardManagers managers={managers.data} colleges={colleges} />
    </AppShell>
  );
}

/* ---- icons ---- */
function IconCoin() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><path d="M9.5 9h4M9 12.5h6M11 15l2-5" /></svg>; }
function IconUsers() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M3.5 20c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5M16 6a3 3 0 0 1 0 6M18 15.5c2 .4 3.5 1.6 3.5 4" /></svg>; }
function IconCap() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-4 9 4-9 4z" /><path d="M7 11v4c0 1.1 2.2 2 5 2s5-.9 5-2v-4M21 9v5" /></svg>; }
function IconCheck() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>; }
function IconFunnel() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16l-6 7v6l-4-2v-4z" /></svg>; }
function IconChat() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" /></svg>; }
