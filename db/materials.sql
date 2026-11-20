create table if not exists public.school_materials (
 id uuid primary key default gen_random_uuid(), role text not null check (role in ('defectologist','logoped')),
 category text not null check (category in ('presentation','document','lesson','video')),
 title text not null, description text not null default '', path text, filename text, video text,
 created_at timestamptz not null default now()
);
alter table public.school_materials enable row level security;
revoke all on public.school_materials from anon, authenticated;
grant select,insert,update,delete on public.school_materials to service_role;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('school-materials','school-materials',true,26214400,array['application/pdf','application/msword','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation'])
on conflict (id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
