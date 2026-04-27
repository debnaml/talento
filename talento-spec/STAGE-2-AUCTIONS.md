# Stage 2 — Auctions (Simplified)

Only start after Stage 1 is live, deployed, and validated with at least a few real users.

The brief describes auctions with A-list talent, live bid feeds, countdown timers, real-time WebSocket updates. For Stage 2, **we strip that down to what actually delivers the brand moment without the real-time complexity.** The mechanic can evolve later if demand justifies it.

---

## Stage 2 scope

A studio (or Talento admin) creates an auction for a specific production opportunity. Registered talent can submit one bid (sealed-ish) within the auction window. When the window closes, the highest bidder wins and a notification appears in their dashboard. Admin manually confirms the winner. No real-time updates; bids refresh on page reload.

This covers ~80% of the brand value (the "Act With JCVD" homepage hero, the cultural magnetism) with ~20% of the Stage 3 complexity.

---

## What we are NOT building in Stage 2

- WebSocket live bid updates
- A-list talent revenue share calculations
- Runner-up packages
- Payment processing for winning bids (Stripe integration is Stage 2.5)
- Auction categories taxonomy beyond a simple enum
- Bid history visible to all bidders (only the current high bid is shown)

---

## Schema additions

Migration: `supabase/migrations/20260601000000_auctions.sql`

```sql
create type auction_status as enum ('draft', 'scheduled', 'live', 'closed', 'cancelled');

create table public.auctions (
  id uuid primary key default gen_random_uuid(),
  title text not null,                      -- "Act With JCVD — Fight Scene"
  slug text unique not null,                -- "act-with-jcvd"
  description text,
  hero_image_path text,                     -- storage path in `auctions-media`
  category text,                            -- "fight_scene", "romance", "action"
  host_talent_id uuid references public.talent_profiles(id) on delete set null,
  -- The production opportunity
  production_details text,                  -- free text; what the winner gets
  -- Pricing
  starting_bid_gbp int not null,            -- pence
  reserve_price_gbp int,                    -- optional minimum
  current_high_bid_gbp int,
  current_high_bidder_id uuid references public.profiles(id) on delete set null,
  -- Timing
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  status auction_status not null default 'draft',
  -- Winner
  winner_id uuid references public.profiles(id) on delete set null,
  winner_confirmed_at timestamptz,
  -- Admin
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index auctions_status_idx on public.auctions (status);
create index auctions_closes_at_idx on public.auctions (closes_at);

create table public.auction_bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.auctions(id) on delete cascade,
  bidder_id uuid not null references public.profiles(id) on delete cascade,
  amount_gbp int not null,                  -- pence
  created_at timestamptz default now(),
  -- One bid per user per auction (Stage 2 sealed-bid simplification).
  -- Remove this constraint if you later want an English-auction style where
  -- users can raise their own bid.
  unique (auction_id, bidder_id)
);

create index auction_bids_auction_id_idx on public.auction_bids (auction_id);

-- Updated_at triggers as per Stage 1 pattern
create trigger auctions_updated_at before update on public.auctions
  for each row execute function public.set_updated_at();

-- RLS ---------------------------------------------------------------
alter table public.auctions enable row level security;
alter table public.auction_bids enable row level security;

-- Any authenticated user can view scheduled, live, closed auctions.
create policy "auctions: public read"
  on public.auctions for select
  to authenticated
  using (status in ('scheduled', 'live', 'closed'));

-- Only admins (service role) create/modify auctions in Stage 2.
-- No policy for insert/update/delete = denied for normal users.

-- Bidders can insert their own bid on a LIVE auction.
create policy "auction_bids: place own bid"
  on public.auction_bids for insert
  to authenticated
  with check (
    auth.uid() = bidder_id
    and exists (
      select 1 from public.auctions a
      where a.id = auction_id
        and a.status = 'live'
        and now() between a.opens_at and a.closes_at
    )
  );

-- Bidders see only their own bids; admins see all via service role.
create policy "auction_bids: self read"
  on public.auction_bids for select
  using (auth.uid() = bidder_id);

-- Storage: auctions-media bucket
insert into storage.buckets (id, name, public)
values ('auctions-media', 'auctions-media', true);  -- public because hero images are promo

create policy "auctions_media: public read"
  on storage.objects for select
  using (bucket_id = 'auctions-media');

-- Admins-only writes (via service role).
```

---

## Bid-placement logic

Place a bid via a server action so we can enforce business rules in one place:

```ts
// app/auctions/[slug]/actions.ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function placeBid(auctionId: string, amountGbp: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to bid" };

  // Pence
  const amountPence = Math.round(amountGbp * 100);

  // Fetch the auction + current high bid server-side to avoid race conditions
  const { data: auction } = await supabaseAdmin
    .from("auctions")
    .select("*")
    .eq("id", auctionId)
    .single();

  if (!auction || auction.status !== "live")
    return { error: "Auction is not live" };
  if (new Date() < new Date(auction.opens_at) || new Date() > new Date(auction.closes_at))
    return { error: "Auction is closed to bids" };

  const minBid = (auction.current_high_bid_gbp ?? auction.starting_bid_gbp) + 100_00; // +£100
  if (amountPence < minBid)
    return { error: `Minimum bid is £${(minBid / 100).toFixed(0)}` };

  // Insert bid (unique constraint enforces one per user — upsert instead if you want raises)
  const { error: bidErr } = await supabaseAdmin
    .from("auction_bids")
    .upsert({
      auction_id: auctionId,
      bidder_id: user.id,
      amount_gbp: amountPence,
    }, { onConflict: "auction_id,bidder_id" });

  if (bidErr) return { error: bidErr.message };

  // Update the auction's current high bid if this one beats it
  if (amountPence > (auction.current_high_bid_gbp ?? 0)) {
    await supabaseAdmin.from("auctions").update({
      current_high_bid_gbp: amountPence,
      current_high_bidder_id: user.id,
    }).eq("id", auctionId);
  }

  revalidatePath(`/auctions/${auction.slug}`);
  return { ok: true };
}
```

Because we use `supabaseAdmin` here, the server action bypasses RLS — but only after we've verified the user is authenticated and the auction is live. The RLS policy on `auction_bids` stays as a belt-and-braces check.

---

## Pages

### `/auctions` — public listings

Server component:
```ts
const { data } = await supabase.from("auctions")
  .select("*, host_talent_id(stage_name)")
  .in("status", ["scheduled", "live"])
  .order("closes_at", { ascending: true });
```

Grid of auction cards (reuse the t-card shape but with the auction hero image, countdown, and current bid prominent).

### `/auctions/[slug]` — auction detail + bid UI

- Hero image
- Title, description, host talent linked
- Countdown component (client, ticks client-side — just shows "Closes in Xd Yh Zm", re-fetches on mount)
- Current high bid (£X)
- If the viewer is the current high bidder: "You're currently winning."
- Bid form: number input with a suggested minimum, Place Bid button
- After bid: success toast and the page refreshes with the new high

### `/studio/dashboard` additions

Talent view: "My bids" section — lists auctions where the user has placed a bid, with status (winning / outbid / won / lost).

### Admin

For Stage 2, admin is manual: use the Supabase dashboard or a simple `/admin` page gated by an `is_admin` column on `profiles` (add a migration for this). An admin can:
- Create an auction (form)
- Move an auction status from draft → scheduled → live
- Manually close an auction after `closes_at` — this copies `current_high_bidder_id` to `winner_id` and sets status to `closed`

---

## Countdown + "near-live" feel

We're not doing WebSockets, but we can fake live-ness cheaply:

- Client-side countdown ticks every second (pure display)
- The current high bid re-fetches every 30 seconds via a client `useEffect` interval
- On the bid detail page, a small "Live" pulse dot matches the LIVE indicator pattern from the design system

If later feedback says this feels too static, *then* introduce Supabase Realtime on the `auctions` and `auction_bids` tables. Don't pay that complexity cost up front.

---

## Stage 2 Definition of Done

- [ ] Migrations applied, RLS verified
- [ ] At least one seeded auction viewable at `/auctions` and `/auctions/[slug]`
- [ ] Talent can place bids, RLS prevents bidding after close
- [ ] High bid updates correctly across multiple bidders
- [ ] Countdown component ticks smoothly and handles timezone correctly
- [ ] Homepage "Featured auction" callout now links to a real auction
- [ ] Admin can manually close auction and a winner is recorded
- [ ] Winner sees "You won!" in their talent dashboard
