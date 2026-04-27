# 02 — Design System

The visual reference is the five HTML files in `/designs/`. This doc extracts their tokens and patterns into reusable Tailwind config. Every colour, font, spacing rule in the build should come from here — don't invent new ones.

---

## Colour tokens

Lifted directly from the CSS `:root` block in `talento.html`.

| Token | Hex | Role |
|---|---|---|
| `orange` | `#E8500A` | Primary CTA, brand accent |
| `orange-hot` | `#FF6020` | Hover state for primary |
| `orange-dim` | `#A33800` | Disabled / muted orange |
| `dark` | `#0D0D10` | Page background |
| `dark-2` | `#13131A` | Section background |
| `dark-3` | `#1C1C26` | Card / panel background |
| `mid` | `#2A2A38` | Border on dark surfaces |
| `grey` | `#6B6B85` | Secondary text, placeholders |
| `silver` | `#A0A0B8` | Nav links, tertiary text |
| `white` | `#F4F2EE` | Primary text on dark (warm white, not pure) |
| `cream` | `#EDE9E1` | Alt warm white |

### Tailwind config (`tailwind.config.ts`)

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: "#E8500A",
          hot: "#FF6020",
          dim: "#A33800",
        },
        dark: {
          DEFAULT: "#0D0D10",
          2: "#13131A",
          3: "#1C1C26",
        },
        mid: "#2A2A38",
        grey: "#6B6B85",
        silver: "#A0A0B8",
        cream: "#EDE9E1",
        // white: use #F4F2EE via `text-[#F4F2EE]` or set as custom "warm-white"
        "warm-white": "#F4F2EE",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],     // Bebas Neue
        condensed: ["var(--font-barlow-c)", "sans-serif"], // Barlow Condensed
        body: ["var(--font-barlow)", "sans-serif"],        // Barlow
      },
      letterSpacing: {
        "ui-sm": "0.125em",   // 2px on 16px — uppercase nav/labels
        "ui-md": "0.2em",     // 3.2px — bigger uppercase
        "ui-lg": "0.3em",     // 4.8px — section eyebrows
      },
    },
  },
  plugins: [],
};

export default config;
```

### `globals.css`

```css
@import "tailwindcss";

:root {
  --orange: #E8500A;
  --orange-hot: #FF6020;
  --dark: #0D0D10;
  --dark-2: #13131A;
  --dark-3: #1C1C26;
}

html { scroll-behavior: smooth; }

body {
  background: var(--dark);
  color: #F4F2EE;
  font-family: var(--font-barlow), sans-serif;
  font-weight: 300;
  overflow-x: hidden;
}

/* Film grain overlay — use <NoiseOverlay /> component, or paste here */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.35;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
}
```

---

## Typography

Three Google Fonts. Load via `next/font/google` in `app/layout.tsx`:

```tsx
import { Bebas_Neue, Barlow_Condensed, Barlow } from "next/font/google";

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

// on <html>:
<html className={`${bebas.variable} ${barlowCondensed.variable} ${barlow.variable}`}>
```

### Usage patterns

| Element | Font | Size | Weight | Case | Tailwind |
|---|---|---|---|---|---|
| Display headline | Bebas Neue | `clamp(72px, 9vw, 120px)` | 400 | as-is | `font-display text-[clamp(72px,9vw,120px)] leading-[0.92] tracking-[0.02em]` |
| Section eyebrow | Barlow Condensed | 11px | 700 | UPPER | `font-condensed text-[11px] font-bold uppercase tracking-ui-lg text-orange` |
| Nav link | Barlow Condensed | 13px | 600 | UPPER | `font-condensed text-[13px] font-semibold uppercase tracking-[2.5px] text-silver` |
| Button label | Barlow Condensed | 14px | 700 | UPPER | `font-condensed text-[14px] font-bold uppercase tracking-[2.5px]` |
| Body copy | Barlow | 16px | 300 | sentence | `font-body text-base font-light text-silver` |
| Form label | Barlow Condensed | 10px | 700 | UPPER | `font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver` |

**Never** use Inter, Roboto, system-ui. Always one of the three above.

---

## Core UI patterns

Every pattern below is copied from the HTML designs. When building, match these as closely as possible before adding anything new.

### 1. Primary button

```tsx
<button className="
  font-condensed text-[14px] font-bold uppercase tracking-[2.5px] text-white
  bg-orange px-9 py-4
  hover:bg-orange-hot transition-colors
  border-none cursor-pointer
">
  Join The Auction
</button>
```

Sharp corners. No rounding. No gradient. No shadow. The orange is the whole design.

### 2. Ghost button

```tsx
<button className="
  font-condensed text-[14px] font-bold uppercase tracking-[2.5px] text-warm-white
  bg-transparent border border-white/20 px-9 py-4
  hover:border-orange hover:text-orange transition-colors
">
  Learn More
</button>
```

### 3. Nav bar

```tsx
<nav className="
  fixed top-0 left-0 right-0 z-50
  flex items-center justify-between
  px-12 h-[72px]
  bg-gradient-to-b from-dark/95 to-transparent
">
  <Link href="/" className="font-display text-[28px] tracking-[3px] text-warm-white">
    Talent<span className="text-orange">o</span>
  </Link>
  <ul className="flex gap-10 list-none">
    <li><Link href="/become-talent" className="font-condensed text-[13px] font-semibold uppercase tracking-[2.5px] text-silver hover:text-warm-white">Become Talent</Link></li>
    {/* ... */}
  </ul>
  <Link href="/login" className="font-condensed text-[13px] font-bold uppercase tracking-[2px] text-white bg-orange hover:bg-orange-hot px-6 py-2.5">Login</Link>
</nav>
```

### 4. Section eyebrow + headline

```tsx
<div className="mb-4">
  <div className="flex items-center gap-3 mb-3">
    <div className="w-8 h-0.5 bg-orange" />
    <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
      Section Label
    </span>
  </div>
  <h2 className="font-display text-[clamp(48px,6vw,80px)] leading-[0.92] tracking-[2px] text-warm-white">
    Big <span className="text-orange">Cinematic</span> Headline
  </h2>
</div>
```

### 5. Form panel (used on Become Talent)

```tsx
<div className="bg-dark-3 p-10 border-t-2 border-orange">
  <h3 className="font-display text-[36px] tracking-[1px] mb-2">Create Your Profile</h3>
  <p className="font-body text-sm text-grey mb-8">Takes two minutes. TIK issued on submit.</p>

  <div className="mb-5">
    <label className="block font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-silver mb-2">
      Stage Name
    </label>
    <input
      type="text"
      className="w-full bg-dark-2 border border-white/10 px-4 py-3 text-warm-white
                 font-body text-sm
                 focus:border-orange focus:outline-none transition-colors"
    />
  </div>
  {/* ... */}
</div>
```

Form inputs: dark-2 background, subtle white border, orange focus ring (achieved by border colour change). No rounding. No drop shadow.

### 6. Upload zone

```tsx
<div className="
  border border-dashed border-orange/30
  bg-orange/5
  p-8 text-center cursor-pointer
  hover:border-orange hover:bg-orange/10 transition-colors
">
  <div className="text-3xl mb-2.5">↑</div>
  <div className="font-condensed text-sm font-semibold tracking-wide text-warm-white mb-1">
    Drop photos here or click to browse
  </div>
  <div className="text-xs text-grey">JPG, PNG up to 10MB · minimum 3 photos</div>
  <div className="font-condensed text-[10px] font-semibold uppercase tracking-[1.5px] text-orange mt-2">
    Required: face-forward, well-lit, high-res
  </div>
</div>
```

### 7. Talent card (the core unit of the registry)

```tsx
<article className="
  bg-dark-3 relative overflow-hidden cursor-pointer
  transition-transform hover:scale-[1.02] hover:z-[2]
">
  {/* The face: photo fills 2:3 aspect */}
  <div className="aspect-[2/3] relative overflow-hidden">
    <Image src={photoUrl} alt="" fill className="object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent" />
  </div>

  {/* Verified tick */}
  <div className="absolute top-2.5 right-2.5 w-6 h-6 bg-orange text-white flex items-center justify-center text-sm">
    ✓
  </div>

  {/* TIK code top-left */}
  <div className="absolute top-2.5 left-2.5 font-condensed text-[10px] font-bold tracking-[1.5px] text-orange bg-dark/80 px-2 py-1">
    TL·AX93F
  </div>

  {/* Info block */}
  <div className="p-3.5">
    <div className="font-condensed text-sm font-bold uppercase tracking-[0.5px] text-warm-white mb-1">
      Sarah M.
    </div>
    <div className="font-body text-xs text-grey mb-2.5">F · 28–34 · London</div>

    <div className="flex gap-1.5 mb-3 flex-wrap">
      <span className="font-condensed text-[9px] font-bold uppercase tracking-[1.5px] px-1.5 py-0.5 border border-orange/25 text-orange">
        Film
      </span>
      <span className="font-condensed text-[9px] font-bold uppercase tracking-[1.5px] px-1.5 py-0.5 border border-orange/25 text-orange">
        D2C
      </span>
    </div>

    <button className="w-full font-condensed text-[11px] font-bold uppercase tracking-[1.5px] bg-orange text-white py-2 hover:bg-orange-hot transition-colors">
      View Profile →
    </button>
  </div>
</article>
```

For Stage 1, the "License →" button in the original becomes "View Profile →" or "Save" depending on context.

### 8. Filter chips (registry page)

```tsx
<button className={cn(
  "font-condensed text-[11px] font-semibold uppercase tracking-[1.5px]",
  "px-4 py-1.5 border cursor-pointer transition-colors",
  active
    ? "bg-orange border-orange text-white"
    : "bg-transparent border-white/10 text-silver hover:border-orange hover:text-warm-white"
)}>
  Film
</button>
```

### 9. Section container

```tsx
<section className="px-12 py-20 md:py-24 relative">
  {/* Orange fade divider on top */}
  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange/20 to-transparent" />

  {/* Content */}
</section>
```

---

## Motion guidelines

- **Fade-up on scroll:** entries use `opacity: 0; transform: translateY(20px)` → `opacity: 1; transform: translateY(0)` over 0.8s. Stagger children by 0.1–0.15s.
- **Hero text:** staggered `fadeUp` with delays of 0.3s, 0.4s, 0.55s, 0.7s across eyebrow → headline → sub → CTAs.
- **Orange dot pulse:** used on "LIVE" indicators. `box-shadow: 0 0 0 0 rgba(232,80,10,0.6)` animates to `0 0 0 6px rgba(232,80,10,0)` over 2s infinite.
- **Flame flicker** (hero background): CSS-only, `animation: flicker 3s ease-in-out infinite alternate;` — the keyframes are in the HTML source.

For Stage 1, stick to CSS animations. No Framer Motion / Motion library unless absolutely needed. Performance first.

---

## Layout rules

- **Desktop content width:** max `1400px`, typically `1200px` centered.
- **Section padding:** `px-12` (48px) horizontal, `py-20` to `py-24` vertical (80–96px).
- **Mobile:** `px-6` (24px) horizontal, `py-14` (56px) vertical. Drop multi-column grids to single column at `md` breakpoint.

---

## What not to do

- ❌ Rounded corners beyond `rounded` (4px). No `rounded-xl`, no `rounded-full` except avatars.
- ❌ Drop shadows. Contrast and scale do the work instead.
- ❌ Gradients other than the specific radial/linear gradients in the HTML (hero atmospheric bg, nav fade).
- ❌ Pastels, blues, purples. Orange is the only accent.
- ❌ Emoji in copy (arrows `→` `↓` are fine — they're in the designs).
- ❌ Sans-serif "SaaS" fonts. Bebas / Barlow only.

---

## Read next

`03-SUPABASE-SETUP.md`
