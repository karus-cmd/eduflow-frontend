import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { LogoutButton } from '@/components/logout-button';

export function AppShell({
  title,
  user,
  children,
}: {
  title: string;
  user: { fullName: string; role: string };
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-semibold tracking-tight">EduFlow</span>
            <span className="text-sm text-muted-foreground">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="text-sm font-medium">{user.fullName}</div>
              <Badge variant="secondary" className="mt-0.5 capitalize">
                {user.role}
              </Badge>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
