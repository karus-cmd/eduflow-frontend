'use client';

import { useEffect } from 'react';
import { clientApi } from '@/lib/client-api';

const PING_INTERVAL_MS = 60_000;

/** Fires a ~60s heartbeat while this tab is open and visible, so real usage time accrues
 *  (§ student streak/study-time). Silently no-ops on failure — never surface an error for this. */
export function ActivityHeartbeat() {
  useEffect(() => {
    function ping() {
      if (document.visibilityState !== 'visible') return;
      clientApi.post('/api/me/activity/ping', { seconds: 60 }).catch(() => {});
    }
    const id = setInterval(ping, PING_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
  return null;
}
