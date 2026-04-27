-- Fix trigger functions to use studio_profiles.company_name (not studio_name)

create or replace function public.notify_brief_invite()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_studio_id uuid;
  brief_title text;
  studio_name text;
  talent_name text;
begin
  if tg_op = 'INSERT' then
    select b.studio_id, b.title, sp.company_name
      into v_studio_id, brief_title, studio_name
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
        'studio_id', v_studio_id,
        'studio_name', studio_name
      )
    );
    return new;
  end if;

  if tg_op = 'UPDATE'
     and new.status is distinct from old.status
     and new.status in ('accepted', 'declined') then
    select b.studio_id, b.title
      into v_studio_id, brief_title
      from public.casting_briefs b
     where b.id = new.brief_id;

    select t.stage_name into talent_name
      from public.talent_profiles t
     where t.id = new.talent_id;

    insert into public.notifications (user_id, kind, payload)
    values (
      v_studio_id,
      case when new.status = 'accepted' then 'invite_accepted' else 'invite_declined' end,
      jsonb_build_object(
        'brief_id', new.brief_id,
        'brief_title', brief_title,
        'talent_id', new.talent_id,
        'talent_name', talent_name
      )
    );

    if new.status = 'accepted' then
      insert into public.conversations (studio_id, talent_id, brief_id, last_message_at)
      values (v_studio_id, new.talent_id, new.brief_id, now())
      on conflict do nothing;
    end if;
    return new;
  end if;

  return new;
end;
$$;

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

  select coalesce(
           (select company_name from public.studio_profiles where id = new.sender_id),
           (select stage_name   from public.talent_profiles where id = new.sender_id),
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

create or replace function public.notify_profile_saved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  studio_name text;
begin
  select sp.company_name into studio_name
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
