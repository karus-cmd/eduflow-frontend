'use client';

import { useEffect, useRef, useState } from 'react';
import { Film, Loader2, TriangleAlert } from 'lucide-react';
import { clientApi, ClientApiError } from '@/lib/client-api';
import type { PlaybackToken } from '@/lib/api/types';

type Status = 'loading' | 'ready' | 'notReady' | 'error';

const PROGRESS_INTERVAL_MS = 15_000; // §12.6 throttle

/**
 * HLS.js video player. Fetches a signed playback URL from the backend (per lesson) and streams it,
 * falling back to native HLS on Safari/iOS. Reports watched seconds every ~15s via `onProgress`.
 * Degrades gracefully when the video isn't ready yet (Worker not deployed / clip not uploaded).
 */
export function VideoPlayer({
  lessonId,
  title,
  onProgress,
  startPositionSec = 0,
}: {
  lessonId: string;
  title: string;
  onProgress?: (watchedSec: number, positionSec: number) => void;
  /** Resume from this position (seconds) once the media is ready. */
  startPositionSec?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const lastReport = useRef(0);
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const startRef = useRef(startPositionSec);
  startRef.current = startPositionSec;
  const didSeek = useRef(false);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hls: any = null;
    const video = videoRef.current;
    lastReport.current = 0;
    didSeek.current = false;
    setStatus('loading');
    setMessage('');

    async function start() {
      let token: PlaybackToken;
      try {
        token = await clientApi.get<PlaybackToken>(`/api/lessons/${lessonId}/playback`);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ClientApiError && e.status === 404) {
          setStatus('notReady');
        } else {
          setStatus('error');
          setMessage(e instanceof ClientApiError ? e.message : 'Could not start playback.');
        }
        return;
      }
      if (cancelled || !video) return;

      video.poster = token.poster || '';

      // Native HLS (Safari / iOS) — just set the source.
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = token.masterUrl;
        setStatus('ready');
        return;
      }

      // Everyone else — hls.js (imported client-side only).
      try {
        const mod = await import('hls.js');
        const Hls = mod.default;
        if (cancelled) return;
        if (Hls.isSupported()) {
          hls = new Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(token.masterUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, (_evt: unknown, data: { fatal?: boolean }) => {
            if (data?.fatal) {
              setStatus('error');
              setMessage('Playback error — the video stream could not be loaded.');
            }
          });
          setStatus('ready');
        } else {
          setStatus('error');
          setMessage('This browser cannot play the video format.');
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
          setMessage('Failed to initialise the video player.');
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      if (hls) hls.destroy();
      if (video) {
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [lessonId]);

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;
    const now = Date.now();
    if (now - lastReport.current < PROGRESS_INTERVAL_MS) return;
    lastReport.current = now;
    onProgressRef.current?.(Math.floor(video.currentTime), Math.floor(video.currentTime));
  }

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video || didSeek.current) return;
    didSeek.current = true;
    const pos = startRef.current;
    // Resume a bit before the saved point; ignore if it's basically the end.
    if (pos > 3 && Number.isFinite(video.duration) && pos < video.duration - 5) {
      video.currentTime = pos;
    }
  }

  function handleEnded() {
    const video = videoRef.current;
    if (!video) return;
    lastReport.current = Date.now();
    const watched = Math.floor(video.duration || video.currentTime);
    onProgressRef.current?.(watched, Math.floor(video.currentTime));
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        controls
        playsInline
        className="h-full w-full"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {status !== 'ready' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center text-white">
          {status === 'loading' && (
            <>
              <Loader2 className="size-8 animate-spin" />
              <p className="text-sm text-white/80">Loading player…</p>
            </>
          )}
          {status === 'notReady' && (
            <>
              <Film className="size-9 text-white/70" />
              <div>
                <p className="font-medium">Video is being prepared</p>
                <p className="mt-1 max-w-sm text-sm text-white/70">
                  “{title}” doesn&rsquo;t have a ready video yet. Once the clip is transcoded and the video
                  Worker is live, it will play here automatically.
                </p>
              </div>
            </>
          )}
          {status === 'error' && (
            <>
              <TriangleAlert className="size-9 text-amber-400" />
              <div>
                <p className="font-medium">Can&rsquo;t play this video</p>
                <p className="mt-1 max-w-sm text-sm text-white/70">{message}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
