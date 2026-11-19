-- Postgres / Supabase. Children's data minimised: no full names, no raw prompts stored.
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('student','teacher')),
  alias text,                       -- nickname only, never a real name
  lang text not null default 'kk' check (lang in ('kk','ru')),
  guardian_consent boolean not null default false,
  created_at timestamptz default now());
create table a11y_settings (
  user_id uuid primary key references profiles on delete cascade,
  large_text bool default false, high_contrast bool default false,
  simple_ui bool default false, reduced_motion bool default false, audio bool default false);
create table classes (id uuid primary key default gen_random_uuid(), teacher_id uuid references profiles, title text not null);
create table class_members (class_id uuid references classes on delete cascade, student_id uuid references profiles on delete cascade, primary key (class_id, student_id));
create table ai_tasks (                -- created by teachers
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references profiles not null, class_id uuid references classes,
  module text not null check (module in ('adaptive','social','story')),
  lang text not null, level int default 1, grade int, support_area text,
  content text not null, approved boolean default false, created_at timestamptz default now());
create table ai_results (              -- generated output only; reviewed by teacher
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles not null, task_id uuid references ai_tasks,
  module text not null, output text not null, created_at timestamptz default now());
create table audit_log (id bigserial primary key, actor uuid, action text, at timestamptz default now());

alter table profiles enable row level security; alter table a11y_settings enable row level security;
alter table classes enable row level security; alter table class_members enable row level security;
alter table ai_tasks enable row level security; alter table ai_results enable row level security;
create policy own_profile on profiles for all using (id = auth.uid());
create policy own_a11y on a11y_settings for all using (user_id = auth.uid());
create policy teacher_classes on classes for all using (teacher_id = auth.uid());
create policy teacher_tasks on ai_tasks for all using (teacher_id = auth.uid());
create policy student_sees_approved on ai_tasks for select using (approved and class_id in (select class_id from class_members where student_id = auth.uid()));
create policy student_results on ai_results for all using (student_id = auth.uid());
create policy teacher_reads_results on ai_results for select using (student_id in (select student_id from class_members m join classes c on c.id = m.class_id where c.teacher_id = auth.uid()));
