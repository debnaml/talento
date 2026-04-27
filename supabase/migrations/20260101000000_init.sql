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
  location text,
  country text,
  age_range text,
  gender gender_identity,
  ethnicity text,
  height_cm int,
  categories talent_category[] default '{}',
  allows_film boolean default true,
  allows_advertising boolean default true,
  allows_gaming boolean default true,
  allows_d2c boolean default false,
  allows_political boolean default false,
  allows_adult boolean default false,
  verified boolean default false,
  published boolean default false,
  tik text unique,
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
  supplier_code text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Talent images ----------------------------------------------------------
create table public.talent_images (
  id uuid primary key default gen_random_uuid(),
  talent_id uuid not null references public.talent_profiles(id) on delete cascade,
  storage_path text not null,
  is_primary boolean default false,
  sort_order int default 0,
  width int,
  height int,
  file_size_bytes int,
  mime_type text,
  created_at timestamptz default now()
);

create index talent_images_talent_id_idx on public.talent_images (talent_id);

create unique index talent_images_one_primary_per_talent
  on public.talent_images (talent_id) where is_primary = true;

-- Studio saves -----------------------------------------------------------
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
  actor_id uuid,
  action text not null,
  target_type text,
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
