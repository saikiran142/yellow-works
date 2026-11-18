import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/** Search engines and AI crawlers may read all public pages; admin, APIs and the styleguide are excluded. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/styleguide"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
