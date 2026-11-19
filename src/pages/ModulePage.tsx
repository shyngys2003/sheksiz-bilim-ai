import { useState, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useApp } from '../ctx';
import { MODULES } from '../modules';
import { useAI } from '../lib/ai';
import { AsyncState } from '../components/UI';
import type { Key } from '../i18n';

const NEEDS: Key[] = ['need1', 'need2', 'need3', 'need4'];
export default function ModulePage() {
  const { module, role } = useParams();
  const { t, lang } = useApp();
  const ai = useAI();
  const [input, setInput] = useState('');
  const [level, setLevel] = useState(1);
  const [grade, setGrade] = useState(3);
  const [need, setNeed] = useState<Key>('need1');
  const cfg = MODULES.find(m => m.id === module);
  if (!cfg || (role !== 'student' && role !== 'teacher')) return <Navigate to="/" replace />;
  const isTeacher = role === 'teacher';
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    void ai.run({ module: cfg.id, role, lang, input, level, ...(isTeacher ? { grade, need: need } : {}) });
  };
  return (
    <section>
      <h1><span aria-hidden="true">{cfg.icon} </span>{t(cfg.title)}</h1>
      <nav className="tabs" aria-label="role">
        <Link className={'btn' + (!isTeacher ? '' : ' ghost')} to={`/${cfg.id}/student`}>{t('student')}</Link>
        <Link className={'btn' + (isTeacher ? '' : ' ghost')} to={`/${cfg.id}/teacher`}>{t('teacher')}</Link>
      </nav>
      <div className="split">
        <form className={`card tone-${cfg.tone}`} onSubmit={submit}>
          <label>{t('topic')}<textarea rows={5} maxLength={1500} value={input} onChange={e => setInput(e.target.value)} /></label>
          <p className="note">🔒 {t('privacyNote')}</p>
          <label>{t('level')}
            <select value={level} onChange={e => setLevel(Number(e.target.value))}>
              <option value={1}>{t('lvl1')}</option><option value={2}>{t('lvl2')}</option><option value={3}>{t('lvl3')}</option></select></label>
          {isTeacher && (<>
            <label className="extra">{t('grade')}
              <select value={grade} onChange={e => setGrade(Number(e.target.value))}>
                {Array.from({ length: 11 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select></label>
            <label className="extra">{t('need')}
              <select value={need} onChange={e => setNeed(e.target.value as Key)}>
                {NEEDS.map(k => <option key={k} value={k}>{t(k)}</option>)}</select></label></>)}
          <button type="submit" className="btn big" disabled={ai.status === 'loading'}>{t('generate')}</button>
        </form>
        <article className="card" aria-live="polite">
          <h2>{t('result')}</h2>
          <AsyncState s={ai} onRetry={ai.retry} />
          {isTeacher && ai.status === 'ok' && <p className="note">{t('teacherNote')}</p>}
        </article>
      </div>
    </section>);
}
