const STATS = [
  { num: "48K+", label: "Registered Talent" },
  { num: "320+", label: "Studio Partners" },
  { num: "1.2M", label: "Licenses Issued" },
  { num: "£4.8M", label: "Paid to Talent" },
  { num: "190+", label: "Countries" },
];

export function StatStrip() {
  return (
    <div className="bg-dark-3 border-t border-white/[0.04] border-b border-white/[0.04] px-6 md:px-12 py-7 flex items-center justify-between gap-8">
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className={`flex flex-col items-center gap-1 text-center flex-1 ${
            i < STATS.length - 1 ? "border-r border-white/[0.06]" : ""
          }`}
        >
          <span className="font-display text-[36px] tracking-[1px] text-orange leading-none">
            {stat.num}
          </span>
          <span className="font-condensed text-[11px] font-medium uppercase tracking-[2px] text-grey">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
