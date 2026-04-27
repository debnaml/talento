import type { Metadata } from "next";
import { Bebas_Neue, Barlow_Condensed, Barlow } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const barlowCondensed = Barlow_Condensed({
  weight: ["300", "400", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-barlow-c",
});

const barlow = Barlow({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: {
    default: "Talento — AI Talent & Likeness Marketplace",
    template: "%s | Talento",
  },
  description:
    "Your face. Your voice. Your likeness. Talento makes sure you get paid every time AI uses it.",
  metadataBase: new URL("https://talento.ai"),
  openGraph: {
    type: "website",
    siteName: "Talento",
    title: "Talento — AI Talent & Likeness Marketplace",
    description:
      "Your face. Your voice. Your likeness. Talento makes sure you get paid every time AI uses it.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Talento" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Talento — AI Talent & Likeness Marketplace",
    description:
      "Your face. Your voice. Your likeness. Talento makes sure you get paid every time AI uses it.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebas.variable} ${barlowCondensed.variable} ${barlow.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
