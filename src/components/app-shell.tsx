import type { ReactNode } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { LogoutButton } from '@/components/logout-button';
import { ShellNav, type NavLink } from '@/components/shell-nav';

export function AppShell({
  title,
  user,
  nav,
  homeHref = '/',
  children,
}: {
  title: string;
  user: { fullName: string; role: string };
  /** Optional secondary nav (e.g. the student's My Learning / Browse / Profile). */
  nav?: NavLink[];
  /** Where the "EduFlow" wordmark links to (defaults to root, which bounces to the role home). */
  homeHref?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-baseline gap-3">
            <Link href={homeHref} className="text-lg font-semibold tracking-tight">
              EduFlow
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="max-w-[9rem] truncate text-sm font-medium sm:max-w-none">{user.fullName}</div>
              <Badge variant="secondary" className="mt-0.5 capitalize">
                {user.role}
              </Badge>
            </div>
            <LogoutButton />
          </div>
        </div>
        {nav && nav.length > 0 && (
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <ShellNav links={nav} />
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
