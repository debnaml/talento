import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Talento",
  description: "How Talento collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="PRIVACY POLICY" lastUpdated="23 April 2026">
      <p>
        This policy explains what personal data Talento collects, why we collect it, how we
        use it, who we share it with, and the rights you have over it. If you have questions,
        write to{" "}
        <a
          href="mailto:privacy@talento.com"
          className="text-orange hover:text-orange-hot"
        >
          privacy@talento.com
        </a>
        .
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        1. WHAT WE COLLECT
      </h2>
      <ul className="list-disc pl-6 flex flex-col gap-2">
        <li>
          <strong className="text-warm-white">Account data</strong> — email address, hashed
          password, role (talent or studio), display name.
        </li>
        <li>
          <strong className="text-warm-white">Profile data</strong> — stage name, bio,
          location, age range, gender, height, categories, and the consent toggles you set.
        </li>
        <li>
          <strong className="text-warm-white">Media</strong> — photos, videos, and voice
          clips you choose to upload.
        </li>
        <li>
          <strong className="text-warm-white">Usage data</strong> — pages viewed, searches
          run, saves made. Used to improve the service.
        </li>
      </ul>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        2. HOW WE USE IT
      </h2>
      <p>
        To run the marketplace: to display your profile to eligible studios when published,
        to deliver messages and notifications, to keep the service secure, and to comply with
        legal obligations. We do not sell your data.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        3. LEGAL BASIS
      </h2>
      <p>
        We process your data under the contract we have with you (to provide the service),
        your consent (for optional features like marketing communications), and our legitimate
        interests (security, fraud prevention, service improvement).
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        4. WHO WE SHARE DATA WITH
      </h2>
      <ul className="list-disc pl-6 flex flex-col gap-2">
        <li>
          <strong className="text-warm-white">Supabase</strong> (our database and storage
          provider).
        </li>
        <li>
          <strong className="text-warm-white">Vercel</strong> (hosting and content delivery).
        </li>
        <li>
          <strong className="text-warm-white">Studios</strong> you have chosen to publish to,
          strictly within the consent scope you set.
        </li>
      </ul>
      <p>
        We do not transfer data to third-party advertisers or brokers. Our processors are
        bound by data-processing agreements.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        5. RETENTION
      </h2>
      <p>
        We retain account data for as long as your account is active. When you delete your
        account we unpublish you immediately and hard-delete your data after 30 days (records
        required by law — e.g. tax or dispute — may be kept longer).
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        6. YOUR RIGHTS
      </h2>
      <p>Under UK GDPR / EU GDPR you have the right to:</p>
      <ul className="list-disc pl-6 flex flex-col gap-2">
        <li>Access a copy of your data.</li>
        <li>Correct inaccurate data (you can do this directly in Settings).</li>
        <li>Delete your data (Settings → Account → Delete Account).</li>
        <li>Object to processing based on legitimate interests.</li>
        <li>Port your data to another service.</li>
        <li>Withdraw consent at any time.</li>
      </ul>
      <p>
        Requests that cannot be handled in-app can be sent to{" "}
        <a
          href="mailto:privacy@talento.com"
          className="text-orange hover:text-orange-hot"
        >
          privacy@talento.com
        </a>
        . We respond within 30 days.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        7. SECURITY
      </h2>
      <p>
        Data is encrypted in transit. Media files are stored privately and delivered by
        short-lived signed URLs — never by public links. Access to production data is
        restricted to a small number of authorised engineers.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        8. CHILDREN
      </h2>
      <p>
        Talento is not directed at people under 18. If you believe a minor has registered,
        write to us and we will delete the account.
      </p>

      <h2 className="font-display text-[22px] text-warm-white tracking-[1px] mt-6 mb-1">
        9. CHANGES
      </h2>
      <p>
        We may update this policy. Material changes will be notified by email or in-app at
        least 14 days in advance.
      </p>
    </LegalPage>
  );
}
