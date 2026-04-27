import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — Talento",
  description: "The terms that govern your use of Talento.",
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="TERMS OF SERVICE" lastUpdated="23 April 2026">
      <p>
        These terms govern your use of Talento (&quot;Talento&quot;, &quot;we&quot;, &quot;us&quot;).
        By creating an account or using the service you agree to them. If you do not agree,
        do not use Talento.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        1. WHO WE ARE
      </h2>
      <p>
        Talento is a consent-based marketplace that connects talent (people who choose to
        license their face, voice, and likeness for use in media) with studios (productions,
        agencies, brands, and other commercial buyers).
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        2. ACCOUNTS
      </h2>
      <p>
        You must be at least 18 years old to register. You are responsible for keeping your
        credentials secure and for any activity on your account. You must provide accurate
        information and keep it up to date.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        3. TALENT CONTENT AND CONSENT
      </h2>
      <p>
        When you upload your photo, video, or voice, you keep ownership of that content. You
        grant Talento a limited licence to host, display, and transmit it on the platform so
        that studios can discover you. Your consent toggles (film, advertising, gaming, D2C,
        political, adult) govern what categories of use your profile is available for; these
        are binding and can be changed at any time.
      </p>
      <p>
        You may unpublish or delete your profile at any time. Deletion removes your data on
        the timeline described in our Privacy Policy.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        4. STUDIO USE
      </h2>
      <p>
        Studios agree to use the registry in good faith, to respect a talent&apos;s consent
        scope, and not to reach out to talent whose scope excludes their intended use. Scraping,
        bulk export, or training machine-learning models on talent content is prohibited
        without an explicit, separate licence.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        5. PROHIBITED CONDUCT
      </h2>
      <p>
        You will not: impersonate another person; upload content you do not have the right
        to share; harass other users; attempt to circumvent platform security; or use Talento
        for unlawful purposes.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        6. TERMINATION
      </h2>
      <p>
        You may close your account at any time from Settings → Account. We may suspend or
        terminate accounts that violate these terms, with or without notice, at our discretion.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        7. LIABILITY
      </h2>
      <p>
        Talento is provided &quot;as is&quot;. To the fullest extent permitted by law, we
        disclaim all implied warranties and limit our aggregate liability to the amount you
        have paid us in the twelve months preceding a claim.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        8. GOVERNING LAW AND DISPUTES
      </h2>
      <p>
        These terms are governed by the laws of England and Wales. Disputes will be resolved
        in the courts of England and Wales unless mandatory consumer-protection rules in your
        country require otherwise.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        9. CHANGES
      </h2>
      <p>
        We may update these terms. Material changes will be notified by email or in-app at
        least 14 days before they take effect.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        10. CONTACT
      </h2>
      <p>
        Questions about these terms:{" "}
        <a
          href="mailto:legal@talento.com"
          className="text-orange hover:text-orange-hot"
        >
          legal@talento.com
        </a>
        .
      </p>
    </LegalPage>
  );
}
