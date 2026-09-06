/**
 * The "this lesson has no video" slot in the player.
 *
 * It used to be an empty grey box with a generic file icon — the palest thing on the page, and
 * the first thing a student sees on a course where no video has been uploaded yet. Since every
 * lesson is currently a reading lesson, that box IS the product right now.
 *
 * So it draws a page of text instead: ruled lines that lay themselves in, one after another, as
 * if the lesson were being set down. The lines are generated from the lesson title, so each
 * lesson's panel has its own ragged right edge rather than a repeating shape — the detail that
 * stops it reading as a loading skeleton.
 *
 * Deliberately quiet: it plays once on arrival, holds, and never loops. This is a surface people
 * read on.
 */

function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function ReadingPanel({ title }: { title: string }) {
  let x = hash(title) || 1;
  const next = () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x / 0xffffffff;
  };

  // Two short paragraphs of ruled lines with a believable ragged edge.
  const lines: { w: number; gap: boolean }[] = [];
  for (let p = 0; p < 2; p++) {
    const n = 4 + Math.floor(next() * 2);
    for (let i = 0; i < n; i++) {
      const last = i === n - 1;
      lines.push({ w: last ? 32 + next() * 26 : 74 + next() * 24, gap: false });
    }
    if (p === 0) lines.push({ w: 0, gap: true });
  }

  return (
    <div className="reading-panel" aria-hidden="true">
      <div className="reading-sheet">
        <span className="reading-kicker">Reading lesson</span>
        {lines.map((l, i) =>
          l.gap ? (
            <span key={i} className="reading-gap" />
          ) : (
            <span
              key={i}
              className="reading-line"
              style={{ width: `${l.w}%`, animationDelay: `${120 + i * 55}ms` }}
            />
          ),
        )}
      </div>
    </div>
  );
}
