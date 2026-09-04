'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DeactivateUserButton } from '@/components/admin/deactivate-user-button';
import { PromoteUserForm } from '@/components/admin/promote-user-form';
import { formatDate } from '@/lib/format';
import type { College, UserPublic } from '@/lib/api/types';

export function AdminsList({
  admins,
  colleges,
  currentUserId,
}: {
  admins: UserPublic[];
  colleges: College[];
  currentUserId: string;
}) {
  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/users/${a.id}`} className="flex items-center gap-2 hover:text-primary">
                      {a.fullName}
                      {a.status !== 'active' && <Badge variant="destructive" className="capitalize">{a.status}</Badge>}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.email ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(a.createdAt)}</TableCell>
                  <TableCell className="text-muted-foreground">{a.lastLoginAt ? formatDate(a.lastLoginAt) : 'never'}</TableCell>
                  <TableCell className="text-right">
                    {a.id === currentUserId ? (
                      <span className="text-xs text-muted-foreground">You</span>
                    ) : (
                      <DeactivateUserButton userId={a.id} name={a.fullName} status={a.status} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    No other admins yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PromoteUserForm colleges={colleges} />
    </div>
  );
}
