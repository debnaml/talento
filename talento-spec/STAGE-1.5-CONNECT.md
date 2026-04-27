# Stage 1.5 — Connect

**Goal:** turn the Stage 1 marketplace shell into a product a real talent would fill out and a real studio would actually use. Close the feedback loops that make the two-sided flywheel spin before adding auctions.

Stage 1 gives us a registry and a "save" button. That's a catalogue, not a marketplace. A studio who saves a talent has nowhere to go next; a talent who publishes has no reason to come back. Stage 1.5 fixes that — plus it finally delivers on the brand promise (face **and voice and video**, not just photos).

Do not start Stage 2 (auctions) until Stage 1.5 is shipped. Auctions on top of a broken flywheel won't save it.

---

## What's actually missing — audit

Grouped by why it matters. Ticked items are already in Stage 1; this is the pre-work summary so the next person reading this knows the baseline.

### Core product promise — currently unfulfilled

- [ ] **Video uploads.** The tagline is "Your face. Your voice. Your likeness." Photos alone don't sell likeness licensing. A talent needs to upload short reference clips (5–30s: neutral, profile, expression range).
- [ ] **Voice samples.** Same reason. Short audio clips (10–30s read, 30–60s conversational).
- [ ] **Primary image selection on mobile.** Exists but gated behind desktop-only `:hover` interaction in `ImageUploader`. Mobile users cannot change their primary photo today — it's the first one they upload, permanently. Critical UX bug.

### Two-sided flywheel — currently broken

- [ ] **Casting briefs.** The whole studio narrative ("cast at the speed of AI") needs briefs. Without one, a studio is just filter-browsing. `talento-casting.html` shows a brief-driven flow that was never built.
- [ ] **Brief → shortlist matching.** Given a brief, surface the N most relevant published talents (basic filter match to start; embedding/AI later).
- [ ] **Messaging.** Studio → talent 1:1. Without it, "save" is a dead end and there is no path from discovery to booking. Stage 1 marked this as Stage 2 — that was wrong; an auction with no DM channel leads nowhere either. Messaging belongs here.
- [ ] **Notifications.** In-app + email for: profile saved, new message, brief invitation, verification granted. Without these, async messaging doesn't work.

### Trust & compliance — currently zero

- [ ] **Verification flow.** `talent_profiles.verified` boolean exists in schema, unused. Add a minimal admin-gated verification request + grant flow. Badge renders in `TalentCard`.
- [ ] **Legal pages.** `/terms`, `/privacy`, `/consent` — required for go-live, referenced by the register form's checkbox which today links to nothing.
- [ ] **Reporting / flagging.** A studio or talent can flag a profile or message. Admin review queue.
- [ ] **Account deletion.** GDPR right to erasure. Also "unpublish" as a softer option. Currently no UI for either.

### Account management — currently missing

- [ ] **Edit profile.** Talent and studio onboarding forms are write-once today; no edit route. Users cannot correct a typo in their own bio. (`/talent/onboarding` redirects away once `onboarded = true`.)
- [ ] **Forgot password / reset.** Not built.
- [ ] **Email change / password change.** Not built.
- [ ] **Public shareable talent profile.** STAGE-1-BUILD explicitly excluded `/talent/[id]` as public. That was a defensible scoping call for v1, but a shareable profile URL is how talent bring studios to the platform. We'll add `/t/[slug]` (published talent only) in Stage 1.5.

### Studio onboarding quality

- [ ] **Studio logo upload.** Column exists (`studio_profiles.logo_url`), flagged as Stage 1.5 in the original spec. Include it here.
- [ ] **Studio verification.** Same mechanism as talent verification — prevents fake studios from DMing real talent.

### Discoverability

- [ ] **Filter expansion.** Today: `q`, `category`, `gender`, `country`. Add: `age_range`, `height_cm` range, `verified only`, `has_video`, `has_voice`, `consent scope` (film/advertising/gaming/d2c).
- [ ] **Sort.** Newest · Most saved · Verified first.
- [ ] **Featured row.** Admin-curated "verified + complete profile" selection on homepage and top of browse.

### Admin

- [ ] **Admin dashboard.** Minimal: list users, verify/unverify, ban, review reports. `profiles.is_admin` boolean + `/admin` route gated on it.

---

## Priority order

Build in this sequence. Each phase ends in a shippable state.

1. **F — Media expansion** (video + voice + primary-image mobile fix)
2. **G — Account management** (edit profile, forgot password, unpublish, delete, legal pages)
3. **H — Casting briefs + matching**
4. **I — Messaging + notifications**
5. **J — Trust** (verification, reporting, admin)
6. **K — Discoverability** (filter expansion, sort, featured)
7. **L — Polish + ship**

Phases F and G are straightforward extensions of what we already have. H, I, J are new verticals. Do F and G first so the upgrade feels live to existing users, then layer the new surfaces on top.

---

## Phase F — Media expansion

### F1. Schema additions

Migration `supabase/migrations/20260301000000_media.sql`:

```sql
create type media_kind as enum ('image', 'video', 'voice');

-- Rename-in-place if preferred; for minimum breakage, keep talent_images
-- and add a parallel talent_media table for video/voice. Dual tables are
-- fine — migrations are cheap, a union view is trivial if needed later.

create table public.talent_media (
  id uuid primary key default gen_random_uuid(),
  talent_id uuid not null references public.talent_profiles(id) on delete cascade,
  kind media_kind not null,                -- 'video' | 'voice'
  storage_path text not null,              -- bucket path
  poster_path text,                        -- video: poster frame; voice: waveform png (nullable)
  duration_seconds numeric(5,2),
  mime_type text,
  file_size_bytes bigint,
  sort_order int default 0,
  label text,                              -- "Neutral", "Profile", "Read 1" etc.
  created_at timestamptz default now()
);

create index talent_media_talent_id_idx on public.talent_media (talent_id, kind);

-- Enforce per-talent caps via a trigger (Stage 1.5: 5 videos, 3 voice clips).
create or replace function public.enforce_media_caps()
returns trigger language plpgsql as $$
declare
  cap int;
  current_count int;
begin
  cap := case new.kind when 'video' then 5 when 'voice' then 3 else 999 end;
  select count(*) into current_count from public.talent_media
    where talent_id = new.talent_id and kind = new.kind;
  if current_count >= cap then
    raise exception 'Media limit reached for kind %', new.kind;
  end if;
  return new;
end;
$$;

create trigger talent_media_cap_check
  before insert on public.talent_media
  for each row execute function public.enforce_media_caps();

-- RLS — mirror talent_images
alter table public.talent_media enable row level security;

create policy "talent_media: read when talent published"
  on public.talent_media for select
  to authenticated
  using (
    exists (select 1 from public.talent_profiles t
             where t.id = talent_media.talent_id and t.published = true)
  );

create policy "talent_media: owner all"
  on public.talent_media for all
  using (auth.uid() = talent_id)
  with check (auth.uid() = talent_id);
```

Storage buckets:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('talent-video', 'talent-video', false, 104857600,               -- 100 MB
   array['video/mp4','video/webm','video/quicktime']),
  ('talent-voice', 'talent-voice', false, 20971520,                -- 20 MB
   array['audio/mpeg','audio/mp4','audio/wav','audio/webm','audio/x-m4a']);

-- Owner-writes, published-reads — same pattern as talent-images.
-- (Copy the existing storage policies from the talent-images migration.)
```

### F2. Publish gate — tighten

Update `publishProfile` server action: allow publishing with ≥1 image. **Do not require** video or voice yet (many talent won't have them). But surface a "Profile strength" indicator on the dashboard — Basic (image only) / Good (image + video) / Complete (image + video + voice). Nudges without gating.

### F3. UI

- **`/talent/upload`**: tabbed within one page — Photos · Videos · Voice. Each tab reuses the existing `ImageUploader` shape with a kind-specific uploader.
- **`components/forms/VideoUploader.tsx`** — client, same drop-zone pattern. Server-generate poster via an Edge Function post-upload (or skip poster for v1 and fall back to native `<video>` preview).
- **`components/forms/VoiceUploader.tsx`** — record-in-browser (MediaRecorder API) **or** upload file. Show a waveform (use `wavesurfer.js` lazily-loaded, or skip waveform and just use an `<audio controls>` bar).
- **`/studio/talent/[id]`**: below the photo gallery, render video and voice sections. Signed URLs, 3600s TTL.

### F4. Primary-image mobile fix (ships with F)

The existing `ImageUploader` hides "Set Primary" and "Delete" inside an `opacity-0 group-hover` overlay. On touch devices there's no hover. Fix:

- Always-visible small icon row on the card (star for primary, trash for delete), sized ≥44px touch target.
- Primary indicator stays on the card (existing "Primary" pill).
- On desktop, keep the hover dim for aesthetics but put the buttons in the always-visible bottom bar.

Same treatment for video and voice cards.

---

## Phase G — Account management

### G1. Edit profile

- `/talent/settings/profile` — same form as onboarding, pre-filled, Save button returns to dashboard. Do **not** redirect away based on `onboarded = true` this time; the guard in `app/talent/layout.tsx` needs a path-aware exception.
- `/studio/settings/profile` — same for studios. Adds logo upload (was deferred).

Server actions upsert into the respective profile tables. RLS already covers it.

### G2. Auth completion

- `/forgot-password` — form takes email, calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: ${origin}/reset-password })`.
- `/reset-password` — client page; user arrives from email link with a session in URL; calls `supabase.auth.updateUser({ password })`.
- `/settings/account` — change email, change password, **delete account** (soft delete: flips `profiles.deleted_at`, unpublishes talent, removes from registry, retains audit rows; hard-delete after 30d via cron).
- "Forgot password?" link on `/login`.

### G3. Unpublish

On `/talent/dashboard`, add a secondary "Unpublish" action next to Edit Profile. Flips `published = false`. Cheaper than delete when a talent just wants to step away.

### G4. Legal pages

Three static MDX (or plain TSX) pages: `/terms`, `/privacy`, `/consent`. Draft copy below — run past a lawyer before go-live, don't ship as-is for paid traffic.

- `/terms` — service terms, dispute resolution, account termination rights.
- `/privacy` — data collected, retention, third parties (Supabase, Vercel), right to erasure flow, contact.
- `/consent` — plain-English explainer of the six consent toggles. What "advertising" means. What "D2C" means. What "political" and "adult" exclude.

Wire these into:

- Register form checkbox (`By signing up you agree to our [Terms] and [Privacy Policy]`)
- Onboarding consent block (link to `/consent`)
- Footer

### G5. Public shareable talent profile

- `/t/[username]` (new shorter root-level route). `talent_profiles.username` — new unique column, generated from stage name on first publish, editable in settings.
- Public (unauthenticated) read of published talent profiles; no save button; CTA: "Studios — log in to save and message".
- Add OG image per talent (generate from primary photo via `ImageResponse` in an `opengraph-image.tsx`).

Schema:

```sql
alter table public.talent_profiles
  add column username citext unique;

create extension if not exists citext;

-- Public read policy for published talent (unauthenticated)
create policy "talent_profiles: public read when published"
  on public.talent_profiles for select
  to anon
  using (published = true);

create policy "talent_images: public read when talent published"
  on public.talent_images for select
  to anon
  using (
    exists (select 1 from public.talent_profiles t
             where t.id = talent_images.talent_id and t.published = true)
  );

-- Same for talent_media
```

Update `/app/robots.ts` — allow `/t/*`.

---

## Phase H — Casting briefs + matching

### H1. Schema

```sql
create type brief_status as enum ('draft', 'open', 'closed', 'cancelled');

create table public.casting_briefs (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studio_profiles(id) on delete cascade,
  title text not null,
  description text,
  -- Target attributes (all nullable — null means "any")
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
  usage_scope text,                       -- free text
  shoot_date date,
  -- Lifecycle
  status brief_status not null default 'draft',
  closes_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index casting_briefs_studio_idx on public.casting_briefs (studio_id);
create index casting_briefs_open_idx on public.casting_briefs (status) where status = 'open';

-- Studio invites a specific talent into a brief shortlist
create table public.brief_invites (
  brief_id uuid not null references public.casting_briefs(id) on delete cascade,
  talent_id uuid not null references public.talent_profiles(id) on delete cascade,
  status text not null default 'pending',  -- 'pending' | 'accepted' | 'declined'
  note text,
  invited_at timestamptz default now(),
  responded_at timestamptz,
  primary key (brief_id, talent_id)
);

alter table public.casting_briefs enable row level security;
alter table public.brief_invites enable row level security;

create policy "briefs: owner all"
  on public.casting_briefs for all
  using (auth.uid() = studio_id)
  with check (auth.uid() = studio_id);

-- Talent can read a brief only if they've been invited to it
create policy "briefs: invited talent read"
  on public.casting_briefs for select
  using (exists (select 1 from public.brief_invites bi
                  where bi.brief_id = casting_briefs.id
                    and bi.talent_id = auth.uid()));

create policy "invites: studio owner"
  on public.brief_invites for all
  using (exists (select 1 from public.casting_briefs b
                  where b.id = brief_id and b.studio_id = auth.uid()))
  with check (exists (select 1 from public.casting_briefs b
                       where b.id = brief_id and b.studio_id = auth.uid()));

create policy "invites: talent read own"
  on public.brief_invites for select
  using (auth.uid() = talent_id);

create policy "invites: talent respond own"
  on public.brief_invites for update
  using (auth.uid() = talent_id);
```

### H2. Routes

- `/studio/briefs` — list briefs (draft / open / closed tabs).
- `/studio/briefs/new` — create brief form.
- `/studio/briefs/[id]` — brief detail: description + shortlist grid + action buttons.
- `/studio/briefs/[id]/edit` — edit while status = `draft`.
- `/talent/invites` — talent's inbox of brief invites (accept / decline).
- `/talent/invites/[id]` — brief details from talent's perspective.

### H3. Matching

Stage 1.5 matching = deterministic filter match. Given a brief:

```sql
select t.*, ti.storage_path
  from public.talent_profiles t
  left join public.talent_images ti
    on ti.talent_id = t.id and ti.is_primary
 where t.published = true
   and (b.categories = '{}' or t.categories && b.categories)
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
 order by t.verified desc, t.created_at desc
 limit 50;
```

Wrap this in a Postgres function `match_talent_for_brief(brief_id uuid)` so we can call it from server components without rebuilding the query each time.

**Do not build AI / embedding matching in Stage 1.5.** Deterministic filter match is good enough to prove the flow. Embedding-based "most similar to these three examples" is a Stage 2.5 or 3 feature when we have real usage data.

### H4. Shortlist action

On `/studio/briefs/[id]`, studio sees the matched grid. Each card has "Invite to brief" button (writes `brief_invites` row with `status = 'pending'`). Invited talent appears in a second section "Invited (N)". This is the bridge to Phase I (messaging) — accepting an invite creates a conversation.

---

## Phase I — Messaging + notifications

### I1. Schema

```sql
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studio_profiles(id) on delete cascade,
  talent_id uuid not null references public.talent_profiles(id) on delete cascade,
  brief_id uuid references public.casting_briefs(id) on delete set null,
  last_message_at timestamptz,
  created_at timestamptz default now(),
  unique (studio_id, talent_id, brief_id)  -- allow multi convo per brief context
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at desc);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "conversations: participant read"
  on public.conversations for select
  using (auth.uid() = studio_id or auth.uid() = talent_id);

create policy "conversations: studio create"
  on public.conversations for insert
  with check (
    auth.uid() = studio_id
    and exists (select 1 from public.profiles p
                 where p.id = auth.uid() and p.role = 'studio')
  );

create policy "messages: participant read"
  on public.messages for select
  using (exists (
    select 1 from public.conversations c
     where c.id = conversation_id
       and (c.studio_id = auth.uid() or c.talent_id = auth.uid())
  ));

create policy "messages: participant send"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
       where c.id = conversation_id
         and (c.studio_id = auth.uid() or c.talent_id = auth.uid())
    )
  );
```

### I2. UI

- `/studio/messages` and `/talent/messages` — conversation list (left column) + open thread (right).
- Thread view: simple Slack-style. Sender on right, other on left. Input at bottom. No attachments for v1 — text only. Markdown not rendered (escape everything).
- On "Save talent", "Invite to brief", or talent "Accept invite" → create/reuse conversation, land in it.
- Use Supabase Realtime on `messages` table for live updates in the open thread; fall back to polling if realtime is not enabled.

### I3. Notifications

Two channels: in-app and email.

```sql
create type notif_kind as enum ('save', 'message', 'brief_invite', 'verified', 'report_update');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind notif_kind not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index notifications_user_idx on public.notifications (user_id, read_at, created_at desc);

alter table public.notifications enable row level security;
create policy "notifications: self"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

- Bell icon in every nav (public/talent/studio) showing unread count.
- Dropdown lists last 10; "See all" → `/notifications`.
- Email: use **Resend** (cheap, fast, clean SDK). Triggered from server actions on message insert, save, brief invite, verification grant. Template fragments in `/lib/email/templates/`.

Add to env:

```env
RESEND_API_KEY=
EMAIL_FROM=Talento <hello@talento.ai>
```

---

## Phase J — Trust

### J1. Verification flow

- `talent_profiles.verified_at`, `talent_profiles.verification_submitted_at` columns.
- `/talent/settings/verification` — talent uploads ID photo + selfie (new `talent-verification` private bucket, admin-read only).
- Admin dashboard reviews, grants, denies. On grant: sets `verified = true`, inserts notification, sends email.
- Same flow mirrored for studios (`studio_profiles.verified`, `studio-verification` bucket).

Verified badge shown on:

- `TalentCard` (existing `verified` flag already rendered — keep).
- Talent profile page header.
- Studio brief / message sender name.

### J2. Reporting

```sql
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null,  -- 'profile' | 'message' | 'media'
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'open',  -- 'open' | 'resolved' | 'dismissed'
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz default now()
);

alter table public.reports enable row level security;
create policy "reports: reporter insert"
  on public.reports for insert
  with check (auth.uid() = reporter_id);
create policy "reports: reporter read own"
  on public.reports for select
  using (auth.uid() = reporter_id);
-- Admins read all via service role / is_admin bypass (see J3).
```

"Report" menu item on:

- Any talent profile (studio-view)
- Any message (both sides)
- Any media item (studio-view)

### J3. Admin

```sql
alter table public.profiles
  add column is_admin boolean default false;

-- Admin policies: every table gets a bypass.
-- Cleaner than service-role fetches for admin UI.
create policy "admin: read all reports"
  on public.reports for select
  using (exists (select 1 from public.profiles p
                  where p.id = auth.uid() and p.is_admin));
-- …etc for talent_profiles, studio_profiles, talent_media, reports
```

`/admin` — gated by middleware + `is_admin`. Tabs:

- Verification queue (pending talent + studio)
- Reports queue
- Users list (verify, ban, unban)
- Briefs (read-only overview)

Keep it boring and functional. No need for charts or analytics in Stage 1.5.

---

## Phase K — Discoverability

### K1. Expanded filters on `/studio/browse`

Add: `age_range`, `height_min` / `height_max`, `verified`, `has_video`, `has_voice`, consent scope (one or more of film/advertising/gaming/d2c), multi-select categories.

Persist in searchParams — stay URL-shareable.

### K2. Sort

- Newest (default for empty query)
- Most saved (derived: subquery count on `talent_saves`)
- Verified first
- Recently active (last media upload)

### K3. Featured row

- `talent_profiles.featured_until` timestamptz column, admin-settable.
- `/studio/browse` top strip: where `featured_until > now() and verified`, limit 12, shuffle server-side (stable per-hour).
- Homepage (public): same query, limit 6.

---

## Phase L — Polish + ship

- Mobile QA pass for every new surface (messaging especially; touch targets on thread input).
- Loading + error boundaries for every new route.
- Test RLS explicitly for the new tables: can studio A read studio B's briefs? Can talent read a message they're not part of? Automated tests are overkill for 1.5; checklist it.
- Rebuild, redeploy, smoke-test full flow: talent signup → upload video + voice → verify → studio signup → post brief → invite → message → save → report.

---

## Stage 1.5 Definition of Done

Media

- [ ] Talent can upload ≥1 video (≤100MB) and ≥1 voice clip (≤20MB).
- [ ] Primary image can be set from mobile (no hover dependency anywhere).
- [ ] Studio profile page shows video + voice with working players.

Account

- [ ] Edit-profile routes live for talent and studio.
- [ ] Forgot / reset password working end-to-end via email.
- [ ] Account deletion soft-flag wired; public-facing GDPR link from footer.
- [ ] `/terms`, `/privacy`, `/consent` pages live, linked from register + footer.
- [ ] Public talent profile at `/t/[username]` with OG image.

Briefs

- [ ] Studio can create, edit, open, close a brief.
- [ ] Matching query returns correct talent given brief filters.
- [ ] Studio can invite matched talent; talent sees invite in `/talent/invites`.

Messaging

- [ ] Studio → talent 1:1 thread working, with realtime or polled updates.
- [ ] Save / brief invite / accepted invite create a conversation.
- [ ] Notification bell in nav shows unread count; email sent on new message.

Trust

- [ ] Talent verification request + admin grant flow, badge visible after.
- [ ] Studio verification mirrors the above.
- [ ] Report button on profiles, messages, media; admin review queue clears reports.
- [ ] `/admin` gated on `is_admin`, shows verification + reports queues.

Discoverability

- [ ] Expanded filters (age, height, verified, has_video/voice, consent scope) working and URL-shareable.
- [ ] Sort options working.
- [ ] Admin can feature a talent; featured row appears on homepage + browse.

Quality

- [ ] Every new surface has `loading.tsx` and `error.tsx`.
- [ ] RLS manually tested for every new table with a second test account.
- [ ] Mobile walk-through of all new flows at 390px.
- [ ] `npm run build` green.
- [ ] Lighthouse ≥85 perf, ≥95 a11y on homepage and one public talent profile.

When all ticked, Stage 2 (auctions) becomes a feature on top of a working product, not a bolt-on to a catalogue.

---

## Explicitly still out of scope in Stage 1.5

Hold these for Stage 2 or Stage 3:

- Auctions of any kind.
- TIK / supplier code / license token generation (schema columns remain null).
- License tokens + Verification API.
- Payment processing (Stripe). Booking is handled off-platform via messaging for now.
- AI-based matching (embeddings, visual similarity). Filter-match is fine until we see the data.
- Mobile app. The web app is responsive; that's the whole mobile story for now.
- Multi-language. English only.

If a task asks for any of the above, stub with `// STAGE 2` or `// STAGE 3` and move on — same discipline as Stage 1.
