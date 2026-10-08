-- Ilik portfolio schema. Run once in the Supabase SQL Editor on a fresh project.
--
-- Access model:
--   * anon (the public site build) reads only published projects and visible photos;
--   * admins (accounts listed in public.admins, signed in to /admin) can read and write everything.
-- Also disable public sign-ups in Authentication → Providers → Email.
-- After creating the photographer's account by hand, make it an admin:
--   insert into public.admins (user_id) select id from auth.users where email = '<their email>';

-- Projects -------------------------------------------------------------------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  details text,
  published boolean not null default false,
  show_on_home boolean not null default false,
  home_order integer not null default 0,
  home_photo_left_id uuid,
  home_photo_right_id uuid,
  created_at timestamptz not null default now()
);

-- Photos ---------------------------------------------------------------------

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  storage_path text not null,
  alt text,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index photos_project_id_idx on public.photos (project_id, sort_order);

alter table public.projects
  add constraint projects_home_photo_left_id_fkey
    foreign key (home_photo_left_id) references public.photos (id) on delete set null,
  add constraint projects_home_photo_right_id_fkey
    foreign key (home_photo_right_id) references public.photos (id) on delete set null;

-- Site settings (single row) -------------------------------------------------

create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  email text,
  instagram text,
  about_bio text,
  portrait_path text
);

insert into public.site_settings (id) values (1);

-- Admins ---------------------------------------------------------------------

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create function public.is_admin() returns boolean
  language sql stable security definer set search_path = ''
  as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

-- Row level security ---------------------------------------------------------

alter table public.projects enable row level security;
alter table public.photos enable row level security;
alter table public.site_settings enable row level security;
alter table public.admins enable row level security;

create policy "Public reads published projects" on public.projects
  for select to anon using (published);

create policy "Public reads visible photos of published projects" on public.photos
  for select to anon using (
    is_visible and exists (
      select 1 from public.projects p where p.id = project_id and p.published
    )
  );

create policy "Public reads site settings" on public.site_settings
  for select to anon using (true);

create policy "Admin manages projects" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admin manages photos" on public.photos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admin manages site settings" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Storage --------------------------------------------------------------------

-- Uploads are re-encoded by the dashboard as JPEGs of at most 1500px, far below the 5 MB limit.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('photos', 'photos', true, 5242880, array['image/jpeg'])
  on conflict (id) do nothing;

create policy "Admin uploads photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'photos' and public.is_admin());

create policy "Admin updates photos" on storage.objects
  for update to authenticated using (bucket_id = 'photos' and public.is_admin());

create policy "Admin deletes photos" on storage.objects
  for delete to authenticated using (bucket_id = 'photos' and public.is_admin());
