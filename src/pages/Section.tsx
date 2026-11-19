import { Link, Navigate, useParams } from 'react-router-dom';
import { SECTIONS, useHT, type HKey } from '../home-text';
const IDS: Record<string, number> = { udl: 1, lessons: 4, needs: 5, parents: 8 };
export default function Section() {
  const { id = '' } = useParams();
  const h = useHT();
  const n = IDS[id];
  if (!n || !SECTIONS.some(s => s.n === n)) return <Navigate to="/" replace />;
  return (
    <section>
      <h1>{h(('c' + n) as HKey)}</h1>
      <p className="muted">{h(('s' + n) as HKey)}</p>
      {id === 'udl' ? (
        <div className="grid">{([1, 2, 3] as const).map(i => (
          <article key={i} className="card tone-sky"><h2>{h(('p' + i) as HKey)}</h2><p>{h(('p' + i + 'd') as HKey)}</p></article>))}</div>
      ) : <p className="card tone-sun">{h('soon')}</p>}
      <p><Link className="btn ghost" to="/">{h('back')}</Link></p>
    </section>);
}
