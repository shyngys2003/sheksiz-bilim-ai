import { useState } from 'react';
import { useApp } from '../ctx';
import { Speak } from '../components/UI';
import Shell from './Shell';
import ExerciseView from './ExerciseView';
import { useAT } from './text';
import { adjust, badges, needsSupport, pickNext } from './engine';
import { getAssignments, getOne, saveProgress } from './store';
import type { Assignment, Result } from './types';

function Session({ asg, alias, onExit }: { asg: Assignment; alias: string; onExit: () => void }) {
  const at = useAT();
  const saved = getOne(alias, asg.id);
  const total = asg.exercises.filter(e => e.level <= asg.maxLevel).length;
  const [results, setResults] = useState<Result[]>(saved?.results ?? []);
  const [level, setLevel] = useState(saved?.level ?? 1);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hints, setHints] = useState(0);
  const [step, setStep] = useState(0);
  const [fb, setFb] = useState<'none' | 'wrong' | 'right' | 'reveal'>('none');
  const cur = pickNext(asg.exercises, results.map(r => r.exId), level, asg.maxLevel);
  const earned = badges(results, total);

  if (!cur) return (
    <article className="card tone-mint" aria-live="polite">
      <h2>🏆 {at('finish')}</h2>
      <h3>{at('badges')}</h3>
      <ul className="badges">{earned.map(b => <li key={b} className="badge">{({ first: '⭐', streak: '🔥', helper: '🤝', done: '🏆' } as Record<string, string>)[b]} {at(('b_' + b) as 'b_first')}</li>)}</ul>
      <button type="button" className="btn" onClick={onExit}>{at('back')}</button>
    </article>);

  const support = needsSupport(attempts, hints);
  const shownHints = Math.min(cur.hints.length, hints + (support ? 1 : 0));
  const instr = support && cur.simpleInstruction ? cur.simpleInstruction : cur.instruction;
  const onCheck = (ok: boolean) => {
    const a = attempts + 1; setAttempts(a);
    setFb(ok ? 'right' : a >= 3 ? 'reveal' : 'wrong');
  };
  const commit = () => {
    const r: Result = { exId: cur.id, level: cur.level, attempts: Math.max(1, attempts), hints, correct: fb === 'right' };
    const adj = adjust(level, asg.maxLevel, streak, r);
    const all = [...results, r];
    setResults(all); setLevel(adj.level); setStreak(adj.streak);
    saveProgress({ alias, assignmentId: asg.id, results: all, level: adj.level });
    setAttempts(0); setHints(0); setStep(0); setFb('none');
  };
  const done = fb === 'right' || fb === 'reveal';
  return (
    <article className="card tone-sky">
      <progress value={results.length} max={total} aria-label={`${results.length}/${total}`} />
      <p className="note">{results.length + 1}/{total} · {at('noRush')}</p>
      {support && <p role="status" className="support">💛 {at('supportOn')}</p>}
      <h2>{instr}</h2>
      <p className="q">{cur.question} <Speak force text={`${instr}. ${cur.question}`} /></p>
      {support && cur.visualExample && <p className="visual" aria-label={at('example')}>{at('example')}: {cur.visualExample}</p>}
      {support ? (
        <div><h3>{at('steps')}</h3>
          <ol>{cur.steps.slice(0, step + 1).map((s, i) => <li key={i}>{s}</li>)}</ol>
          {step < cur.steps.length - 1 && <button type="button" className="btn ghost" onClick={() => setStep(step + 1)}>{at('nextStep')}</button>}</div>
      ) : cur.steps.length > 0 && (
        <details><summary>{at('steps')}</summary><ol>{cur.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></details>)}
      <ExerciseView key={cur.id} ex={cur} locked={done} onCheck={onCheck} />
      {shownHints > 0 && <ul className="hints">{cur.hints.slice(0, shownHints).map((h, i) => <li key={i}>💡 {h}</li>)}</ul>}
      {!done && <button type="button" className="btn ghost" disabled={hints >= cur.hints.length} onClick={() => setHints(hints + 1)}>💡 {at('hint')}</button>}
      <div role="status" aria-live="polite">
        {fb === 'wrong' && <p className="soft">🌱 {at('again')}</p>}
        {fb === 'right' && <p className="soft ok">🎉 {at('good')} {cur.explanation}</p>}
        {fb === 'reveal' && <p className="soft">🤝 {at('reveal')} {cur.explanation}</p>}
      </div>
      {done && <button type="button" className="btn big" onClick={commit}>{at('next')}</button>}
    </article>);
}

export default function StudentAdaptive() {
  const { t } = useApp();
  const at = useAT();
  const [alias, setAlias] = useState(() => { try { return localStorage.getItem('ab_alias') ?? ''; } catch { return ''; } });
  const [draft, setDraft] = useState('');
  const [asg, setAsg] = useState<Assignment | null>(null);
  const list = getAssignments();
  const begin = () => { const a = draft.trim().slice(0, 20); if (!a) return; try { localStorage.setItem('ab_alias', a); } catch { /* ignore */ } setAlias(a); };
  return (
    <Shell role="student">
      {!alias ? (
        <form className="card" onSubmit={e => { e.preventDefault(); begin(); }}>
          <label>{at('alias')}<input value={draft} maxLength={20} onChange={e => setDraft(e.target.value)} /></label>
          <p className="note">🔒 {t('privacyNote')}</p>
          <button type="submit" className="btn big">{at('start')}</button>
        </form>
      ) : asg ? <Session key={asg.id} asg={asg} alias={alias} onExit={() => setAsg(null)} /> : (
        <article className="card"><h2>{at('pick')}</h2>
          {list.length === 0 ? <p className="muted">{at('none')}</p> : (
            <div className="grid">{list.map(a => (
              <button key={a.id} type="button" className="card tone-sun pickcard" onClick={() => setAsg(a)}>
                <strong>{a.title}</strong><span>{a.subject} · {t('grade')} {a.grade}</span></button>))}</div>)}
        </article>)}
    </Shell>);
}
