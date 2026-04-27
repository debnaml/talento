-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

alter table public.profiles         enable row level security;
alter table public.talent_profiles  enable row level security;
alter table public.studio_profiles  enable row level security;
alter table public.talent_images    enable row level security;
alter table public.talent_saves     enable row level security;
alter table public.audit_logs       enable row level security;

-- PROFILES ---------------------------------------------------------------
create policy "profiles: self read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: self update"
  on public.profiles for update
  using (auth.uid() = id);

-- TALENT PROFILES --------------------------------------------------------
create policy "talent_profiles: published read (auth)"
  on public.talent_profiles for select
  to authenticated
  using (published = true);

create policy "talent_profiles: self read"
  on public.talent_profiles for select
  using (auth.uid() = id);

create policy "talent_profiles: self insert"
  on public.talent_profiles for insert
  with check (
    auth.uid() = id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'talent'
    )
  );

create policy "talent_profiles: self update"
  on public.talent_profiles for update
  using (auth.uid() = id);

-- STUDIO PROFILES --------------------------------------------------------
create policy "studio_profiles: self read"
  on public.studio_profiles for select
  using (auth.uid() = id);

create policy "studio_profiles: self insert"
  on public.studio_profiles for insert
  with check (
    auth.uid() = id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'studio'
    )
  );

create policy "studio_profiles: self update"
  on public.studio_profiles for update
  using (auth.uid() = id);

-- TALENT IMAGES ----------------------------------------------------------
create policy "talent_images: read when talent published"
  on public.talent_images for select
  to authenticated
  using (
    exists (
      select 1 from public.talent_profiles t
      where t.id = talent_images.talent_id and t.published = true
    )
  );

create policy "talent_images: owner read"
  on public.talent_images for select
  using (auth.uid() = talent_id);

create policy "talent_images: owner insert"
  on public.talent_images for insert
  with check (auth.uid() = talent_id);

create policy "talent_images: owner update"
  on public.talent_images for update
  using (auth.uid() = talent_id);

create policy "talent_images: owner delete"
  on public.talent_images for delete
  using (auth.uid() = talent_id);

-- TALENT SAVES -----------------------------------------------------------
create policy "talent_saves: studio own"
  on public.talent_saves for all
  using (auth.uid() = studio_id)
  with check (auth.uid() = studio_id);

-- AUDIT LOGS -------------------------------------------------------------
-- Stage 1: service role only (bypasses RLS by design).

-- STORAGE BUCKET ---------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'talent-images',
  'talent-images',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy "talent_images_bucket: owner upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'talent-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "talent_images_bucket: owner read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'talent-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "talent_images_bucket: owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'talent-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
