import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Talento",
  description: "About Talento, the consent-based AI talent & likeness marketplace.",
};

export default function AboutPage() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-px bg-orange" />
        <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
          Our Mission
        </span>
        <div className="w-8 h-px bg-orange" />
      </div>
      <h1 className="font-display text-[clamp(48px,8vw,96px)] leading-[0.92] tracking-[2px] text-warm-white mb-6">
        ABOUT<br />
        <span className="text-orange">TALENTO</span>
      </h1>
      <p className="font-body text-base font-light text-silver max-w-lg mb-10">
        Talento is the world&apos;s first consent-based AI talent and likeness marketplace. We
        believe every person deserves full control over how their face, voice, and likeness
        is used — and the right to be paid every time it is.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/become-talent"
          className="font-condensed text-[14px] font-bold uppercase tracking-[2.5px] text-warm-white bg-orange hover:bg-orange-hot px-9 py-4 transition-colors no-underline"
        >
          Become Talent
        </Link>
        <Link
          href="/for-studios"
          className="font-condensed text-[14px] font-bold uppercase tracking-[2.5px] text-warm-white border border-white/20 hover:border-orange hover:text-orange px-9 py-4 transition-colors no-underline"
        >
          For Studios
        </Link>
      </div>
    </section>
  );
}
