import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../src/ctx';
import StudentAdaptive from '../src/adaptive/Student';
import { adjust, badges, pickNext, needsSupport } from '../src/adaptive/engine';
import { offlineSample } from '../src/adaptive/offline';
import type { Result } from '../src/adaptive/types';

const r = (p: Partial<Result>): Result => ({ exId: 'x', level: 1, attempts: 1, hints: 0, correct: true, ...p });

afterEach(cleanup);
describe('engine', () => {
  it('raises level only after two smooth successes, capped by teacher max', () => {
    const a = adjust(1, 2, 0, r({})); expect(a).toEqual({ level: 1, streak: 1 });
    expect(adjust(1, 2, a.streak, r({})).level).toBe(2);
    expect(adjust(2, 2, 1, r({})).level).toBe(2);
  });
  it('lowers level on difficulty and never below 1', () => {
    expect(adjust(2, 3, 1, r({ hints: 2 }))).toEqual({ level: 1, streak: 0 });
    expect(adjust(1, 3, 0, r({ correct: false, attempts: 3 })).level).toBe(1);
  });
  it('supports after 2 attempts or 2 hints; has no time input', () => {
    expect(needsSupport(2, 0)).toBe(true); expect(needsSupport(0, 2)).toBe(true); expect(needsSupport(1, 1)).toBe(false);
  });
  it('picks closest level and respects max', () => {
    const l = offlineSample('ru', 3);
    expect(pickNext(l, [], 3, 3)?.level).toBe(3);
    expect(pickNext(l, [], 3, 1)?.level).toBe(1);
  });
  it('awards badges', () => {
    expect(badges([r({}), r({}), r({})], 5)).toEqual(['first', 'streak']);
    expect(badges([r({ hints: 1 })], 1)).toContain('helper');
  });
  it('offline samples keep one objective across all formats', () => {
    expect(new Set(offlineSample('kk', 3).map(e => e.type)).size).toBe(4);
  });
});

describe('student session', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('ab_alias', JSON.stringify('x').slice(1, -1));
    localStorage.setItem('ab_assign', JSON.stringify([{ id: 'a1', title: 'Test', subject: 'Math', grade: 1, topic: 't', objective: 'o', needs: [], maxLevel: 3, lang: 'kk', source: 'offline', exercises: offlineSample('kk', 3) }]));
  });
  it('supports a struggling student without penalty, then continues', async () => {
    const u = userEvent.setup();
    render(<MemoryRouter><AppProvider><StudentAdaptive /></AppProvider></MemoryRouter>);
    await u.click(screen.getByText('Test'));
    await u.click(screen.getByRole('radio', { name: '4' })); await u.click(screen.getByRole('button', { name: 'Тексеру' }));
    expect(screen.getByText(/Тағы бір рет/)).toBeTruthy();
    await u.click(screen.getByRole('radio', { name: '6' })); await u.click(screen.getByRole('button', { name: 'Тексеру' }));
    expect(screen.getByText(/Тапсырманы жеңілдеттік/)).toBeTruthy();   // instructions simplified
    expect(screen.getAllByText(/🍎/).length).toBeGreaterThan(0);        // visual example
    await u.click(screen.getByRole('radio', { name: '5' })); await u.click(screen.getByRole('button', { name: 'Тексеру' }));
    expect(screen.getByText(/Тамаша/)).toBeTruthy();
    await u.click(screen.getByRole('button', { name: 'Әрі қарай' }));
    const saved = JSON.parse(localStorage.getItem('ab_prog') || '[]');
    expect(saved[0].results[0]).toMatchObject({ attempts: 3, correct: true });
    expect(saved[0].level).toBe(1);
  });
});
