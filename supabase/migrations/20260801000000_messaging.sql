-- Phase I: Blocking, messaging, in-app notifications

-- =====================================================
-- user_blocks
-- =====================================================
create table public.user_blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  reason text,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index user_blocks_blocked_idx on public.user_blocks (blocked_id);

alter table public.user_blocks enable row level security;

-- Blocker manages their own blocks; blocked party can also read rows where
-- they are blocked (so the client can short-circuit UI) but cannot mutate.
create policy "blocks: blocker all"
  on public.user_blocks for all
  using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);

create policy "blocks: blocked read own"
  on public.user_blocks for select
  using (auth.uid() = blocked_id);

-- Helper: does either direction of block exist between two users?
create or replace function public.is_blocked(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_blocks
     where (blocker_id = a and blocked_id = b)
        or (blocker_id = b and blocked_id = a)
  );
$$;

grant execute on function public.is_blocked(uuid, uuid) to authenticated;

-- =====================================================
-- conversations + messages
-- =====================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studio_profiles(id) on delete cascade,
  talent_id uuid not null references public.talent_profiles(id) on delete cascade,
  brief_id uuid references public.casting_briefs(id) on delete set null,
  last_message_at timestamptz,
  created_at timestamptz default now()
);

-- One conversation per (studio, talent, brief) — using coalesce to make
-- brief_id=null participate properly in uniqueness.
create unique index conversations_unique_idx
  on public.conversations (
    studio_id, talent_id,
    coalesce(brief_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create index conversations_studio_idx on public.conversations (studio_id, last_message_at desc);
create index conversations_talent_idx on public.conversations (talent_id, last_message_at desc);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) > 0 and length(body) <= 4000),
  read_at timestamptz,
  created_at timestamptz default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at desc);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Conversations: readable/mutatable only by the two parties, and only if no
-- active block exists between them.
create policy "convos: participant read"
  on public.conversations for select
  using (
    (auth.uid() = studio_id or auth.uid() = talent_id)
    and not public.is_blocked(studio_id, talent_id)
  );

create policy "convos: participant insert"
  on public.conversations for insert
  with check (
    (auth.uid() = studio_id or auth.uid() = talent_id)
    and not public.is_blocked(studio_id, talent_id)
  );

create policy "convos: participant update"
  on public.conversations for update
  using (
    (auth.uid() = studio_id or auth.uid() = talent_id)
    and not public.is_blocked(studio_id, talent_id)
  );

-- Messages: readable by either participant of the parent conversation.
create policy "messages: participant read"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
       where c.id = messages.conversation_id
         and (auth.uid() = c.studio_id or auth.uid() = c.talent_id)
         and not public.is_blocked(c.studio_id, c.talent_id)
    )
  );

-- Sender must be a participant AND be the authenticated user AND not be blocked.
create policy "messages: participant insert"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
       where c.id = messages.conversation_id
         and (auth.uid() = c.studio_id or auth.uid() = c.talent_id)
         and not public.is_blocked(c.studio_id, c.talent_id)
    )
  );

-- Recipients can update read_at on messages not sent by them.
create policy "messages: recipient mark read"
  on public.messages for update
  using (
    sender_id <> auth.uid()
    and exists (
      select 1 from public.conversations c
       where c.id = messages.conversation_id
         and (auth.uid() = c.studio_id or auth.uid() = c.talent_id)
    )
  )
  with check (
    sender_id <> auth.uid()
  );

-- Bump conversations.last_message_at on new message
create or replace function public.bump_conversation_last_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_bump_convo
  after insert on public.messages
  for each row execute function public.bump_conversation_last_message();

-- =====================================================
-- notifications
-- =====================================================
-- kind values (free-form text; enforced in app):
--   'invite_received'     — talent: studio invited you to a brief
--   'invite_accepted'     — studio: talent accepted
--   'invite_declined'     — studio: talent declined
--   'message_received'    — either: new message
--   'profile_saved'       — talent: a studio saved your profile
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index notifications_user_idx on public.notifications (user_id, read_at, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications: owner read"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications: owner update"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Inserts only via security-definer trigger functions (no direct insert policy).

-- =====================================================
-- Trigger: notify on brief_invites
-- =====================================================
create or replace function public.notify_brief_invite()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  studio_id uuid;
  brief_title text;
  studio_name text;
  talent_name text;
begin
  if tg_op = 'INSERT' then
    select b.studio_id, b.title, sp.studio_name
      into studio_id, brief_title, studio_name
      from public.casting_briefs b
      left join public.studio_profiles sp on sp.id = b.studio_id
     where b.id = new.brief_id;

    insert into public.notifications (user_id, kind, payload)
    values (
      new.talent_id,
      'invite_received',
      jsonb_build_object(
        'brief_id', new.brief_id,
        'brief_title', brief_title,
        'studio_id', studio_id,
        'studio_name', studio_name
      )
    );
    return new;
  end if;

  if tg_op = 'UPDATE'
     and new.status is distinct from old.status
     and new.status in ('accepted', 'declined') then
    select b.studio_id, b.title
      into studio_id, brief_title
      from public.casting_briefs b
     where b.id = new.brief_id;

    select t.stage_name into talent_name
      from public.talent_profiles t
     where t.id = new.talent_id;

    insert into public.notifications (user_id, kind, payload)
    values (
      studio_id,
      case when new.status = 'accepted' then 'invite_accepted' else 'invite_declined' end,
      jsonb_build_object(
        'brief_id', new.brief_id,
        'brief_title', brief_title,
        'talent_id', new.talent_id,
        'talent_name', talent_name
      )
    );

    -- On accept: auto-create conversation scoped to the brief (idempotent)
    if new.status = 'accepted' then
      insert into public.conversations (studio_id, talent_id, brief_id, last_message_at)
      values (studio_id, new.talent_id, new.brief_id, now())
      on conflict do nothing;
    end if;
    return new;
  end if;

  return new;
end;
$$;

create trigger brief_invites_notify
  after insert or update on public.brief_invites
  for each row execute function public.notify_brief_invite();

-- =====================================================
-- Trigger: notify on new message
-- =====================================================
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  c record;
  recipient uuid;
  sender_name text;
begin
  select studio_id, talent_id, brief_id into c
    from public.conversations where id = new.conversation_id;

  recipient := case when new.sender_id = c.studio_id then c.talent_id else c.studio_id end;

  -- Get sender display name based on role
  select coalesce(
           (select studio_name from public.studio_profiles where id = new.sender_id),
           (select stage_name  from public.talent_profiles where id = new.sender_id),
           'Someone'
         ) into sender_name;

  insert into public.notifications (user_id, kind, payload)
  values (
    recipient,
    'message_received',
    jsonb_build_object(
      'conversation_id', new.conversation_id,
      'message_id', new.id,
      'sender_id', new.sender_id,
      'sender_name', sender_name,
      'preview', left(new.body, 140)
    )
  );
  return new;
end;
$$;

create trigger messages_notify
  after insert on public.messages
  for each row execute function public.notify_new_message();

-- =====================================================
-- Trigger: notify on profile save
-- =====================================================
create or replace function public.notify_profile_saved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  studio_name text;
begin
  select sp.studio_name into studio_name
    from public.studio_profiles sp where sp.id = new.studio_id;

  insert into public.notifications (user_id, kind, payload)
  values (
    new.talent_id,
    'profile_saved',
    jsonb_build_object(
      'studio_id', new.studio_id,
      'studio_name', studio_name
    )
  );
  return new;
end;
$$;

create trigger talent_saves_notify
  after insert on public.talent_saves
  for each row execute function public.notify_profile_saved();
