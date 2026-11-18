import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Terms";

export default function Image() {
  return renderOg({ title: "Terms", eyebrow: "Website, demos and Growth Scan" });
}
