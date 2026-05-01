-- Allow authenticated users (studios) to read storage objects for any
-- published talent. The existing "public read when published" policies
-- only target the anon role, so studio users fall back to the owner-only
-- policy and createSignedUrl returns nothing for other talents' images.

create policy "talent_images storage: authenticated read when published"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'talent-images'
    and exists (
      select 1 from public.talent_profiles t
      where t.id::text = (storage.foldername(name))[1]
        and t.published = true
    )
  );

create policy "talent_video storage: authenticated read when published"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'talent-video'
    and exists (
      select 1 from public.talent_profiles t
      where t.id::text = (storage.foldername(name))[1]
        and t.published = true
    )
  );

create policy "talent_voice storage: authenticated read when published"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'talent-voice'
    and exists (
      select 1 from public.talent_profiles t
      where t.id::text = (storage.foldername(name))[1]
        and t.published = true
    )
  );
