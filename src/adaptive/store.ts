import type { Assignment, Progress } from './types';
// Demo storage in the browser. Next stage: move to ai_tasks / ai_results in db/schema.sql.
const rd = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } };
const wr = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };
export const getAssignments = () => rd<Assignment[]>('ab_assign', []);
export const saveAssignment = (a: Assignment) => wr('ab_assign', [a, ...getAssignments().filter(x => x.id !== a.id)]);
export const getProgress = () => rd<Progress[]>('ab_prog', []);
export const getOne = (alias: string, id: string) => getProgress().find(p => p.alias === alias && p.assignmentId === id);
export const saveProgress = (p: Progress) => wr('ab_prog', [p, ...getProgress().filter(x => !(x.alias === p.alias && x.assignmentId === p.assignmentId))]);
