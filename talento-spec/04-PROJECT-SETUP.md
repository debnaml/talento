# 04 — Project Setup

Initial scaffold of the Next.js app with everything wired up. Aim: from `git init` to "dev server runs, design tokens loaded, Supabase client working" in about 90 minutes.

---

## 1. Scaffold

```bash
pnpm create next-app@latest talento \
  --typescript --tailwind --app --src-dir=false --import-alias "@/*" --eslint
cd talento
git init
```

Notes:
- `--src-dir=false` keeps `app/` at the project root, matching the folder structure in `01-ARCHITECTURE.md`.
- Skip turbo if prompted (Vercel handles it).

---

## 2. Install dependencies

```bash
# Supabase
pnpm add @supabase/supabase-js @supabase/ssr

# Forms + validation
pnpm add react-hook-form @hookform/resolvers zod

# Utils
pnpm add clsx tailwind-merge
pnpm add -D @types/node

# shadcn/ui primitives (init will prompt for style — choose "Default", baseColor "neutral")
pnpm dlx shadcn@latest init
# Then add only what we need, lazily:
pnpm dlx shadcn@latest add button input label textarea select dialog dropdown-menu
```

Do not preemptively add packages for Stage 2 or Stage 3 (no `stripe`, no `resend`, no `ably`).

---

## 3. Environment variables

Create `.env.local.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Copy to `.env.local` and fill in with your real values. Add `.env.local` to `.gitignore` (Next.js does this by default — double-check).

---

## 4. Tailwind + globals

Replace `tailwind.config.ts` with the config in `02-DESIGN-SYSTEM.md`.

Replace `app/globals.css` with:

```css
@import "tailwindcss";

@theme inline {
  --color-orange: #E8500A;
  --color-orange-hot: #FF6020;
  --color-orange-dim: #A33800;
  --color-dark: #0D0D10;
  --color-dark-2: #13131A;
  --color-dark-3: #1C1C26;
  --color-mid: #2A2A38;
  --color-grey: #6B6B85;
  --color-silver: #A0A0B8;
  --color-warm-white: #F4F2EE;
  --color-cream: #EDE9E1;
}

html { scroll-behavior: smooth; }

body {
  background: var(--color-dark);
  color: var(--color-warm-white);
  font-family: var(--font-barlow), sans-serif;
  font-weight: 300;
  overflow-x: hidden;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.35;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
}

/* Fonts are wired via next/font in layout.tsx — see below */
```

---

## 5. Root layout (fonts)

`app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Bebas_Neue, Barlow_Condensed, Barlow } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const barlowCondensed = Barlow_Condensed({
  weight: ["300", "400", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-barlow-c",
});

const barlow = Barlow({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: "Talento — AI Talent & Likeness Marketplace",
  description:
    "Your face. Your voice. Your likeness. Talento makes sure you get paid every time AI uses it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bebas.variable} ${barlowCondensed.variable} ${barlow.variable}`}
    >
      <body className="font-body bg-dark text-warm-white antialiased">
        {children}
      </body>
    </html>
  );
}
```

---

## 6. Supabase clients

### `lib/supabase/server.ts` — for server components & route handlers

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component ignored; middleware handles it.
          }
        },
      },
    }
  );
}
```

### `lib/supabase/client.ts` — for client components

```ts
"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### `lib/supabase/admin.ts` — service role, server-only

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Bypasses RLS. Use only for server actions that need elevated permissions
// (e.g. signed URL generation for the public registry).
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

---

## 7. Middleware (session + route protection)

`middleware.ts` at the repo root:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Touching getUser() refreshes the session if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isTalent = pathname.startsWith("/talent");
  const isStudio = pathname.startsWith("/studio");

  if ((isTalent || isStudio) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (isTalent || isStudio)) {
    // Enforce role match
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile) {
      if (isTalent && profile.role !== "talent") {
        return NextResponse.redirect(new URL("/studio/dashboard", request.url));
      }
      if (isStudio && profile.role !== "studio") {
        return NextResponse.redirect(new URL("/talent/dashboard", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets & API webhooks.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## 8. Utils

`lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 9. Sanity check

```bash
pnpm dev
```

- Visit `http://localhost:3000` → Next default page should render on a very dark background with the grain overlay.
- Open DevTools → Elements → verify `--font-bebas`, `--font-barlow-c`, `--font-barlow` are set on `<html>`.
- Load fonts tab → three font files downloading.

If all green, proceed to `STAGE-1-BUILD.md`.

---

## 10. Git + Vercel

```bash
git add -A
git commit -m "chore: initial scaffold"
git remote add origin git@github.com:<you>/talento.git
git push -u origin main
```

In Vercel:
1. Import the repo.
2. Add the 4 env vars from `.env.local.example`.
3. Framework auto-detects Next.js. First deploy should succeed on the default Next scaffold.

Now back to building.
