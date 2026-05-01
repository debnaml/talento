import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For Studios — Talento",
  description:
    "Browse 48,000+ licensed, consented faces. Submit a casting brief and cast at the speed of AI — with full compliance and audit trail built in.",
};

const PROBLEM_ITEMS = [
  {
    icon: "🚫",
    title: "No Catering Bills",
    desc: "200 licensed extras cost the same at 3am as at 3pm. No riders, no green rooms, no travel.",
  },
  {
    icon: "⚖️",
    title: "No Likeness Lawsuits",
    desc: "Every face is consented, keyed, and auditable. Your legal team will sleep at night.",
  },
  {
    icon: "🤖",
    title: "No Generative Accidents",
    desc: "Uncontrolled AI generation creates real people without consent. Talento closes that gap entirely.",
  },
  {
    icon: "📁",
    title: "Audit-Ready by Default",
    desc: "Every license event is logged and exportable. Insurers, regulators, and producers covered.",
  },
];

const TALENT_RESULTS = [
  { key: "TL·AX93F", name: "Sarah M.",   meta: "Female · 28–34 · London",      perms: ["Film", "Advertising", "D2C"],      faces: "linear-gradient(180deg, rgba(180,140,100,0.15) 0%, rgba(13,13,16,0.9) 75%), radial-gradient(ellipse at 50% 35%, rgba(200,160,120,0.2) 0%, transparent 55%), #111118" },
  { key: "TL·BK71M", name: "James K.",   meta: "Male · 35–45 · Manchester",     perms: ["Action", "Gaming", "Historical"],  faces: "linear-gradient(180deg, rgba(100,140,180,0.12) 0%, rgba(13,13,16,0.9) 75%), radial-gradient(ellipse at 50% 35%, rgba(120,160,200,0.18) 0%, transparent 55%), #0f1218" },
  { key: "TL·CR82P", name: "Priya R.",   meta: "Female · 24–30 · Birmingham",   perms: ["D2C", "Advertising", "Film"],      faces: "linear-gradient(180deg, rgba(200,160,100,0.18) 0%, rgba(13,13,16,0.9) 75%), radial-gradient(ellipse at 50% 30%, rgba(220,180,120,0.22) 0%, transparent 55%), #131008" },
  { key: "TL·DJ54Q", name: "Marcus T.",  meta: "Male · 40–50 · Edinburgh",      perms: ["Sports", "Film", "Historical"],    faces: "linear-gradient(180deg, rgba(140,100,180,0.12) 0%, rgba(13,13,16,0.9) 75%), radial-gradient(ellipse at 50% 35%, rgba(160,120,200,0.15) 0%, transparent 55%), #100d16" },
];

const AUDIT_CARDS = [
  {
    icon: "🔑",
    title: "Unique Key Per Production",
    desc: "Every production gets its own project code. 100 extras in one film = 100 individual audit records, each tied to a unique talent key. Indisputable in court.",
  },
  {
    icon: "🌍",
    title: "Territory-Scoped Licensing",
    desc: "License for UK theatrical release. Want to distribute in Germany? That's a separate license event — automatically flagged if you try to exceed it. No accidental global rights.",
  },
  {
    icon: "📤",
    title: "One-Click Audit Export",
    desc: "Export your full compliance record as a legally formatted audit log for insurance submission, distributor requirements, or regulatory review. Instant. Complete.",
  },
  {
    icon: "⚡",
    title: "Real-Time API Verification",
    desc: "Every generation event calls the Talento API. If a license is expired, out of scope, or revoked, the call returns unauthorized. You cannot accidentally use unlicensed talent.",
  },
  {
    icon: "🛡",
    title: "Insurance & Legal Ready",
    desc: "Talento compliance records are structured to meet the requirements of E&O insurers, completion bondsmen, and distribution legal teams. The paperwork writes itself.",
  },
];

const CASTING_STEPS = [
  {
    num: "01",
    title: "Submit Brief or Search Registry",
    desc: "Tell us what you need, or search and filter 48,000+ talents yourself. Every result shows permitted uses upfront — no surprises.",
  },
  {
    num: "02",
    title: "Licenses Issued Instantly",
    desc: "Select talent, specify scope. Your Supplier Code is appended to each talent key. Project keys are generated per production — each one a discrete, auditable license record.",
  },
  {
    num: "03",
    title: "API Verification at Every Generation",
    desc: "Your production pipeline calls the Talento API before each generation event. The system verifies scope in real time. Out of scope? It won't generate. No exceptions.",
  },
  {
    num: "04",
    title: "Compliance Dashboard Lives in Real Time",
    desc: "Every license, every key, every event — visible, exportable, legally structured. Your E&O insurer, your distributor, your legal team: all covered before they ask.",
  },
];

const TRUST_STATS = [
  { num: "48K+",  label: "Licensed Talents" },
  { num: "1.2M",  label: "License Events Audited" },
  { num: "320+",  label: "Studio Partners" },
  { num: "0",     label: "Likeness Disputes" },
  { num: "190+",  label: "Countries Available" },
];

export default function ForStudiosPage() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative overflow-hidden pt-[68px] bg-dark">
        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 75% 50%, rgba(232,80,10,0.07) 0%, transparent 70%), radial-gradient(ellipse 30% 40% at 10% 80%, rgba(232,80,10,0.04) 0%, transparent 60%)",
          }}
        />

        {/* Left — pitch */}
        <div className="relative z-[2] px-6 md:px-12 py-20 flex flex-col justify-center border-r border-white/[0.04]">
          <div
            className="inline-flex items-center gap-2.5 mb-7"
            style={{ opacity: 0, animation: "fadeUp 0.7s 0.1s forwards" }}
          >
            <div className="w-7 h-0.5 bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              The Casting Hub · Studios &amp; Brands
            </span>
          </div>

          <h1
            className="font-display text-[clamp(42px,6.5vw,92px)] leading-[0.9] tracking-[1px] text-warm-white mb-8"
            style={{ opacity: 0, animation: "fadeUp 0.8s 0.2s forwards" }}
          >
            CAST<br />
            <span className="text-orange">WITHOUT</span><br />
            <span className="pl-8">THE</span><br />
            HEADACHE.
          </h1>

          <p
            className="font-body text-[16px] font-light leading-[1.75] text-silver max-w-[480px] mb-10"
            style={{ opacity: 0, animation: "fadeUp 0.8s 0.35s forwards" }}
          >
            Need a crowd of 200 for a war epic? A face for 10,000 personalised gift boxes?
            A street full of extras for a Hong Kong chase sequence?{" "}
            <strong className="text-warm-white font-medium">
              No catering. No no-shows. No likeness lawsuits.
            </strong>{" "}
            Just licensed, auditable talent — ready at the speed of production.
          </p>

          <div
            className="flex gap-3.5 flex-wrap"
            style={{ opacity: 0, animation: "fadeUp 0.8s 0.5s forwards" }}
          >
            <a
              href="#casting-brief"
              className="font-condensed text-[13px] font-bold uppercase tracking-[2.5px] bg-orange text-warm-white hover:bg-orange-hot px-9 py-4 transition-colors no-underline"
            >
              Submit a Casting Brief
            </a>
            <a
              href="#registry"
              className="font-condensed text-[13px] font-bold uppercase tracking-[2.5px] text-warm-white border border-white/20 hover:border-warm-white hover:bg-white/[0.04] px-9 py-4 transition-colors no-underline"
            >
              Browse the Registry
            </a>
          </div>
        </div>

        {/* Right — old world vs new */}
        <div
          className="relative z-[2] px-6 md:px-12 py-20 flex flex-col justify-center gap-0.5"
          style={{ opacity: 0, animation: "fadeUp 0.8s 0.3s forwards" }}
        >
          <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-danger/80 pb-3.5 mb-0.5">
            ⚠ The Old Way
          </div>
          <div
            className="px-7 py-7 border-l-[3px]"
            style={{
              background: "rgba(180,40,40,0.06)",
              borderLeftColor: "rgba(180,40,40,0.3)",
            }}
          >
            {[
              { icon: "💸", strong: "Extras on location:", rest: " catering, travel, accommodation, holding costs, weather delays, union rates" },
              { icon: "⚖️", strong: "Generative AI without licensing:", rest: " accidental likeness matches, consent disputes, litigation risk, no audit trail" },
              { icon: "📋", strong: "Stock libraries:", rest: " generic faces, restricted usage terms, no control over who else uses the same asset" },
              { icon: "🕐", strong: "Manual consent processes:", rest: " paperwork, chasing signatures, legally unenforceable terms buried in PDFs" },
            ].map((item) => (
              <div
                key={item.strong}
                className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
              >
                <span className="text-[14px] flex-shrink-0 mt-0.5">{item.icon}</span>
                <span className="font-body text-[14px] font-light leading-snug text-silver">
                  <strong className="text-warm-white font-medium">{item.strong}</strong>
                  {item.rest}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 py-5">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="font-display text-[18px] tracking-[2px] text-orange">vs Talento</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-success/80 pb-3.5">
            ✓ The Talento Way
          </div>
          <div
            className="px-7 py-7 border-l-[3px]"
            style={{
              background: "rgba(40,160,80,0.05)",
              borderLeftColor: "rgba(40,160,80,0.3)",
            }}
          >
            {[
              { icon: "⚡", strong: "Instant licensed casting:", rest: " browse, license, generate — same day. No logistics." },
              { icon: "🔑", strong: "Every face has a key:", rest: " cryptographic proof of consent for every single identity used in every single frame." },
              { icon: "📊", strong: "Full audit trail:", rest: " every use logged, scoped, and exportable for legal, insurance, and compliance teams." },
              { icon: "🛡", strong: "Zero liability surprises:", rest: " permissions are enforced at the API level, not buried in a terms document." },
            ].map((item) => (
              <div
                key={item.strong}
                className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
              >
                <span className="text-[14px] flex-shrink-0 mt-0.5">{item.icon}</span>
                <span className="font-body text-[14px] font-light leading-snug text-silver">
                  <strong className="text-warm-white font-medium">{item.strong}</strong>
                  {item.rest}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM STRIP ─────────────────────────────────── */}
      <div className="bg-orange px-6 md:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-0 relative overflow-hidden">
        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 font-display text-[120px] leading-none text-black/[0.07] whitespace-nowrap pointer-events-none">
          PROBLEM SOLVED
        </div>
        {PROBLEM_ITEMS.map((item, i) => (
          <div
            key={item.title}
            className={`relative z-10 px-7 ${i !== PROBLEM_ITEMS.length - 1 ? "border-r border-white/15" : ""} ${i === 0 ? "pl-0" : ""}`}
          >
            <span className="text-[22px] mb-2 block">{item.icon}</span>
            <div className="font-condensed text-[14px] font-extrabold uppercase tracking-[1px] text-white mb-1">
              {item.title}
            </div>
            <div className="font-body text-[12px] font-light leading-relaxed text-white/80">
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      {/* ── TALENT REGISTRY ───────────────────────────────── */}
      <section id="registry" className="bg-dark-2 px-6 md:px-12 py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange/30 to-transparent" />

        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-px bg-orange" />
          <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
            The Registry
          </span>
        </div>
        <h2 className="font-display text-[clamp(40px,5vw,64px)] tracking-[2px] text-warm-white mb-3 leading-none">
          48,000+ Licensed Faces.<br />Search. Filter. Cast.
        </h2>
        <p className="font-body text-[15px] font-light leading-relaxed text-silver max-w-[600px] mb-14">
          Every talent in the registry has given{" "}
          <strong className="text-warm-white font-medium">explicit, scoped consent</strong>.
          Every profile shows exactly what they allow — genre, territory, use type, duration.
          Search by type, appearance, permitted use, or availability. License instantly or submit a brief and we&apos;ll cast it for you.
        </p>

        {/* Search bar mockup */}
        <div className="bg-dark-3 border border-white/[0.06] mb-10">
          <div className="flex items-stretch border-b border-white/[0.06]">
            <div className="flex-1 px-6 py-[18px] font-body text-[15px] font-light text-grey">
              Search by type, genre, appearance, location… e.g. &apos;male 30s, action, UK licensed&apos;
            </div>
            <div className="w-px bg-white/[0.06]" />
            <div className="bg-orange px-9 flex items-center font-condensed text-[13px] font-bold uppercase tracking-[2px] text-white">
              Search Registry
            </div>
          </div>
          <div className="flex flex-wrap gap-0 px-6 py-3">
            {["All Types", "Background & Extras", "Named Support", "Action", "Historical", "D2C / Commercial", "Gaming", "UK Licensed", "Global"].map((chip, i) => (
              <span
                key={chip}
                className={`font-condensed text-[11px] font-semibold uppercase tracking-[1.5px] px-3.5 py-1.5 m-1 border cursor-default transition-colors ${
                  i === 0
                    ? "bg-orange border-orange text-white"
                    : "border-white/10 text-silver"
                }`}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Talent results grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-0.5">
          {TALENT_RESULTS.map((t) => (
            <div key={t.key} className="bg-dark-3 relative overflow-hidden cursor-default hover:scale-[1.02] transition-transform">
              <div
                className="aspect-[3/4] relative"
                style={{ background: t.faces }}
              >
                <div className="absolute top-[14%] left-1/2 -translate-x-1/2 w-1/2 pb-[62%] rounded-[50%_50%_44%_44%] bg-white/[0.07]" />
                <div className="absolute top-2 right-2 bg-orange w-5 h-5 flex items-center justify-center font-body text-[10px] text-white font-bold">
                  ✓
                </div>
                <div className="absolute bottom-2 left-2 font-display text-[10px] tracking-[2px] text-orange bg-dark/85 px-1.5 py-0.5">
                  {t.key}
                </div>
              </div>
              <div className="p-3.5 bg-dark-2">
                <div className="font-condensed text-[14px] font-bold uppercase tracking-[0.5px] text-warm-white mb-0.5">
                  {t.name}
                </div>
                <div className="font-condensed text-[11px] tracking-[1px] text-grey mb-2.5">
                  {t.meta}
                </div>
                <div className="flex flex-wrap gap-0.5 mb-2.5">
                  {t.perms.map((p) => (
                    <span key={p} className="font-condensed text-[9px] font-bold uppercase tracking-[1.5px] px-1.5 py-0.5 border border-orange/30 text-orange">
                      {p}
                    </span>
                  ))}
                </div>
                <div className="w-full font-condensed text-[11px] font-bold uppercase tracking-[1.5px] border border-orange/30 text-orange px-2 py-2 text-center cursor-default hover:bg-orange hover:text-white transition-colors">
                  License This Talent
                </div>
              </div>
            </div>
          ))}

          {/* 48K+ more card */}
          <div className="bg-dark-3 border border-dashed border-white/[0.08] flex flex-col items-center justify-center p-8 gap-2 cursor-default hover:border-orange transition-colors">
            <div className="font-display text-[40px] text-orange leading-none">48K+</div>
            <div className="font-condensed text-[11px] font-semibold uppercase tracking-[2px] text-grey">
              More in Registry
            </div>
            <div className="mt-4 font-condensed text-[12px] font-bold uppercase tracking-[2px] text-orange">
              Browse All →
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPLIANCE / AUDIT ────────────────────────────── */}
      <section className="bg-dark px-6 md:px-12 py-24">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-px bg-orange" />
          <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
            The Compliance Layer
          </span>
        </div>
        <h2 className="font-display text-[clamp(40px,5vw,64px)] tracking-[2px] text-warm-white mb-16 leading-none">
          Every Use. Logged. Exportable. Bulletproof.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
          {/* Left — copy + dashboard mockup */}
          <div>
            <h3 className="font-display text-[34px] tracking-[1px] text-warm-white mb-3.5 leading-none">
              Your audit trail is live from the moment you license.
            </h3>
            <p className="font-body text-[15px] font-light leading-[1.75] text-silver mb-3.5">
              Every talent license issued through Talento generates a{" "}
              <strong className="text-warm-white font-medium">unique project key</strong> — a
              cryptographic record that ties your production, your studio code, and the
              individual talent&apos;s identity key together in one auditable string.
            </p>
            <p className="font-body text-[15px] font-light leading-[1.75] text-silver mb-3.5">
              Your compliance dashboard shows every active license in real time. Export a full
              audit log in one click.{" "}
              <strong className="text-warm-white font-medium">
                No chasing paperwork. No reconstructing consent after the fact.
              </strong>
            </p>

            {/* Dashboard mockup */}
            {/* STAGE 3 — real-time dashboard tied to TIK system. See STAGE-3-ADVANCED.md */}
            <div className="bg-dark-3 border border-white/[0.06] border-t-2 border-t-orange mt-8 overflow-hidden">
              <div className="bg-dark-2 px-5 py-3.5 flex items-center justify-between border-b border-white/[0.04]">
                <span className="font-condensed text-[11px] font-bold uppercase tracking-[2.5px] text-silver">
                  Studio Compliance Dashboard
                </span>
                <span className="flex items-center gap-1.5 font-condensed text-[10px] font-bold uppercase tracking-[2px] text-orange">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange" />
                  Live
                </span>
              </div>
              {/* Header row */}
              <div className="grid grid-cols-2 md:grid-cols-4 px-5 py-3 bg-white/[0.02] border-b border-white/[0.03]">
                {["Talent / Key", "Production", "Expires", "Status"].map((h) => (
                  <div key={h} className="font-condensed text-[9px] font-bold uppercase tracking-[2px] text-grey">
                    {h}
                  </div>
                ))}
              </div>
              {[
                { name: "Sarah M.",  code: "TL·AX93F·PRJ042", prod: "Hong Kong Action · BG",  exp: "14 Mar 2025", status: "Active",  statusClass: "bg-success/20 text-success" },
                { name: "James K.",  code: "TL·BK71M·PRJ042", prod: "Hong Kong Action · BG",  exp: "14 Mar 2025", status: "Active",  statusClass: "bg-success/20 text-success" },
                { name: "Priya R.",  code: "TL·CR82P·PRJ019", prod: "Brand Campaign · Q1",    exp: "Awaiting",    status: "Pending", statusClass: "bg-orange/10 text-orange" },
                { name: "Marcus T.", code: "TL·DJ54Q·PRJ003", prod: "Biblical Epic · Crowd",  exp: "01 Jan 2025", status: "Expired", statusClass: "bg-white/[0.04] text-grey" },
              ].map((row) => (
                <div
                  key={row.code}
                  className="grid grid-cols-2 md:grid-cols-4 px-5 py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <div>
                    <div className="font-condensed text-[13px] font-bold text-warm-white">
                      {row.name}
                    </div>
                    <div className="font-display text-[11px] tracking-[2px] text-orange">
                      {row.code}
                    </div>
                  </div>
                  <div className="font-condensed text-[12px] text-silver flex items-center">
                    {row.prod}
                  </div>
                  <div className={`font-condensed text-[12px] flex items-center ${row.status === "Pending" ? "text-orange" : "text-silver"}`}>
                    {row.exp}
                  </div>
                  <div className="flex items-center">
                    <span className={`font-condensed text-[9px] font-bold uppercase tracking-[1.5px] px-2 py-1 ${row.statusClass}`}>
                      {row.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — audit cards */}
          <div className="flex flex-col gap-0.5">
            {AUDIT_CARDS.map((c) => (
              <div
                key={c.title}
                className="bg-dark-3 px-6 py-7 border-l-2 border-transparent hover:border-orange hover:bg-mid hover:translate-x-1 transition-all cursor-default"
              >
                <span className="text-[22px] mb-3 block">{c.icon}</span>
                <div className="font-condensed text-[16px] font-bold uppercase tracking-[0.5px] text-warm-white mb-1.5">
                  {c.title}
                </div>
                <p className="font-body text-[13px] font-light leading-relaxed text-silver">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GENERATIVE RISK ───────────────────────────────── */}
      <section className="bg-dark-2 px-6 md:px-12 py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange/25 to-transparent" />

        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-px bg-orange" />
          <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
            The Risk You&apos;re Already Carrying
          </span>
        </div>
        <h2 className="font-display text-[clamp(40px,5vw,64px)] tracking-[2px] text-warm-white mb-16 leading-none">
          Uncontrolled AI Generation<br />Is a Lawsuit Waiting to Happen.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Left — the problem */}
          <div>
            <p className="font-body text-[15px] font-light leading-[1.75] text-silver mb-4">
              Generative AI is remarkable. It is also, when used without proper licensing
              infrastructure, a source of{" "}
              <strong className="text-warm-white font-medium">
                significant legal and reputational exposure
              </strong>{" "}
              that most productions are currently ignoring.
            </p>
            <div className="border-l-[3px] border-orange pl-5 py-4 bg-orange/[0.04] mb-7">
              <p className="font-condensed text-[20px] font-light italic text-warm-white leading-snug">
                AI doesn&apos;t know it created someone real. Your legal team does — after the
                letter arrives.
              </p>
            </div>
            <p className="font-body text-[15px] font-light leading-[1.75] text-silver mb-8">
              The risks are not hypothetical. They are structural. Every AI system trained on
              human image data contains the potential to recreate a real person&apos;s appearance.
              Without a systematic consent and audit layer, you have no defence.
            </p>
            <div className="flex flex-col gap-0.5">
              {[
                { text: <><strong className="text-warm-white font-medium">Accidental likeness matches.</strong> An AI-generated crowd extra looks like a real, identifiable person who never consented. Right-of-publicity claim incoming.</> },
                { text: <><strong className="text-warm-white font-medium">No audit trail.</strong> A distributor, insurer, or regulator asks for consent records. You have a folder of screenshots and a prayer.</> },
                { text: <><strong className="text-warm-white font-medium">Scope creep.</strong> A face licensed for a trailer ends up in the theatrical cut, the streaming release, and three regional variants. Technically? Four separate violations.</> },
              ].map((p, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 px-5 py-4 border-l-2"
                  style={{ background: "rgba(180,40,40,0.05)", borderLeftColor: "rgba(180,40,40,0.25)" }}
                >
                  <span className="text-[18px] flex-shrink-0 mt-0.5">⚠️</span>
                  <p className="font-body text-[14px] font-light leading-relaxed text-silver">
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — solutions */}
          <div>
            <div className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange mb-5">
              How Talento Fixes This
            </div>
            <div className="flex flex-col gap-0.5">
              {[
                { num: "01 / CONSENT AT SOURCE",    title: "Every Face is Pre-Consented",               desc: "Every talent in the registry has given explicit, scoped, legally documented consent before their likeness can be licensed. You never encounter a face that hasn't agreed to be there." },
                { num: "02 / KEY VERIFICATION",     title: "Cryptographic Proof of Authorization",      desc: "Each use generates a unique, cryptographically signed license token — a record that cannot be fabricated, backdated, or disputed. Your legal team has what they need before they need it." },
                { num: "03 / SCOPE ENFORCEMENT",    title: "Licenses Don't Stretch",                    desc: "Every license is scoped by production, territory, use type, and duration. The system enforces the scope at the API level. You can't exceed a license accidentally. It just won't work." },
                { num: "04 / ONGOING MONITORING",   title: "Live Dashboard. Always Current.",           desc: "Your compliance dashboard reflects the live status of every license, in real time. Expirations are flagged in advance. No stale consents. No retroactive surprises." },
              ].map((s) => (
                <div
                  key={s.num}
                  className="px-5 py-5 border-l-2 transition-all cursor-default hover:border-l-success/60 hover:bg-success/[0.07]"
                  style={{ background: "rgba(40,160,80,0.04)", borderLeftColor: "rgba(40,160,80,0.2)" }}
                >
                  <div className="font-display text-[12px] tracking-[2px] mb-1.5" style={{ color: "rgba(40,160,80,0.6)" }}>
                    {s.num}
                  </div>
                  <div className="font-condensed text-[16px] font-bold uppercase tracking-[0.5px] text-warm-white mb-1.5">
                    {s.title}
                  </div>
                  <p className="font-body text-[13px] font-light leading-relaxed text-silver">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CASTING BRIEF SECTION ─────────────────────────── */}
      <section id="casting-brief" className="bg-dark px-6 md:px-12 py-24">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-px bg-orange" />
          <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
            Submit a Brief
          </span>
        </div>
        <h2 className="font-display text-[clamp(40px,5vw,64px)] tracking-[2px] text-warm-white mb-16 leading-none">
          Tell Us What You Need.<br />We&apos;ll Cast It.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
          {/* Left — brief CTA panel */}
          <div className="bg-dark-3 border-t-2 border-orange p-10">
            <div className="font-display text-[30px] tracking-[1.5px] text-warm-white mb-1.5 leading-none">
              Casting Brief
            </div>
            <p className="font-body text-[13px] font-light text-silver mb-8">
              Describe the production. We&apos;ll identify, license, and deliver the right talent.
            </p>

            {/* Genre quick-select (visual only, non-interactive) */}
            <div className="mb-6">
              <div className="font-condensed text-[10px] font-bold uppercase tracking-[2.5px] text-grey mb-3">
                Genre / Use Type
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Action", "Historical", "Sci-Fi", "Drama", "Advertising", "D2C", "Gaming", "Sports"].map((g, i) => (
                  <span
                    key={g}
                    className={`font-condensed text-[11px] font-bold uppercase tracking-[1.5px] px-3.5 py-1.5 border cursor-default ${
                      i === 0
                        ? "bg-orange border-orange text-white"
                        : "border-white/10 text-silver"
                    }`}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <p className="font-body text-[13px] font-light leading-relaxed text-silver mb-8">
              Ready to submit? Create your studio account to file a full casting brief.
              We respond within 4 hours for registered studios.
            </p>

            <Link
              href="/register?role=studio"
              className="block w-full font-condensed text-[14px] font-extrabold uppercase tracking-[3px] bg-orange text-white text-center py-[18px] hover:bg-orange-hot transition-colors no-underline"
            >
              Register as a Studio →
            </Link>
            <p className="font-body text-[11px] font-light text-grey mt-3.5 text-center leading-relaxed">
              Free to explore the registry. Licensing requires a studio account.
            </p>
          </div>

          {/* Right — how it works + key gen preview */}
          <div>
            <h3 className="font-display text-[34px] tracking-[1px] text-warm-white mb-3 leading-none">
              How Studio Casting Works on Talento
            </h3>
            <p className="font-body text-[14px] font-light leading-[1.7] text-silver mb-8">
              Submit a brief or browse the registry yourself. Either way,{" "}
              <strong className="text-warm-white font-medium">
                every license is automatically keyed, scoped, and logged
              </strong>{" "}
              — your compliance record is live from the moment you cast.
            </p>

            <div className="flex flex-col gap-0.5 mb-8">
              {CASTING_STEPS.map((s) => (
                <div
                  key={s.num}
                  className="flex gap-4 bg-dark-3 px-5 py-5 border-l-2 border-transparent hover:border-orange hover:bg-mid transition-all cursor-default"
                >
                  <div className="font-display text-[28px] text-orange flex-shrink-0 leading-none mt-0.5">
                    {s.num}
                  </div>
                  <div>
                    <div className="font-condensed text-[15px] font-bold uppercase tracking-[0.5px] text-warm-white mb-1.5">
                      {s.title}
                    </div>
                    <p className="font-body text-[13px] font-light leading-relaxed text-silver">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Key generation preview */}
            {/* STAGE 3 — real key generation per license event. See STAGE-3-ADVANCED.md */}
            <div
              className="p-6 border border-orange/15"
              style={{ background: "linear-gradient(135deg, rgba(232,80,10,0.08) 0%, rgba(232,80,10,0.02) 100%)" }}
            >
              <div className="font-condensed text-[10px] font-bold uppercase tracking-[3px] text-orange mb-3">
                How Your Project Keys Are Generated
              </div>
              <div className="font-display text-[18px] tracking-[3px] text-warm-white mb-2.5 leading-snug">
                TL · <span className="text-orange">AX93F·K28Q·771</span> · <span className="text-silver">PRJ-042</span> · <span className="text-grey text-[15px]">STU-009</span>
              </div>
              <p className="font-body text-[12px] font-light leading-relaxed text-grey">
                Each talent&apos;s personal key + your unique project code + your studio identifier
                = one cryptographically unique license record per talent per production.{" "}
                <strong className="text-warm-white font-medium">
                  Generated automatically. Logged permanently. Yours to export at any time.
                </strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STATS ───────────────────────────────────── */}
      <div className="bg-dark px-6 md:px-12 py-0 grid grid-cols-2 md:grid-cols-5 gap-0.5">
        {TRUST_STATS.map((s) => (
          <div key={s.label} className="bg-dark-3 p-8 flex flex-col items-center text-center gap-2">
            <div className="font-display text-[48px] text-orange leading-none">{s.num}</div>
            <div className="font-condensed text-[10px] font-semibold uppercase tracking-[2.5px] text-grey">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <div className="bg-orange px-6 md:px-12 py-20 flex items-center justify-between gap-10 flex-wrap relative overflow-hidden">
        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 font-display text-[160px] leading-none text-black/[0.07] whitespace-nowrap pointer-events-none">
          CASTING NOW
        </div>
        <div className="relative z-10">
          <div className="font-condensed text-[11px] font-bold uppercase tracking-[3px] text-white/70 mb-2">
            The Casting Hub is Open
          </div>
          <div className="font-display text-[clamp(36px,4.5vw,58px)] tracking-[2px] text-white leading-none">
            CAST SMARTER.<br />STAY PROTECTED.
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-end gap-3.5 flex-shrink-0">
          <Link
            href="/register?role=studio"
            className="font-condensed text-[14px] font-extrabold uppercase tracking-[2.5px] bg-dark text-white hover:bg-black/80 px-10 py-[18px] transition-colors no-underline whitespace-nowrap"
          >
            Submit Your First Brief →
          </Link>
          <span className="font-body text-[12px] font-light text-white/70 text-right">
            Response within 4 hours · No commitment required
          </span>
        </div>
      </div>
    </>
  );
}
