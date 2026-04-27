import type { Metadata } from "next";
import { PublicNav } from "@/components/nav/PublicNav";
import { Footer } from "@/components/marketing/Footer";
import { Hero } from "@/components/marketing/Hero";
import { StatStrip } from "@/components/marketing/StatStrip";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { AuctionTeaser } from "@/components/marketing/AuctionTeaser";
import { TalentPreviewGrid } from "@/components/marketing/TalentPreviewGrid";
import { VerticalsStrip } from "@/components/marketing/VerticalsStrip";
import { CtaBanner } from "@/components/marketing/CtaBanner";

export const metadata: Metadata = {
  title: "Talento — AI Talent & Likeness Marketplace",
  description:
    "Your face. Your voice. Your likeness. Talento makes sure you get paid every time AI uses it.",
  openGraph: {
    title: "Talento — AI Talent & Likeness Marketplace",
    description:
      "Consent-based AI talent licensing. Upload once, earn every time.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <PublicNav />
      <main>
        <Hero />
        <StatStrip />
        {/* STAGE 2 — AuctionTeaser replaced with live auction grid. See STAGE-2-AUCTIONS.md */}
        <AuctionTeaser />
        <VerticalsStrip />
        <HowItWorks />
        <TalentPreviewGrid />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}


