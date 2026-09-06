'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Globe, Loader2, Save, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SyllabusEditor } from '@/components/admin/syllabus-editor';
import { ResourceManager } from '@/components/admin/resource-manager';
import { LiveClassManager } from '@/components/admin/live-class-manager';
import { clientApi, ClientApiError } from '@/lib/client-api';
import type { AdminCourseDetail, LiveClass } from '@/lib/api/types';

export function CourseEditor({ course, liveClasses }: { course: AdminCourseDetail; liveClasses: LiveClass[] }) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);

  async function publish() {
    setPublishing(true);
    try {
      await clientApi.post(`/api/courses/${course.id}/publish`);
      router.refresh();
    } finally {
      setPublishing(false);
    }
  }

  const lessonCount = course.sections.reduce((a, s) => a + s.lessons.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
            <Badge variant={course.status === 'published' ? 'default' : 'outline'} className="capitalize">
              {course.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {course.sections.length} sections · {lessonCount} lessons
          </p>
        </div>
        {course.status !== 'published' ? (
          <Button onClick={publish} disabled={publishing}>
            {publishing ? <Loader2 className="size-4 animate-spin" /> : <Globe className="size-4" />}
            Publish
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-4" /> Live
          </span>
        )}
      </div>

      <Tabs defaultValue="curriculum">
        <TabsList>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="live">Live classes</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="pt-2">
          <SyllabusEditor courseId={course.id} sections={course.sections} />
        </TabsContent>

        <TabsContent value="settings" className="pt-2">
          <SettingsForm course={course} />
        </TabsContent>

        <TabsContent value="resources" className="pt-2">
          <Card>
            <CardContent className="p-4">
              <ResourceManager
                resources={course.resources}
                addEndpoint={`/api/courses/${course.id}/resources`}
                emptyText="No course-level resources yet."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="pt-2">
          <LiveClassManager courseId={course.id} liveClasses={liveClasses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsForm({ course }: { course: AdminCourseDetail }) {
  const router = useRouter();
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? '');
  const [price, setPrice] = useState(String(Number(course.pricePaise) / 100 || ''));
  const [mrp, setMrp] = useState(course.mrpPaise ? String(Number(course.mrpPaise) / 100) : '');
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnailUrl ?? '');
  const [accessDays, setAccessDays] = useState(course.accessDays ? String(course.accessDays) : '');
  // The Complete tier. Until now it could only be set by a seed script, so no two-tier course
  // could be created through the UI at all.
  const [hasComplete, setHasComplete] = useState(course.premiumPricePaise != null);
  const [premiumPrice, setPremiumPrice] = useState(
    course.premiumPricePaise ? String(Number(course.premiumPricePaise) / 100) : '',
  );
  const [premiumMrp, setPremiumMrp] = useState(
    course.premiumMrpPaise ? String(Number(course.premiumMrpPaise) / 100) : '',
  );
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const standard = Number(price) || 0;
    const complete = Number(premiumPrice) || 0;
    if (hasComplete && complete <= 0) {
      setError('Enter a Complete price, or turn the Complete plan off.');
      return;
    }
    if (hasComplete && complete <= standard) {
      setError(`The Complete price must be higher than the Standard price (₹${standard.toLocaleString('en-IN')}).`);
      return;
    }
    if (hasComplete && premiumMrp && Number(premiumMrp) < complete) {
      setError('The Complete MRP cannot be lower than the Complete price.');
      return;
    }
    if (hasComplete && standard <= 0) {
      setError('Set a Standard price above ₹0 — checkout skips free courses, so the Complete plan would be unreachable.');
      return;
    }

    setBusy(true);
    setSaved(false);
    setError('');
    try {
      await clientApi.patch(`/api/courses/${course.id}`, {
        title: title.trim(),
        description: description.trim() || undefined,
        pricePaise: Math.round(standard * 100),
        ...(mrp ? { mrpPaise: Math.round(Number(mrp) * 100) } : {}),
        // Always sent, never omitted: null is what REMOVES the tier. The `...(x ? {} : {})`
        // spread used above for mrp is precisely what would make un-checking the box a no-op.
        premiumPricePaise: hasComplete ? Math.round(complete * 100) : null,
        premiumMrpPaise: hasComplete && premiumMrp ? Math.round(Number(premiumMrp) * 100) : null,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        ...(accessDays ? { accessDays: Number(accessDays) } : {}),
      });
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof ClientApiError ? e.message : 'Could not save settings.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await fetch(`/api/courses/${course.id}`, { method: 'DELETE' });
      router.push('/admin/content');
      router.refresh();
    } catch {
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardContent className="max-w-2xl space-y-4 p-4">
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="c-title">Title</Label>
            <Input id="c-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-desc">Description</Label>
            <Textarea id="c-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-24" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-price">Price (₹)</Label>
              <Input id="c-price" type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-mrp">MRP (₹, optional)</Label>
              <Input id="c-mrp" type="number" min={0} value={mrp} onChange={(e) => setMrp(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-days">Access (days)</Label>
              <Input id="c-days" type="number" min={1} value={accessDays} onChange={(e) => setAccessDays(e.target.value)} placeholder="365" />
            </div>
          </div>
          <div className="space-y-3 rounded-lg border p-3">
            <div className="flex items-start gap-2.5">
              <input
                id="c-has-complete"
                type="checkbox"
                checked={hasComplete}
                onChange={(e) => setHasComplete(e.target.checked)}
                className="mt-0.5 size-4 accent-[var(--primary)]"
              />
              <div className="space-y-1">
                <Label htmlFor="c-has-complete">Offer a Complete plan</Label>
                <p className="text-xs text-muted-foreground">
                  A second, higher-priced tier that also unlocks this course&rsquo;s Complete-tier
                  sections. Leave off for a normal single-tier course.
                </p>
              </div>
            </div>

            {hasComplete ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="c-premium-price">Complete price (₹)</Label>
                  <Input
                    id="c-premium-price"
                    type="number"
                    min={0}
                    value={premiumPrice}
                    onChange={(e) => setPremiumPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-premium-mrp">Complete MRP (₹, optional)</Label>
                  <Input
                    id="c-premium-mrp"
                    type="number"
                    min={0}
                    value={premiumMrp}
                    onChange={(e) => setPremiumMrp(e.target.value)}
                  />
                </div>
              </div>
            ) : course.premiumPricePaise != null ? (
              <p className="text-xs text-[var(--warning)]">
                Saving will remove this course&rsquo;s Complete plan. Students can no longer buy or
                upgrade to it, and any Complete-tier sections become unreachable.
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="c-thumb">Thumbnail URL</Label>
            <Input id="c-thumb" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://…" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save settings
            </Button>
            {saved && <span className="text-sm text-emerald-600 dark:text-emerald-500">Saved.</span>}
          </div>
        </form>

        <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <div className="text-sm">
            <p className="font-medium text-destructive">Delete course</p>
            <p className="text-xs text-muted-foreground">Soft-deletes the course (students lose access).</p>
          </div>
          {confirmDel ? (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="destructive" onClick={remove} disabled={deleting}>
                {deleting ? <Loader2 className="size-4 animate-spin" /> : null} Confirm
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDel(false)} disabled={deleting}>Cancel</Button>
            </div>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => setConfirmDel(true)}>
              <Trash2 className="size-4" /> Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
