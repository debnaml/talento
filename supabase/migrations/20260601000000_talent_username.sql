-- Public shareable talent profiles at /t/[username]
-- Adds a unique, URL-safe username column and opens up anonymous read
-- access to published talent + their images + their media.

create extension if not exists citext;

alter table public.talent_profiles
  add column username citext unique;

-- Format check: 3–32 chars, lowercase letters, numbers, hyphen, underscore.
-- Keep it simple; we reserve "admin", "api", etc. at the application layer.
alter table public.talent_profiles
  add constraint talent_profiles_username_format
  check (
    username is null
    or username ~ '^[a-z0-9][a-z0-9_-]{2,31}$'
  );

create index talent_profiles_username_idx
  on public.talent_profiles (username)
  where username is not null;

-- Public read policies — anon role can see published talent, their
-- images, and their media. Auth users keep their existing broader
-- access via the policies added in the initial RLS migration.

create policy "talent_profiles: public read when published"
  on public.talent_profiles for select
  to anon
  using (published = true);

create policy "talent_images: public read when talent published"
  on public.talent_images for select
  to anon
  using (
    exists (
      select 1 from public.talent_profiles t
      where t.id = talent_images.talent_id and t.published = true
    )
  );

create policy "talent_media: public read when talent published"
  on public.talent_media for select
  to anon
  using (
    exists (
      select 1 from public.talent_profiles t
      where t.id = talent_media.talent_id and t.published = true
    )
  );

-- Storage: allow anon signed-URL generation for published talent is
-- handled by the API (we only sign URLs after the RLS select above
-- confirms publication). The storage policies remain owner-only.
--
-- Signed URLs still require SELECT on storage.objects though, so we
-- grant anon read access on the three talent buckets when the owning
-- talent (first path segment = talent id) is published.

create policy "talent_images storage: public read when published"
  on storage.objects for select
  to anon
  using (
    bucket_id = 'talent-images'
    and exists (
      select 1 from public.talent_profiles t
      where t.id::text = (storage.foldername(name))[1]
        and t.published = true
    )
  );

create policy "talent_video storage: public read when published"
  on storage.objects for select
  to anon
  using (
    bucket_id = 'talent-video'
    and exists (
      select 1 from public.talent_profiles t
      where t.id::text = (storage.foldername(name))[1]
        and t.published = true
    )
  );

create policy "talent_voice storage: public read when published"
  on storage.objects for select
  to anon
  using (
    bucket_id = 'talent-voice'
    and exists (
      select 1 from public.talent_profiles t
      where t.id::text = (storage.foldername(name))[1]
        and t.published = true
    )
  );
