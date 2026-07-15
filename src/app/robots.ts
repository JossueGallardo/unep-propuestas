import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacidad"],
      disallow: ["/admin", "/api", "/auth"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
