import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "More customers. Less manual work.";

export default function Image() {
  return renderOg({ title: "More customers. Less manual work.", eyebrow: "AI automation and digital growth studio" });
}
