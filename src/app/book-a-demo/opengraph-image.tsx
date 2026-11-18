import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Book a personalised demo";

export default function Image() {
  return renderOg({ title: "Book a personalised demo", eyebrow: "Free, about a minute" });
}
