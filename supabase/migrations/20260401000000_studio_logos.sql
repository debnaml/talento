-- Studio logo storage bucket (private; displayed via signed URLs).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'studio-logos',
  'studio-logos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
);

-- Owner-only upload. Files must live under {auth.uid()}/...
create policy "studio_logos: owner upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'studio-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "studio_logos: owner read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'studio-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "studio_logos: owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'studio-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
