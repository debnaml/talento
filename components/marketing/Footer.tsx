import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-dark-2 border-t border-white/[0.04] px-6 md:px-12 pt-16 pb-10">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-16 mb-16">
        {/* Brand */}
        <div>
          <div className="font-display text-[32px] tracking-[3px] text-warm-white mb-4">
            TALEN<span className="text-orange">T</span>O
          </div>
          <p className="font-body text-sm font-light leading-relaxed text-grey max-w-[280px]">
            The world&apos;s first consent-based AI talent and likeness marketplace. Your face.
            Your voice. Your rules. Your revenue.
          </p>
        </div>

        {/* Talent */}
        <div>
          <h4 className="font-condensed text-[11px] font-bold uppercase tracking-[3px] text-orange mb-5">
            Talent
          </h4>
          <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
            <li>
              <Link href="/become-talent" className="font-body text-sm font-light text-silver hover:text-warm-white transition-colors no-underline">
                Become Talent
              </Link>
            </li>
            <li>
              {/* STAGE 2 — see STAGE-2-AUCTIONS.md */}
              <span className="font-body text-sm font-light text-grey cursor-not-allowed">
                Extras Registry
              </span>
            </li>
            <li>
              <Link href="/talent/dashboard" className="font-body text-sm font-light text-silver hover:text-warm-white transition-colors no-underline">
                Dashboard
              </Link>
            </li>
            <li>
              {/* STAGE 2 */}
              <span className="font-body text-sm font-light text-grey cursor-not-allowed">
                How Payments Work
              </span>
            </li>
          </ul>
        </div>

        {/* Studios */}
        <div>
          <h4 className="font-condensed text-[11px] font-bold uppercase tracking-[3px] text-orange mb-5">
            Studios
          </h4>
          <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
            <li>
              <Link href="/studio/browse" className="font-body text-sm font-light text-silver hover:text-warm-white transition-colors no-underline">
                Browse Registry
              </Link>
            </li>
            <li>
              {/* STAGE 3 — see STAGE-3-ADVANCED.md */}
              <span className="font-body text-sm font-light text-grey cursor-not-allowed">
                API Access
              </span>
            </li>
            <li>
              {/* STAGE 3 */}
              <span className="font-body text-sm font-light text-grey cursor-not-allowed">
                Compliance
              </span>
            </li>
            <li>
              <Link href="/for-studios" className="font-body text-sm font-light text-silver hover:text-warm-white transition-colors no-underline">
                Enterprise
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-condensed text-[11px] font-bold uppercase tracking-[3px] text-orange mb-5">
            Company
          </h4>
          <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
            <li>
              <Link href="/about" className="font-body text-sm font-light text-silver hover:text-warm-white transition-colors no-underline">
                About Talento
              </Link>
            </li>
            <li>
              {/* STAGE 3 */}
              <span className="font-body text-sm font-light text-grey cursor-not-allowed">
                The Authorization System
              </span>
            </li>
            <li>
              <span className="font-body text-sm font-light text-grey cursor-not-allowed">
                Press
              </span>
            </li>
            <li>
              <span className="font-body text-sm font-light text-grey cursor-not-allowed">
                Contact
              </span>
            </li>
            <li>
              <Link href="/terms" className="font-body text-sm font-light text-silver hover:text-warm-white transition-colors no-underline">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="font-body text-sm font-light text-silver hover:text-warm-white transition-colors no-underline">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/consent" className="font-body text-sm font-light text-silver hover:text-warm-white transition-colors no-underline">
                Consent
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between pt-8 border-t border-white/[0.06]">
        <p className="font-condensed text-[11px] font-normal tracking-[1.5px] text-grey">
          &copy; 2025 Talento. All rights reserved. Consent-based. Fully auditable.
        </p>
        <span className="font-condensed text-[11px] font-semibold tracking-[2px] uppercase text-orange">
          Your likeness. Authorized. Protected. Yours.
        </span>
      </div>
    </footer>
  );
}
