import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/become-talent",
          "/for-studios",
          "/about",
          "/auctions",
          "/t/",
          "/terms",
          "/privacy",
          "/consent",
        ],
        disallow: ["/talent/", "/studio/", "/auth/", "/api/"],
      },
    ],
    sitemap: "https://talento.ai/sitemap.xml",
  };
}
