import { getIndustry } from "@/content/industries";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Industry page";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const i = getIndustry((await params).slug);
  return renderOg({ title: i ? `For ${i.plural}` : "Industries", eyebrow: i?.headline });
}
