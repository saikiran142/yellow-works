import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Unique title + description, canonical URL and social tags for a page. OG images come from each route's opengraph-image file. */
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", title: `${title} · The Yellow Works`, description, url: path, siteName: "The Yellow Works", locale: "en_IN" },
    twitter: { card: "summary_large_image", title: `${title} · The Yellow Works`, description },
  };
}
