-- Phase H: Casting briefs + matching

create type brief_status as enum ('draft', 'open', 'closed', 'cancelled');

create table public.casting_briefs (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studio_profiles(id) on delete cascade,
  title text not null,
  description text,
  -- Target attributes (all nullable = "any")
  categories talent_category[] default '{}',
  gender gender_identity,
  age_range text,
  country text,
  height_min_cm int,
  height_max_cm int,
  requires_video boolean default false,
  requires_voice boolean default false,
  requires_verified boolean default false,
  -- Commercial
  budget_gbp_min int,
  budget_gbp_max int,
  usage_scope text,
  shoot_date date,
  -- Lifecycle
  status brief_status not null default 'draft',
  closes_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index casting_briefs_studio_idx on public.casting_briefs (studio_id);
create index casting_briefs_open_idx on public.casting_briefs (status) where status = 'open';

create trigger casting_briefs_updated_at
  before update on public.casting_briefs
  for each row execute function public.set_updated_at();

create table public.brief_invites (
  brief_id uuid not null references public.casting_briefs(id) on delete cascade,
  talent_id uuid not null references public.talent_profiles(id) on delete cascade,
  status text not null default 'pending',  -- 'pending' | 'accepted' | 'declined'
  note text,
  invited_at timestamptz default now(),
  responded_at timestamptz,
  primary key (brief_id, talent_id)
);

create index brief_invites_talent_idx on public.brief_invites (talent_id, status);

alter table public.casting_briefs enable row level security;
alter table public.brief_invites enable row level security;

-- Studio owner: full access to own briefs
create policy "briefs: owner all"
  on public.casting_briefs for all
  using (auth.uid() = studio_id)
  with check (auth.uid() = studio_id);

-- Invited talent can read the brief
create policy "briefs: invited talent read"
  on public.casting_briefs for select
  using (
    exists (
      select 1 from public.brief_invites bi
       where bi.brief_id = casting_briefs.id
         and bi.talent_id = auth.uid()
    )
  );

-- Studio (as brief owner) manages invites on their briefs
create policy "invites: studio owner"
  on public.brief_invites for all
  using (
    exists (
      select 1 from public.casting_briefs b
       where b.id = brief_id and b.studio_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.casting_briefs b
       where b.id = brief_id and b.studio_id = auth.uid()
    )
  );

-- Talent can read their own invites
create policy "invites: talent read own"
  on public.brief_invites for select
  using (auth.uid() = talent_id);

-- Talent can update (respond to) their own invites
create policy "invites: talent respond own"
  on public.brief_invites for update
  using (auth.uid() = talent_id)
  with check (auth.uid() = talent_id);

-- Deterministic filter match function
create or replace function public.match_talent_for_brief(p_brief_id uuid)
returns table (
  id uuid,
  stage_name text,
  username citext,
  location text,
  country text,
  gender gender_identity,
  age_range text,
  height_cm int,
  categories talent_category[],
  verified boolean,
  primary_storage_path text
)
language sql
stable
security invoker
as $$
  with b as (
    select * from public.casting_briefs where id = p_brief_id
  )
  select t.id, t.stage_name, t.username, t.location, t.country,
         t.gender, t.age_range, t.height_cm, t.categories, t.verified,
         ti.storage_path as primary_storage_path
    from public.talent_profiles t
    cross join b
    left join public.talent_images ti
      on ti.talent_id = t.id and ti.is_primary
   where t.published = true
     and (coalesce(array_length(b.categories, 1), 0) = 0
          or t.categories && b.categories)
     and (b.gender is null or t.gender = b.gender)
     and (b.country is null or t.country = b.country)
     and (b.age_range is null or t.age_range = b.age_range)
     and (b.height_min_cm is null or t.height_cm >= b.height_min_cm)
     and (b.height_max_cm is null or t.height_cm <= b.height_max_cm)
     and (not b.requires_verified or t.verified = true)
     and (not b.requires_video or exists (
       select 1 from public.talent_media m
        where m.talent_id = t.id and m.kind = 'video'))
     and (not b.requires_voice or exists (
       select 1 from public.talent_media m
        where m.talent_id = t.id and m.kind = 'voice'))
   order by t.verified desc nulls last, t.created_at desc
   limit 50;
$$;

grant execute on function public.match_talent_for_brief(uuid) to authenticated;
