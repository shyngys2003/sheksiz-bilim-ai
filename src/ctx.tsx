import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { dict, type Key, type Lang } from './i18n';
export type A11y = { large: boolean; contrast: boolean; simple: boolean; calm: boolean; audio: boolean };
type C = { lang: Lang; setLang: (l: Lang) => void; a11y: A11y; toggle: (k: keyof A11y) => void; t: (k: Key) => string };
const def: A11y = { large: false, contrast: false, simple: false, calm: false, audio: false };
const Ctx = createContext<C | null>(null);
// Only UI preferences are stored locally; no personal data.
const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };
export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => load<Lang>('lang', 'kk'));
  const [a11y, setA11y] = useState<A11y>(() => ({ ...def, ...load<Partial<A11y>>('a11y', {}) }));
  useEffect(() => {
    const d = document.documentElement; d.lang = lang;
    (Object.keys(a11y) as (keyof A11y)[]).forEach(k => { d.dataset[k] = String(a11y[k]); });
    save('lang', lang); save('a11y', a11y);
  }, [lang, a11y]);
  const value: C = { lang, setLang, a11y, toggle: k => setA11y(s => ({ ...s, [k]: !s[k] })), t: k => dict[lang][k] };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useApp(): C { const c = useContext(Ctx); if (!c) throw new Error('AppProvider missing'); return c; }
