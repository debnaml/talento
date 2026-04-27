// STAGE 2 — Full auction grid with live bidding, countdown timers,
// and sealed-bid mechanics. See STAGE-2-AUCTIONS.md.
// Stage 1: render a static placeholder card.

export function AuctionTeaser() {
  return (
    <section className="bg-dark-2 px-6 md:px-12 py-20 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange/20 to-transparent" />

      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-px bg-orange" />
        <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
          Live &amp; Upcoming
        </span>
      </div>
      <h2 className="font-display text-[clamp(40px,5vw,64px)] tracking-[2px] text-warm-white mb-12 leading-none">
        Open Auctions
      </h2>

      {/* Static teaser — replaced in Stage 2 */}
      <div className="bg-dark-3 border border-mid p-12 flex flex-col items-center justify-center text-center min-h-[280px] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(232,80,10,0.3) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10">
          <div className="font-display text-[clamp(36px,5vw,64px)] text-orange leading-none mb-4">
            COMING IN STAGE 2
          </div>
          <p className="font-body text-sm font-light text-silver max-w-md mb-6">
            Sealed-bid auctions for AI talent licensing. Talent registers once and bids
            come to them — no agent, no middleman.
          </p>
          <div className="font-condensed text-[11px] font-semibold uppercase tracking-[2px] text-grey">
            See STAGE-2-AUCTIONS.md for the full spec
          </div>
        </div>
      </div>
    </section>
  );
}
