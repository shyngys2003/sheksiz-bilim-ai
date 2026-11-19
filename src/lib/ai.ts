import { useCallback, useRef, useState } from 'react';
import type { Lang } from '../i18n';
export type Req = { module: string; role: 'student' | 'teacher'; lang: Lang; input: string; level: number; grade?: number; need?: string };
export async function callAI(r: Req): Promise<string> {
  const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(r) });
  const j = await res.json().catch(() => ({} as { error?: string; text?: string }));
  if (!res.ok) throw new Error(j.error || String(res.status));
  return String(j.text ?? '');
}
export type AIState = { status: 'idle' | 'loading' | 'error' | 'ok'; text: string; error: string };
export function useAI() {
  const [s, set] = useState<AIState>({ status: 'idle', text: '', error: '' });
  const last = useRef<Req | null>(null);
  const run = useCallback(async (r: Req) => {
    last.current = r; set({ status: 'loading', text: '', error: '' });
    try { set({ status: 'ok', text: await callAI(r), error: '' }); }
    catch (e) { set({ status: 'error', text: '', error: e instanceof Error ? e.message : 'error' }); }
  }, []);
  const retry = useCallback(() => { if (last.current) void run(last.current); }, [run]);
  return { ...s, run, retry };
}
