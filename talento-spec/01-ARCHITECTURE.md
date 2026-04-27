# 01 — Architecture

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15, App Router | Server components, Vercel-native, matches Lee's default |
| Language | TypeScript (strict) | Catches issues before runtime |
| Styling | Tailwind CSS v4 | Fast iteration, maps cleanly to the CSS tokens from the design |
| UI primitives | shadcn/ui (Radix) | Accessible base components, fully customisable — no opinionated look |
| Database | Supabase Postgres | Row-level security, generous free tier |
| Auth | Supabase Auth | Email/password + magic link, integrates with RLS |
| Storage | Supabase Storage | Signed URLs, RLS on buckets, same bill as the DB |
| Forms | React Hook Form + Zod | Standard, light, type-safe |
| Deployment | Vercel | Next.js-native, preview deployments per PR |
| Analytics | Vercel Analytics (free) | Add later if needed |

### Explicit non-choices

- **No Prisma.** We use the Supabase JS client directly. Prisma duplicates the schema and fights with RLS. For a small project with RLS-first security, Supabase's SDK is simpler.
- **No Clerk.** Supabase Auth is free, integrates with RLS out of the box, and removes a vendor. The user_id from Supabase Auth is the same one used in RLS policies — no bridging layer needed.
- **No Cloudflare R2.** Supabase Storage handles uploads, transforms, and signed URLs. One less vendor.
- **No websockets yet.** Stage 1 has no real-time requirement. Stage 2 auctions will use Supabase Realtime when we get there.
- **No Stripe.** Stage 1 is pre-monetisation. Stage 2+ will add payments.

---

## Folder structure

```
talento/
├── app/
│   ├── (public)/                    # Public routes, shared layout
│   │   ├── page.tsx                 # Homepage (from talento.html)
│   │   ├── become-talent/
│   │   │   └── page.tsx             # From talento-become-talent.html
│   │   ├── for-studios/
│   │   │   └── page.tsx             # From talento-studios.html
│   │   └── layout.tsx               # Public nav, footer
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx        # Role picker: talent | studio
│   │   ├── callback/route.ts        # Supabase auth callback
│   │   └── layout.tsx
│   ├── talent/
│   │   ├── onboarding/page.tsx      # Multi-step profile creation
│   │   ├── dashboard/page.tsx       # Profile, images, "active listings"
│   │   ├── upload/page.tsx          # Image upload UI
│   │   └── layout.tsx               # Talent-only guard + nav
│   ├── studio/
│   │   ├── onboarding/page.tsx
│   │   ├── dashboard/page.tsx       # Saved talents
│   │   ├── browse/page.tsx          # Talent registry with filters (from talento-casting.html)
│   │   ├── talent/[id]/page.tsx     # Public talent profile from studio view
│   │   └── layout.tsx               # Studio-only guard + nav
│   ├── api/
│   │   └── [...]/route.ts           # Route handlers for things that can't be server actions
│   ├── layout.tsx                   # Root layout, fonts, analytics
│   └── globals.css                  # Tailwind + design tokens
├── components/
│   ├── ui/                          # shadcn primitives (button, input, dialog, etc.)
│   ├── nav/
│   │   ├── PublicNav.tsx
│   │   ├── TalentNav.tsx
│   │   └── StudioNav.tsx
│   ├── forms/
│   │   ├── TalentProfileForm.tsx
│   │   ├── StudioProfileForm.tsx
│   │   └── ImageUploader.tsx
│   ├── talent/
│   │   ├── TalentCard.tsx           # The "t-card" from talento-casting.html
│   │   ├── TalentGrid.tsx
│   │   └── TalentFilters.tsx
│   ├── marketing/
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── StatStrip.tsx
│   │   └── Footer.tsx
│   └── common/
│       ├── NoiseOverlay.tsx
│       └── SectionLabel.tsx
├── lib/
│   ├── supabase/
│   │   ├── server.ts                # Server component + route handler client
│   │   ├── client.ts                # Browser client
│   │   ├── middleware.ts            # Session refresh helper
│   │   └── admin.ts                 # Service-role client (server-only, rare)
│   ├── validations/
│   │   ├── talent.ts                # Zod schemas
│   │   └── studio.ts
│   ├── db/
│   │   ├── talent.ts                # Typed query helpers
│   │   ├── studio.ts
│   │   └── images.ts
│   └── utils.ts                     # cn(), formatters, etc.
├── types/
│   └── database.ts                  # Generated from Supabase
├── supabase/
│   ├── migrations/
│   │   ├── 20260101000000_init.sql  # Tables + RLS
│   │   └── 20260101000100_storage.sql # Storage bucket policies
│   └── seed.sql                     # Dev seed data
├── public/
│   ├── favicon.ico
│   └── og-image.jpg
├── middleware.ts                    # Route protection + session refresh
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.local.example
└── README.md
```

---

## Route map and access

| Route | Public | Talent | Studio |
|---|:---:|:---:|:---:|
| `/` | ✅ | ✅ | ✅ |
| `/become-talent` | ✅ | ✅ | ✅ |
| `/for-studios` | ✅ | ✅ | ✅ |
| `/login`, `/register` | ✅ | redirect | redirect |
| `/talent/*` | ❌ | ✅ | ❌ |
| `/studio/*` | ❌ | ❌ | ✅ |

Middleware (`middleware.ts`) handles:
1. Refreshing the Supabase session on each request
2. Redirecting unauthenticated users away from `/talent/*` and `/studio/*`
3. Redirecting role-mismatched users (a talent hitting `/studio/*` goes to `/talent/dashboard`)

---

## Data model summary (full SQL in `03-SUPABASE-SETUP.md`)

- `profiles` — one row per authenticated user, stores `role` (talent | studio) and shared fields
- `talent_profiles` — 1:1 extension with talent-specific fields (stage name, bio, categories, locations, age_range, permissions)
- `studio_profiles` — 1:1 extension with studio-specific fields (company name, type, website)
- `talent_images` — N:1 to talent_profiles, stores storage path + variant metadata
- `talent_saves` — studio-side bookmarks (studio_id, talent_id, created_at)
- `audit_logs` — append-only log table, schema-ready for Stage 3 but unused in Stage 1

---

## Environment variables

```env
# Supabase (from the project settings page)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=            # server-only, never NEXT_PUBLIC_

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# (Stage 2+) Resend for transactional email, Stripe, etc.
```

---

## Read next

`02-DESIGN-SYSTEM.md`
