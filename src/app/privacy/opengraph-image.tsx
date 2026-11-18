import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Privacy policy";

export default function Image() {
  return renderOg({ title: "Privacy policy", eyebrow: "What we collect and what we do not store" });
}
