-- =========================================================================
-- STAGE 1.5 — MEDIA (VIDEO + VOICE)
-- =========================================================================

-- Enum ------------------------------------------------------------------
create type media_kind as enum ('video', 'voice');

-- Talent media table ----------------------------------------------------
create table public.talent_media (
  id uuid primary key default gen_random_uuid(),
  talent_id uuid not null references public.talent_profiles(id) on delete cascade,
  kind media_kind not null,
  storage_path text not null,              -- path in talent-video or talent-voice
  poster_path text,                        -- optional poster / waveform
  duration_seconds numeric(6, 2),
  mime_type text,
  file_size_bytes bigint,
  sort_order int default 0,
  label text,                              -- "Neutral", "Read 1", etc.
  created_at timestamptz default now()
);

create index talent_media_talent_id_idx on public.talent_media (talent_id, kind);

-- Per-talent caps ------------------------------------------------------
create or replace function public.enforce_talent_media_caps()
returns trigger language plpgsql as $$
declare
  cap int;
  current_count int;
begin
  cap := case new.kind
    when 'video' then 5
    when 'voice' then 3
    else 999
  end;
  select count(*) into current_count
    from public.talent_media
    where talent_id = new.talent_id and kind = new.kind;
  if current_count >= cap then
    raise exception 'Media limit reached for kind %', new.kind;
  end if;
  return new;
end;
$$;

create trigger talent_media_cap_check
  before insert on public.talent_media
  for each row execute function public.enforce_talent_media_caps();

-- RLS ------------------------------------------------------------------
alter table public.talent_media enable row level security;

create policy "talent_media: read when talent published"
  on public.talent_media for select
  to authenticated
  using (
    exists (
      select 1 from public.talent_profiles t
      where t.id = talent_media.talent_id and t.published = true
    )
  );

create policy "talent_media: owner read"
  on public.talent_media for select
  using (auth.uid() = talent_id);

create policy "talent_media: owner insert"
  on public.talent_media for insert
  with check (auth.uid() = talent_id);

create policy "talent_media: owner update"
  on public.talent_media for update
  using (auth.uid() = talent_id);

create policy "talent_media: owner delete"
  on public.talent_media for delete
  using (auth.uid() = talent_id);

-- STORAGE — talent-video ------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'talent-video',
  'talent-video',
  false,
  104857600,  -- 100 MB
  array['video/mp4', 'video/webm', 'video/quicktime']
);

create policy "talent_video_bucket: owner upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'talent-video'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "talent_video_bucket: owner read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'talent-video'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "talent_video_bucket: owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'talent-video'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- STORAGE — talent-voice ------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'talent-voice',
  'talent-voice',
  false,
  20971520,  -- 20 MB
  array['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/x-m4a', 'audio/ogg']
);

create policy "talent_voice_bucket: owner upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'talent-voice'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "talent_voice_bucket: owner read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'talent-voice'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "talent_voice_bucket: owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'talent-voice'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
