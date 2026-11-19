import { Link } from 'react-router-dom';
import { useApp } from '../ctx';
import { MODULES } from '../modules';
import { SECTIONS, useHT, type HKey } from '../home-text';
export default function Home() {
  const { t } = useApp();
  const h = useHT();
  return (
    <section>
      <header className="banner-hero"><h1><span aria-hidden="true">🌈 </span>{h('title')}</h1><p>{h('sub')}</p></header>
      <div className="tiles">
        {SECTIONS.map(s => {
          const body = (<><span className="num" aria-hidden="true">{String(s.n).padStart(2, '0')}</span><strong>{h(('c' + s.n) as HKey)}</strong><span className="muted">{h(('s' + s.n) as HKey)}</span></>);
          return s.to.startsWith('#') ? <a key={s.n} className="tile" href={s.to}>{body}</a> : <Link key={s.n} className="tile" to={s.to}>{body}</Link>;
        })}
      </div>
      <h2 id="ai" className="aihead">{h('aiTitle')}</h2>
      <div className="grid">
        {MODULES.map(m => (
          <article key={m.id} className={`card tone-${m.tone}`}>
            <div className="icon" aria-hidden="true">{m.icon}</div>
            <h3>{t(m.title)}</h3><p className="extra">{t(m.desc)}</p>
            <div className="row">
              <Link className="btn" to={`/${m.id}/student`}>{t('student')}</Link>
              <Link className="btn ghost" to={`/${m.id}/teacher`}>{t('teacher')}</Link>
            </div>
          </article>))}
      </div>
    </section>);
}
