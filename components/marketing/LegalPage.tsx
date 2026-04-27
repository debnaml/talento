import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

export function LegalPage({ eyebrow, title, lastUpdated, children }: Props) {
  return (
    <div className="min-h-screen bg-dark px-6 md:px-12 py-20">
      <div className="max-w-[760px] mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-6 h-0.5 bg-orange" />
            <span className="font-condensed text-[11px] font-bold uppercase tracking-[4px] text-orange">
              {eyebrow}
            </span>
          </div>
          <h1 className="font-display text-[clamp(40px,6vw,72px)] tracking-[2px] text-warm-white leading-none">
            {title}
          </h1>
          <p className="font-condensed text-[11px] uppercase tracking-[2px] text-grey mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>

        <article className="legal-article font-body text-[15px] text-silver leading-relaxed flex flex-col gap-5">
          {children}
        </article>

        <p className="mt-16 font-condensed text-[11px] text-grey uppercase tracking-[1.5px]">
          This document is provided for transparency. It is not a substitute for legal advice.
          Contact us with questions.
        </p>
      </div>
    </div>
  );
}
