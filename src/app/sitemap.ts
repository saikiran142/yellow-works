import type { MetadataRoute } from "next";

import { INDUSTRIES } from "@/content/industries";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/services", "/industries", "/pricing", "/demos", "/about", "/book-a-demo", "/growth-scan", "/privacy", "/terms", ...INDUSTRIES.map((i) => `/industries/${i.slug}`)];
  const now = new Date();
  return pages.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: p === "" ? "weekly" : "monthly", priority: p === "" ? 1 : p.startsWith("/industries/") ? 0.6 : 0.8 }));
}
