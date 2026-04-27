import Link from "next/link";

const ENTRY_CARDS = [
  {
    num: "01",
    icon: "↑",
    title: "Become Talent",
    desc: "Upload your likeness. Set exactly what you will and won't allow. Earn passively every time AI uses your face, voice, or body — with full visibility of who, when, and where.",
    link: "/become-talent",
    cta: "Get Started",
  },
  {
    num: "02",
    icon: "◎",
    title: "Browse Talent",
    desc: "Search thousands of consented, verified identities. License instantly for film, advertising, gaming, or D2C. Every transaction is authorized, auditable, and legally complete.",
    link: "/studio/browse",
    cta: "Browse Now",
  },
  {
    num: "03",
    icon: "⬡",
    title: "For Studios",
    desc: "Enterprise casting, API access, compliance dashboards, and full audit infrastructure. The system that makes AI-generated talent legally scalable at studio speed.",
    link: "/for-studios",
    cta: "Learn More",
  },
];

export function VerticalsStrip() {
  return (
    <section className="bg-dark px-6 md:px-12 py-20 grid grid-cols-1 md:grid-cols-3 gap-0.5 relative">
      {ENTRY_CARDS.map((card) => (
        <div
          key={card.num}
          className="group bg-dark-3 px-9 py-12 relative overflow-hidden cursor-pointer border-t-2 border-transparent hover:border-orange hover:bg-mid transition-all"
        >
          {/* Ghost number */}
          <div className="absolute top-4 right-6 font-display text-[80px] leading-none text-white/[0.04] tracking-[-2px] pointer-events-none">
            {card.num}
          </div>

          {/* Icon box */}
          <div className="w-11 h-11 border border-orange flex items-center justify-center text-orange text-[18px] mb-5">
            {card.icon}
          </div>

          <div className="font-display text-[32px] tracking-[1.5px] text-warm-white mb-2.5 leading-none">
            {card.title}
          </div>
          <p className="font-body text-sm font-light leading-relaxed text-silver mb-6">
            {card.desc}
          </p>
          <Link
            href={card.link}
            className="font-condensed text-[12px] font-bold uppercase tracking-[2.5px] text-orange no-underline inline-flex items-center gap-2 after:content-['→'] after:transition-transform group-hover:after:translate-x-1"
          >
            {card.cta}
          </Link>
        </div>
      ))}
    </section>
  );
}
