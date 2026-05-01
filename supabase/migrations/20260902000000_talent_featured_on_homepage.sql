-- Allow talent to opt-in to being featured on the public marketing
-- homepage. This is a separate consent surface from `published`
-- (which controls visibility in the studio registry). Defaults OFF —
-- talent must explicitly opt in.

alter table public.talent_profiles
  add column if not exists featured_on_homepage boolean not null default false;

-- Helpful partial index for the homepage query
create index if not exists talent_profiles_featured_idx
  on public.talent_profiles (featured_on_homepage)
  where featured_on_homepage = true and published = true;
