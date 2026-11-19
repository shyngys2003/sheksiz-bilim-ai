import { useApp, type A11y } from '../ctx';
import type { AIState } from '../lib/ai';

export function Speak({ text, force }: { text: string; force?: boolean }) {
  const { a11y, lang, t } = useApp();
  if (!(force || a11y.audio)) return null;
  if (!('speechSynthesis' in window)) return null;
  const go = () => { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = lang === 'kk' ? 'kk-KZ' : 'ru-RU'; speechSynthesis.speak(u); };
  return <button type="button" className="btn ghost" onClick={go}>🔊 {t('listen')}</button>;
}

export function AsyncState({ s, onRetry }: { s: Pick<AIState, 'status' | 'text' | 'error'>; onRetry: () => void }) {
  const { t } = useApp();
  if (s.status === 'idle') return <p className="muted">{t('empty')}</p>;
  if (s.status === 'loading') return <p role="status" className="loading"><span className="spin" aria-hidden="true" />{t('loading')}</p>;
  if (s.status === 'error') return (
    <div role="alert" className="err"><p>{s.error === 'rate_limited' ? t('limit') : t('error')}</p>
      <button type="button" className="btn" onClick={onRetry}>↻ {t('retry')}</button></div>);
  return <div className="out"><p>{s.text}</p><Speak text={s.text} /></div>;
}

export function A11yPanel({ onClose }: { onClose: () => void }) {
  const { a11y, toggle, t } = useApp();
  const items: (keyof A11y)[] = ['large', 'contrast', 'simple', 'calm', 'audio'];
  return (
    <aside className="card panel" role="dialog" aria-label={t('a11y')}>
      <h2>{t('a11y')}</h2>
      {items.map(k => (
        <label key={k} className="switch"><input type="checkbox" checked={a11y[k]} onChange={() => toggle(k)} />{t(k)}</label>))}
      <button type="button" className="btn" onClick={onClose}>{t('close')}</button>
    </aside>);
}
