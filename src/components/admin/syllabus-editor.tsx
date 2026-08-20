'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, ChevronUp, Film, GripVertical, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LessonEditor } from '@/components/admin/lesson-editor';
import { clientApi } from '@/lib/client-api';
import { cn } from '@/lib/utils';
import type { AdminLesson, AdminSection } from '@/lib/api/types';

export function SyllabusEditor({ courseId, sections }: { courseId: string; sections: AdminSection[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const selectedLesson = useMemo<AdminLesson | null>(() => {
    for (const s of sections) for (const l of s.lessons) if (l.id === selected) return l;
    return null;
  }, [sections, selected]);

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      {/* Curriculum tree */}
      <div className="space-y-4">
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            courseId={courseId}
            section={section}
            selected={selected}
            onSelect={setSelected}
            onChange={() => router.refresh()}
          />
        ))}
        <AddSectionForm courseId={courseId} />
      </div>

      {/* Lesson editor */}
      <div>
        {selectedLesson ? (
          <LessonEditor key={selectedLesson.id} lesson={selectedLesson} onDeleted={() => setSelected(null)} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            Select a lesson to edit it, or add one to a section.
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({
  courseId,
  section,
  selected,
  onSelect,
  onChange,
}: {
  courseId: string;
  section: AdminSection;
  selected: string | null;
  onSelect: (id: string) => void;
  onChange: () => void;
}) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [confirmDel, setConfirmDel] = useState(false);
  const [newLesson, setNewLesson] = useState('');
  const [busy, setBusy] = useState(false);

  const lessons = section.lessons;

  async function renameSection() {
    await clientApi.patch(`/api/sections/${section.id}`, { title: title.trim() });
    setRenaming(false);
    onChange();
  }
  async function deleteSection() {
    await fetch(`/api/sections/${section.id}`, { method: 'DELETE' });
    onChange();
  }
  async function addLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!newLesson.trim()) return;
    setBusy(true);
    try {
      await clientApi.post(`/api/sections/${section.id}/lessons`, { title: newLesson.trim(), status: 'published' });
      setNewLesson('');
      onChange();
    } finally {
      setBusy(false);
    }
  }
  async function move(idx: number, dir: -1 | 1) {
    const next = [...lessons];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    await clientApi.post(`/api/sections/${section.id}/reorder`, { orderedIds: next.map((l) => l.id) });
    router.refresh();
  }

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
        {renaming ? (
          <div className="flex flex-1 items-center gap-1">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-7" autoFocus />
            <Button size="icon-sm" variant="ghost" onClick={renameSection} aria-label="Save"><Check className="size-4" /></Button>
            <Button size="icon-sm" variant="ghost" onClick={() => setRenaming(false)} aria-label="Cancel"><X className="size-4" /></Button>
          </div>
        ) : (
          <>
            <span className="truncate text-sm font-medium">{section.title}</span>
            <div className="flex shrink-0 items-center">
              <Button size="icon-sm" variant="ghost" onClick={() => setRenaming(true)} aria-label="Rename section"><Pencil className="size-3.5" /></Button>
              {confirmDel ? (
                <span className="flex items-center gap-1 text-xs">
                  <Button size="xs" variant="destructive" onClick={deleteSection}>Yes</Button>
                  <Button size="xs" variant="ghost" onClick={() => setConfirmDel(false)}>No</Button>
                </span>
              ) : (
                <Button size="icon-sm" variant="ghost" onClick={() => setConfirmDel(true)} aria-label="Delete section"><Trash2 className="size-3.5 text-destructive" /></Button>
              )}
            </div>
          </>
        )}
      </div>

      <ul className="divide-y">
        {lessons.map((l, i) => (
          <li key={l.id}>
            <div className={cn('flex items-center gap-1.5 px-2 py-1.5 text-sm', selected === l.id && 'bg-primary/10')}>
              <GripVertical className="size-3.5 shrink-0 text-muted-foreground/50" />
              <button onClick={() => onSelect(l.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left hover:text-primary">
                <span className="truncate">{l.title}</span>
                {l.videoAssetId && <Film className="size-3.5 shrink-0 text-muted-foreground" />}
                {l.status === 'draft' && <Badge variant="outline" className="shrink-0">Draft</Badge>}
                {l.isFreePreview && <Badge variant="secondary" className="shrink-0">Free</Badge>}
              </button>
              <div className="flex shrink-0">
                <Button size="icon-sm" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><ChevronUp className="size-3.5" /></Button>
                <Button size="icon-sm" variant="ghost" onClick={() => move(i, 1)} disabled={i === lessons.length - 1} aria-label="Move down"><ChevronDown className="size-3.5" /></Button>
              </div>
            </div>
          </li>
        ))}
        {lessons.length === 0 && <li className="px-3 py-2 text-xs text-muted-foreground">No lessons yet.</li>}
      </ul>

      <form onSubmit={addLesson} className="flex items-center gap-1.5 border-t p-2">
        <Input value={newLesson} onChange={(e) => setNewLesson(e.target.value)} placeholder="New lesson title" className="h-8" />
        <Button type="submit" size="sm" disabled={busy || !newLesson.trim()}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
        </Button>
      </form>
    </Card>
  );
}

function AddSectionForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await clientApi.post(`/api/courses/${courseId}/sections`, { title: title.trim() });
      setTitle('');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={add} className="flex items-center gap-2">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New section title" />
      <Button type="submit" variant="outline" disabled={busy || !title.trim()}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Section
      </Button>
    </form>
  );
}
