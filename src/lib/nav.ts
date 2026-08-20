/** The student area's top-level sections (rendered by AppShell's secondary nav). */
export const STUDENT_NAV: { href: string; label: string }[] = [
  { href: '/student', label: 'My Learning' },
  { href: '/student/browse', label: 'Browse courses' },
  { href: '/student/profile', label: 'Profile' },
];

/** The counselor/manager area's top-level sections. */
export const COUNSELOR_NAV: { href: string; label: string }[] = [
  { href: '/counselor', label: 'Dashboard' },
  { href: '/counselor/leads', label: 'Leads' },
  { href: '/counselor/students', label: 'Students' },
  { href: '/counselor/commission', label: 'Commission' },
  { href: '/counselor/courses', label: 'Courses' },
  { href: '/counselor/profile', label: 'Profile' },
];

/** The admin area's top-level sections (F4 adds Managers / Payouts / Reports). */
export const ADMIN_NAV: { href: string; label: string }[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/content', label: 'Content' },
];
