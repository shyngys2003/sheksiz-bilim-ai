import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../ctx';
import Shell from './Shell';
import Dashboard from './Dashboard';
import { useAT, type AKey } from './text';
import { offlineSample } from './offline';
import { saveAssignment } from './store';
import type { Exercise, ExType } from './types';

const NEEDS = ['reading', 'attention', 'communication', 'motor', 'visual', 'hearing'];
const FORMATS: ExType[] = ['choice', 'picture', 'match', 'order'];
const toggle = (a: string[], v: string) => (a.includes(v) ? a.filter(x => x !== v) : [...a, v]);

export default function TeacherAdaptive() {
  const { t, lang } = useApp();
  const at = useAT();
  const [sp] = useSearchParams();
  const [tab, setTab] = useState<'gen' | 'dash'>(sp.get('tab') === 'dash' ? 'dash' : 'gen');
  const [f, setF] = useState({ subject: '', grade: 3, topic: '', objective: '', level: 2 });
  const [needs, setNeeds] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>(['choice', 'picture', 'match', 'order']);
  const [st, setSt] = useState<'idle' | 'loading' | 'error' | 'ok'>('idle');
  const [src, setSrc] = useState<'ai' | 'offline'>('ai');
  const [list, setList] = useState<Exercise[]>([]);
  const [title, setTitle] = useState('');
  const [saved, setSaved] = useState(false);

  const useOffline = () => { setList(offlineSample(lang, f.level)); setSrc('offline'); setSt('ok'); setSaved(false); };
  const generate = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!f.topic.trim() || !f.objective.trim() || !formats.length) return;
    setSt('loading'); setSaved(false);
    try {
      const res = await fetch('/api/adaptive/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang, ...f, needs, formats, count: 6 }) });
      const j = (await res.json().catch(() => ({}))) as { exercises?: Exercise[]; error?: string };
      if (res.status === 503) return useOffline();
      if (!res.ok || !j.exercises) throw new Error(j.error || 'error');
      setList(j.exercises); setSrc('ai'); setSt('ok');
    } catch { setSt('error'); }
  };
  const upd = (i: number, p: Partial<Exercise>) => setList(l => l.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const assign = () => {
    saveAssignment({ id: Date.now().toString(36), title: title.trim() || f.topic || 'Set', subject: f.subject, grade: f.grade, topic: f.topic, objective: f.objective,
      needs, maxLevel: f.level, lang, source: src, exercises: list });
    setSaved(true);
  };
  return (
    <Shell role="teacher">
      <nav className="tabs" aria-label="tabs">
        <button type="button" className={'btn' + (tab === 'gen' ? '' : ' ghost')} onClick={() => setTab('gen')}>{at('gen')}</button>
        <button type="button" className={'btn' + (tab === 'dash' ? '' : ' ghost')} onClick={() => setTab('dash')}>{at('dash')}</button>
      </nav>
      {tab === 'dash' ? <Dashboard /> : (
        <div className="split">
          <form className="card tone-sky" onSubmit={generate}>
            <label>{at('subject')}<input value={f.subject} maxLength={60} onChange={e => setF({ ...f, subject: e.target.value })} /></label>
            <label>{t('grade')}<select value={f.grade} onChange={e => setF({ ...f, grade: Number(e.target.value) })}>
              {Array.from({ length: 11 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select></label>
            <label>{at('topic')}<input value={f.topic} maxLength={200} onChange={e => setF({ ...f, topic: e.target.value })} /></label>
            <label>{at('objective')}<textarea rows={3} maxLength={300} value={f.objective} onChange={e => setF({ ...f, objective: e.target.value })} /></label>
            <fieldset><legend>{at('needs')}</legend>{NEEDS.map(n => (
              <label key={n} className="switch"><input type="checkbox" checked={needs.includes(n)} onChange={() => setNeeds(toggle(needs, n))} />{at(('n_' + n) as AKey)}</label>))}</fieldset>
            <label>{at('difficulty')}<select value={f.level} onChange={e => setF({ ...f, level: Number(e.target.value) })}>
              <option value={1}>{t('lvl1')}</option><option value={2}>{t('lvl2')}</option><option value={3}>{t('lvl3')}</option></select></label>
            <fieldset><legend>{at('formats')}</legend>{FORMATS.map(x => (
              <label key={x} className="switch"><input type="checkbox" checked={formats.includes(x)} onChange={() => setFormats(toggle(formats, x))} />{at(('f_' + x) as AKey)}</label>))}</fieldset>
            <button type="submit" className="btn big" disabled={st === 'loading'}>{t('generate')}</button>
          </form>
          <article className="card" aria-live="polite">
            <h2>{at('review')}</h2>
            {st === 'idle' && <p className="muted">{t('empty')}</p>}
            {st === 'loading' && <p role="status" className="loading"><span className="spin" aria-hidden="true" />{t('loading')}</p>}
            {st === 'error' && <div role="alert" className="err"><p>{t('error')}</p>
              <div className="row"><button type="button" className="btn" onClick={() => void generate()}>↻ {t('retry')}</button>
                <button type="button" className="btn ghost" onClick={useOffline}>{at('useOffline')}</button></div></div>}
            {st === 'ok' && (<>
              <p className={src === 'offline' ? 'banner warn' : 'banner'}>{src === 'offline' ? '📦 ' + at('offline') : '✨ ' + at('ai')}</p>
              {list.map((x, i) => (
                <fieldset key={x.id + i} className="ex">
                  <legend>{at(('f_' + x.type) as AKey)} · {at('lvl')} {x.level}</legend>
                  <label>{at('instruction')}<input value={x.instruction} onChange={e => upd(i, { instruction: e.target.value })} /></label>
                  <label>{at('question')}<input value={x.question} onChange={e => upd(i, { question: e.target.value })} /></label>
                  <label>{at('hints')}<textarea rows={2} value={x.hints.join('\n')} onChange={e => upd(i, { hints: e.target.value.split('\n').filter(Boolean) })} /></label>
                  <label>{at('explanation')}<input value={x.explanation} onChange={e => upd(i, { explanation: e.target.value })} /></label>
                  <button type="button" className="btn ghost sm" onClick={() => setList(list.filter((_, j) => j !== i))}>{at('remove')}</button>
                </fieldset>))}
              <label>{at('title')}<input value={title} maxLength={80} onChange={e => setTitle(e.target.value)} /></label>
              <button type="button" className="btn big" disabled={!list.length || saved} onClick={assign}>{saved ? at('assigned') : at('assign')}</button></>)}
          </article>
        </div>)}
    </Shell>);
}
