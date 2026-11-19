import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../src/ctx';
import TeacherAdaptive from '../src/adaptive/Teacher';

const setup = async () => {
  const u = userEvent.setup();
  render(<MemoryRouter><AppProvider><TeacherAdaptive /></AppProvider></MemoryRouter>);
  const boxes = screen.getAllByRole('textbox');
  await u.type(boxes[1], 'Қосу'); await u.type(boxes[2], 'Сандарды қосу');
  return u;
};
afterEach(cleanup);
describe('teacher flow', () => {
  beforeEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
  it('falls back to clearly labelled offline samples when AI is unavailable, then assigns', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'ai_unavailable' }), { status: 503 })));
    const u = await setup();
    await u.click(screen.getByRole('button', { name: 'Жасау' }));
    await waitFor(() => expect(screen.getByText(/Офлайн үлгі/)).toBeTruthy());
    await u.click(screen.getByRole('button', { name: 'Бекітіп, тапсыру' }));
    const a = JSON.parse(localStorage.getItem('ab_assign') || '[]');
    expect(a[0]).toMatchObject({ source: 'offline', maxLevel: 2 });
    expect(a[0].exercises.every((e: { level: number }) => e.level <= 2)).toBe(true);
  });
  it('shows error with retry when the service fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 502 })));
    const u = await setup();
    await u.click(screen.getByRole('button', { name: 'Жасау' }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Қайталау/ })).toBeTruthy());
  });
});
