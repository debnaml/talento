import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Become Talent — Talento",
  description:
    "Register your likeness, set your permissions, and earn every time AI uses your face. Free to join. You control everything.",
};

const GENRES = [
  {
    bgText: "ACT",
    icon: "🎬",
    title: "Action & Thriller",
    examples:
      "Bar fights in Bangkok. Rooftop chases in Hong Kong. Car chases through narrow streets. Assassins, bodyguards, henchmen.",
    pay: "From £80 per use",
  },
  {
    bgText: "SCI",
    icon: "🦕",
    title: "Sci-Fi & Prehistoric",
    examples:
      "Dinosaur stampede survivors. Alien invasion crowds. Dystopian city dwellers. The person who doesn't make it out.",
    pay: "From £60 per use",
  },
  {
    bgText: "EPIC",
    icon: "⚔️",
    title: "Historical Epic",
    examples:
      "Biblical marketplace crowds. Roman centurions. Medieval peasants. Viking raiders. Pilgrims crossing continents.",
    pay: "From £75 per use",
  },
  {
    bgText: "WAR",
    icon: "🪖",
    title: "War & Drama",
    examples:
      "Soldiers on every front. Resistance fighters. Refugees. Field medics. The civilian faces that make war real.",
    pay: "From £90 per use",
  },
];

const GENRES_WIDE = [
  {
    bgText: "BRAND",
    icon: "📦",
    title: "D2C & Brand Campaigns",
    examples:
      "Your face on a product. Your likeness in a personalized gift. Lifestyle campaigns, brand storytelling, product photography — all AI-generated, all fully licensed.",
    pay: "From £25 per product license",
  },
  {
    bgText: "GAME",
    icon: "🎮",
    title: "Gaming & Esports",
    examples:
      "NPCs. Crowd characters. Customizable skins. Your face in a game played by millions.",
    pay: "From £50 per character license",
  },
  {
    bgText: "SPORT",
    icon: "🏆",
    title: "Sports & Live Events",
    examples:
      "Stadium crowds. Fan recreations. Athlete stand-ins. AI sports broadcasts and game replays.",
    pay: "From £40 per event",
  },
];

const EARN_CARDS = [
  {
    role: "Extras & Background",
    title: "Film & TV Background Role",
    example:
      '"Beaten up in a Hong Kong fight scene." "Biblical marketplace crowd." "Dinosaur stampede survivor."',
    amount: "£80",
    per: "per scene use",
    note: "Each use of your likeness generates a new license event and a new payment. One shoot — unlimited productions.",
  },
  {
    role: "Named Support Role",
    title: "Auction & Named Casting",
    // STAGE 2 — auction mechanic; presented as marketing info here
    example:
      '"Fight JCVD in the opening sequence." "Play opposite the lead in a confrontation scene." "Appear as a named villain."',
    amount: "£400+",
    per: "per role",
    note: "Auction wins and named casting attract premium rates. A-list adjacent means A-list adjacent pay.",
  },
  {
    role: "D2C & Commercial",
    title: "Brand & Product Licensing",
    example:
      '"Your face on a personalized birthday card sent to 50,000 people." "Brand campaign across 12 markets." "Product model for an e-commerce range."',
    amount: "£25",
    per: "per product license",
    note: "Volume is the model. Small per-unit fees across thousands of product licenses add up fast — and you see every one.",
  },
];

const PERMISSIONS = [
  { name: "Film & Television",    detail: "Extras, background, crowd scenes, genre productions",       earn: "£60–£200",  on: true },
  { name: "Advertising & Brand",  detail: "Commercial campaigns, social media, product imagery",        earn: "£40–£300",  on: true },
  { name: "Gaming & Esports",     detail: "NPC characters, crowd skins, sports titles",                 earn: "£50–£150",  on: true },
  { name: "D2C Products",         detail: "Personalized gifts, greeting cards, product integration",    earn: "£15–£80",   on: true },
  { name: "Political Content",    detail: "Any political advertising, campaign, or affiliation",        earn: "Blocked",   on: false },
  { name: "Adult Content",        detail: "Any content rated 18+ or of an adult nature",               earn: "Blocked",   on: false },
];

const STEPS = [
  { num: "01", name: "Create Your Profile",    desc: "Name, location, and basic details. Takes two minutes." },
  { num: "02", name: "Upload Your Likeness",   desc: "Photos and video reference. The more you upload, the more you can earn." },
  { num: "03", name: "Set Your Permissions",   desc: "Choose exactly what you allow. Your rules are enforced at the system level." },
  { num: "04", name: "Receive Your Key",       desc: "Your Talento Identity Key is issued. You're live in the registry." },
];

const ROLE_EXAMPLES = [
  { num: "01", text: "Hong Kong Action Sequence", sub: "— bar fight, rooftop chase, villain henchman",                    tag: "Action" },
  { num: "02", text: "Prehistoric Epic",           sub: "— eaten by a T-Rex, stampede survivor, cave tribe member",         tag: "Sci-Fi" },
  { num: "03", text: "Biblical Epic",              sub: "— marketplace crowd, Roman soldier, pilgrim in the wilderness",    tag: "Historical" },
  { num: "04", text: "Wartime Drama",              sub: "— soldier, resistance fighter, refugee, medic behind the lines",   tag: "Drama" },
  { num: "05", text: "D2C Brand Campaign",         sub: "— face on a product, model in a lifestyle ad, brand story",        tag: "Commercial" },
];

export default function BecomeTalentPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        className="min-h-screen flex flex-col relative overflow-hidden pt-[68px]"
        style={{
          background:
            "linear-gradient(168deg, #0D0D10 0%, #0D0D10 55%, #1C1C26 55%, #13131A 100%)",
        }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(232,80,10,0.09) 0%, transparent 70%), radial-gradient(ellipse 30% 40% at 20% 80%, rgba(232,80,10,0.05) 0%, transparent 60%)",
          }}
        />

        {/* "CASTING OPEN" watermark */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[clamp(80px,14vw,200px)] tracking-[-4px] text-white/[0.025] whitespace-nowrap pointer-events-none z-[1] leading-none"
        >
          CASTING OPEN
        </div>

        <div className="relative z-[2] grid grid-cols-1 md:grid-cols-2 flex-1">
          {/* Left */}
          <div
            className="px-6 md:px-12 py-20 flex flex-col justify-center border-r border-white/[0.04]"
          >
            <div
              className="inline-flex items-center gap-2.5 mb-8"
              style={{ opacity: 0, animation: "fadeUp 0.7s 0.1s forwards" }}
            >
              <div className="w-8 h-0.5 bg-orange" />
              <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
                Global Casting Call — Now Open
              </span>
            </div>

            <h1
              className="font-display text-[clamp(44px,7vw,100px)] leading-[0.9] tracking-[1px] text-warm-white mb-7"
              style={{ opacity: 0, animation: "fadeUp 0.8s 0.2s forwards" }}
            >
              YOUR<br />
              <span className="text-orange">FACE.</span><br />
              <span className="pl-6">YOUR</span><br />
              CAREER.
            </h1>

            <p
              className="font-condensed text-[clamp(16px,2vw,22px)] font-light italic text-silver leading-snug mb-10 max-w-[480px]"
              style={{ opacity: 0, animation: "fadeUp 0.8s 0.35s forwards" }}
            >
              Ever wanted to be in a film? Get beaten up in a Hong Kong back alley.
              Eaten by a dinosaur. Die heroically in a biblical epic. Stand in the
              crowd as history is made. Now you can — without leaving home.
            </p>

            {/* Role examples */}
            <div
              className="flex flex-col gap-0 mb-11"
              style={{ opacity: 0, animation: "fadeUp 0.8s 0.45s forwards" }}
            >
              {ROLE_EXAMPLES.map((r, i) => (
                <div
                  key={r.num}
                  className={`flex items-baseline gap-3.5 py-2.5 border-b border-white/[0.05] ${
                    i === 0 ? "border-t border-white/[0.05]" : ""
                  } hover:bg-orange/[0.04] transition-colors cursor-default`}
                >
                  <span className="font-display text-[13px] tracking-[1px] text-orange-dim flex-shrink-0 w-6">
                    {r.num}
                  </span>
                  <span className="font-condensed text-[16px] font-normal tracking-[0.5px] text-silver leading-snug">
                    <strong className="font-bold text-warm-white">{r.text}</strong>
                    {r.sub}
                  </span>
                  <span className="ml-auto flex-shrink-0 font-condensed text-[9px] font-bold uppercase tracking-[2px] px-2 py-0.5 border border-white/[0.08] text-grey">
                    {r.tag}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="flex gap-3.5 flex-wrap"
              style={{ opacity: 0, animation: "fadeUp 0.8s 0.55s forwards" }}
            >
              <Link
                href="/register?role=talent"
                className="font-condensed text-[13px] font-bold uppercase tracking-[2.5px] text-warm-white bg-orange hover:bg-orange-hot px-9 py-4 transition-colors no-underline"
              >
                Register as Talent
              </Link>
              <a
                href="#how-it-works"
                className="font-condensed text-[13px] font-bold uppercase tracking-[2.5px] text-warm-white border border-white/20 hover:border-warm-white hover:bg-white/[0.04] px-9 py-4 transition-colors no-underline"
              >
                How Your Key Works
              </a>
            </div>
          </div>

          {/* Right — stats + key preview */}
          <div className="px-6 md:px-12 py-20 flex flex-col justify-center gap-0.5">
            <div
              className="bg-dark-3 border-l-[3px] border-orange px-7 py-6 mb-6"
              style={{ opacity: 0, animation: "fadeUp 0.8s 0.3s forwards" }}
            >
              <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange mb-2">
                Talento Represents You
              </div>
              <p className="font-body text-sm font-light leading-relaxed text-silver">
                Register once, set your terms, and earn every time your likeness is used in
                any production — anywhere in the world.{" "}
                <strong className="text-warm-white font-medium">
                  No auditions. No waiting by the phone. No middleman.
                </strong>{" "}
                You are in the room the moment you register.
              </p>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-0.5"
              style={{ opacity: 0, animation: "fadeUp 0.8s 0.4s forwards" }}
            >
              {[
                { num: "48K+", label: "Talent Registered" },
                { num: "£4.8M", label: "Paid to Talent" },
                { num: "320+", label: "Studio Partners" },
                { num: "190+", label: "Countries" },
              ].map((s) => (
                <div key={s.label} className="bg-dark-3 p-6">
                  <div className="font-display text-[44px] tracking-[1px] text-orange leading-none mb-1">
                    {s.num}
                  </div>
                  <div className="font-condensed text-[10px] font-semibold uppercase tracking-[2.5px] text-grey">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* TIK preview — STAGE 3: real key issued on registration. See STAGE-3-ADVANCED.md */}
            <div
              className="bg-dark-3 px-7 py-6 mt-0.5 border-t border-orange/20"
              style={{ opacity: 0, animation: "fadeUp 0.8s 0.5s forwards" }}
            >
              <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-grey mb-2.5">
                Your Talento Identity Key — Issued on Registration
              </div>
              {/* STAGE 3 — see STAGE-3-ADVANCED.md for real TIK cryptographic generation */}
              <div className="font-display text-[28px] tracking-[4px] text-orange bg-orange/[0.06] px-4 py-2.5 inline-block mb-2.5 border border-orange/15">
                TL · AX93F · K28Q · 771
              </div>
              <p className="font-body text-xs font-light text-grey leading-relaxed">
                Every time your likeness is used in any production, a unique project key is
                generated from yours. You see every use. You approve every use. You get paid
                for every use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" className="bg-dark-2 px-6 md:px-12 py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange to-transparent" />

        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-px bg-orange" />
          <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
            Registration
          </span>
        </div>
        <h2 className="font-display text-[clamp(40px,5vw,64px)] tracking-[2px] text-warm-white mb-16 leading-none">
          Your Casting Call Starts Here
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 relative">
          {/* Connecting line */}
          <div
            className="absolute h-px bg-gradient-to-r from-orange via-orange-dim to-orange"
            style={{ top: 32, left: "12.5%", right: "12.5%" }}
          />
          {STEPS.map((step, i) => (
            <div key={step.num} className="px-6 relative z-[1]">
              <div className="w-16 h-16 border border-orange bg-dark-2 flex items-center justify-center font-display text-[24px] tracking-[1px] text-orange mb-5">
                {step.num}
              </div>
              <div className="font-display text-[22px] tracking-[1px] text-warm-white mb-2 leading-none">
                {step.name}
              </div>
              <p className="font-body text-[13px] font-light leading-relaxed text-silver">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── GENRES GRID ──────────────────────────────────── */}
      <section className="bg-dark-2 px-6 md:px-12 pb-24 relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-px bg-orange" />
          <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
            Open Roles
          </span>
        </div>
        <h2 className="font-display text-[clamp(40px,5vw,64px)] tracking-[2px] text-warm-white mb-3 leading-none">
          What Could You Be In?
        </h2>
        <p className="font-body text-[15px] font-light leading-relaxed text-silver max-w-[560px] mb-14">
          Studios, game developers, and brands are casting globally — right now. Every genre.
          Every type. Background roles to lead support. Your likeness, used with your permission.
        </p>

        {/* 4-col row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5">
          {GENRES.map((g) => (
            <GenreCard key={g.title} {...g} />
          ))}
        </div>

        {/* Wide 3-col row */}
        <div className="grid grid-cols-[2fr_1fr_1fr] gap-0.5 mt-0.5">
          {GENRES_WIDE.map((g) => (
            <GenreCard key={g.title} {...g} />
          ))}
        </div>
      </section>

      {/* ── PERMISSIONS EXPLAINER ─────────────────────────── */}
      <section className="bg-dark px-6 md:px-12 py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange/25 to-transparent" />

        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-px bg-orange" />
          <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
            Your Rules
          </span>
        </div>
        <h2 className="font-display text-[clamp(40px,5vw,64px)] tracking-[2px] text-warm-white mb-16 leading-none">
          You Decide What You Allow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Left — copy */}
          <div>
            <p className="font-body text-[15px] font-light leading-relaxed text-silver mb-3.5">
              This is not a checkbox you tick and forget. Your permissions are{" "}
              <strong className="text-warm-white font-medium">
                live, enforceable rules
              </strong>{" "}
              built into every license key that includes your identity.
            </p>
            <p className="font-body text-[15px] font-light leading-relaxed text-silver mb-3.5">
              Change your mind? Update your permissions and every future license reflects it
              instantly.{" "}
              <strong className="text-warm-white font-medium">
                Existing licenses run to their agreed term
              </strong>{" "}
              — your commitments are honored — but nothing new gets issued outside your
              current rules.
            </p>
            <p className="font-body text-[15px] font-light leading-relaxed text-silver mb-6">
              Want to allow gaming but not advertising? Fine. UK and EU only? Done. No adult
              content, ever? Enforced at the API level — no studio can override it.
            </p>
            <div className="border-l-[3px] border-orange pl-5 py-4 bg-orange/[0.04]">
              <p className="font-condensed text-[18px] font-light italic text-warm-white leading-snug">
                This is the difference between a contract no-one reads and a system that
                actually works at machine speed.
              </p>
            </div>
          </div>

          {/* Right — static permission preview */}
          <div className="flex flex-col gap-0.5">
            {PERMISSIONS.map((p) => (
              <div
                key={p.name}
                className={`flex items-center justify-between bg-dark-3 px-5 py-4 gap-4 border-l-2 ${
                  p.on ? "border-orange" : "border-grey opacity-60"
                }`}
              >
                <div className="flex-1">
                  <div className="font-condensed text-[15px] font-bold uppercase tracking-[0.5px] text-warm-white mb-0.5">
                    {p.name}
                  </div>
                  <div className="font-body text-[12px] font-light text-grey leading-snug">
                    {p.detail}
                  </div>
                </div>
                <div
                  className={`font-condensed text-[12px] font-bold tracking-[1px] flex-shrink-0 ${
                    p.on ? "text-orange" : "text-grey"
                  }`}
                >
                  {p.earn}
                </div>
                {/* Visual toggle indicator (non-interactive — set at /talent/onboarding) */}
                <div
                  className={`w-11 h-6 rounded-full flex-shrink-0 relative ${
                    p.on ? "bg-orange" : "bg-mid border border-grey"
                  }`}
                >
                  <div
                    className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all ${
                      p.on ? "left-[23px]" : "left-[3px]"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EARNINGS ─────────────────────────────────────── */}
      <section className="bg-dark-2 px-6 md:px-12 py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange/30 to-transparent" />

        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-px bg-orange" />
          <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
            The Money
          </span>
        </div>
        <h2 className="font-display text-[clamp(40px,5vw,64px)] tracking-[2px] text-warm-white mb-16 leading-none">
          What Talent Earns
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5">
          {EARN_CARDS.map((c) => (
            <div
              key={c.title}
              className="bg-dark-3 px-7 py-9 border-t-2 border-transparent hover:border-orange hover:bg-mid transition-all cursor-default"
            >
              <div className="font-condensed text-[11px] font-bold uppercase tracking-[2.5px] text-orange mb-3">
                {c.role}
              </div>
              <div className="font-display text-[26px] tracking-[1px] text-warm-white mb-2 leading-snug">
                {c.title}
              </div>
              <p className="font-body text-[13px] font-light italic text-grey mb-5 leading-relaxed">
                {c.example}
              </p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-display text-[48px] tracking-[1px] text-orange leading-none">
                  {c.amount}
                </span>
                <span className="font-condensed text-[13px] font-normal tracking-[1px] text-grey">
                  {c.per}
                </span>
              </div>
              <p className="font-body text-[11px] font-light leading-relaxed text-grey mt-3">
                {c.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <div
        className="bg-orange px-6 md:px-12 py-20 flex items-center justify-between gap-10 flex-wrap relative overflow-hidden"
        style={{
          /* CASTING OPEN ghost text from design */
        }}
      >
        <div
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 font-display text-[180px] leading-none text-black/[0.08] whitespace-nowrap pointer-events-none tracking-[-4px]"
        >
          CASTING OPEN
        </div>
        <div className="relative z-10">
          <div className="font-condensed text-[11px] font-bold uppercase tracking-[3px] text-white/70 mb-2">
            The World&apos;s Largest AI Casting Call
          </div>
          <div className="font-display text-[clamp(40px,5vw,64px)] tracking-[2px] text-white leading-none">
            CASTING IS OPEN.<br />
            YOUR SCENE AWAITS.
          </div>
        </div>
        <Link
          href="/register?role=talent"
          className="relative z-10 font-condensed text-[14px] font-extrabold uppercase tracking-[2.5px] bg-dark text-white hover:bg-black/80 px-6 md:px-12 py-5 transition-colors no-underline flex-shrink-0"
        >
          Register Now — It&apos;s Free
        </Link>
      </div>
    </>
  );
}

function GenreCard({
  bgText,
  icon,
  title,
  examples,
  pay,
}: {
  bgText: string;
  icon: string;
  title: string;
  examples: string;
  pay: string;
}) {
  return (
    <div className="group relative overflow-hidden bg-dark-3 px-7 py-10 border-t-2 border-transparent hover:border-orange hover:bg-mid transition-all cursor-default min-h-[280px] flex flex-col justify-end">
      {/* Ghost bg text */}
      <div className="absolute top-3 left-4 font-display text-[88px] leading-none text-white/[0.03] pointer-events-none tracking-[-2px]">
        {bgText}
      </div>
      <span className="text-[32px] mb-4 relative z-10">{icon}</span>
      <div className="font-display text-[28px] tracking-[1.5px] text-warm-white mb-2.5 leading-none relative z-10">
        {title}
      </div>
      <div className="font-condensed text-[13px] font-light italic text-grey mb-4 leading-relaxed relative z-10">
        {examples}
      </div>
      <div className="font-condensed text-[11px] font-bold uppercase tracking-[2px] text-orange relative z-10">
        {pay}
      </div>
    </div>
  );
}
