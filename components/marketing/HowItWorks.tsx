const STEPS = [
  {
    num: "01",
    title: "Upload & License Your Likeness",
    desc: "Register, upload your photo, video, and voice. Set your permissions — what you allow, what you don't. Receive your unique Talento Identity Key. You're in control.",
  },
  {
    num: "02",
    title: "Studios Hire AI Talent Legally",
    desc: "Studios, brands, and developers search, cast, and license through a single system. Every transaction is authorized, scoped, and permanently recorded. No legal grey areas.",
  },
  {
    num: "03",
    title: "Earn & Get Paid Fast",
    desc: "Instant payment on license completion. Full audit trail in your dashboard. See exactly who used your likeness, for what, and when. Your identity. Your revenue.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-dark-2 px-6 md:px-12 py-24 relative">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange/30 to-transparent" />

      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-px bg-orange" />
        <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
          The Process
        </span>
      </div>
      <h2 className="font-display text-[clamp(40px,5vw,64px)] tracking-[2px] text-warm-white mb-16 leading-none">
        AI Casting Made Simple
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
        {/* Connecting line */}
        <div
          className="absolute h-px bg-gradient-to-r from-orange via-orange-dim to-orange z-0"
          style={{ top: 28, left: "16.66%", right: "16.66%" }}
        />

        {STEPS.map((step, i) => (
          <div
            key={step.num}
            className={`relative z-10 ${i === 0 ? "pr-9" : i === 2 ? "pl-9" : "px-9"}`}
          >
            <div className="w-14 h-14 border border-orange bg-dark-2 flex items-center justify-center font-display text-[22px] tracking-[1px] text-orange mb-6">
              {step.num}
            </div>
            <div className="font-display text-[26px] tracking-[1px] text-warm-white mb-2.5 leading-none">
              {step.title}
            </div>
            <p className="font-body text-sm font-light leading-relaxed text-silver">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
