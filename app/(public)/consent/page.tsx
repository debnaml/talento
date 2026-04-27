import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Consent Explainer — Talento",
  description:
    "Plain-English explanation of the six consent toggles on a Talento profile.",
};

export default function ConsentPage() {
  return (
    <LegalPage eyebrow="Consent" title="YOUR CONSENT, EXPLAINED" lastUpdated="23 April 2026">
      <p>
        Every Talento profile has six consent toggles. They control which categories of
        commercial use your face, voice, and likeness are available for. You can change them
        at any time in Settings → Edit Profile. Studios whose intended use falls outside your
        scope cannot license your likeness.
      </p>

      <p>
        Each toggle is independent. Turning one on does not turn any other on.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        FILM
      </h2>
      <p>
        Narrative film and episodic television production. Feature films, streaming series,
        shorts, documentaries, trailers. Includes VFX doubles and digital background extras
        within those productions.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        ADVERTISING
      </h2>
      <p>
        Commercial campaigns for goods and services: TV spots, social ads, out-of-home,
        in-store, and brand content. Does <strong>not</strong> include direct-to-consumer
        product use (see D2C) or political messaging (see Political).
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        GAMING
      </h2>
      <p>
        Use inside video games: playable characters, NPCs, cutscene cast, motion-capture
        performances, and in-game cosmetics. Includes game trailers and marketing directly
        tied to a game.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        D2C (DIRECT-TO-CONSUMER)
      </h2>
      <p>
        Your likeness appearing on a product a consumer can buy and take home — figurines,
        avatars, apparel graphics, NFTs, and similar merchandise. This is a distinct category
        from advertising because the product itself is the likeness.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        POLITICAL
      </h2>
      <p>
        Political advertising, campaign messaging, and public-affairs communications. This is{" "}
        <strong>off by default</strong>. Turning it on opts you in to campaigns across the
        political spectrum; you can specify parties or causes to exclude by contacting support.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        ADULT
      </h2>
      <p>
        Adult or sexually explicit productions. This is <strong>off by default</strong> and
        requires separate identity verification before a profile can be licensed in this
        category. Adult-category licensing is non-transferable and scope-limited.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        WHAT STAYS THE SAME
      </h2>
      <ul className="list-disc pl-6 flex flex-col gap-2">
        <li>Your ownership of your likeness — unchanged.</li>
        <li>Your right to revoke consent and unpublish — immediate, always available.</li>
        <li>Our audit trail — every licence issued is recorded and visible to you.</li>
      </ul>

      <p className="mt-6">
        Questions about what a category covers?{" "}
        <a
          href="mailto:support@talento.com"
          className="text-orange hover:text-orange-hot"
        >
          support@talento.com
        </a>
        .
      </p>
    </LegalPage>
  );
}
