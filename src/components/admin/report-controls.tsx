'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

/** Date-range picker for the counselor report; navigates with ?from&to (server re-fetches the rollup). */
export function ReportControls({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const [f, setF] = useState(from);
  const [t, setT] = useState(to);

  function apply() {
    router.push(`/admin/reports?from=${f}&to=${t}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="r-from" className="text-xs">From</Label>
        <Input id="r-from" type="date" value={f} onChange={(e) => setF(e.target.value)} className="w-44" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="r-to" className="text-xs">To</Label>
        <Input id="r-to" type="date" value={t} onChange={(e) => setT(e.target.value)} className="w-44" />
      </div>
      <Button onClick={apply} variant="outline">Apply</Button>
    </div>
  );
}
