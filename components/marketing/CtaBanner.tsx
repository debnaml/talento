import Link from "next/link";

export function CtaBanner() {
  return (
    <section className="bg-dark px-6 md:px-12 py-20 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange/20 to-transparent" />

      <div className="bg-dark-2 border border-mid p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 80% at 0% 50%, rgba(232,80,10,0.08) 0%, transparent 60%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-px bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              Join Today
            </span>
          </div>
          <h2 className="font-display text-[clamp(36px,5vw,64px)] leading-[0.92] tracking-[2px] text-warm-white">
            YOUR LIKENESS.<br />
            YOUR <span className="text-orange">RULES.</span>
          </h2>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-4 flex-shrink-0">
          <Link
            href="/become-talent"
            className="font-condensed text-[14px] font-bold uppercase tracking-[2.5px] text-warm-white bg-orange hover:bg-orange-hot px-9 py-4 transition-colors no-underline text-center"
          >
            Become Talent
          </Link>
          <Link
            href="/for-studios"
            className="font-condensed text-[14px] font-bold uppercase tracking-[2.5px] text-warm-white border border-white/20 hover:border-orange hover:text-orange px-9 py-4 transition-colors no-underline text-center"
          >
            For Studios
          </Link>
        </div>
      </div>
    </section>
  );
}
