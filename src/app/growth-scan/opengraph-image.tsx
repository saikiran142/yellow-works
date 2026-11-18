import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Free Growth Scan";

export default function Image() {
  return renderOg({ title: "Free Growth Scan", eyebrow: "Two minutes, your own numbers" });
}
