import { useApp } from '../ctx';
import { useAT } from './text';
import { getAssignments, getProgress } from './store';

export default function Dashboard() {
  const { t } = useApp();
  const at = useAT();
  const asgs = getAssignments(), prog = getProgress();
  if (!asgs.length) return <p className="muted">{at('empty')}</p>;
  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  return (
    <div>
      <p className="note">{at('noTime')} {at('storeNote')}</p>
      {asgs.map(a => {
        const total = a.exercises.filter(e => e.level <= a.maxLevel).length;
        const rows = prog.filter(p => p.assignmentId === a.id);
        return (
          <article key={a.id} className="card tone-sky" style={{ marginBottom: 16 }}>
            <h2>{a.title}</h2>
            {rows.length === 0 ? <p className="muted">{at('empty')}</p> : (
              <div className="scroll"><table>
                <thead><tr><th>{t('student')}</th><th>{at('done')}</th><th>{at('acc')}</th><th>{at('att')}</th><th>{at('hav')}</th><th>{at('lvl')}</th><th /></tr></thead>
                <tbody>{rows.map(p => {
                  const r = p.results, acc = r.length ? Math.round(100 * r.filter(x => x.correct).length / r.length) : 0;
                  const att = avg(r.map(x => x.attempts)), hv = avg(r.map(x => x.hints));
                  const flag = r.length >= 2 && (acc < 50 || hv >= 2);
                  return (<tr key={p.alias}><td>{p.alias}</td><td>{r.length}/{total}</td><td>{acc}%</td><td>{att.toFixed(1)}</td><td>{hv.toFixed(1)}</td><td>{p.level}</td>
                    <td>{flag ? `💛 ${at('support')}` : `✅ ${at('ok')}`}</td></tr>);
                })}</tbody></table></div>)}
          </article>);
      })}
    </div>);
}
