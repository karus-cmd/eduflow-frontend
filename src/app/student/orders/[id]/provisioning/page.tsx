import { AppShell } from '@/components/app-shell';
import { ProvisioningPoller } from '@/components/provisioning-poller';
import { requireRole } from '@/lib/auth';
import { STUDENT_NAV } from '@/lib/nav';

export const metadata = { title: 'Provisioning access · EduFlow' };

export default async function ProvisioningPage(props: PageProps<'/student/orders/[id]/provisioning'>) {
  const { id } = await props.params;
  const me = await requireRole(['student']);

  return (
    <AppShell title="Checkout" user={me} nav={STUDENT_NAV} homeHref="/student">
      <div className="mx-auto max-w-lg">
        <ProvisioningPoller orderId={id} />
      </div>
    </AppShell>
  );
}
