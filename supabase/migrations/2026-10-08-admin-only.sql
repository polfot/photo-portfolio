-- Run once in the Supabase SQL Editor on the existing project (fresh projects get this from schema.sql).
--
-- Before: any signed-in account could edit everything, so safety depended on sign-ups staying disabled.
-- After: only accounts listed in public.admins can edit, and the photo bucket accepts only JPEGs up to 5 MB.
-- The accounts that exist right now (the photographer) become the admins.

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.admins enable row level security;

insert into public.admins (user_id) select id from auth.users on conflict do nothing;

create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = ''
  as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

drop policy if exists "Admin manages projects" on public.projects;
create policy "Admin manages projects" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin manages photos" on public.photos;
create policy "Admin manages photos" on public.photos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin manages site settings" on public.site_settings;
create policy "Admin manages site settings" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admin uploads photos" on storage.objects;
create policy "Admin uploads photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'photos' and public.is_admin());

drop policy if exists "Admin updates photos" on storage.objects;
create policy "Admin updates photos" on storage.objects
  for update to authenticated using (bucket_id = 'photos' and public.is_admin());

drop policy if exists "Admin deletes photos" on storage.objects;
create policy "Admin deletes photos" on storage.objects
  for delete to authenticated using (bucket_id = 'photos' and public.is_admin());

-- The dashboard re-encodes every upload as a JPEG of at most 1500px, far below this limit.
update storage.buckets
  set file_size_limit = 5242880, allowed_mime_types = array['image/jpeg']
  where id = 'photos';

-- Check: this should list the photographer's account.
select u.email from public.admins a join auth.users u on u.id = a.user_id;
