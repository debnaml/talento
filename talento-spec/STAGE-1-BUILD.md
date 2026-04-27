# Stage 1 — Main Build

**Goal:** ship a working marketplace MVP to Vercel. Talent can sign up, fill a profile, upload photos, and appear in a searchable registry. Studios can sign up, browse the registry, filter it, view a talent profile, and save favourites. No auctions, no crypto, no licensing — just the core two-sided marketplace.

**Budget:** ~10 working days solo. Go in order; each phase depends on the previous.

---

## Phase A — Public marketing site

Build the three public-facing pages from the HTML designs. These are server components with zero data dependencies — pure translation from HTML to React/Tailwind.

### A1. Public layout + nav

- [ ] `app/(public)/layout.tsx` — wraps homepage, become-talent, for-studios
- [ ] `components/nav/PublicNav.tsx` — matches the nav in `talento.html`:
  - Logo: `Talent<span>o</span>` with the "o" in orange
  - Links: Become Talent · For Studios · Auctions (stub route) · About (stub)
  - Login button (right side, orange)
- [ ] `components/marketing/Footer.tsx` — copy from the HTML footer

**File stubs:**

```tsx
// app/(public)/layout.tsx
import { PublicNav } from "@/components/nav/PublicNav";
import { Footer } from "@/components/marketing/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

### A2. Homepage (`app/(public)/page.tsx`)

Source: `designs/talento.html`.

Sections, in order:
1. **Hero** — cinematic background, "YOUR FACE. YOUR VOICE. YOUR LIKENESS. YOURS." headline (from the brief's tagline). Two CTAs: "Become Talent" (primary orange) and "For Studios" (ghost).
2. **Trust strip** — a single line of 4 stats: `100% Consent-Based · Instant Payment · Fully Auditable · Global`.
3. **How It Works** — 3-step grid, same as HTML. Upload / Approve / Earn (or Studio-facing alt: Browse / License / Generate).
4. **Featured auction callout** — Stage 2 stub. Render as a static card that says "Auctions coming soon" for Stage 1.
5. **Verticals strip** — 6 or 7 small cards: Film & TV / Advertising / Gaming / D2C / Sports / Stock AI.
6. **CTA banner** — big orange block repeating "Become Talent" or "For Studios" CTAs.
7. **Footer**.

Keep it a server component — no state, no client code. Lift styles directly from `talento.html`. For the hero's atmospheric flame effect, copy the `hero-flames` / `hero-figure` CSS into `globals.css` scoped under a `.hero-fx` class and apply on the hero wrapper.

**Acceptance:**
- Matches the HTML visually at `md` (1024px) and above
- Mobile fallback: hero headline scales, content reflows, no horizontal scroll
- Lighthouse perf > 90 on mobile

### A3. Become Talent page (`app/(public)/become-talent/page.tsx`)

Source: `designs/talento-become-talent.html`.

Sections:
1. Hero with the "BECOME THE TALENT" treatment
2. How it works (3 steps, talent-flavoured)
3. Earnings examples grid (`.earn-card`)
4. Genres grid (`.genre-card`)
5. Consent / permissions explainer
6. Big sign-up CTA pointing to `/register?role=talent`

No form on this page — the form lives at `/register` and `/talent/onboarding`. This page is marketing.

### A4. For Studios page (`app/(public)/for-studios/page.tsx`)

Source: `designs/talento-studios.html`.

Sections:
1. Hero ("CAST AT THE SPEED OF AI")
2. Compliance/verification value prop (stub — don't fully build the audit dashboard preview; use a simple static mockup)
3. Pricing placeholder — mark "pricing coming soon" or hide entirely for Stage 1
4. Casting brief teaser → CTA to `/register?role=studio`

---

## Phase B — Auth + role flows

Supabase Auth with email + password. Email magic link is a Stage 1.5 nice-to-have; skip it if time is tight.

### B1. Register page (`app/(auth)/register/page.tsx`)

Two-step UI:

**Step 1 — choose role:**
A big split layout — two tiles side by side:
- Left: "I'm Talent" — orange hover, icon, "Upload your likeness and earn"
- Right: "I'm a Studio" — orange hover, icon, "Find and license talent"

Clicking a tile sets `?role=talent|studio` in the URL and reveals step 2.

**Step 2 — credentials form:**
- Email
- Password
- Confirm password
- Full name (for profile)
- Terms checkbox

On submit, call `supabase.auth.signUp` with `options.data: { role, full_name }`. The `handle_new_user` trigger in Postgres creates the `profiles` row.

After signup, redirect to the role-specific onboarding:
- Talent → `/talent/onboarding`
- Studio → `/studio/onboarding`

```tsx
// app/(auth)/register/page.tsx (structure)
"use client";
// ...form setup, zod schema, RHF
async function onSubmit(values) {
  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: { role, full_name: values.fullName },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) { /* toast */ return; }
  router.push(role === "talent" ? "/talent/onboarding" : "/studio/onboarding");
}
```

### B2. Login page (`app/(auth)/login/page.tsx`)

Standard email + password. On success, read the user's role and redirect:
- Talent → `/talent/dashboard` (or `/talent/onboarding` if `profiles.onboarded = false`)
- Studio → `/studio/dashboard` (or onboarding)

### B3. Logout

Server action at `app/(auth)/logout/route.ts`:

```ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 302 });
}
```

Wire into the signed-in nav's dropdown menu.

### B4. Auth callback (for email confirmation, if enabled)

`app/(auth)/callback/route.ts` — exchanges the code for a session, redirects based on role.

---

## Phase C — Talent onboarding + profile

### C1. Talent onboarding (`app/talent/onboarding/page.tsx`)

Single-page form (no multi-step for Stage 1 — keep it flat to reduce friction). Fields, in order:

1. **Stage name** (required) — what they go by publicly
2. **Bio** (textarea, 500 char max)
3. **Location** (text, "London, UK")
4. **Country** (select, ISO codes — top 20 markets)
5. **Age range** (select: 18-24, 25-34, 35-44, 45-54, 55-64, 65+)
6. **Gender** (select: male / female / non-binary / other / prefer not to say)
7. **Height (cm)** (number, optional)
8. **Categories** (multi-select chips — the enum values from `talent_category`)
9. **Consent toggles** — five switches:
   - Film & TV
   - Advertising
   - Gaming
   - D2C (products, ecommerce)
   - Political content (default OFF)
   - Adult content (default OFF)
10. **Agreement checkbox** — "I confirm I am the person whose likeness will be licensed and I consent to the use cases I have enabled above."

On submit:
- Upsert into `talent_profiles` with `auth.uid()` as id
- Update `profiles.onboarded = true`
- Redirect to `/talent/upload`

```tsx
// Structure of the submit handler (inside a client component)
const supabase = createClient();
const { error } = await supabase.from("talent_profiles").upsert({
  id: user.id,
  stage_name: values.stageName,
  bio: values.bio,
  // ...
  allows_film: values.consent.film,
  // ...
});
if (!error) {
  await supabase.from("profiles").update({ onboarded: true }).eq("id", user.id);
  router.push("/talent/upload");
}
```

Form uses the "Form panel" pattern from `02-DESIGN-SYSTEM.md`. All inputs are dark-2 background with orange focus border.

### C2. Image upload (`app/talent/upload/page.tsx`)

The core upload flow. Keep it simple — multi-file drag/drop, upload one at a time, show thumbnails with delete.

**Flow:**

1. User drops or picks N image files.
2. Client-side validation: JPG/PNG/WebP, ≤10MB each.
3. For each file:
   - Call `supabase.storage.from("talent-images").upload(path, file)` where path = `{user.id}/{uuid}.{ext}`
   - On success, insert into `talent_images` with the storage path + mime + size
4. Show uploaded images in a grid. First upload is auto-set to `is_primary = true`.
5. Buttons:
   - "Set as primary" on each card (updates DB, unsets others via the unique index)
   - "Delete" on each card (removes from storage + DB)
   - "Publish to registry" at bottom — sets `talent_profiles.published = true` if there's ≥1 image

**Client component** (`components/forms/ImageUploader.tsx`):

```tsx
"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ImageUploader({ talentId }: { talentId: string }) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList) {
    setUploading(true);
    for (const file of Array.from(files)) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) continue;
      if (file.size > 10 * 1024 * 1024) continue;

      const ext = file.name.split(".").pop();
      const imageId = crypto.randomUUID();
      const path = `${talentId}/${imageId}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("talent-images")
        .upload(path, file, { contentType: file.type });
      if (upErr) continue;

      await supabase.from("talent_images").insert({
        id: imageId,
        talent_id: talentId,
        storage_path: path,
        mime_type: file.type,
        file_size_bytes: file.size,
      });
    }
    setUploading(false);
    // refresh the grid
  }

  return (
    <div className="upload-zone" onDrop={/* ... */} onClick={/* ... */}>
      {/* Design from 02-DESIGN-SYSTEM.md §6 */}
    </div>
  );
}
```

**Display the uploaded images** — for the talent's own view, generate a signed URL per image from the server component parent:

```ts
// server component
const { data: images } = await supabase
  .from("talent_images")
  .select("*")
  .eq("talent_id", user.id)
  .order("sort_order");

const withUrls = await Promise.all(
  images.map(async (img) => {
    const { data } = await supabase.storage
      .from("talent-images")
      .createSignedUrl(img.storage_path, 3600);
    return { ...img, signedUrl: data?.signedUrl };
  })
);
```

**Publish action:**

Server action in `app/talent/upload/actions.ts`:

```ts
"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function publishProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Check the talent has at least one image
  const { count } = await supabase
    .from("talent_images")
    .select("*", { count: "exact", head: true })
    .eq("talent_id", user.id);

  if ((count ?? 0) < 1) {
    return { error: "Upload at least one image before publishing." };
  }

  const { error } = await supabase
    .from("talent_profiles")
    .update({ published: true })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/talent/dashboard");
  return { ok: true };
}
```

### C3. Talent dashboard (`app/talent/dashboard/page.tsx`)

Minimal. Four tiles and a photo strip:
- Profile snippet (name, location, category chips) + "Edit profile" link
- Publish status (green tick "Published" or grey "Draft — publish to appear in registry")
- Image strip (horizontal scroll of uploaded images with "Manage" link)
- Stats placeholder (just shows "Views: —", "Saves: —" until Stage 2)

Don't over-build. Focus on the two actions that matter: edit profile + manage photos.

### C4. Talent nav / layout

`app/talent/layout.tsx`:
- Uses a different nav (`TalentNav`) with the talent's name + dropdown (Logout, Settings)
- Server component that fetches the current user + profile
- If `!profile.onboarded` and the current path is not `/talent/onboarding`, redirect to onboarding

---

## Phase D — Studio registry + browse

### D1. Studio onboarding (`app/studio/onboarding/page.tsx`)

Short form:
- Company name (required)
- Studio type (select from `studio_type` enum)
- Website
- Description (textarea)
- Country
- (Logo upload is Stage 1.5 — skip if time-pressured)

Upsert into `studio_profiles` + set `profiles.onboarded = true`, redirect to `/studio/browse`.

### D2. Registry browse (`app/studio/browse/page.tsx`)

**The core studio UX.** Source: `designs/talento-casting.html`.

Server-rendered with searchParams for filtering:

```tsx
// app/studio/browse/page.tsx
import { createClient } from "@/lib/supabase/server";
import { TalentGrid } from "@/components/talent/TalentGrid";
import { TalentFilters } from "@/components/talent/TalentFilters";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; gender?: string; country?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("talent_profiles")
    .select("*, talent_images(storage_path, is_primary)")
    .eq("published", true);

  if (params.q) query = query.ilike("stage_name", `%${params.q}%`);
  if (params.category) query = query.contains("categories", [params.category]);
  if (params.gender) query = query.eq("gender", params.gender);
  if (params.country) query = query.eq("country", params.country);

  const { data: talents } = await query.limit(48);

  // Generate signed URLs for primary images
  const enriched = await Promise.all(
    (talents ?? []).map(async (t) => {
      const primary = t.talent_images.find((i) => i.is_primary) ?? t.talent_images[0];
      if (!primary) return { ...t, imageUrl: null };
      const { data } = await supabase.storage
        .from("talent-images")
        .createSignedUrl(primary.storage_path, 3600);
      return { ...t, imageUrl: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="px-12 py-24">
      <TalentFilters />
      <TalentGrid talents={enriched} />
    </div>
  );
}
```

**Filters** (`components/talent/TalentFilters.tsx`, client component):
- Text search input (debounced, updates `?q=`)
- Category chips (film, tv, advertising, gaming, d2c, sports) — toggle sets `?category=`
- Gender select
- Country select

All filter state lives in URL searchParams. On change, use `router.push()` with the new query.

**Grid** (`components/talent/TalentGrid.tsx`):
- Responsive grid: 2 col mobile, 3 col tablet, 4 col desktop, 6 col on wide
- Each item is a `TalentCard` from the pattern in `02-DESIGN-SYSTEM.md §7`

**Talent card links** to `/studio/talent/[id]`.

### D3. Talent profile view for studios (`app/studio/talent/[id]/page.tsx`)

Read-only view:
- Big hero with primary photo and stage name
- Bio, location, category chips
- Photo gallery (all uploaded images)
- Consent summary (which use cases they allow)
- Actions: "Save" button (writes to `talent_saves`), "Message" button (Stage 2 — disabled for now with "Coming in Stage 2" tooltip)

Check ownership/published state on the server:

```ts
const { data: talent } = await supabase
  .from("talent_profiles")
  .select("*, profiles!inner(full_name, avatar_url), talent_images(*)")
  .eq("id", params.id)
  .eq("published", true)
  .single();

if (!talent) notFound();
```

### D4. Saved talents (`app/studio/dashboard/page.tsx`)

List of saved talents (from `talent_saves` join to `talent_profiles`). Same `TalentCard` component, but with an "Unsave" action. Empty state: "No saved talent yet. [Browse →]".

### D5. Studio nav / layout

`app/studio/layout.tsx`:
- `StudioNav` with company name + dropdown
- Redirect to onboarding if not onboarded
- Two main nav items: Browse · Saved

---

## Phase E — Polish + ship

### E1. Empty states
- Talent dashboard with no images: "Upload your first photo →"
- Studio dashboard with no saves: "Browse talent →"
- Registry with no results matching filters: "No matches. [Clear filters]"

### E2. Loading states
Use `loading.tsx` in each route folder. A simple skeleton grid for the registry, a pulse for profile loads.

### E3. Error boundaries
`error.tsx` in each route folder. Match the design: dark bg, orange accent "Something broke. [Try again]".

### E4. Mobile QA
Walk every page on a real phone or `viewport: 390px` in DevTools:
- Nav collapses to a hamburger (build `MobileNav` in `components/nav/`)
- Forms stack single-column
- Talent cards 2-per-row
- Touch targets ≥44px

### E5. SEO basics
- Each public page has a unique `<title>` and meta description via the `metadata` export
- Open Graph image: `public/og-image.jpg` (cinematic hero still)
- `app/robots.ts` + `app/sitemap.ts` for public routes only

### E6. Deploy
```bash
pnpm build        # must succeed locally first
git push
# Vercel deploys automatically
```

Test the live URL end-to-end:
1. Sign up as talent → onboard → upload → publish
2. Sign up as studio → onboard → browse → find the talent from step 1 → save

---

## Stage 1 Definition of Done

- [ ] Homepage, Become Talent, For Studios pages live and match the HTML designs at desktop + mobile
- [ ] Email signup works for both roles
- [ ] Talent can complete onboarding, upload ≥1 image, publish
- [ ] Published talent appears in the studio registry
- [ ] Studio filters (search, category, gender, country) work and are URL-shareable
- [ ] Studio can view a talent profile page with gallery
- [ ] Studio can save / unsave talent
- [ ] All routes respect role-based access (middleware works)
- [ ] RLS blocks cross-user access (tested by logging in as talent A and trying to edit talent B — should fail)
- [ ] Deployed to Vercel at a real URL
- [ ] No console errors on any page
- [ ] Lighthouse ≥85 perf, ≥95 accessibility on homepage

Confirm all ticked before starting Stage 2.

---

## What explicitly does NOT exist yet

Make sure none of these are accidentally built in Stage 1:
- Auction anything
- TIK/supplier code generation (the DB column exists but stays null)
- License token API
- Affiliate codes
- Real-time anything (websockets, Supabase Realtime)
- Payment processing
- Email notifications (beyond Supabase's own signup confirmation)
- Audit log reads or writes from the app (schema exists, left empty)
- Public talent profile URLs (`/talent/[id]` — the only view is studio-side)

If the user asks for any of these, point them to `STAGE-2-AUCTIONS.md` or `STAGE-3-ADVANCED.md`.
