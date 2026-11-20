import { timingSafeEqual, randomUUID } from 'node:crypto';
const types = {pdf:'application/pdf',ppt:'application/vnd.ms-powerpoint',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
const roles=['defectologist','logoped'];
const cats=['presentation','document','lesson','video'];
const clean=(s,n)=>typeof s==='string'?s.trim().slice(0,n):'';
function auth(req,role){const a=Buffer.from(req.headers['x-specialist-password']||''), b=Buffer.from(process.env[role==='logoped'?'LOGOPED_PASSWORD':'DEFECTOLOGIST_PASSWORD']||'');return b.length>=8&&a.length===b.length&&timingSafeEqual(a,b);}
export function mountMaterials(app){
 const hits=new Map();
 app.all('/api/materials',async(req,res)=>{
 res.set('Cache-Control','no-store');
 const base=process.env.SUPABASE_URL?.replace(/\/$/,'');const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!base||!key)return res.status(503).json({error:'storage_not_configured'});
 const call=async(path,opts={})=>{const r=await fetch(base+path,{...opts,headers:{apikey:key,...(key.startsWith('sb_secret_')?{}:{Authorization:'Bearer '+key}),'Content-Type':'application/json',...opts.headers},signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('storage_error');return r.json().catch(()=>null);};
 const table='/rest/v1/school_materials';
 try{
 if(req.method==='GET'){const data=await call(table+'?select=*&order=created_at.desc&limit=200');return res.json({items:data.map(x=>({...x,download:x.path?base+'/storage/v1/object/public/school-materials/'+x.path:null}))});}
 if(req.method!=='POST')return res.status(405).json({error:'method'});
 const now=Date.now();for(const [k,v] of hits)if(v.until<now)hits.delete(k);const ip=req.ip||'unknown';const h=hits.get(ip)||{count:0,until:now+60000};h.count++;hits.set(ip,h);if(h.count>30)return res.status(429).json({error:'rate_limited'});
 const b=req.body||{};if(!roles.includes(b.role)||!auth(req,b.role))return res.status(401).json({error:'unauthorized'});
 const action=b.action;
 if(action==='login')return res.json({ok:true});
 if(action==='prepare'){
 const ext=clean(b.filename,200).split('.').pop()?.toLowerCase();if(!types[ext]||!Number.isInteger(b.size)||b.size<1||b.size>25*1024*1024)return res.status(400).json({error:'invalid_file'});
 const path=b.role+'/'+randomUUID()+'.'+ext;
 const j=await call('/storage/v1/object/upload/sign/school-materials/'+path,{method:'POST',body:JSON.stringify({})});
 const url=new URL(j.url.startsWith('/object/')?'/storage/v1'+j.url:j.url,base+'/storage/v1/');if(url.origin!==new URL(base).origin)throw Error('storage_error');
 return res.json({path,url:url.href,mime:types[ext]});
 }
 if(!['save','delete'].includes(action))return res.status(400).json({error:'bad_request'});
 const id=clean(b.id,40);let old;
 if(id){if(!/^[0-9a-f-]{36}$/i.test(id))return res.status(400).json({error:'bad_request'});const rows=await call(table+'?id=eq.'+id+'&role=eq.'+b.role);old=rows[0];if(!old)return res.status(404).json({error:'not_found'});}
 if(action==='delete'){if(!old)return res.status(400).json({error:'bad_request'});await call(table+'?id=eq.'+id,{method:'DELETE'});if(old.path)await call('/storage/v1/object/school-materials',{method:'DELETE',body:JSON.stringify({prefixes:[old.path]})}).catch(()=>{});return res.json({ok:true});}
 const title=clean(b.title,150),description=clean(b.description,2000),category=b.category;let path=old?.path||null,filename=old?.filename||null,video=null;
 if(!title||!cats.includes(category))return res.status(400).json({error:'bad_request'});
 if(category==='video'){try{const u=new URL(b.video);if(u.protocol!=='https:'||!['www.youtube.com','youtube.com','youtu.be'].includes(u.hostname))throw Error();video=u.href;}catch{return res.status(400).json({error:'invalid_video'});}path=null;filename=null;}
 else if(b.path){const p=clean(b.path,150);if(!new RegExp('^'+b.role+'/[0-9a-f-]{36}\\.(pdf|pptx?|docx?)$').test(p))return res.status(400).json({error:'invalid_file'});const info=await call('/storage/v1/object/info/school-materials/'+p);if(!info)throw Error();path=p;filename=clean(b.filename,180)||p.split('/')[1];}
 if(category!=='video'&&!path&&!description)return res.status(400).json({error:'missing_content'});
 const row={role:b.role,title,description,category,path,filename,video};
 await call(table+(old?'?id=eq.'+id:''),{method:old?'PATCH':'POST',body:JSON.stringify(row)});
 if(old?.path&&old.path!==path)await call('/storage/v1/object/school-materials',{method:'DELETE',body:JSON.stringify({prefixes:[old.path]})}).catch(()=>{});
 return res.json({ok:true});
 }catch{return res.status(502).json({error:'storage_error'});}
 });
}
