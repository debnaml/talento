# CLAUDE.md

Project-level instructions for Claude Code. Keep this file at the repo root.

## Project

Talento — a consent-based AI talent & likeness marketplace. People upload their face/likeness, studios browse and license. Built on Next.js + Supabase + Vercel.

## Current scope

You are working on **Stage 1** unless told otherwise. Stage 1 covers the public site, talent signup + image upload, studio signup + browse. Auctions (Stage 2) and the TIK/crypto/licensing system (Stage 3) are deferred — do not build them speculatively. If a task mentions them, stub them with a clear `// STAGE 2` or `// STAGE 3` comment and move on.

## Conventions

- **Framework:** Next.js 15 App Router. Server components by default. `"use client"` only where needed (forms, interactive UI, Supabase browser client).
- **Language:** TypeScript strict mode. No `any` unless explicitly justified in a comment.
- **Styling:** Tailwind CSS. Use the design tokens defined in `02-DESIGN-SYSTEM.md` — never invent colours. If a hex is not in the palette, stop and ask.
- **Data:** Supabase JS client. Use the server client (`@supabase/ssr`) in server components and route handlers. Use the browser client only in client components.
- **Forms:** React Hook Form + Zod. Always validate on both client and server.
- **Components:** Co-locate server-only components in the route folder. Shared UI goes in `/components/ui` (shadcn primitives) or `/components/` (custom).
- **Imports:** Absolute imports via `@/` prefix. No relative parent imports (`../`).

## Design fidelity

The HTML files in `/designs` are the brief. Match them visually. When in doubt, open the HTML, inspect the computed styles, translate to Tailwind. Do not substitute "nicer" or "more modern" alternatives — the cinematic burnt-orange aesthetic is the brand.

Fonts in use:
- `Bebas Neue` — display headlines
- `Barlow Condensed` — UI labels, buttons, nav
- `Barlow` — body copy

Load via `next/font/google` in `app/layout.tsx`.

## What to avoid

- Don't add dependencies without a reason. Ask first.
- Don't build Stage 2 or Stage 3 features while on Stage 1.
- Don't use generic SaaS patterns (purple gradients, rounded-3xl cards, blue CTAs). This is a dark, cinematic, orange-accented product. Sharp corners or 2px rounding max.
- Don't use emoji in UI copy unless it's in the original HTML (the HTMLs use some → and ↓ arrows — those are fine).
- Don't skip RLS on any table. If a table is user-owned, it has row-level security. No exceptions.
- Don't put secrets in client components. Service role key is server-only, always.

## Commit style

Short imperative summary, one task per commit. Examples:
```
feat(talent): onboarding form + profile insert
feat(studio): registry search with postgres FTS
fix(nav): active link colour on mobile
chore(db): add storage bucket policies
```

## When a task is ambiguous

Stop and ask. Don't guess UX decisions that affect the brand. Don't silently skip RLS or validation. Don't invent design tokens.

## Useful commands

```bash
# Dev
pnpm dev                    # Next.js dev server
npx supabase start          # local Supabase (optional, can use hosted instead)
npx supabase db push        # push migrations to linked hosted project

# Typecheck / lint
pnpm typecheck
pnpm lint

# Build
pnpm build                  # verify before pushing to Vercel
```

## Stage gate

Do not start Stage 2 until all boxes in `STAGE-1-BUILD.md` are ticked and the site is deployed to Vercel at a live URL. Confirm with the user before moving stages.
