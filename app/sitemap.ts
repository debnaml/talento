import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://talento.ai";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/become-talent`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/for-studios`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/auctions`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];
}
