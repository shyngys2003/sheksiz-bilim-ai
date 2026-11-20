-- Run once after db/materials.sql. Existing materials are preserved.
begin;
alter table public.school_materials add column if not exists section integer;
alter table public.school_materials drop constraint if exists school_materials_section_check;
alter table public.school_materials add constraint school_materials_section_check check (section between 1 and 8);
alter table public.school_materials drop constraint if exists school_materials_category_check;
alter table public.school_materials add constraint school_materials_category_check check (category in ('presentation','document','lesson','video','photo'));
update storage.buckets set allowed_mime_types=array['application/pdf','application/msword','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation','image/jpeg','image/png','image/webp','video/mp4','video/webm'] where id='school-materials';
commit;
