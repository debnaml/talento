// STAGE 2 — Auction listings, sealed-bid system, countdown timers.
// See STAGE-2-AUCTIONS.md for the full spec.
// This page is a placeholder until Stage 2 is built.

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Auctions — Talento",
  description: "AI talent auctions. Coming soon.",
};

export default function AuctionsPage() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-px bg-orange" />
        <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
          Coming Soon
        </span>
        <div className="w-8 h-px bg-orange" />
      </div>
      <h1 className="font-display text-[clamp(48px,8vw,96px)] leading-[0.92] tracking-[2px] text-warm-white mb-6">
        AUCTIONS<br />
        <span className="text-orange">STAGE 2</span>
      </h1>
      <p className="font-body text-base font-light text-silver max-w-md mb-10">
        Sealed-bid auctions for AI talent licensing are coming in Stage 2. Registered talent
        will appear automatically once launched.
      </p>
      <Link
        href="/"
        className="font-condensed text-[14px] font-bold uppercase tracking-[2.5px] text-warm-white bg-orange hover:bg-orange-hot px-9 py-4 transition-colors no-underline"
      >
        Back to Home
      </Link>
    </section>
  );
}
