import { useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { useApp } from './ctx';
import { MODULES } from './modules';
import { A11yPanel } from './components/UI';
import Home from './pages/Home';
import Section from './pages/Section';
import ModulePage from './pages/ModulePage';
import Social from './pages/Social';
import Story from './pages/Story';
import StudentAdaptive from './adaptive/Student';
import TeacherAdaptive from './adaptive/Teacher';

export default function App() {
  const { t, lang, setLang } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <>
      <a className="skip" href="#main">{t('skip')}</a>
      <header className="top">
        <NavLink to="/" className="brand">🌱 {t('app')}</NavLink>
        <nav className="nav" aria-label="main">
          <NavLink to="/" end>{t('home')}</NavLink>
          {MODULES.map(m => <NavLink key={m.id} to={`/${m.id}/student`}>{m.icon} {t(m.title)}</NavLink>)}
        </nav>
        <div className="tools">
          <button type="button" className="btn ghost" onClick={() => setLang(lang === 'kk' ? 'ru' : 'kk')} aria-label="language">{lang === 'kk' ? 'RU' : 'ҚАЗ'}</button>
          <button type="button" className="btn ghost" onClick={() => setOpen(o => !o)} aria-expanded={open}>♿ {t('a11y')}</button>
        </div>
      </header>
      {open && <A11yPanel onClose={() => setOpen(false)} />}
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/section/:id" element={<Section />} />
          <Route path="/adaptive/student" element={<StudentAdaptive />} />
          <Route path="/adaptive/teacher" element={<TeacherAdaptive />} />
          <Route path="/social/:role" element={<Social />} />
          <Route path="/story/:role" element={<Story />} />
          <Route path="/:module/:role" element={<ModulePage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </>);
}
