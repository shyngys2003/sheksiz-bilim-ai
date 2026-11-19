import type { Exercise, Result } from './types';
// Adaptive rules use only accuracy, attempts and hints. Response time is never measured.
export const needsSupport = (attempts: number, hints: number) => attempts >= 2 || hints >= 2;
export function adjust(level: number, max: number, streak: number, r: Result) {
  if (!r.correct || r.attempts >= 3 || r.hints >= 2) return { level: Math.max(1, level - 1), streak: 0 };
  if (r.attempts === 1 && r.hints === 0) { const s = streak + 1; return s >= 2 ? { level: Math.min(max, level + 1), streak: 0 } : { level, streak: s }; }
  return { level, streak: 0 };
}
export function pickNext(list: Exercise[], done: string[], target: number, max: number): Exercise | undefined {
  return list.map((e, i) => ({ e, i })).filter(x => !done.includes(x.e.id) && x.e.level <= max)
    .sort((a, b) => Math.abs(a.e.level - target) - Math.abs(b.e.level - target) || a.i - b.i)[0]?.e;
}
export function badges(rs: Result[], total: number): string[] {
  const b: string[] = []; let run = 0, best = 0;
  for (const r of rs) { if (r.correct && r.attempts === 1 && r.hints === 0) { run++; best = Math.max(best, run); } else run = 0; }
  if (rs.some(r => r.correct)) b.push('first');
  if (best >= 3) b.push('streak');
  if (rs.some(r => r.hints > 0)) b.push('helper');
  if (total > 0 && rs.length >= total) b.push('done');
  return b;
}
