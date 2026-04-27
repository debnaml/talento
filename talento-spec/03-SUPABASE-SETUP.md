# 03 — Supabase Setup

Everything for the backend lives in Supabase: auth, database, storage. This doc is the complete setup. Copy the SQL into the Supabase SQL editor (or use `supabase/migrations/` files and push via CLI).

---

## 1. Create the project

1. Go to [supabase.com](https://supabase.com), create a new project.
2. Choose a region close to the target audience (London → `eu-west-2`, or `eu-central-1`).
3. Save the project URL, anon key, and service role key — they go into `.env.local`.

---

## 2. Schema (Stage 1)

Create a migration file at `supabase/migrations/20260101000000_init.sql`:

```sql
-- =========================================================================
-- TALENTO STAGE 1 SCHEMA
-- =========================================================================

-- Enums ------------------------------------------------------------------
create type user_role as enum ('talent', 'studio');
create type talent_category as enum (
  'film', 'tv', 'advertising', 'gaming', 'd2c', 'sports',
  'music', 'historical', 'stunt', 'action', 'drama', 'comedy'
);
create type studio_type as enum (
  'film_production', 'advertising_agency', 'gaming_studio',
  'brand', 'music_label', 'other'
);
create type gender_identity as enum ('male', 'female', 'non_binary', 'other', 'prefer_not');

-- Profiles (one per auth.users row) --------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  email text not null,
  full_name text,
  avatar_url text,
  onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Talent profiles (1:1 extension) ----------------------------------------
create table public.talent_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  stage_name text not null,
  bio text,
  location text,              -- "London, UK"
  country text,               -- "GB" iso code
  age_range text,             -- "28-34"
  gender gender_identity,
  ethnicity text,             -- free text for Stage 1, controlled vocab later
  height_cm int,
  categories talent_category[] default '{}',
  -- Consent toggles (simple for Stage 1; granular permissions = Stage 3)
  allows_film boolean default true,
  allows_advertising boolean default true,
  allows_gaming boolean default true,
  allows_d2c boolean default false,
  allows_political boolean default false,
  allows_adult boolean default false,
  -- Admin
  verified boolean default false,
  published boolean default false,     -- appears in public registry
  tik text unique,                     -- placeholder for Stage 3 TIK
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index talent_profiles_categories_idx
  on public.talent_profiles using gin (categories);

create index talent_profiles_published_idx
  on public.talent_profiles (published) where published = true;

-- Studio profiles --------------------------------------------------------
create table public.studio_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  company_name text not null,
  studio_type studio_type not null,
  website text,
  description text,
  country text,
  logo_url text,
  supplier_code text unique,    -- placeholder for Stage 3
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Talent images (photo library per talent) -------------------------------
create table public.talent_images (
  id uuid primary key default gen_random_uuid(),
  talent_id uuid not null references public.talent_profiles(id) on delete cascade,
  storage_path text not null,    -- path in the `talent-images` bucket
  is_primary boolean default false,
  sort_order int default 0,
  width int,
  height int,
  file_size_bytes int,
  mime_type text,
  created_at timestamptz default now()
);

create index talent_images_talent_id_idx on public.talent_images (talent_id);

-- Only one primary image per talent -------------------------------------
create unique index talent_images_one_primary_per_talent
  on public.talent_images (talent_id) where is_primary = true;

-- Studio saves (bookmarks) ----------------------------------------------
create table public.talent_saves (
  studio_id uuid not null references public.studio_profiles(id) on delete cascade,
  talent_id uuid not null references public.talent_profiles(id) on delete cascade,
  note text,
  created_at timestamptz default now(),
  primary key (studio_id, talent_id)
);

-- Audit log (schema-ready for Stage 3, unused in Stage 1) ---------------
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,                 -- who did it (nullable = system)
  action text not null,          -- 'profile.published' etc.
  target_type text,              -- 'talent_profile'
  target_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

-- Updated_at trigger helper ---------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger talent_profiles_updated_at before update on public.talent_profiles
  for each row execute function public.set_updated_at();
create trigger studio_profiles_updated_at before update on public.studio_profiles
  for each row execute function public.set_updated_at();

-- Auto-create profiles row on auth signup --------------------------------
-- We store the chosen role in auth.users.raw_user_meta_data during signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'talent'),
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

## 3. Row-Level Security

Create `supabase/migrations/20260101000100_rls.sql`:

```sql
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
-- Everyone can read their own row; authenticated users can read
-- the minimal public profile of anyone (name, role, avatar).
create policy "profiles: self read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: self update"
  on public.profiles for update
  using (auth.uid() = id);

-- TALENT PROFILES --------------------------------------------------------
-- Published talent profiles readable by any authenticated user (the studios).
create policy "talent_profiles: published read (auth)"
  on public.talent_profiles for select
  to authenticated
  using (published = true);

-- A talent reads their own row always.
create policy "talent_profiles: self read"
  on public.talent_profiles for select
  using (auth.uid() = id);

-- A talent inserts and updates their own row.
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
-- Images of PUBLISHED talent are readable by any authenticated user.
create policy "talent_images: read when talent published"
  on public.talent_images for select
  to authenticated
  using (
    exists (
      select 1 from public.talent_profiles t
      where t.id = talent_images.talent_id and t.published = true
    )
  );

-- A talent manages their own images.
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
-- Studios manage their own saves only.
create policy "talent_saves: studio own"
  on public.talent_saves for all
  using (auth.uid() = studio_id)
  with check (auth.uid() = studio_id);

-- AUDIT LOGS -------------------------------------------------------------
-- Stage 1: no one reads; server-only inserts via service role.
-- (Service role bypasses RLS by design.)
```

---

## 4. Storage buckets

Run in the SQL editor after the core migration:

```sql
-- Create the storage bucket for talent images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'talent-images',
  'talent-images',
  false,                       -- not public; we serve via signed URLs
  10 * 1024 * 1024,            -- 10 MB per file
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Storage RLS policies
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

-- Studios read images for PUBLISHED talent via signed URL from server,
-- so no public read policy needed here. The server uses the service role
-- to generate signed URLs for the registry.
```

**Folder convention:** every file is stored under the talent's user id:

```
talent-images/
  └── {talent_uuid}/
        ├── {image_uuid}.jpg
        └── ...
```

This matches the first storage policy which checks that the folder name is the uploader's UUID.

---

## 5. Seed data (optional, for local dev)

`supabase/seed.sql` — run after creating test users via the auth UI:

```sql
-- Replace UUIDs with real ones from auth.users in your dev project.
-- Quickest: sign up a few users in the app UI, then copy their ids here.

-- Example talent
update public.talent_profiles set
  published = true, verified = true,
  bio = 'London-based actor. Film and TV background.',
  categories = array['film', 'tv', 'drama']::talent_category[],
  location = 'London, UK', country = 'GB', age_range = '28-34'
where id = '00000000-0000-0000-0000-000000000001';
```

For speed, prefer the SQL editor to manually set a test talent to `published = true` once you've uploaded a few images.

---

## 6. Generate TypeScript types

Once the schema is pushed, regenerate types into `types/database.ts`:

```bash
npx supabase gen types typescript \
  --project-id "<YOUR-PROJECT-REF>" \
  --schema public > types/database.ts
```

Import from `@/types/database` everywhere.

---

## 7. Checklist

- [ ] Project created in Supabase dashboard
- [ ] Init + RLS migrations run, no errors
- [ ] `talent-images` storage bucket created with policies
- [ ] `.env.local` has all three keys
- [ ] Types generated into `types/database.ts`
- [ ] Test sign-up via app creates a row in `profiles` (via trigger)

---

## Read next

`04-PROJECT-SETUP.md`
