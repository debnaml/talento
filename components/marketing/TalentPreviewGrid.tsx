import Link from "next/link";

// Static preview cards lifted from designs/talento.html .talent-section
// In Stage 1 the real registry is at /studio/browse (auth-gated).
// These cards are purely decorative marketing previews.
const PREVIEW_TALENT = [
  { name: "Sarah M.", type: "Film · Advertising", bg: "linear-gradient(180deg, rgba(180,140,100,0.15) 0%, rgba(13,13,16,0.95) 70%), radial-gradient(ellipse at 50% 35%, rgba(200,160,120,0.2) 0%, transparent 55%), #111118" },
  { name: "James K.", type: "Action · Gaming",    bg: "linear-gradient(180deg, rgba(100,140,180,0.1) 0%, rgba(13,13,16,0.95) 70%), radial-gradient(ellipse at 50% 35%, rgba(120,160,200,0.15) 0%, transparent 55%), #0f1218" },
  { name: "Priya R.", type: "D2C · Advertising",  bg: "linear-gradient(180deg, rgba(200,160,100,0.18) 0%, rgba(13,13,16,0.95) 70%), radial-gradient(ellipse at 50% 30%, rgba(220,180,120,0.2) 0%, transparent 55%), #131008" },
  { name: "Marcus T.", type: "Sports · Film",     bg: "linear-gradient(180deg, rgba(140,100,180,0.12) 0%, rgba(13,13,16,0.95) 70%), radial-gradient(ellipse at 50% 35%, rgba(160,120,200,0.15) 0%, transparent 55%), #100d16" },
  { name: "Aiko N.", type: "Gaming · D2C",        bg: "linear-gradient(180deg, rgba(100,180,140,0.1) 0%, rgba(13,13,16,0.95) 70%), radial-gradient(ellipse at 50% 30%, rgba(120,200,160,0.12) 0%, transparent 55%), #0d1210" },
];

export function TalentPreviewGrid() {
  return (
    <section className="bg-dark px-6 md:px-12 py-24">
      {/* Header */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-px bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              The Registry
            </span>
          </div>
          <h2 className="font-display text-[clamp(40px,5vw,64px)] tracking-[2px] text-warm-white leading-none">
            Browse Talent
          </h2>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["Film", "Advertising", "Gaming", "D2C", "Sports"].map((tag) => (
            <span
              key={tag}
              className="font-condensed text-[10px] font-bold uppercase tracking-[2px] px-2.5 py-0.5 border border-orange/40 text-orange"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Grid — 6 cols: 5 talent + 1 CTA */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-0.5">
        {PREVIEW_TALENT.map((t) => (
          <article
            key={t.name}
            className="relative aspect-[2/3] bg-dark-3 overflow-hidden cursor-pointer transition-transform hover:scale-[1.03] hover:z-[2]"
          >
            {/* Cinematic portrait gradient */}
            <div className="absolute inset-0" style={{ background: t.bg }} />

            {/* Abstract face shape */}
            <div
              className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[52%] rounded-[50%_50%_44%_44%] bg-white/[0.07]"
              style={{ paddingBottom: "65%", boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.3)" }}
            />

            {/* Verified tick */}
            <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-orange flex items-center justify-center text-white text-[10px]">
              ✓
            </div>

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[rgba(13,13,16,0.98)] to-transparent">
              <div className="font-condensed text-[13px] font-bold uppercase tracking-[1px] text-warm-white">
                {t.name}
              </div>
              <div className="font-condensed text-[10px] uppercase tracking-[1.5px] text-grey mt-0.5">
                {t.type}
              </div>
            </div>
          </article>
        ))}

        {/* CTA card */}
        <div className="relative aspect-[2/3] bg-dark-3 flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-mid transition-colors">
          <div className="font-display text-[42px] text-orange leading-none">48K+</div>
          <div className="font-condensed text-[11px] font-semibold uppercase tracking-[2.5px] text-grey my-2">
            Talents Available
          </div>
          <Link
            href="/for-studios"
            className="font-condensed text-[12px] font-bold uppercase tracking-[2px] text-orange no-underline inline-flex items-center gap-1"
          >
            Browse All →
          </Link>
        </div>
      </div>
    </section>
  );
}
