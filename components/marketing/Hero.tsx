import Link from "next/link";

export function Hero() {
  return (
    <section
      className="relative h-screen min-h-[780px] flex items-end overflow-hidden pt-[72px]"
      style={{
        background:
          "linear-gradient(105deg, rgba(13,13,16,0.97) 0%, rgba(13,13,16,0.7) 42%, rgba(13,13,16,0.2) 70%, rgba(13,13,16,0.5) 100%), linear-gradient(to top, rgba(13,13,16,1) 0%, rgba(13,13,16,0) 40%)",
      }}
    >
      {/* Atmospheric dark bg */}
      <div className="absolute inset-0 bg-dark z-[-1]" />

      {/* Flame glow effect */}
      <div className="hero-flames" />

      {/* Abstract cinematic figure */}
      <div className="hero-figure">
        <div className="hero-figure-shape" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-12 pb-20 max-w-[900px]">
        {/* Live badge — STAGE 2: replace with real live auction indicator */}
        {/* STAGE 2 — see STAGE-2-AUCTIONS.md */}
        <div
          className="inline-flex items-center gap-2.5 mb-6"
          style={{ opacity: 0, animation: "fadeUp 0.8s 0.2s forwards" }}
        >
          <div className="hero-badge-dot" />
          <span className="font-condensed text-[11px] font-bold uppercase tracking-[3px] text-orange">
            The AI Talent Marketplace
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-display text-[clamp(48px,8vw,108px)] leading-[0.92] tracking-[2px] text-warm-white mb-2"
          style={{ opacity: 0, animation: "fadeUp 0.9s 0.4s forwards" }}
        >
          YOUR FACE.<br />
          YOUR <span className="text-orange">VOICE.</span><br />
          YOUR LIKENESS.<br />
          YOURS.
        </h1>

        {/* Sub */}
        <p
          className="font-condensed text-[clamp(16px,2vw,22px)] font-light tracking-[1px] text-silver mb-9"
          style={{ opacity: 0, animation: "fadeUp 0.8s 0.55s forwards" }}
        >
          Consent-based AI talent licensing. Upload once, earn every time.
        </p>

        {/* CTAs */}
        <div
          className="flex gap-4 flex-wrap"
          style={{ opacity: 0, animation: "fadeUp 0.8s 0.7s forwards" }}
        >
          <Link
            href="/become-talent"
            className="font-condensed text-[14px] font-bold uppercase tracking-[2.5px] text-warm-white bg-orange hover:bg-orange-hot px-9 py-4 transition-colors no-underline"
          >
            Become Talent
          </Link>
          <Link
            href="/for-studios"
            className="font-condensed text-[14px] font-bold uppercase tracking-[2.5px] text-warm-white border border-white/25 hover:border-warm-white hover:bg-white/[0.04] px-9 py-4 transition-colors no-underline"
          >
            For Studios
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 right-12 z-10 flex flex-col items-center gap-2"
        style={{ opacity: 0, animation: "fadeUp 1s 1.2s forwards" }}
      >
        <div className="scroll-line" />
        <span
          className="font-condensed text-[10px] font-semibold uppercase tracking-[3px] text-grey"
          style={{ writingMode: "vertical-lr" }}
        >
          Scroll
        </span>
      </div>
    </section>
  );
}
