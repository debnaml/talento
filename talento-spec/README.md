# Talento — Build Spec

**Project:** The AI Talent & Likeness Marketplace
**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind · Supabase · Vercel
**Build mode:** VS Code + Claude Code agents

---

## How to use this spec

These docs are written to be read in order by a Claude Code agent (or a human). Each file has one job. Start at the top, build each stage end-to-end, then move on.

| #   | File                   | Purpose                                                                            |
| --- | ---------------------- | ---------------------------------------------------------------------------------- |
| —   | `CLAUDE.md`            | Project-level instructions for Claude Code. Read first. Keep in repo root.         |
| 01  | `01-ARCHITECTURE.md`   | Stack choices, folder structure, scope rationale                                   |
| 02  | `02-DESIGN-SYSTEM.md`  | Colours, typography, key UI patterns lifted from the HTML designs                  |
| 03  | `03-SUPABASE-SETUP.md` | Schema SQL, RLS policies, storage buckets                                          |
| 04  | `04-PROJECT-SETUP.md`  | Scaffold the Next.js app, env vars, base config                                    |
| —   | `STAGE-1-BUILD.md`     | **The main build.** Landing, talent signup/upload, studio browse.                  |
| —   | `STAGE-1.5-CONNECT.md` | Media (video/voice), edit profiles, briefs, messaging, trust — close the flywheel. |
| —   | `STAGE-2-AUCTIONS.md`  | Simplified auction system (sealed-bid, no websockets)                              |
| —   | `STAGE-3-ADVANCED.md`  | TIK cryptography, licensing tokens, API, audit ledger — deferred                   |

### `/designs`

The four HTML files from the design phase are copied into `/designs/`. They are the source of truth for the visual look. When building a page, open the corresponding HTML and lift the structure, classes, and styles directly into your React components. The design system doc tells you how to translate those into Tailwind.

- `talento.html` — homepage
- `talento-become-talent.html` — talent signup landing
- `talento-studios.html` — studio/enterprise landing
- `talento-casting.html` — talent registry grid + casting brief
- `talento-2.html` — alternate homepage variant

---

## Scope at a glance

**Stage 1** — the thing you're building now.

- Cinematic homepage
- Talent: sign up → onboard → upload photos → appear in registry
- Studios: sign up → browse/filter talent registry → view profiles → save favourites
- Role-based dashboards (thin)

**Stage 2** — add when Stage 1 is live and stable.

- Auction listings with countdown
- Sealed-bid (or soft-live) bidding
- Winner selection

**Stage 3** — maybe never, or only when commercially justified.

- Talento Identity Key (TIK) crypto generation
- Supplier codes
- Single-use license tokens + verification API
- Immutable audit ledger
- Affiliate/referral revenue split

The brief (`Talento Brief V2.docx`) describes Stages 1–3 as one grand vision. This spec intentionally separates them so you can ship something real fast, then add complexity only if the market pulls it.

---

## Opinionated decisions (different from the old Stage 1 checklist)

1. **Supabase does everything.** Auth + Postgres + Storage, single vendor, single bill, single SDK. No Clerk, no R2, no Prisma. The old checklist suggested Clerk + Prisma + R2 — we're collapsing that.
2. **Supabase JS client, not Prisma.** Less boilerplate, works natively with RLS, fewer moving parts. Migrations handled via plain SQL files in `/supabase/migrations`.
3. **shadcn/ui for primitives only.** Button, Dialog, Dropdown, Form — customised to match the dark/orange cinematic look. Everything else is hand-built.
4. **No Storybook.** Overkill for Stage 1.
5. **No immediate Sentry/analytics.** Add Vercel Analytics free tier only.

---

## Ready to start

Go to `CLAUDE.md`, then `01-ARCHITECTURE.md`, then work through in order.
