import { useState } from 'react';
import type { Exercise } from './types';
import { useAT } from './text';

const rotate = <T,>(a: T[]) => (a.length > 1 ? [...a.slice(1), a[0]] : a);

export default function ExerciseView({ ex, locked, onCheck }: { ex: Exercise; locked: boolean; onCheck: (ok: boolean) => void }) {
  const at = useAT();
  const [sel, setSel] = useState('');
  const [map, setMap] = useState<Record<number, string>>({});
  const [list, setList] = useState<string[]>(() => rotate(ex.items ?? []));
  const [drag, setDrag] = useState<number | null>(null);
  const rights = rotate((ex.pairs ?? []).map(p => p.r));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= list.length || from === to) return;
    const n = [...list]; const [x] = n.splice(from, 1); n.splice(to, 0, x); setList(n);
  };
  const ready = ex.type === 'match' ? (ex.pairs ?? []).every((_, i) => map[i]) : ex.type === 'order' ? true : sel !== '';
  const check = () => {
    if (ex.type === 'match') onCheck((ex.pairs ?? []).every((p, i) => map[i] === p.r));
    else if (ex.type === 'order') onCheck(list.every((v, i) => v === (ex.items ?? [])[i]));
    else onCheck(sel === ex.answer);
  };
  return (
    <div>
      {(ex.type === 'choice' || ex.type === 'picture') && (
        <div className={ex.type === 'picture' ? 'opts pics' : 'opts'} role="radiogroup" aria-label={ex.question}>
          {(ex.options ?? []).map(o => (
            <button key={o.id} type="button" role="radio" aria-checked={sel === o.id} disabled={locked}
              className={'opt' + (sel === o.id ? ' on' : '')} onClick={() => setSel(o.id)}>
              {o.emoji && <span className="emo" aria-hidden="true">{o.emoji}</span>}<span>{o.text}</span>
            </button>))}
        </div>)}
      {ex.type === 'match' && (ex.pairs ?? []).map((p, i) => (
        <label key={i} className="pair"><span>{p.l}</span>
          <select disabled={locked} value={map[i] ?? ''} onChange={e => setMap({ ...map, [i]: e.target.value })}>
            <option value="">{at('choose')}</option>{rights.map(r => <option key={r} value={r}>{r}</option>)}</select></label>))}
      {ex.type === 'order' && (<>
        <p className="note">{at('drag')}</p>
        <ol className="order">
          {list.map((v, i) => (
            <li key={v} draggable={!locked} onDragStart={() => setDrag(i)} onDragOver={e => e.preventDefault()}
              onDrop={() => { if (drag !== null) move(drag, i); setDrag(null); }}>
              <span>{v}</span>
              <button type="button" className="btn ghost sm" disabled={locked || i === 0} onClick={() => move(i, i - 1)} aria-label={at('up')}>↑</button>
              <button type="button" className="btn ghost sm" disabled={locked || i === list.length - 1} onClick={() => move(i, i + 1)} aria-label={at('down')}>↓</button>
            </li>))}
        </ol></>)}
      <button type="button" className="btn big" disabled={locked || !ready} onClick={check}>{at('check')}</button>
    </div>);
}
