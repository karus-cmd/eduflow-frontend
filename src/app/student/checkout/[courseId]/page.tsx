import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { CheckoutClient } from '@/components/checkout-client';
import { requireRole } from '@/lib/auth';
import { ApiError, serverApi } from '@/lib/server-api';
import { STUDENT_NAV } from '@/lib/nav';
import type { CourseDetail } from '@/lib/api/types';

export const metadata = { title: 'Checkout · STEIN-X' };

export default async function CheckoutPage(props: PageProps<'/student/checkout/[courseId]'>) {
  const { courseId } = await props.params;
  const me = await requireRole(['student']);

  let course: CourseDetail;
  try {
    course = await serverApi<CourseDetail>(`/courses/${courseId}`);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) notFound();
    throw e;
  }

  // Already enrolled at the top tier this course offers → straight into the course. A Standard
  // enrollment on a course with a Complete plan still lands here, to upgrade. Free course → can't
  // checkout (positive amount only).
  const canUpgrade = course.enrolledTier === 'standard' && course.premiumPricePaise != null;
  if (course.enrolled && !canUpgrade) redirect(`/student/learn/${course.id}`);
  if (Number(course.pricePaise) <= 0) redirect(`/student/courses/${course.id}`);

  return (
    <AppShell title="Checkout" user={me} nav={STUDENT_NAV} homeHref="/student">
      <Link
        href={`/student/courses/${course.id}`}
        className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to course
      </Link>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Checkout</h1>
      <CheckoutClient
        course={{
          id: course.id,
          title: course.title,
          pricePaise: course.pricePaise,
          mrpPaise: course.mrpPaise,
          premiumPricePaise: course.premiumPricePaise,
          premiumMrpPaise: course.premiumMrpPaise,
          thumbnailUrl: course.thumbnailUrl,
        }}
        user={{ fullName: me.fullName, email: me.email, phone: me.phone }}
        upgradeOnly={canUpgrade}
      />
    </AppShell>
  );
}
