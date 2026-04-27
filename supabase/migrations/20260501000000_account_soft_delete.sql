-- Soft-delete flag on profiles. Populated by the user-initiated
-- "delete account" flow. A cron job (TBD) hard-deletes rows older
-- than 30 days via the admin API.

alter table public.profiles
  add column deleted_at timestamptz;

create index profiles_deleted_at_idx
  on public.profiles (deleted_at)
  where deleted_at is not null;
