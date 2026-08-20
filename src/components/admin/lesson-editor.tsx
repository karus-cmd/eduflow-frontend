'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Film, Info, Loader2, Save, Trash2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ResourceManager } from '@/components/admin/resource-manager';
import { clientApi, ClientApiError } from '@/lib/client-api';
import type { AdminLesson, VideoRegisterResult } from '@/lib/api/types';

/** toISO for a datetime-local value; '' → undefined. */
function localToIso(v: string): string | undefined {
  return v ? new Date(v).toISOString() : undefined;
}
/** ISO → datetime-local value (local tz), or ''. */
function isoToLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function LessonEditor({ lesson, onDeleted }: { lesson: AdminLesson; onDeleted: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(lesson.title);
  const [status, setStatus] = useState(lesson.status);
  const [isFreePreview, setIsFreePreview] = useState(lesson.isFreePreview);
  const [availableAt, setAvailableAt] = useState(isoToLocal(lesson.availableAt));
  const [description, setDescription] = useState(lesson.description ?? '');
  const [contentHtml, setContentHtml] = useState(lesson.contentHtml ?? '');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    setError('');
    try {
      await clientApi.patch(`/api/lessons/${lesson.id}`, {
        title: title.trim(),
        status,
        isFreePreview,
        description: description.trim() || undefined,
        contentHtml: contentHtml.trim() || undefined,
        availableAt: localToIso(availableAt),
      });
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not save the lesson.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await fetch(`/api/lessons/${lesson.id}`, { method: 'DELETE' });
      onDeleted();
      router.refresh();
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Lesson</CardTitle>
          {confirmDelete ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Delete lesson?</span>
              <Button size="xs" variant="destructive" onClick={remove} disabled={deleting}>
                {deleting ? <Loader2 className="size-3.5 animate-spin" /> : null} Yes
              </Button>
              <Button size="xs" variant="ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                No
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" /> Delete
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="l-title">Title</Label>
              <Input id="l-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="l-status">Visibility</Label>
                <Select id="l-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="published">Published</option>
                  <option value="draft">Draft (hidden)</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="l-drip">Drip until (optional)</Label>
                <Input id="l-drip" type="datetime-local" value={availableAt} onChange={(e) => setAvailableAt(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 pt-6 text-sm">
                <input type="checkbox" checked={isFreePreview} onChange={(e) => setIsFreePreview(e.target.checked)} className="size-4" />
                Free preview
              </label>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-desc">Description</Label>
              <Textarea id="l-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short summary shown under the video." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-html">Lesson content (HTML)</Label>
              <Textarea id="l-html" value={contentHtml} onChange={(e) => setContentHtml(e.target.value)} className="min-h-24 font-mono text-xs" placeholder="<p>Notes, links, code…</p>" />
              <p className="text-xs text-muted-foreground">Rendered as HTML in the player.</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save lesson
              </Button>
              {saved && <span className="text-sm text-emerald-600 dark:text-emerald-500">Saved.</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <VideoPanel lesson={lesson} />

      <Card>
        <CardHeader>
          <CardTitle>Lesson resources</CardTitle>
        </CardHeader>
        <CardContent>
          <ResourceManager resources={lesson.resources ?? []} addEndpoint={`/api/lessons/${lesson.id}/resources`} emptyText="No resources attached to this lesson." />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Video is a register → transcode+rclone (CLI) → finalize pipeline (§13.7). The browser can't upload
 * the HLS package directly against the current contract, so this registers the asset (returning the R2
 * upload target + the CLI steps) and lets the admin mark it ready once uploaded.
 */
function VideoPanel({ lesson }: { lesson: AdminLesson }) {
  const router = useRouter();
  const [reg, setReg] = useState<VideoRegisterResult | null>(null);
  const [assetId, setAssetId] = useState<string | null>(lesson.videoAssetId);
  const [allowDownload, setAllowDownload] = useState(true);
  const [duration, setDuration] = useState('');
  const [busy, setBusy] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function register() {
    setBusy(true);
    setError('');
    try {
      const r = await clientApi.post<VideoRegisterResult>('/api/videos', { lessonId: lesson.id, allowDownload });
      setReg(r);
      setAssetId(r.videoAssetId);
      router.refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not register the video.');
    } finally {
      setBusy(false);
    }
  }

  async function finalize() {
    if (!assetId) return;
    setFinalizing(true);
    setError('');
    try {
      // Renditions come from the transcode step; a single 720p ladder is a sensible default.
      await clientApi.post(`/api/videos/${assetId}/finalize`, {
        renditions: [{ height: 720, bandwidth: 2_500_000, playlist: '720p/index.m3u8' }],
        ...(duration ? { durationSec: Number(duration) } : {}),
      });
      setDone(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not finalize the video.');
    } finally {
      setFinalizing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="size-4" /> Video
          {assetId && <Badge variant="secondary">Registered</Badge>}
          {done && <Badge>Ready</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>
            Self-hosted HLS on R2 (§13.7): <strong>register</strong> → transcode + upload via the CLI (
            <code>transcode.sh</code> → <code>upload.sh</code>) → <strong>finalize</strong>. Direct
            in-browser upload isn&rsquo;t in the API contract (it would need a presigned-PUT endpoint).
          </span>
        </div>

        {!assetId ? (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={allowDownload} onChange={(e) => setAllowDownload(e.target.checked)} className="size-4" />
              Allow download
            </label>
            <Button onClick={register} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Register video
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {reg && (
              <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                <p className="mb-1 font-medium">Upload the transcoded HLS package to:</p>
                <code className="block break-all rounded bg-background px-2 py-1">{reg.uploadTarget}</code>
                <p className="mt-2 text-muted-foreground">Then: {reg.next}</p>
              </div>
            )}
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <Label htmlFor="v-dur" className="text-xs">Duration (sec, optional)</Label>
                <Input id="v-dur" type="number" min={0} value={duration} onChange={(e) => setDuration(e.target.value)} className="w-40" placeholder="1530" />
              </div>
              <Button onClick={finalize} disabled={finalizing} variant="secondary">
                {finalizing ? <Loader2 className="size-4 animate-spin" /> : null}
                Finalize (mark ready)
              </Button>
            </div>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
