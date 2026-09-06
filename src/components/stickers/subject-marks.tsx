import type { AmbientMark } from './ambient-field';

/**
 * Picks a backdrop from the course's own subject, so a DSA page and an ML page do not share a
 * wallpaper. Matched on the title because that is what the page already has in hand.
 */
export function subjectMarks(title: string): AmbientMark[] {
  const t = title.toLowerCase();

  if (/(dsa|algorithm|data structure|pattern|coding|interview)/.test(t)) {
    return [
      { name: 'tree', top: '4%', right: '3%', size: 44, drift: 12 },
      { name: 'stack', top: '34%', left: '-1%', size: 36, tone: 'ink', drift: 18 },
      { name: 'complexity', top: '62%', right: '1%', size: 40, tone: 'ink', drift: -10 },
      { name: 'brackets', top: '86%', left: '4%', size: 30, tone: 'ink', drift: 22 },
    ];
  }

  if (/(machine learning|\bml\b|gradient|neural|deep learning|data science|ai\b)/.test(t)) {
    return [
      { name: 'neuron', top: '4%', right: '3%', size: 44, tone: 'mint', drift: 12 },
      { name: 'loss', top: '36%', left: '-1%', size: 38, tone: 'ink', drift: 18 },
      { name: 'tensor', top: '64%', right: '1%', size: 36, tone: 'ink', drift: -10 },
      { name: 'scatter', top: '88%', left: '4%', size: 32, tone: 'mint', drift: 22 },
    ];
  }

  return [
    { name: 'bookmark', top: '5%', right: '3%', size: 38, drift: 12 },
    { name: 'gauge', top: '48%', left: '-1%', size: 34, tone: 'ink', drift: 18 },
  ];
}
