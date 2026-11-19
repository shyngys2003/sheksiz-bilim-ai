import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../ctx';
export default function Shell({ role, children }: { role: 'student' | 'teacher'; children: ReactNode }) {
  const { t } = useApp();
  return (
    <section>
      <h1><span aria-hidden="true">🧩 </span>{t('adaptive')}</h1>
      <nav className="tabs" aria-label="role">
        <Link className={'btn' + (role === 'student' ? '' : ' ghost')} to="/adaptive/student">{t('student')}</Link>
        <Link className={'btn' + (role === 'teacher' ? '' : ' ghost')} to="/adaptive/teacher">{t('teacher')}</Link>
      </nav>
      {children}
    </section>);
}
