import { Link, Navigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SECTION_IDS, useHT, type HKey } from '../home-text';
import { useApp } from '../ctx';
type Material={id:string;section:number|null;title:string;description:string;path:string|null;download:string|null;video:string|null};
const links:Record<string,[string,string,string][]>={ai:[['/adaptive/student','Бейімделген тапсырмалар','Адаптивные задания'],['/social/student','Қарым-қатынас тренажері','Тренажёр общения'],['/story/student','Әлеуметтік оқиғалар','Социальные истории']],games:[['/adaptive/student','Ойындар мен тапсырмалар','Игры и задания']],tasks:[['/adaptive/teacher','Тапсырма құрастыру','Создать задания']],progress:[['/adaptive/teacher?tab=dash','Жетістік мониторингі','Мониторинг достижений']]};
export default function Section(){
 const {id=''}=useParams();const h=useHT();const {lang}=useApp();const tr=(kk:string,ru:string)=>lang==='kk'?kk:ru;
 const n=SECTION_IDS.indexOf(id)+1;
 const [items,setItems]=useState<Material[]>([]),[status,setStatus]=useState('loading');
 useEffect(()=>{let active=true;setStatus('loading');fetch('/api/materials').then(async r=>{if(!r.ok)throw Error();const j=await r.json();if(active){setItems(j.items);setStatus('ready');}}).catch(()=>{if(active)setStatus('error');});return()=>{active=false;};},[id]);
 if(!n)return <Navigate to="/" replace/>;
 const visible=items.filter(x=>x.section===n);
 return <section><header className="banner-hero"><h1>{h(('c'+n) as HKey)}</h1><p>{h(('s'+n) as HKey)}</p></header>
 {id==='udl'&&<div className="grid">{[1,2,3].map(i=><article key={i} className="card tone-sky"><h2>{h(('p'+i) as HKey)}</h2><p>{h(('p'+i+'d') as HKey)}</p></article>)}</div>}
 <div className="row">{(links[id]||[]).map(([url,kk,ru])=><Link key={url} className="btn" to={url}>{tr(kk,ru)}</Link>)}</div>
 <h2>{tr('Оқу материалдары','Учебные материалы')}</h2>
 {status==='loading'?<p>{tr('Жүктелуде…','Загрузка…')}</p>:status==='error'?<p role="alert" className="err">{tr('Материалдар жүктелмеді','Не удалось загрузить материалы')}</p>:!visible.length?<p className="muted">{tr('Материалдар жоқ','Материалов пока нет')}</p>:<div className="grid">{visible.map(x=><article className="card" key={x.id}><h3>{x.title}</h3><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{x.description}</p>{x.download&&/\.(jpe?g|png|webp)$/i.test(x.path||'')&&<img src={x.download} alt={x.title} loading="lazy" style={{width:'100%',maxHeight:360,objectFit:'contain'}}/>}{x.download&&/\.(mp4|webm)$/i.test(x.path||'')&&<video controls preload="none" src={x.download} style={{width:'100%'}}/>}<div className="row">{x.download&&<a className="btn" href={x.download} target="_blank" rel="noopener noreferrer">{tr('Файлды ашу','Открыть файл')}</a>}{x.video&&<a className="btn" href={x.video} target="_blank" rel="noopener noreferrer">{tr('Бейнені көру','Смотреть видео')}</a>}</div></article>)}</div>}
 <div className="row"><Link className="btn ghost" to="/">{h('back')}</Link><Link className="btn ghost" to={'/materials?section='+n}>{tr('Маман кабинеті','Кабинет специалиста')}</Link></div></section>;
}
