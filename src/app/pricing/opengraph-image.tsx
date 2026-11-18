import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Pricing";

export default function Image() {
  return renderOg({ title: "Pricing", eyebrow: "Three packages, no surprises" });
}
